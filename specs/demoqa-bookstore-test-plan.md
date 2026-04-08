# DemoQA Book Store Application Test Plan

## Application Overview

The DemoQA Book Store is a web application that allows users to browse books, log in, and manage their personal book collections. Registration is out of scope for this assessment. The application uses a custom React UI — all dialogs are modal components, not native browser dialogs.

**Validated base URL:** `https://demoqa.com/books`
**Page `document.title`:** `demosite` (not "Book Store" — do not assert on page title)
**Post-login redirect:** `/profile` (not `/books`)

---

## Test Data

| Key | Value | Notes |
| :--- | :--- | :--- |
| `DEMOQA_USERNAME` | `vron` | From `config/environments.ts` — do not hardcode |
| `DEMOQA_PASSWORD` | `#Corto1234` | From `config/environments.ts` — do not hardcode |
| Book ISBN (Git Pocket Guide) | `9781449325862` | Used for add/delete and detail view scenarios |
| Book Title | `Git Pocket Guide` | Used for search and collection assertions |
| Book Author | `Richard E. Silverman` | Used for detail view assertions |
| Book Publisher | `O'Reilly Media` | Used for detail view assertions |
| Book Sub Title | `A Working Introduction` | Used for detail view assertions |
| Book Total Pages | `234` | Used for detail view assertions |

**Authentication method for tests:** Use `POST https://demoqa.com/Account/v1/Login` with `{"userName": "vron", "password": "#Corto1234"}` to obtain a token and inject into browser `storageState`. Do not use the UI login form in test setup — it is slow and fragile. The UI login form is only tested explicitly in Scenario 1.1.

---

## Test Scenarios

### 1. Authentication Flow

**Seed:** `tests/seed.spec.ts`
**Tag scope:** `@smoke` for 1.1, `@regression` for 1.2 and 1.3

#### 1.1. Valid User Login `@smoke`

**File:** `tests/ui/bookstore/valid-login.spec.ts`

**Steps:**
  1. Navigate to `https://demoqa.com/login`
     - expect: `#userName` and `#password` inputs are visible
     - expect: `#login` button is present
  2. Enter valid credentials and click Login
     - expect: URL pathname changes to `/profile` — assert `expect(new URL(page.url()).pathname).toBe('/profile')` (do not assert the full absolute URL; it couples the test to a specific environment)
     - expect: `#userName-value` label displays the logged-in username
     - expect: `#submit` button with text "Logout" is visible in the header

#### 1.2. Invalid Login Credentials `@regression`

**File:** `tests/ui/bookstore/invalid-login.spec.ts`

**Steps:**
  1. Navigate to `https://demoqa.com/login`
  2. Enter invalid username and password, click Login
     - expect: URL pathname remains `/login` — assert `expect(new URL(page.url()).pathname).toBe('/login')`
     - expect: Element `#name` with text `"Invalid username or password!"` is visible
     - expect: No redirect occurs

#### 1.3. Access Profile Without Authentication `@regression`

**File:** `tests/ui/bookstore/unauthorized-profile-access.spec.ts`

**Steps:**
  1. Navigate directly to `https://demoqa.com/profile` without logging in
     - expect: The following exact message is visible on the page:
       `"Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself."`
     - expect: A link to the login page is present

---

### 2. Book Store Browsing

**Seed:** `tests/seed.spec.ts`
**Tag scope:** `@smoke` for 2.1, `@regression` for 2.2 and 2.3

#### 2.1. Browse Book Catalog `@smoke`

**File:** `tests/ui/bookstore/browse-books.spec.ts`

**Steps:**
  1. Navigate to `https://demoqa.com/books`
     - expect: Book catalog table is visible with columns: Image, Title, Author, Publisher
     - expect: At least one book row is present
     - expect: `#searchBox` input is visible
  2. Verify book row data
     - expect: Each row has a clickable title link
     - expect: Author and Publisher columns are populated

#### 2.2. Search Functionality `@regression`

**File:** `tests/ui/bookstore/search-books.spec.ts`

**Steps:**
  1. Type `"Git"` into `#searchBox`
     - expect: Book list filters to show only books with "Git" in the title
     - expect: "Git Pocket Guide" row is visible
  2. Clear the search box
     - expect: All 8 books are displayed again

#### 2.3. Book Detail View `@regression`

**File:** `tests/ui/bookstore/book-details.spec.ts`

**Steps:**
  1. Click on "Git Pocket Guide" title link from the book list
     - expect: URL contains `/books` with query param `search=9781449325862` — assert `expect(page.url()).toContain('/books?search=9781449325862')` (do not assert the full absolute URL)
     - expect: ISBN `9781449325862` is displayed
     - expect: Title `"Git Pocket Guide"`, Sub Title `"A Working Introduction"` are displayed
     - expect: Author `"Richard E. Silverman"`, Publisher `"O'Reilly Media"` are displayed
     - expect: Total Pages `234` is displayed
     - expect: `#addNewRecordButton` with text "Back To Book Store" is present
     - expect: `getByRole('button', { name: 'Add To Your Collection' })` is visible (when authenticated — DemoQA renders both buttons with `id="addNewRecordButton"`, causing duplicate IDs; target by role+name)

---

### 3. Collection Management

**Seed:** `tests/seed.spec.ts`
**Tag scope:** `@smoke` for 3.1, `@regression` for 3.2 and 3.3

#### 3.1. Add Book to Collection `@smoke`

**File:** `tests/ui/bookstore/add-book-to-collection.spec.ts`

**Pre-condition:** User is authenticated via API login (not UI form — use `storageState` fixture)

