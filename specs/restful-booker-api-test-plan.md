# Restful Booker API Test Plan

## Application Overview

The Restful Booker API is a REST web service for managing hotel bookings. It provides endpoints for creating, reading, updating, and deleting booking records. Authentication uses a token generated via `POST /auth`, passed as a `Cookie: token=<value>` header on protected endpoints.

**Validated base URL:** `https://restful-booker.herokuapp.com`

**Validated status codes (all confirmed via live requests — do not rely on docs alone):**

| Endpoint | Method | Expected Status |
| :--- | :--- | :--- |
| `/ping` | GET | **201** |
| `/auth` | POST (valid creds) | **200** |
| `/auth` | POST (invalid creds) | **200** (body: `{"reason":"Bad credentials"}`) |
| `/booking` | GET | **200** |
| `/booking` | POST | **200** (not 201) |
| `/booking/{id}` | GET | **200** |
| `/booking/{id}` | PUT | **200** |
| `/booking/{id}` | PATCH | **200** |
| `/booking/{id}` | DELETE (with auth) | **201** (not 200 or 204) |
| `/booking/{id}` | DELETE (no auth) | **403** (not 401) |
| `/booking/{id}` | GET (non-existent) | **404** |

**Critical note on `POST /auth` with invalid credentials:** The API returns **200 OK** with body `{"reason":"Bad credentials"}` — not a 4xx status. All auth failure assertions MUST check the response body, not the status code alone.

**Critical note on `GET /booking/{id}` response:** The response body does NOT include `bookingid`. The `bookingid` field only appears in the `POST /booking` response. Do not assert `response.body.bookingid` after a GET.

---

## Endpoints and Response Shapes

All shapes confirmed via live API calls. Use these as the source of truth for schema files and assertions.

### `POST /auth` — Valid credentials
```json
{ "token": "805e92e5a21f828" }
```

### `POST /auth` — Invalid credentials
```json
{ "reason": "Bad credentials" }
```
*Status is 200 in both cases. Assert on body, not status.*

### `GET /booking`
```json
[
  { "bookingid": 1 },
  { "bookingid": 2 }
]
```

### `POST /booking` — Request payload
```json
{
  "firstname": "string",
  "lastname": "string",
  "totalprice": 150,
  "depositpaid": true,
  "bookingdates": {
    "checkin": "2026-01-01",
    "checkout": "2026-01-10"
  },
  "additionalneeds": "string"
}
```

### `POST /booking` — Response (status 200)
```json
{
  "bookingid": 2468,
  "booking": {
    "firstname": "string",
    "lastname": "string",
    "totalprice": 150,
    "depositpaid": true,
    "bookingdates": {
      "checkin": "2026-01-01",
      "checkout": "2026-01-10"
    },
    "additionalneeds": "string"
  }
}
```
*Note: `bookingid` appears ONLY in this response, not in `GET /booking/{id}`.*

### `GET /booking/{id}` — Response (status 200)
```json
{
  "firstname": "string",
  "lastname": "string",
  "totalprice": 150,
  "depositpaid": true,
  "bookingdates": {
    "checkin": "2026-01-01",
    "checkout": "2026-01-10"
  },
  "additionalneeds": "string"
}
```
*Note: No `bookingid` field in this response body.*

### `DELETE /booking/{id}` — Response (status 201)
```
"Created"
```
*Plain text string, not JSON. Status is 201, not 200 or 204.*

### `GET /ping` — Response (status 201)
```
"Created"
```

## Test Data

| Key | Value | Notes |
| :--- | :--- | :--- |
| Auth username | `admin` | Default Booker credentials |
| Auth password | `password123` | Default Booker credentials |
| Sample firstname filter | `Sally` | Known to return results on the live sandbox |
| Sample checkin filter | `2026-01-01` | Use a recent date for filter tests |
| `totalprice` boundary | `0` | Edge case — zero price |
| Non-existent booking ID | `999999` | Used for 404 and 405 negative scenarios |

**Token usage:** Pass as `Cookie: token=<value>` header on PUT, PATCH, and DELETE requests. Basic Auth (`Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`) is also accepted as an alternative.

---

## Test Scenarios

### 1. Health Check

**Tag scope:** `@smoke`

#### 1.1. API Health Check `@smoke`

**File:** `tests/api/booking/health-check.spec.ts`

**Steps:**
  1. `GET /ping`
     - expect: status **201**
     - expect: response body is `"Created"`
     - expect: response time < 500ms

---

### 2. Authentication

