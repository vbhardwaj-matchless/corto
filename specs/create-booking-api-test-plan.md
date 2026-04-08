# Create Booking API Test Plan

## Application Overview

This test plan covers comprehensive testing scenarios for the Create Booking API endpoint (POST /booking) of the restful-booker service. The API allows creating hotel bookings without authentication and returns booking details with a unique booking ID. Testing focuses on request/response validation, data persistence, error handling, and performance requirements.

## Test Scenarios

### 1. Smoke Tests

**Seed:** `tests/seed.spec.ts`

#### 1.1. Create booking with all valid fields

**File:** `tests/api/booking/smoke/create-booking-complete.spec.ts`

**Steps:**
  1. Send POST request to /booking endpoint with complete valid payload including all required and optional fields
    - expect: Response returns HTTP 200 status (not 201)
    - expect: Response body contains bookingid as a number
    - expect: Response body contains booking object with complete payload echo
    - expect: All submitted fields are accurately reflected in the response

#### 1.2. Create booking without optional additionalneeds field

**File:** `tests/api/booking/partb/smoke/create-booking-minimal.spec.ts`

**Steps:**
  1. Send POST request to /booking endpoint with only required fields (firstname, lastname, totalprice, depositpaid, bookingdates)
    - expect: Response returns HTTP 200 status
    - expect: Response body contains bookingid as a number
    - expect: Response body contains booking object without additionalneeds field
    - expect: All required fields are present and match submitted data

### 2. Regression Tests

**Seed:** `tests/seed.spec.ts`

#### 2.1. Verify booking persistence after creation

**File:** `tests/api/booking/partb/regression/booking-persistence.spec.ts`

**Steps:**
  1. Create a booking via POST /booking and capture the returned bookingid
    - expect: Booking creation returns HTTP 200 with valid bookingid
  2. Retrieve the created booking using GET /booking/{id} with the captured bookingid
    - expect: GET request returns HTTP 200 status
    - expect: Response body matches the original booking payload
    - expect: bookingid field is absent from the GET response body (as documented)

#### 2.2. Verify minimum required fields handling

**File:** `tests/api/booking/partb/regression/minimum-fields.spec.ts`

**Steps:**
  1. Send POST request with exactly the minimum required fields: firstname, lastname, totalprice, depositpaid, and bookingdates (checkin, checkout)
    - expect: Response returns HTTP 200 status
    - expect: Booking is successfully created with only required fields
    - expect: Response structure matches expected format without optional fields

#### 2.3. Response time performance validation

**File:** `tests/api/booking/partb/regression/performance-validation.spec.ts`

**Steps:**
  1. Send POST request to create booking and measure response time
    - expect: Response time is within 3000ms (Heroku free-dyno SLA)
    - expect: Booking creation completes successfully within performance threshold

#### 2.4. Response schema validation

**File:** `tests/api/booking/partb/regression/schema-validation.spec.ts`

**Steps:**
  1. Create booking and validate response against booking.schema.json
    - expect: Response body structure matches booking.schema.json specification
    - expect: All required fields are present with correct data types
    - expect: Response format is consistent and valid

### 3. Edge Cases and Error Handling

**Seed:** `tests/seed.spec.ts`

#### 3.1. Handle missing required firstname field

**File:** `tests/api/booking/partb/edge-cases/missing-firstname.spec.ts`

**Steps:**
  1. Send POST request with payload missing the required firstname field
    - expect: Response returns HTTP 500 status (server-side validation)
    - expect: Booking is not created due to missing required field
    - expect: Error response indicates validation failure

#### 3.2. Handle missing required lastname field

**File:** `tests/api/booking/partb/edge-cases/missing-lastname.spec.ts`

**Steps:**
  1. Send POST request with payload missing the required lastname field
    - expect: Response returns HTTP 500 status
    - expect: Booking creation fails with appropriate error indication

#### 3.3. Handle missing totalprice field

**File:** `tests/api/booking/partb/edge-cases/missing-totalprice.spec.ts`

**Steps:**
  1. Send POST request with payload missing the required totalprice field
    - expect: Response returns HTTP 500 status
    - expect: Server-side validation prevents booking creation

#### 3.4. Handle missing depositpaid field

**File:** `tests/api/booking/partb/edge-cases/missing-depositpaid.spec.ts`

**Steps:**
  1. Send POST request with payload missing the required depositpaid field
    - expect: Response returns HTTP 500 status
    - expect: Booking creation fails due to missing required boolean field

#### 3.5. Handle missing bookingdates object

**File:** `tests/api/booking/partb/edge-cases/missing-bookingdates.spec.ts`

**Steps:**
  1. Send POST request with payload missing the entire bookingdates object
    - expect: Response returns HTTP 500 status
    - expect: Server rejects request due to missing required nested object

#### 3.6. Handle missing checkin date

**File:** `tests/api/booking/partb/edge-cases/missing-checkin.spec.ts`

**Steps:**
  1. Send POST request with bookingdates object missing the required checkin field
    - expect: Response returns HTTP 500 status
    - expect: Booking creation fails due to incomplete booking dates

#### 3.7. Handle missing checkout date

**File:** `tests/api/booking/partb/edge-cases/missing-checkout.spec.ts`

**Steps:**
  1. Send POST request with bookingdates object missing the required checkout field
    - expect: Response returns HTTP 500 status
    - expect: Server validation prevents booking without complete date range

#### 3.8. Handle invalid date format

**File:** `tests/api/booking/partb/edge-cases/invalid-date-format.spec.ts`

**Steps:**
  1. Send POST request with checkin/checkout dates in invalid format (not YYYY-MM-DD ISO format)
    - expect: Response returns HTTP 500 status or validation error
    - expect: Server rejects booking with improperly formatted dates

#### 3.9. Handle totalprice as string instead of number

**File:** `tests/api/booking/partb/edge-cases/totalprice-type-coercion.spec.ts`

**Steps:**
  1. Send POST request with totalprice as string value instead of number
    - expect: Response returns HTTP 200 (if API performs type coercion) OR HTTP 500 (if strict validation)
    - expect: Behavior is consistent and documented based on server implementation

#### 3.10. Handle excessively large totalprice values

**File:** `tests/api/booking/partb/edge-cases/boundary-totalprice.spec.ts`

**Steps:**
  1. Send POST request with extremely large totalprice values to test numeric boundaries
    - expect: Server handles large numeric values appropriately
    - expect: Response indicates success or provides clear error for boundary violations

#### 3.11. Handle negative totalprice values

**File:** `tests/api/booking/partb/edge-cases/negative-totalprice.spec.ts`

**Steps:**
  1. Send POST request with negative totalprice value
    - expect: Server handles negative pricing appropriately
    - expect: Business logic validation for realistic pricing constraints

#### 3.12. Handle checkout date before checkin date

**File:** `tests/api/booking/partb/edge-cases/invalid-date-range.spec.ts`

**Steps:**
  1. Send POST request with checkout date that occurs before checkin date
    - expect: Server validates logical date sequence
    - expect: Appropriate error response for invalid date ranges
