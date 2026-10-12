# Restaurant Management Service: testing and CI

The product name is **Restaurant Management Service (RMS)**. Restaurant names configured by individual owners remain their own branding.

## Test layers

| Layer | Source | What it verifies |
| --- | --- | --- |
| Frontend unit tests | `tests/frontend/cart.test.js` | The cart reducer used by CartProvider: quantities, totals, notes, removal and clearing |
| Frontend component tests | `tests/frontend/statusBadge.test.js` | The actual rendered status component, icons, fallback and HTML escaping |
| Frontend API unit tests | `tests/frontend/orders.test.js` | The real createOrder helper with a mocked HTTP transport: lost-response retry, changed payloads and tenant-separated request keys |
| Django model/serializer/permission tests | `server/restaurant/tests.py` | Model relationships, totals, constraints, validation, permissions and utilities |
| Django API integration tests | `server/restaurant/tests.py` | Authentication, signup, CRUD, tracking, token generation, analytics, platform access, tenant isolation and customer → kitchen → waiter → bill → payment lifecycle |
| Django regression tests | `server/restaurant/test_hardening.py` | Cross-tenant writes, atomic rollback, illegal transitions, duplicate billing, immutable receipts, payment rules and duplicate-order protection |
| Selenium browser tests | `tests/selenium/test_ui.py` | Built React app talking to a real disposable Django server, through Chrome |

The Django API tests integrate the HTTP routing, middleware/DRF, serializers, permissions and database. Some tests use `force_authenticate` to isolate role behavior; separate authentication tests use the actual login and refresh endpoints. Selenium logs in through the UI and verifies persisted order/payment states through the API.

## Install test dependencies

From the repository root, using Python 3.12 or 3.13, Node.js 22 and Chrome:

```sh
python -m pip install -r tests/requirements.txt
npm --prefix client ci
```

On Windows PowerShell use `npm.cmd` if the execution policy blocks `npm.ps1`. A virtual environment is recommended. Test tools are separate from the production image dependencies.

## Run unit and integration tests

```sh
npm --prefix client test
python server/check_local.py
```

The backend runner uses an isolated SQLite test database and temporary uploads. It does not use the application's database. Test settings use a fast password hasher; these runs do not measure production password hashing performance.

Equivalent standard Django command (including the requested `tests.py` integration suite):

```sh
python server/manage.py test restaurant --settings=server.test_settings -v 2
```

To demonstrate just the multi-role integration lifecycle:

```sh
python server/check_local.py restaurant.tests.OrderAPITest.test_full_order_to_bill_lifecycle_workflow
```

For a coverage report:

```sh
python -m coverage run --source=server/restaurant server/check_local.py
python -m coverage report --omit="*/migrations/*,*/tests.py,*/test_*.py" --fail-under=80
python -m coverage xml --omit="*/migrations/*,*/tests.py,*/test_*.py" -o test-results/django-coverage.xml
```

Coverage measures executed statements in the restaurant backend, excluding migrations and tests. It is not a claim of complete scenario, branch, security or browser coverage.

## Run Selenium

```sh
python tests/selenium/run.py
```

For a visible browser during a presentation:

```sh
python tests/selenium/run.py --headed
```

The runner builds the frontend, picks free loopback ports, migrates and seeds a temporary SQLite database, starts Django and Vite preview, executes six independent browser scenarios, then stops its servers and removes fixture data. It deliberately has no deployed-site URL argument. Synthetic usernames/passwords in the fixture are test-only and are never added to your real database.

The scenarios cover:

1. Correct product title, scroll transforms and workflow tabs.
2. Mobile navigation, horizontal overflow and reduced motion.
3. Interactive demo and anonymous route protection.
4. Table selection, cart, checkout, order recovery, kitchen preparation, waiter service, cashier billing/payment and a kitchen/admin route boundary.
5. Eight administration routes and platform login.
6. Counter-order creation in shop mode.

Assertions include actual API state after lifecycle actions. Unexpected severe browser console errors fail the test. Results, screenshots and server logs are written to `test-results/selenium/`; these generated files are ignored by Git and uploaded by CI.

Selenium Manager normally locates/downloads the matching ChromeDriver. For offline machines, set `CHROMEDRIVER` to an already-installed matching driver; optionally set `CHROME_BINARY`. Restricted local test environments that prevent Chrome's sandbox starting can opt in to `RMS_SELENIUM_NO_SANDBOX=1` for this disposable fixture only. The normal runner and CI leave Chrome's sandbox enabled.

## GitHub Actions

`.github/workflows/ci.yml` runs on pushes, pull requests and manual dispatch:

- **frontend:** `npm ci`, 22 unit/component tests, JUnit report and production build.
- **django:** a disposable PostgreSQL 16 service, Django checks/migration consistency, 144 backend tests, coverage XML and an 80% minimum statement-coverage gate.
- **selenium:** runs after both jobs succeed, builds the app and executes the browser suite with disposable SQLite fixtures.

No production secrets are required for CI. The PostgreSQL service password is only for the disposable runner database. Test results become downloadable workflow artifacts. Repository branch protection must separately make these jobs required before merging; adding the workflow does not configure that setting.

## EC2 continuous deployment

CI is prepared in the repository. CD is not enabled yet because the target EC2 instance, registry, deployment branch, domain/TLS setup and credentials have not been configured. Once those are available, connect a successful CI run to a deployment that builds a versioned image, backs up before reviewed migrations, updates EC2, checks application health and retains a rollback image. Production credentials belong in environment/secret storage, not source files or test fixtures.

Keep unit/integration/browser tests on disposable CI data. Validate PostgreSQL concurrency, HTTPS/proxy behavior, backups/restoration and infrastructure health separately on the target staging environment before production release.

Reference documentation: [Django test runner](https://docs.djangoproject.com/en/5.2/topics/testing/overview/), [Selenium Manager](https://www.selenium.dev/documentation/selenium_manager/), [GitHub Python CI](https://docs.github.com/en/actions/tutorials/build-and-test-code/python).