**Tag scope:** `@smoke` for 2.1, `@regression` for 2.2

#### 2.1. Generate Valid Authentication Token `@smoke`

**File:** `tests/api/booking/generate-auth-token.spec.ts`

**Steps:**
  1. `POST /auth` with body `{"username":"admin","password":"password123"}`
     - expect: status **200**
     - expect: response body has `token` field (string, non-empty)
     - expect: response schema matches `token.schema.json`
     - expect: response time < 500ms

#### 2.2. Invalid Credentials — Body Assertion Required `@regression`

**File:** `tests/api/booking/invalid-auth.spec.ts`

**Steps:**
  1. `POST /auth` with body `{"username":"wrong","password":"wrong"}`
     - expect: status **200** (this is correct — the API does not return 4xx for bad creds)
     - expect: response body is `{"reason":"Bad credentials"}`
     - expect: response body does NOT contain a `token` field
     - **Do NOT assert a 401 or 403 status — this will always fail**

---

### 3. Booking Management

**Tag scope:** `@smoke` for 3.1 and 3.2, `@regression` for 3.3–3.6

#### 3.1. Create New Booking `@smoke`

**File:** `tests/api/booking/create-booking.spec.ts`

**Steps:**
  1. `POST /booking` with valid payload:
     ```json
     {
       "firstname": "Varun",
       "lastname": "TestQE",
       "totalprice": 150,
       "depositpaid": true,
       "bookingdates": { "checkin": "2026-01-01", "checkout": "2026-01-10" },
       "additionalneeds": "Breakfast"
     }
     ```
     - expect: status **200** (not 201)
     - expect: response body has `bookingid` (number) and `booking` object
     - expect: `booking` object matches the submitted payload exactly
     - expect: response schema matches `booking.schema.json`
     - expect: response time < 500ms
  2. `GET /booking/{bookingid}` using the ID from step 1
     - expect: status **200**
     - expect: response body matches submitted payload
     - expect: response body does NOT contain `bookingid` field (it is absent from GET response)

#### 3.2. Retrieve All Bookings `@smoke`

**File:** `tests/api/booking/get-bookings.spec.ts`

**Steps:**
  1. `GET /booking`
     - expect: status **200**
     - expect: response is an array of objects each with a `bookingid` number field
     - expect: array has at least one entry
     - expect: response schema matches `bookingList.schema.json`
     - expect: response time < 500ms

#### 3.3. Filter Bookings by Query Params `@regression`

**File:** `tests/api/booking/filter-bookings.spec.ts`

**Steps:**
  1. `GET /booking?firstname=Sally`
     - expect: status **200**
     - expect: returns array containing only bookings where firstname is Sally
  2. `GET /booking?checkin=2026-01-01`
     - expect: status **200**
     - expect: returns array of bookings with checkin on or after that date
  3. `GET /booking?firstname=ZZZNOMATCH`
     - expect: status **200**
     - expect: returns empty array `[]`

#### 3.4. Update Booking (Full Replace) `@regression`

**File:** `tests/api/booking/update-booking.spec.ts`

**Pre-condition:** Valid token and a created booking ID available via fixture

**Steps:**
  1. `PUT /booking/{id}` with complete updated payload and `Cookie: token=<value>` header
     - expect: status **200**
     - expect: response body reflects all updated fields
     - expect: response time < 500ms
  2. `PUT /booking/{id}` without auth token
     - expect: status **403**
  3. `GET /booking/{id}` to verify update persisted
     - expect: response body matches the PUT payload

#### 3.5. Partial Update Booking `@regression`

**File:** `tests/api/booking/partial-update-booking.spec.ts`

**Pre-condition:** Valid token and a created booking ID available via fixture

**Steps:**
  1. `PATCH /booking/{id}` with `{"firstname":"Patched","totalprice":999}` and `Cookie: token=<value>`
     - expect: status **200**
     - expect: `firstname` is `"Patched"` and `totalprice` is `999` in response
     - expect: all other fields (lastname, depositpaid, bookingdates, additionalneeds) are unchanged
  2. `PATCH /booking/{id}` without auth token
     - expect: status **403**

#### 3.6. Delete Booking `@regression`

**File:** `tests/api/booking/delete-booking.spec.ts`

**Pre-condition:** Valid token and a created booking ID available via fixture

