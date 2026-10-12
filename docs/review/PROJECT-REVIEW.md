# Project review — 12 October 2026

## What this project is

RMS is a multi-tenant restaurant operations application. React/Vite renders the customer menu and staff workspaces; Django REST Framework owns authentication, tenant boundaries, order pricing and billing; PostgreSQL is the intended production database. SQLite is used for local verification. Nginx fronts the application in Docker.

A restaurant is the tenant. Its categories, dishes, recipes, tables, tokens, customers, orders, bills and staff profiles belong to that restaurant. Platform superusers have a separate console for restaurant/account administration and audit events. Restaurant owners are tenant administrators, not platform administrators.

## Flow map

| Flow | Behaviour and findings |
| --- | --- |
| Owner onboarding | Signup creates the owner, restaurant and admin profile together, then signs in. Password-length guidance and optional blank fields now match the API. |
| Staff sign-in | Username/password authentication returns JWTs and a role. Route guards send each role to its own workspace. Google owner sign-in is optional and is shown only when configured. |
| Customer table ordering | Public menu → choose a table or scan its QR → add dishes → cart → checkout → order tracking. Table context survives header and mobile navigation. |
| Token ordering | Order creation allocates a daily restaurant-scoped token. The restaurant row is locked during allocation. Daily boundaries now use the configured local timezone. |
| Shop/counter | Guests browse; the cashier creates orders from the menu, generates bills and records payment. A counter-entry form has been added. |
| Kitchen | Polls the queue, reads preparation notes, and advances pending/confirmed → preparing → ready. Confirmed tickets remain visible. |
| Waiter | Reads tables and orders, sees ready tickets, and marks delivery. Its former admin-only table read is repaired. |
| Billing | Looks up unbilled orders by table/token, generates a server-priced bill, applies a bounded discount, and records payment. Settlement does not silently mark food as served. |
| Menu and recipes | Admins manage categories/dishes; kitchen/admin roles access internal recipes. Writable relationships are restricted to the requesting tenant. |
| Tables | Administrators manage tables and QR codes. Customers get only the active table-selection fields. Tables with order history must be deactivated rather than deleted. |
| Staff | Admins create/remove staff. The directory now reads the API's nested user fields correctly. Reassigning staff to another tenant and deleting the owner/self are blocked. |
| Analytics | Aggregates order value, order volume, customers, categories and popular dishes. These totals are order value, not a payment-ledger reconciliation. Fabricated growth percentages were removed. |
| Branding | Configures restaurant details, colours, imagery, workflow and tax. Saving now refreshes the authenticated restaurant context as well. |
| Platform console | Superuser-only restaurant/account administration and audit-event inspection. Existing tenant admins cannot access its API. |
| Demo | An explicitly labelled browser-only simulation supports ordering, preparation, delivery and sample payment without real records. |

## UI work

- Rebuilt the landing page with restrained colours, clear typography, shorter copy and a scroll-linked perspective preview with receipt parallax.
- Added responsive navigation, keyboard-operated workflow tabs and reduced-motion support.
- Removed decorative navigation eyebrows, artificial live/API labels, ambient glow animations and invented dashboard trends.
- Standardised workspace surfaces, buttons and forms. Segmented controls no longer bounce; selects use native keyboard/touch behaviour.
- Added modal/dialog semantics, focus containment, Escape handling and focus restoration. Cart dialogs render outside clipped page containers.
- Added recoverable page errors and an application error boundary. Missing restaurant links no longer leave an endless loading screen.
- Split page bundles. The main JavaScript entry is approximately 343 KB before gzip, versus approximately 1,111 KB at baseline. Landing motion and analytics load in separate chunks.
- Removed unconditional external-font and unconfigured Google-script requests. Fonts use installed/system fallbacks.

## Data integrity and security changes

- Restricted category, recipe and translation write relationships to the authenticated restaurant.
- Denied inactive staff/restaurant writes and tightened role-specific order transitions.
- Blocked generic order/bill PATCH paths that could bypass workflows or reassign records.
- Made order creation transactional; unavailable dishes roll back customers, tokens and order records together.
- Added request keys and payload fingerprints so repeated checkout requests return the original order instead of creating another one.
- Added order-line dish-name snapshots; later menu renames no longer rewrite receipt names. Migration 0004 backfills existing names.
- Protected ordered dishes from deletion and retained order/bill records through API deletion restrictions.
- Locked bill creation/payment, rejected duplicate or cancelled-order billing, bounded discounts, and prevented settled bills from being reopened or changed.
- Redacted customer IDs and phone numbers from public tracking responses; validated malformed tracking IDs and analytics parameters.
- Serialized concurrent token refreshes; expired sessions update the authentication context. Access-token lifetime is now 30 minutes and password changes invalidate existing access tokens through SimpleJWT's password check.
- Removed automatic hard-coded superadmin creation/reset and fabricated security-log seeding. The explicit provisioning command requires supplied environment credentials and refuses existing usernames.