**Steps:**
  1. Navigate to the "Git Pocket Guide" detail page
     - expect: `getByRole('button', { name: 'Add To Your Collection' })` is visible (both "Back To Book Store" and "Add To Your Collection" share `id="addNewRecordButton"` on DemoQA; target by role+name)
  2. Click `getByRole('button', { name: 'Add To Your Collection' })`
     - expect: No error dialog appears
     - expect: No redirect occurs — user remains on the book detail page
  3. Navigate to `https://demoqa.com/profile`
     - expect: "Git Pocket Guide" appears in the books table
     - expect: Pagination shows "Page 1 of 1"

**Note:** A successful first-time add does NOT trigger a visible alert or toast. The confirmation is the book appearing in the profile. A second add attempt triggers a native `window.alert` with text: `"Book already present in the your collection!"` — this is the duplicate-add negative scenario (see 3.4).

#### 3.2. Remove Single Book from Collection `@regression`

**File:** `tests/ui/bookstore/remove-book-from-collection.spec.ts`

**Pre-condition:** User is authenticated and has at least one book in collection

**Steps:**
  1. Navigate to `https://demoqa.com/profile`
     - expect: At least one book row is visible in the table
     - expect: Delete icon (`span[hint="Delete"]`) is visible in the Action column
  2. Click the delete icon for a specific book
     - expect: A **custom React modal** appears (NOT a native browser dialog)
     - expect: `[role="dialog"]` is visible
     - expect: Modal title is `"Delete Book"`
     - expect: Modal body text is `"Do you want to delete this book?"`
     - expect: `#closeSmallModal-ok` (OK) and `#closeSmallModal-cancel` (Cancel) buttons are present
  3. Click OK
     - expect: Modal closes
     - expect: The deleted book no longer appears in the collection table

**Note:** Use `page.getByRole('dialog')` for this modal — NOT `page.on('dialog')`. These are different Playwright APIs.

#### 3.3. Delete All Books from Collection `@regression`

**File:** `tests/ui/bookstore/delete-all-books.spec.ts`

**Pre-condition:** User is authenticated and has at least one book in collection

**Steps:**
  1. Navigate to `https://demoqa.com/profile`
     - expect: `#submit` button with text "Delete All Books" is visible
  2. Click "Delete All Books"
     - expect: A **custom React modal** appears (NOT a native browser dialog — use `page.getByRole('dialog')`, not `page.on('dialog')`)
     - expect: `[role="dialog"]` is visible with body text `"Do you want to delete all books?"`
     - expect: `#closeSmallModal-ok` (OK) and `#closeSmallModal-cancel` (Cancel) buttons are present
  3. Click `#closeSmallModal-ok` to confirm deletion
     - expect: Collection table is empty
     - expect: Pagination shows "Page 1 of 0"

#### 3.4. Duplicate Add Attempt (Negative) `@extended`

**File:** `tests/ui/bookstore/duplicate-add-book.spec.ts`

**Pre-condition:** User is authenticated. "Git Pocket Guide" (ISBN `9781449325862`) must be in the collection before the test — **self-provision via API in `beforeEach`**: `POST https://demoqa.com/BookStore/v1/Books` with `{ userId, collectionOfIsbns: [{ isbn: '9781449325862' }] }` and `Authorization: Bearer <token>`. If the response is 400 (already present), continue — the pre-condition is satisfied. **Do not rely on Scenario 3.1 having run first.** Every test must be runnable in isolation.

**Steps:**
  1. Navigate to the "Git Pocket Guide" detail page
  2. Register the dialog handler, THEN click `getByRole('button', { name: 'Add To Your Collection' })` again
     - **Register `page.on('dialog', dialog => dialog.accept())` BEFORE triggering the click.** If the listener is registered after the click, the alert fires and auto-dismisses before the handler is attached and the test will hang.
     - expect: Native `window.alert` fires with exact text: `"Book already present in the your collection!"`
     - expect: Book count in profile remains unchanged

---

## Layer Tag Summary

| Scenario | Tag |
| :--- | :--- |
| 1.1 Valid Login | `@smoke` |
| 2.1 Browse Catalog | `@smoke` |
| 3.1 Add Book | `@smoke` |
| 1.2 Invalid Login | `@regression` |
| 1.3 Unauthorized Access | `@regression` |
| 2.2 Search | `@regression` |
| 2.3 Book Detail | `@regression` |
| 3.2 Remove Single Book | `@regression` |
| 3.3 Delete All Books | `@regression` |
| 3.4 Duplicate Add | `@extended` |

---

## Strategic Constraints

These global constraints apply to all scenarios and must be implemented by the Generator:

- **Accessibility:** Trigger a `@axe-core/playwright` scan on every page transition (Login, Books, Profile). Fail the test if any critical or serious violations are found.
- **Performance:** Assert that the "Time to Actionable" (page load + key element visibility) is < 500ms for every navigation.
- **Network Strategy:** Use **Live Integration** for all `@smoke` and `@regression` tests. No network mocking allowed for these layers.
- **Locator Strategy:** Use semantic locators (`getByRole`, `getByPlaceholder`) where the DOM provides sufficient accessibility information. DemoQA's `<label>` elements have no `for` attribute and no `aria-label` attributes — `getByLabel` does **not** match any input on this site. Use `#id` selectors for DemoQA form inputs (`#userName`, `#password`, `#searchBox`) — these are stable element contracts, not aesthetic CSS classes. Use `getByRole('button', { name: '...' })` for buttons and `getByPlaceholder` for the search input.
- **URL Assertions:** Never assert on full absolute URLs. Use `expect(new URL(page.url()).pathname).toBe('/path')` or `expect(page.url()).toContain('/path')` to keep tests environment-independent. The base URL is read from `config/environments.ts`.
- **Isolation:** Every test must use a fresh `browserContext` and `storageState` (where applicable) to ensure zero state leakage.