**Steps:**
  1. `DELETE /booking/{id}` with `Cookie: token=<value>`
     - expect: status **201** (not 200 or 204 — this is the actual API behaviour)
     - expect: response body is `"Created"` (unusual but confirmed live)
  2. `GET /booking/{id}` after deletion
     - expect: status **404**
     - expect: response body is `"Not Found"`
  3. `DELETE /booking/{id}` without auth token
     - expect: status **403** (not 401)
  4. `DELETE /booking/999999` (non-existent ID) with valid token
     - expect: status **405** (confirmed live — server returns "Method Not Allowed" for non-existent IDs)

---

### 4. Data Validation and Edge Cases

**Tag scope:** `@regression` for 4.1, `@extended` for 4.2

#### 4.1. Response Schema Validation `@regression`

**File:** `tests/api/booking/response-schema-validation.spec.ts`

**Steps:**
  1. Validate `POST /booking` response against `booking.schema.json`
     - expect: `bookingid` is a number
     - expect: `booking.firstname`, `booking.lastname` are strings
     - expect: `booking.totalprice` is a number
     - expect: `booking.depositpaid` is a boolean
     - expect: `booking.bookingdates.checkin` and `checkout` are date strings
  2. Validate `GET /booking` response against `bookingList.schema.json`
     - expect: array of objects each with `bookingid` as number
  3. Validate `POST /auth` response against `token.schema.json`
     - expect: `token` is a string

#### 4.2. Edge Cases and Boundary Values `@extended`

**File:** `tests/api/booking/edge-cases.spec.ts`

**Steps:**
  1. `POST /booking` with `totalprice: 0`
     - expect: status **200**, booking created
  2. `POST /booking` with missing required field (e.g., no `lastname`)
     - expect: status **500** (confirmed live — API returns 500, not 400, for missing required fields)
  3. `POST /booking` with `checkin` date after `checkout` date
     - expect: status **200** (confirmed live — API accepts reversed dates without validation and creates the booking as submitted; assert the response contains the reversed dates exactly as sent)
  4. `GET /booking/{id}` with a string ID (e.g., `/booking/abc`)
     - expect: status **404** (confirmed live)

---

### 5. API Response Performance

**Tag scope:** `@extended`

#### 5.1. Response Time Baselines `@extended`

**File:** `tests/api/booking/response-performance.spec.ts`

**Note:** These are regression guards, not load tests. A single request per endpoint.

**Steps:**
  1. `GET /ping` — expect < 500ms
  2. `GET /booking` — expect < 500ms
  3. `POST /booking` — expect < 500ms
  4. `GET /booking/{id}` — expect < 500ms
  5. `DELETE /booking/{id}` — expect < 500ms

---

## Layer Tag Summary

| Scenario | Tag |
| :--- | :--- |
| 1.1 Health Check | `@smoke` |
| 2.1 Valid Auth Token | `@smoke` |
| 3.1 Create Booking | `@smoke` |
| 3.2 Get All Bookings | `@smoke` |
| 2.2 Invalid Auth | `@regression` |
| 3.3 Filter Bookings | `@regression` |
| 3.4 Update Booking (PUT) | `@regression` |
| 3.5 Partial Update (PATCH) | `@regression` |
| 3.6 Delete Booking | `@regression` |
| 4.1 Schema Validation | `@regression` |
| 4.2 Edge Cases | `@extended` |
| 5.1 Performance Baselines | `@extended` |

---

## Strategic Constraints

These global constraints apply to all scenarios and must be implemented by the Generator:

- **Contract Validation:** Assert that every API response matches its corresponding JSON schema (defined in `data/api/schemas/`).
- **Performance Baseline:** Assert that every API response time is < 500ms for all `@smoke` and `@regression` scenarios. Response time **must** be measured using `assertResponseTime` from `utils/response-timer.ts` with this pattern: `const start = Date.now(); const response = await service.method(); assertResponseTime(Date.now() - start, 500)`. **Do NOT** use `response.timing()` — this method does not exist on Playwright's `APIResponse`.
- **Network Strategy:** Use **Live Integration** for all tests. No network mocking allowed for this assessment.
- **Security Baseline:** Explicitly assert on 401/403 status codes for unauthorized access and verify that sensitive headers (like `Set-Cookie`) are handled correctly.
- **Isolation:** Every test uses its own test-scoped `request` fixture for context isolation, with unique UUID-prefixed data to ensure parallel safety. The `authToken` fixture is intentionally **worker-scoped** — one token is generated per parallel worker and shared across that worker's tests. Tokens are long-lived and there is no isolation benefit to re-authenticating per test; doing so only adds latency.
- **Idempotency:** Use `afterEach` hooks to delete any bookings created during the test run (where an ID is available).
