# Restaurant Management Service tests

Non-Django test code lives here:

- `frontend/`: cart, rendered status badge and order-request unit tests.
- `selenium/`: browser scenarios, disposable backend fixture and test runner.
- `requirements.txt`: Python dependencies for the test tools.

Django unit and integration tests stay in `server/restaurant/tests.py` and
`server/restaurant/test_hardening.py` for Django test discovery.

From the repository root:

```sh
npm --prefix client test
python server/check_local.py
python tests/selenium/run.py
```

Frontend dependencies and the Vitest configuration remain in `client/`.
See [Testing and CI](../docs/TESTING.md) for installation, coverage and CI details.
