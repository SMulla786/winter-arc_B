# 🔍 Catering Backend — Complete Technical Error, Security & Architecture Audit

> **Summary**: Consolidated 40-item technical audit identifying critical runtime crashes, high-risk security flaws, multi-tenant authorization gaps, database transaction breaks, and architectural anti-patterns.

---

## 📊 Findings Overview by Priority

| Priority | Count | Risk Level | Target Action |
| :--- | :---: | :--- | :--- |
| 🔴 **P0** | **12** | Critical (Immediate Security / Data Corruption / Server Crash) | Remediate immediately in Phase 0–1 |
| 🟠 **P1** | **19** | High (Production Failure / Build Issue / Reliability Risk) | Remediate in Phase 1–2 |
| 🟡 **P2** | **9** | Medium (Technical Debt / Maintenance / Code Quality) | Remediate in Phase 3–4 |
| **Total** | **40** | **Comprehensive Codebase Audit** | Full Remediation Roadmap |

---

## 🚀 Most Urgent Remediation Sequence

1. 🔐 **Rotate Exposed Credentials**: Remove hardcoded AWS & SMTP secrets from source control immediately.
2. 🔑 **Shorten JWT Token Lifetimes**: Fix `30000m` / `30000d` expiration settings in `.env` and implement token rotation.
3. 🛡️ **Enforce Tenant Isolation (Finding #39)**: Validate `caterorId` ownership on every database query.
4. 🔄 **Fix Transaction Boundaries**: Ensure all nested writes share the same Prisma `tx` client to prevent orphaned user records.
5. 💰 **Fix Financial Precision & Ledger Sync**: Use Decimal-safe math and reconcile split ledger balances.
6. 💥 **Fix 404 & Prisma Error Crashes**: Eliminate double response headers and fix `.join()` on non-array targets.
7. 🐛 **Fix `createEvent` Client ID Bug (Finding #40)**: Prevent client ID overwrites on new client creation.
8. 🛑 **Re-enable Input Validation**: Un-comment Zod validation schemas across admin update controllers.

---

## 🔴 Category 1: Critical Server Crashes & Unhandled Exceptions

### - [x] #1 — Express 404 Response Header Crash (`ERR_HTTP_HEADERS_SENT`)
- **Severity**: 🔴 `P0 - Critical` (FIXED)
- **Location**: [src/middlewares/error.middleware.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/middlewares/error.middleware.ts#L7-L14)
- **Detailed Description**: `notFoundHandler` sends a JSON response (`res.status(404).json(...)`) and then calls `next(error)`. The centralized `errorHandler` attempts to send a *second* JSON response, causing an `ERR_HTTP_HEADERS_SENT` crash on invalid endpoints.
- **Recommended Fix**: Pass `new ApiError(...)` to `next(error)` without calling `res.json()` inside `notFoundHandler`.
- **Verification**: Query a non-existent URL and verify exactly one 404 HTTP response is returned.

---

### - [x] #2 — `PrismaError` Target `.join()` TypeError Crash
- **Severity**: 🔴 `P0 - Critical` (FIXED)
- **Location**: [src/utils/PrismaError.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/utils/PrismaError.ts#L20)
- **Detailed Description**: The error formatter assumes `error.meta.target` is always an Array (`(error.meta?.target as string[]).join(', ')`). In PostgreSQL unique constraint violations, `target` can be a string or `undefined`, causing a `TypeError: error.meta.target.join is not a function` crash that hides the real database error.
- **Recommended Fix**: Safely check target: `Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : String(error.meta?.target || 'field')`.
- **Verification**: Trigger a unique constraint error and verify a structured 499/409 response is returned.

---

### - [x] #3 — Unhandled DB Connection Failure on Startup
- **Severity**: 🔴 `P0 - Critical` (FIXED)
- **Location**: [src/index.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/index.ts#L8)
- **Detailed Description**: `prisma.$connect()` lacks a `.catch()` block. When the database is offline or unreachable on server boot, Node.js throws an unhandled promise rejection without clean diagnostic logging.
- **Recommended Fix**: Attach `.catch((err) => { logger.error("Database connection failed", err); process.exit(1); })`.
- **Verification**: Start server with an invalid `DATABASE_URL` and assert controlled process termination.

---

### - [x] #4 — Prisma Transaction Context Escape (Orphaned Data)
- **Severity**: 🔴 `P0 - Critical` (FIXED)
- **Location**: [src/services/admin/cateror.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/admin/cateror.service.ts#L90-L95)
- **Detailed Description**: Inside `prisma.$transaction(async (tx) => { ... })`, `registerCateror` calls `userService.registerUser(userData)`. However, `userService.registerUser` uses the global `prisma` client instead of the transaction client `tx`.
- **Consequence**: If cateror creation fails, user creation is **not** rolled back, leaving orphaned `User` rows in the database.
- **Recommended Fix**: Pass transaction instance `tx` to user registration: `userService.registerUser(userData, tx)`.
- **Verification**: Force `cateror.create` to fail and verify the created user is rolled back.

---

### - [x] #5 — Multer Temporary File Disk Leak
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/middlewares/multer.middleware.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/middlewares/multer.middleware.ts#L17-L29)
- **Detailed Description**: Multer writes uploaded files to `public/temp/`. However, `fs.unlink()` is never called in a `finally` block after S3 or Cloudinary uploads complete. Server hard drives will eventually run out of disk space.
- **Recommended Fix**: Delete local temp files in a `finally` block after upload processing.
- **Verification**: Upload 20 files and confirm `public/temp` directory remains clean.

---

## 🛡️ Category 2: Security Vulnerabilities & Misconfigurations

### - [x] #6 — CORS Browser Misconfiguration
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/app.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/app.ts#L32-L37)
- **Detailed Description**: Express sets `cors({ origin: '*', credentials: true })`. Browser CORS specs automatically block credentialed requests with wildcard `*` origins. Furthermore, `CORS_ORIGINS` configured in [.env](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/.env#L43) is ignored.
- **Recommended Fix**: Pass `config.cors.origins` array into `cors({ origin: config.cors.origins, credentials: true })`.
- **Verification**: Test cross-origin API requests from allowed and disallowed domains.

---

### - [x] #7 — Hardcoded AWS Secret Credentials Leak
- **Severity**: 🔴 `P0 - Critical` (FIXED)
- **Location**: [src/utils/s3upload.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/utils/s3upload.ts#L10-L11)
- **Detailed Description**: AWS Access Key ID and Secret Access Key are hardcoded into fallback strings inside source code (`AKIA6GBMAVK3TRJQ3ZKJ`).
- **Recommended Fix**: Remove all hardcoded credential fallbacks, rely strictly on environment variables, and rotate exposed AWS keys immediately.
- **Verification**: Perform code search for credential string literals.

---

### - [x] #8 — Excessive Decades-Long JWT Expiration Window
- **Severity**: 🔴 `P0 - Critical` (FIXED)
- **Location**: [.env](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/.env#L16-L19)
- **Detailed Description**: `JWT_ACCESS_EXPIRATION_MINUTES` is set to `30000` (~20.8 days) and `JWT_REFRESH_EXPIRATION_DAYS` is set to `30000` (~82 years!). Stolen tokens grant permanent unauthorized access.
- **Recommended Fix**: Set `JWT_ACCESS_EXPIRATION_MINUTES=30` and `JWT_REFRESH_EXPIRATION_DAYS=30`.
- **Verification**: Inspect `exp` timestamp on newly issued JWT tokens.

---

### - [x] #9 — Inactive Rate Limiting
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/app.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/app.ts#L47)
- **Detailed Description**: Rate limiting is attached to `/v1/auth`, but all API routes are mounted under `/api/v1`. Authentication endpoints are completely unprotected against brute-force attacks.
- **Recommended Fix**: Change route path to `app.use('/api/v1/users', authLimiter)`.
- **Verification**: Send 20 rapid requests to auth endpoints and confirm `429 Too Many Requests` is returned.

---

### - [x] #10 — Mass Assignment / Disabled Input Validation
- **Severity**: 🔴 `P0 - Critical` (FIXED)
- **Location**: [src/controllers/admin/cateror.controller.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/controllers/admin/cateror.controller.ts#L33-L35)
- **Detailed Description**: Zod validation schemas are commented out (`// const updateData = ...`), passing unvalidated `req.body.data` directly into Prisma update operations.
- **Recommended Fix**: Re-enable strict Zod schema validation for all administrative update controllers.
- **Verification**: Attempt to update protected fields via request body and verify rejection.

---

### - [ ] #11 — Plaintext SMTP Credentials & Expiring DevTunnel URL
- **Severity**: 🔴 `P0 - Critical` (Secrets) / 🟠 `P1` (Config)
- **Location**: [.env](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/.env#L10), [.env](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/.env#L34-L37)
- **Detailed Description**: Plaintext Gmail app passwords are stored in `.env`, and `SOP_URL` uses an expiring local DevTunnel link (`https://f5z16x7l-5100.inc1.devtunnels.ms`).
- **Recommended Fix**: Rotate SMTP password, move secrets out of version control, and set a stable production URL for SOP integration.
- **Verification**: Test SOP service connectivity with a production domain URL.

---

### - [ ] #12 — Dummy Cloudinary Credentials
- **Severity**: 🟡 `P2 - Medium`
- **Location**: [.env](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/.env#L46-L52)
- **Detailed Description**: Contains placeholder Cloudinary credentials (`your_cloudinary_api_key`), causing image upload calls to crash in production.
- **Recommended Fix**: Add configuration validation on startup to fail fast if required upload credentials are dummy values.
- **Verification**: Start app with missing keys and assert immediate startup failure message.

---

### - [x] #39 — Missing Cateror Ownership / Tenant Checks
- **Severity**: 🔴 `P0 - Critical Security` (FIXED)
- **Location**: Cateror services & child-resource lookups ([subEvent.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/subEvent.service.ts), [event.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/event.service.ts))
- **Detailed Description**: Authenticated access is not scoped by cateror identity. Many child-resource operations look up records using only primary key `id` without verifying `caterorId`. Cateror A can access or modify Cateror B's data by guessing UUIDs.
- **Recommended Fix**: Enforce `caterorId` in every `where` clause: `prisma.event.findFirst({ where: { id, caterorId } })`.
- **Verification**: Attempt cross-tenant data access using token from Cateror A against IDs belonging to Cateror B; verify `403 Forbidden` / `404 Not Found`.

---

## 🏛️ Category 3: Domain Modeling & Architectural Anti-Patterns

### - [x] #13 — Entangled `Maharaj` vs `Food Vendor` Domain Logic
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/services/caterors/subEvent.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/subEvent.service.ts#L2326-L2335)
- **Detailed Description**: `Maharaj` (internal cook) and `Food Vendor` (external supplier) are treated interchangeably in service code. Furthermore, if `dish.maharajId == 'Default'`, the application queries `prisma.maharaj.findFirst()` and binds the dish to whichever Maharaj happens to return first.
- **Recommended Fix**: Decouple `Maharaj` staff assignments from `FoodVendor` orders. Replace magic string `'Default'` with explicit assignment rules.
- **Verification**: Test dish assignment with multiple chefs and suppliers.

---

### - [ ] #14 — 11+ Fragmented & Duplicate Vendor Entities
- **Severity**: 🟡 `P2 - Medium`
- **Location**: [prisma/schema.prisma](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/prisma/schema.prisma)
- **Detailed Description**: The schema defines 11 separate vendor models (`Vendor`, `foodVendors`, `manpowerVendors`, `displayVendor`, `DisposalVendor`, `rawMaterialVendor`, `additionalVendor`, `CounterManpowerVendors`, `caterorCounterManpowerVendors`, `eventVendorHistory`, `sendToVendor`). `IncomeExpenditureHistory` requires 6 separate nullable foreign keys to link vendor payments.
- **Recommended Fix**: Normalize vendor entities into a unified `Vendor` model with a `vendorType` discriminator enum.
- **Verification**: Map out ER schema for consolidated vendor design.

---

### - [ ] #15 — Overloaded & Bloated Route Files ("Too Many Routes")
- **Severity**: 🟡 `P2 - Medium`
- **Location**: [src/routes/cateror/event.routes.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/src/routes/cateror/event.routes.ts) (240 lines, 40+ endpoints)
- **Detailed Description**: `event.routes.ts` mixes 40+ unrelated sub-resources (events, subevents, raw materials, actual/expected people, transport, fuel, feedback, quotations, bills, manpower, extra cost, utensils, cutlery, disposals) into a single file.
- **Recommended Fix**: Split `event.routes.ts` into sub-routers: `event.routes.ts`, `subEvent.routes.ts`, `quotation.routes.ts`, `eventRawMaterial.routes.ts`.
- **Verification**: Verify route registration and endpoint tests after split.

---

### - [ ] #16 — Monolithic "God Services" Bloat
- **Severity**: 🟠 `P1 - High`
- **Location**: [subEvent.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/src/services/caterors/subEvent.service.ts) (**150 KB / 3,000+ lines**), [vendor.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/src/services/caterors/vendor.service.ts) (**101 KB**)
- **Detailed Description**: Large monolithic service files mix business calculations, PDF generation, vendor communications, raw database queries, and inventory updates in single files.
- **Recommended Fix**: Decompose giant services into domain-specific modules (e.g. `subEventCalculator.service.ts`, `subEventPlanner.service.ts`).
- **Verification**: Run unit tests on extracted service modules.

---

### - [ ] #17 — Split & Unsynchronized Financial Ledgers
- **Severity**: 🔴 `P0 - Critical` / 🟠 `P1`
- **Location**: [caterorExpense.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/src/services/caterors/caterorExpense.service.ts), [accountAndAnalysis.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/src/services/caterors/accountAndAnalysis.service.ts)
- **Detailed Description**: Financial transactions are recorded across three disconnected systems (`caterorExpences`, `IncomeExpenditureWallet`, `amountStatus`) in non-transactional operations, causing ledgers to drift out of sync.
- **Recommended Fix**: Define `IncomeExpenditureWallet` as the single source of truth and wrap all ledger writes in `$transaction`.
- **Verification**: Execute payment scenarios and reconcile total balances.

---

### - [ ] #18 — Unlinked Vendor/User Relations
- **Severity**: 🟡 `P2 - Medium`
- **Location**: [prisma/schema.prisma](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/prisma/schema.prisma#L320)
- **Detailed Description**: `Maharaj`, `foodVendors`, `displayVendor`, `rawMaterialVendor`, `additionalVendor` models store contact info directly without linking to `User` accounts.
- **Recommended Fix**: Add optional `userId` foreign key relations to vendor/contact models.
- **Verification**: Assert user-to-vendor identity linkage.

---

### - [x] #40 — `createEvent` Client ID Overwrite Bug
- **Severity**: 🔴 `P0 - Critical` / 🟠 `P1` (FIXED)
- **Location**: [src/services/caterors/event.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/event.service.ts)
- **Detailed Description**: In event creation, `clientId` is retrieved from newly created Client data, but is subsequently overwritten by `clientId = findClient?.id`. When creating an event for a brand-new client, `findClient` is undefined, setting `clientId = undefined` and failing the event creation logic.
- **Recommended Fix**: Assign `clientId` conditionally within existing-client vs new-client branches without overwriting it afterwards.
- **Verification**: Create an event for a new phone number and confirm event creation succeeds.

---

## 🗄️ Category 4: Database & Schema Quality Issues

### - [x] #19 — `DATABASE_URL` Typo in `.env.example`
- **Severity**: 🟡 `P2 - Medium` (FIXED)
- **Location**: [.env.example](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/.env.example#L8)
- **Detailed Description**: Example configuration contains `schema=pubic` instead of `schema=public`.
- **Recommended Fix**: Correct typo in `.env.example`.
- **Verification**: Verify clean database connection with template `.env`.

---

### - [ ] #20 — Inconsistent Model Casing in Prisma Schema
- **Severity**: 🟡 `P2 - Medium`
- **Location**: [prisma/schema.prisma](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/prisma/schema.prisma)
- **Detailed Description**: Mixes PascalCase (`User`, `Cateror`) with lowercase/camelCase (`employee`, `firms`, `eventManpower`, `subEventDisplay`, `sop`, `department`, `eventtype`).
- **Recommended Fix**: Standardize all models to PascalCase and use `@@map` for legacy table mappings.
- **Verification**: Run `npx prisma validate`.

---

### - [ ] #21 — Model & Field Spelling Typos in Schema
- **Severity**: 🟡 `P2 - Medium`
- **Location**: [prisma/schema.prisma](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/prisma/schema.prisma)
- **Detailed Description**: Typos in model names: `catrorReview`, `catrorAdditionalService`, `caterorExpences`, `dsisposalPurchaseMaterials`, `eventTrasnport`, `quatationDesign`.
- **Recommended Fix**: Fix model/field spelling in schema migrations.
- **Verification**: Run Prisma schema validation and build checks.

---

### - [x] #22 — Missing Foreign Key Database Indexes
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [prisma/schema.prisma](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj-b/prisma/schema.prisma)
- **Detailed Description**: Relational foreign keys (`caterorId`, `eventId`, `subEventId`, `dishId`, `rawMaterialId`) across high-volume tables lack `@index` directives, causing full table scans.
- **Recommended Fix**: Add `@index([caterorId])`, `@index([eventId])`, `@index([subEventId])` on relational models.
- **Verification**: Inspect PostgreSQL query execution plans (`EXPLAIN ANALYZE`).

---

### - [x] #23 — Missing Prisma Seed Configuration
- **Severity**: 🟡 `P2 - Medium` (FIXED)
- **Location**: [package.json](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/package.json#L33)
- **Detailed Description**: `package.json` contains script `"prisma:db:seed": "prisma db seed"`, but lacks the required `"prisma": { "seed": "ts-node prisma/seed.ts" }` config block.
- **Recommended Fix**: Add `"prisma": { "seed": "ts-node prisma/seed.ts" }` to `package.json`.
- **Verification**: Execute `npx prisma db seed`.

---

## 📁 Category 5: Code Quality, File Typos & Dead Code

### - [x] #24 — Direct Database Access in Route Layer
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/routes/index.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/routes/index.ts#L45-L96)
- **Detailed Description**: Endpoint `/subeventbyId/:id` executes raw Prisma queries inside the route file instead of delegating to a controller and service.
- **Recommended Fix**: Move database logic to `subEvent.service.ts` and call it via `subEvent.controller.ts`.
- **Verification**: Confirm route file contains zero database queries.

---

### - [ ] #25 — Directory Pluralization Mismatch
- **Severity**: 🟡 `P2 - Medium`
- **Location**: `controllers/cateror` (singular) vs `services/caterors` (plural)
- **Detailed Description**: Controller folder is singular while service folder is plural.
- **Recommended Fix**: Rename `src/services/caterors` to `src/services/cateror`.
- **Verification**: Run TypeScript build to confirm all module imports resolve.

---

### - [x] #26 — File Name Typos & Irregular Extensions
- **Severity**: 🟡 `P2 - Medium` (FIXED)
- **Locations**:
  - `copy.data.validatation.ts` (`validatation` typo)
  - `eventype.validation.ts` (`eventype` typo)
  - `eventManger.validation.ts` (`eventManger` typo)
  - `caterorExpences.routes.ts` (`Expences` typo)
  - Extension mixing: `transport.route.ts` vs `.routes.ts`
- **Recommended Fix**: Fix file typos and standardize extension to `.routes.ts` and `.validation.ts`.
- **Verification**: Run `npm run lint`.

---

### - [x] #27 — Empty `eventAnalysis.validation.ts` File
- **Severity**: 🟡 `P2 - Medium` (FIXED)
- **Location**: [src/validations/eventAnalysis.validation.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/validations/eventAnalysis.validation.ts)
- **Detailed Description**: File is 0 bytes (completely empty).
- **Recommended Fix**: Add Zod validation schema or delete if unused.
- **Verification**: Confirm file is non-empty or safely deleted.

---

### - [x] #28 — Dead and Duplicate Files
- **Severity**: 🟡 `P2 - Medium` (FIXED)
- **Locations**: [salaries.controller.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/controllers/cateror/salaries.controller.ts) (133 lines of commented code), [s3upload1.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/utils/s3upload1.ts) (unused helper duplicate)
- **Recommended Fix**: Delete dead and duplicate files.
- **Verification**: Verify no broken imports exist across codebase.

---

### - [x] #29 — Duplicate Controller Import in Main Router
- **Severity**: 🟡 `P2 - Medium` (FIXED)
- **Location**: [src/routes/index.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/routes/index.ts#L11-L15)
- **Detailed Description**: `subEvent.controller.ts` is imported twice under two different alias names (`caterorSubEventController` and `subEventController`).
- **Recommended Fix**: Consolidate to a single import alias.
- **Verification**: Confirm clean route compilation.

---

## ⚙️ Category 6: TypeScript & CLI Config Errors

### - [x] #30 — Missing Global Type Import in `express.d.ts`
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/types/express.d.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/types/express.d.ts#L11)
- **Detailed Description**: `role: Role;` is declared inside `Express.Request` without importing `Role` from `@prisma/client`.
- **Recommended Fix**: Add `import { Role } from '@prisma/client';` at top of file.
- **Verification**: Run `npx tsc --noEmit`.

---

### - [x] #31 — Un-exported Type Reference in Response Types
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/types/response.d.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/types/response.d.ts#L24)
- **Detailed Description**: `employeeRestriction?: employeeRestriction;` references an un-exported / commented-out Prisma model.
- **Recommended Fix**: Export `employeeRestriction` type or remove property.
- **Verification**: Run `npx tsc --noEmit`.

---

### - [x] #32 — Broken `updateRoleToAdmin` CLI Script
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [package.json](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/package.json#L35)
- **Detailed Description**: Script `"updateRoleToAdmin": "node -r module-alias/register src/cli/updateRoleToAdmin.js"` fails because `updateRoleToAdmin.js` does not exist in `src/cli/` (it is `updateRoleToAdmin.ts`).
- **Recommended Fix**: Change script to use `dist/cli/updateRoleToAdmin.js` or `ts-node`.
- **Verification**: Execute `npm run updateRoleToAdmin`.

---

### - [x] #33 — Non-Existent `tsconfig.json` Include Path
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [tsconfig.json](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/tsconfig.json#L27)
- **Detailed Description**: Config includes `"src/seeding/priority.ts"`, but no `src/seeding` directory exists.
- **Recommended Fix**: Remove stale path from `include` array.
- **Verification**: Run `npx tsc --noEmit`.

---

## 📧 Category 7: Email, Validation & Financial Edge-Cases

### - [x] #34 — Dummy Fallback URLs in Email Templates
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/services/email.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/email.service.ts#L51-L102)
- **Detailed Description**: Email templates use hardcoded fallback URLs `http://link-to-app/reset-password?token=...` and `http://link-to-app/verify`. If `customUrl` is missing, users receive broken email links.
- **Recommended Fix**: Require `config.frontendUrl` from environment variables.
- **Verification**: Send test emails and check link validity.

---

### - [x] #35 — Infinite `while` Loop Phone Generator
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/services/admin/cateror.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/admin/cateror.service.ts#L20-L42)
- **Detailed Description**: `generateIndianPhoneNumber()` continuously queries the DB in a `while` loop generating random numbers until an unused number is found. Under high database load, this loop can stall the process.
- **Recommended Fix**: Add maximum iteration limit (e.g. 10 retries) and throw an error if limit is exceeded.
- **Verification**: Test generator under simulated collision scenario.

---

### - [x] #36 — Floating-Point Financial Precision Loss
- **Severity**: 🔴 `P0 - Critical` / 🟠 `P1` (FIXED)
- **Location**: Financial services ([accountAndAnalysis.service.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/accountAndAnalysis.service.ts#L101-L115))
- **Detailed Description**: Prisma `Decimal` values are converted to JS numbers (`Number(decimal)`), introducing IEEE 754 rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`) on ledger totals.
- **Recommended Fix**: Keep financial values as `Decimal` or integer cents/paise until final presentation.
- **Verification**: Run currency calculation tests.

---

### - [x] #37 — Rigid Phone Number Regex Rules
- **Severity**: 🟡 `P2 - Medium` (FIXED)
- **Location**: [src/validations/common.validation.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/validations/common.validation.ts#L7-L14)
- **Detailed Description**: `phoneNumberSchema` uses strict 10-digit regex `/^[6-9]\d{9}$/`, rejecting legitimate numbers formatted with `+91` country prefix.
- **Recommended Fix**: Normalize phone input (strip non-digits / handle `+91` prefix) before validation.
- **Verification**: Test phone numbers with `+91` prefix.

---

### - [x] #38 — Type Conflict in `ApiResponse` Constructor
- **Severity**: 🟠 `P1 - High` (FIXED)
- **Location**: [src/utils/ApiResponse.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/utils/ApiResponse.ts#L15), [src/middlewares/error.middleware.ts](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/middlewares/error.middleware.ts#L43)
- **Detailed Description**: `ApiResponse` constructor types `errors` parameter as `string`, but `error.middleware.ts` passes array/object error structures (`err.errors`).
- **Recommended Fix**: Update `ApiResponse` constructor to accept `errors?: string | object | null`.
- **Verification**: Run `npx tsc --noEmit`.

---

## 🧪 Recommended Test Matrix

| Category | Test Scenario | Expected Outcome | Priority |
| :--- | :--- | :--- | :---: |
| **Tenant Isolation** | Cateror A requests event ID of Cateror B | `403 Forbidden` / `404 Not Found` | 🔴 P0 |
| **Transactions** | Force child row creation failure in transaction | All parent & child rows rolled back | 🔴 P0 |
| **Error Handling** | Request a non-existent URL | Exactly one HTTP 404 response returned | 🔴 P0 |
| **Financials** | Calculate total invoices with decimals | Exact monetary total with zero rounding drift | 🔴 P0 |
| **Rate Limiting** | Send 20 rapid login attempts | `429 Too Many Requests` status code | 🟠 P1 |
| **Uploads** | Upload large file and check `public/temp` | Temporary file deleted from disk | 🟠 P1 |

---

## 📋 Comprehensive Refactoring Roadmap

```mermaid
flowchart TD
    A[Phase 0: Containment & Secrets] --> B[Phase 1: Critical Fixes & Data Safety]
    B --> C[Phase 2: Security & Tenant Isolation]
    C --> D[Phase 3: Domain & DB Normalization]
    D --> E[Phase 4: Service & Route Modularization]
```

- **Phase 0 — Containment & Secrets**: Rotate exposed AWS & SMTP credentials, fix JWT expiration window (`30m` / `30d`), re-enable admin validation schemas.
- **Phase 1 — Critical Fixes & Data Safety**: Fix Express 404 double-header crash, fix `PrismaError` `.join()` crash, fix `$transaction` context escape bug, add Multer disk cleanup, fix `createEvent` client ID bug.
- **Phase 2 — Security & Tenant Isolation**: Enforce `caterorId` ownership checks across all services (#39), fix CORS configuration, mount rate limiter on `/api/v1/users`.
- **Phase 3 — Domain & DB Normalization**: Normalize 11 vendor models into unified `Vendor` table, decouple `Maharaj` from `FoodVendor`, add missing foreign key database indexes.
- **Phase 4 — Service & Route Modularization**: Deconstruct `event.routes.ts` into sub-routers, split `subEvent.service.ts` (150KB) into domain modules.