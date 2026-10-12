"""Browser acceptance tests for Restaurant Management Service.

Use run.py: it owns both servers and a fresh database. Never point these tests
at a deployed restaurant; the lifecycle intentionally creates and pays orders.
"""
import json
import os
from pathlib import Path
import time
import unittest
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class RestaurantBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base = os.environ['RMS_SELENIUM_URL']
        if urlparse(cls.base).hostname != '127.0.0.1':
            raise RuntimeError('Only the runner-owned loopback fixture is allowed.')
        cls.output = Path(os.environ['RMS_SELENIUM_OUTPUT'])

    def setUp(self):
        options = webdriver.ChromeOptions()
        if os.environ.get('RMS_SELENIUM_HEADED') != '1':
            options.add_argument('--headless=new')
        options.add_argument('--window-size=1440,1000')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        if os.environ.get('RMS_SELENIUM_NO_SANDBOX') == '1':
            options.add_argument('--no-sandbox')
        options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
        if os.environ.get('CHROME_BINARY'):
            options.binary_location = os.environ['CHROME_BINARY']
        # Selenium Manager resolves the matching driver unless explicitly supplied.
        service = Service(os.environ['CHROMEDRIVER']) if os.environ.get('CHROMEDRIVER') else Service()
        self.driver = webdriver.Chrome(service=service, options=options)
        self.addCleanup(self.driver.quit)
        self.wait = WebDriverWait(self.driver, 20)

    def tearDown(self):
        self.driver.save_screenshot(str(self.output / f'{self._testMethodName}.png'))
        errors = [entry for entry in self.driver.get_log('browser') if entry['level'] == 'SEVERE']
        (self.output / f'{self._testMethodName}.console.json').write_text(json.dumps(errors, indent=2), encoding='utf-8')
        self.assertEqual(errors, [], 'Unexpected browser console errors')

    def visit(self, path):
        self.driver.get(self.base + path)
        self.wait.until(lambda driver: driver.execute_script('return document.readyState') == 'complete')

    def visible(self, selector):
        return self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, selector)))

    def click(self, text):
        locator = (By.XPATH, f"//button[contains(.,'{text}')]")
        button = self.wait.until(EC.element_to_be_clickable(locator))
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center',behavior:'instant'});", button)
        button.click()

    def body_contains(self, text):
        self.wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, 'body'), text))

    def login(self, username, destination):
        self.visit('/login')
        self.driver.execute_script('localStorage.clear(); sessionStorage.clear();')
        self.visit('/login')
        self.visible('#login-username').send_keys(username)
        self.visible('#login-password').send_keys('BrowserFixture-only-123!')
        self.driver.find_element(By.CSS_SELECTOR, 'button[type=submit]').click()
        self.wait.until(EC.url_contains(destination))
        self.visible('h1')

    def api(self, path, authenticated=False):
        headers = {}
        if authenticated:
            token = self.driver.execute_script("return localStorage.getItem('access_token')")
            headers['Authorization'] = 'Bearer ' + token
        with urlopen(Request(self.base + '/api/v1' + path, headers=headers), timeout=5) as response:
            return json.load(response)

    def test_landing_brand_scroll_and_workflow_tabs(self):
        self.visit('/')
        screen = self.visible('.stage-screen')
        self.assertEqual(self.driver.title, 'RMS — Restaurant Management Service')
        self.assertNotIn('savore', self.driver.find_element(By.TAG_NAME, 'body').text.lower())
        self.assertEqual(self.visible('.landing-brand').get_attribute('aria-label'), 'Restaurant Management Service home')
        # Let the initial useScroll measurement settle, then check a new scroll position.
        time.sleep(.3)
        before = screen.value_of_css_property('transform')
        self.driver.execute_script("window.scrollTo({top:500,behavior:'instant'})")
        self.wait.until(lambda _: screen.value_of_css_property('transform') != before)
        self.click('Token pickup')
        self.body_contains('Keep the queue moving.')
        self.assertEqual(self.driver.find_element(By.ID, 'workflow-tab-1').get_attribute('aria-selected'), 'true')

    def test_mobile_navigation_and_reduced_motion(self):
        self.driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride', {'width':390, 'height':844, 'deviceScaleFactor':1, 'mobile':True})
        self.visit('/')
        self.visible('.landing-menu-toggle').click()
        self.assertTrue(self.visible('#landing-links').is_displayed())
        self.driver.find_element(By.CSS_SELECTOR, '.landing-menu-toggle').click()
        self.assertFalse(self.driver.find_element(By.ID, 'landing-links').is_displayed())
        self.assertTrue(self.driver.execute_script('return document.documentElement.scrollWidth <= innerWidth'))
        self.driver.execute_cdp_cmd('Emulation.setEmulatedMedia', {'features':[{'name':'prefers-reduced-motion', 'value':'reduce'}]})
        self.visit('/')
        self.assertEqual(self.visible('.stage-screen').value_of_css_property('transform'), 'none')

    def test_demo_and_anonymous_route_guard(self):
        self.visit('/demo')
        self.click('Customer')
        self.click('Place sample order')
        self.body_contains('House burger')
        self.visit('/config')
        self.wait.until(EC.url_contains('/login'))
        self.visible('#login-username')

    def test_customer_kitchen_waiter_biller_lifecycle(self):
        self.visit('/test-resto/book')
        self.click('Table 1')
        self.click('Continue with Table')
        self.wait.until(EC.url_contains('table=1'))
        self.body_contains('Burger')
        self.click('Add')
        self.visible('header a[href*="/cart"]').click()
        self.wait.until(EC.url_contains('/cart?table=1'))
        self.visible('input[type=tel]').send_keys('9999999999')
        self.click('Place Order')
        self.wait.until(EC.url_contains('/order/'))
        order_id = self.driver.current_url.rsplit('/', 1)[-1]
        self.assertEqual(self.api('/orders/track/?order_id=' + order_id)['status'], 'pending')
        self.visit('/test-resto/order')
        self.click('View your latest order')
        self.wait.until(EC.url_contains(order_id))

        self.login('kitchen_user', '/kitchen')
        self.click('Start Preparing')
        self.wait.until(lambda _: self.api('/orders/track/?order_id=' + order_id)['status'] == 'preparing')
        self.click('Mark Ready')
        self.wait.until(lambda _: self.api('/orders/track/?order_id=' + order_id)['status'] == 'ready')
        self.visit('/config')
        self.wait.until(EC.url_contains('/kitchen'))

        self.login('waiter_user', '/waiter')
        self.click('Mark Delivered to Table')
        self.wait.until(lambda _: self.api('/orders/track/?order_id=' + order_id)['status'] == 'served')

        self.login('biller_user', '/billing')
        self.visible('input[placeholder*="Enter"]').send_keys('1')
        self.click('Find Tickets')
        self.click('Generate & Print Bill')
        self.visible('[role=dialog]')
        bills = self.api('/bills/', authenticated=True)['results']
        bill = next(bill for bill in bills if any(order['id'] == order_id for order in bill['orders']))
        self.assertEqual(bill['payment_status'], 'unpaid')
        self.click('Record Payment & Close')
        self.wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, '[role=dialog]')))
        paid = self.api('/bills/' + bill['id'] + '/', authenticated=True)
        self.assertEqual(paid['payment_status'], 'paid')
        self.assertEqual(paid['payment_method'], 'cash')
        self.assertEqual(self.api('/orders/track/?order_id=' + order_id)['status'], 'served')

    def test_admin_pages_and_platform_access(self):
        self.login('admin_user', '/dashboard')
        for path in ['/menu-management', '/tables', '/staff', '/recipes', '/orders', '/analytics', '/config', '/bill-history']:
            with self.subTest(path=path):
                self.visit(path)
                self.visible('h1')
                # Retry pages indicate an API failure even if a heading renders.
                self.wait.until(lambda driver: 'Loading' not in driver.find_element(By.TAG_NAME, 'body').text)
                self.assertNotIn('could not', self.driver.find_element(By.TAG_NAME, 'body').text.lower())
                self.assertEqual(urlparse(self.driver.current_url).path, path)
        self.login('browser_platform', '/platform')
        self.body_contains('Browser Test Restaurant')

    def test_shop_counter_order(self):
        self.login('browser_cashier', '/billing')
        self.click('New counter order')
        self.visible('[role=dialog] input[type=tel]').send_keys('8888888888')
        quantity = self.visible('[role=dialog] input[type=number]')
        quantity.clear()
        quantity.send_keys('1')
        self.click('Create order')
        self.wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, '[role=dialog]')))
        self.body_contains('Counter Coffee')
        orders = self.api('/orders/', authenticated=True)['results']
        self.assertEqual(len(orders), 1)
        self.assertEqual(orders[0]['items'][0]['menu_item_name'], 'Counter Coffee')