## Verification

- Baseline: 120 backend tests and 11 existing frontend tests passed.
- Full backend regression run: 140 tests passed after the initial fixes.
- Final focused regression suite: 24 tests passed, including the subsequent optional-field, retry-protection and dish-name snapshot changes.
- Frontend production build and 11 existing frontend tests passed. The existing cart/status unit tests are small simulations; they do not establish complete React integration coverage.
- Django model/migration drift check and standard system check passed.
- Django `check --deploy` passed using synthetic production environment values; this is configuration validation, not a live deployment check.
- Built-app Selenium run: 24 checks passed with no browser console errors. It covered desktop/mobile landing, actual scroll transforms, reduced motion, demo interaction, table selection, checkout/tracking, kitchen/floor/cashier paths, admin route rendering, platform access and shop counter entry. See `browser-results.json` and screenshots beside this report.
- Browser verification preceded the final retry/snapshot and configuration-context changes; those received API regression/build checks. It was an isolated SQLite fixture, not the user's database.

## Production status and remaining limits

**The application has been improved and locally verified, but production sign-off is still pending.** No deployment was performed.

1. Docker was unavailable, so image builds, Nginx configuration/runtime, PostgreSQL row-lock concurrency and container networking remain unverified. SQLite tests cannot prove PostgreSQL concurrency behaviour.
2. `compose.production.yml` is a standalone production configuration. It requires real secrets, hostnames, PostgreSQL credentials and an HTTPS frontend URL. The loopback frontend port must sit behind a trusted TLS proxy that overwrites `X-Forwarded-Proto`. Database/backend ports are not published.
3. Take and restore-test a database/media backup before applying migrations 0003 and 0004. The existing application database and uploads were not migrated or modified in this review.
4. If the old startup command was ever deployed, rotate that previously seeded administrator password. Removing the command does not revoke credentials already present in an existing database. Existing fabricated audit entries were not deleted.
5. Payments are recorded manually; there is no gateway capture, reconciliation, refund ledger or partial-payment accounting. Split billing and reservations are not implemented. Table selection makes no availability reservation. These should not be advertised as supported.
6. Public tracking links are bearer capabilities. Anyone holding an order UUID can view its order details; table/phone lookup is also public. Customer contact fields are redacted, but deployments needing verified customer ownership should add customer authentication or a separate access-token design.
7. JWTs remain in browser local storage. Logout removes the browser's tokens, but there is no server-side refresh-token revocation/logout endpoint. This merits further work before a high-risk public rollout.
8. Queues use periodic HTTP polling, not WebSockets. Collection helpers now follow pagination so tickets are not silently lost after the first 50, but large deployments should introduce server-side paging/active-queue endpoints and load-test them.
9. Backend dependency ranges remain broad; freeze and audit the target installation. HTTPS, backup recovery, monitoring, alerting, OAuth and physical receipt-printer behaviour still need target-environment acceptance tests.

Production checks were informed by the [Django deployment checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/) and DRF's [permission](https://www.django-rest-framework.org/api-guide/permissions/) and [serializer relationship](https://www.django-rest-framework.org/api-guide/relations/) documentation.

## Reproducing local checks

From the repository root:

```powershell
python server/check_local.py
python server/manage.py makemigrations --check --dry-run
npm.cmd --prefix client test
npm.cmd --prefix client run build
```

`check_local.py` uses an in-memory database and temporary media. The browser fixture/scripts used for this review are retained in the parent workspace as `qa_server.py` and `qa_browser.py`; they use synthetic accounts and cached local ChromeDriver. Do not expose that fixture server externally.

## Naming and test-suite follow-up ? 12 October 2026

Product branding is now Restaurant Management Service (RMS). The orange/glass landing style was restored at the user's request, retaining scroll motion and reduced-motion support.

The current reproducible test suite supersedes the earlier frontend simulation limitation: the cart tests import the reducer used by CartProvider, status tests render the real component, and order request tests exercise the actual API helper with mocked transport. All 22 frontend tests and the full 144-test Django suite pass. Measured restaurant-backend statement coverage is 86% (migrations and test files excluded).

All six repository Selenium scenarios pass against a freshly built frontend and disposable Django fixture, including the full ordering/service/payment lifecycle. This restricted Windows environment used a matching cached driver and the documented local no-sandbox option; normal CI leaves the browser sandbox enabled. Results and screenshots are generated under test-results/selenium.

The GitHub Actions workflow includes frontend tests/build, PostgreSQL backend tests and coverage, followed by Selenium. Workflow execution on GitHub, PostgreSQL runtime validation and EC2 continuous deployment are pending; local verification used SQLite. See [Testing and CI](../TESTING.md) for commands, scope and deployment follow-up.
