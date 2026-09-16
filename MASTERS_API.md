# Backend Master APIs Documentation & Pagination Reference

This document provides a comprehensive overview of all **Master APIs** available in the backend system, including routes, query parameters, pagination standards, and calendar month filtering updates.

Base API Endpoint: `/api/v1`

---

## 📌 Standard Pagination & Query Parameters

All Master GET List APIs accept standard query parameters and return a unified paginated response structure:

### Standard Query Parameters
| Query Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `page` | `number` | Optional | `1` | Page number for offset pagination |
| `limit` | `number` | Optional | `10` | Number of records per page |
| `searchTerm` | `string` | Optional | `""` | Search query for case-insensitive name/field matching |
| `month` *(Events)* | `number` (1–12) | Optional | — | Month number for calendar view pagination |
| `year` *(Events)* | `number` (2000–2100) | Optional | — | Year for calendar view pagination |
| `startDate` *(Events)*| `ISO Date` | Optional | — | Start date range boundary for calendar filtering |
| `endDate` *(Events)* | `ISO Date` | Optional | — | End date range boundary for calendar filtering |

### Standard Response Structure
```json
{
  "statusCode": 200,
  "data": {
    "data": [ ...listItems ],
    "total": 42,
    "currentPage": 1,
    "totalPages": 5
  },
  "message": "Retrieved successfully"
}
```

---

## 📅 Event Master Calendar & Pagination Update (`/api/v1/cateror/events`)

The **Event Master List API** has been updated to support month-wise calendar view pagination and flexible date range filtering.

- **Route**: `GET /api/v1/cateror/events`
- **Controller Method**: `getAllEvents` in [`event.controller.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/controllers/cateror/event.controller.ts)
- **Service Method**: `getAllEvents` in [`event.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/event.service.ts)
- **Validation Schema**: `paginateAndSearchEventsSchema` in [`event.validation.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/validations/event.validation.ts)

### How It Changed
1. **Calendar Month View (`month` & `year`)**:
   - Query: `GET /api/v1/cateror/events?month=8&year=2026`
   - Automatically calculates `startOfMonth` and `endOfMonth` boundaries.
   - Retrieves events overlapping with the month: `startDate <= endOfMonth AND endDate >= startOfMonth`.
2. **Historical & Future Range Querying (`startDate` & `endDate`)**:
   - Removed `dateInFuture` restriction so calendar views can display past and upcoming events.
3. **Optional Bounds for Calendar Views**:
   - `limit` is optional; if omitted during calendar fetching, returns all events in the month without truncation.

---

## 📋 Comprehensive Master API Catalog & Route Changes

### 1. Global Admin Master APIs (`/api/v1/admin`)

| Master Category | Base Route | HTTP | Source Files | Query Parameters | Changes Implemented |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Dish Master** | `/admin/dishes` | GET | [`dish.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/admin/dish.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, name search & count metadata |
| **Raw Material Master** | `/admin/rawmaterials` | GET | [`rawMaterial.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/admin/rawMaterial.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, name search & count metadata |
| **Utensils Master** | `/admin/utensils` | GET | [`utensils.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/admin/utensils.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, name search & count metadata |
| **Disposals Master** | `/admin/disposals` | GET | [`disposal.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/admin/disposal.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, name search & count metadata |
| **Process / Unit Master** | `/admin/process` | GET | [`process.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/admin/process.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, name search & count metadata |

---

### 2. Caterer Item & Catalog Masters (`/api/v1/cateror`)

| Master Category | Base Route | HTTP | Source Files | Query Parameters | Changes Implemented |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Dish & Category Master** | `/cateror/dishes` | GET | [`caterors/dish.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/dish.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, category/dish search & count metadata |
| **Raw Material Master** | `/cateror/rawmaterials` | GET | [`caterors/rawMaterial.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/rawMaterial.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Utensils Master** | `/cateror/utensils` | GET | [`caterors/utensils.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/utensils.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Disposals Master** | `/cateror/disposals` | GET | [`caterors/disposal.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/disposal.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Cutlery Master** | `/cateror/cutleries` | GET | [`caterors/cutleries.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/cutleries.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |

---

### 3. Operational & Configuration Masters (`/api/v1/cateror`)

| Master Category | Base Route | HTTP | Source Files | Query Parameters | Changes Implemented |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Process Master** | `/cateror/process` | GET | [`caterors/process.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/process.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, process search & count metadata |
| **Priority Level Master** | `/cateror/priorities` | GET | [`caterors/priority.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/priority.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Event Type Master** | `/cateror/eventTypes` | GET | [`caterors/eventType.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/eventType.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Package Master** | `/cateror/packages` | GET | [`caterors/package.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/package.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Additional Services Master**| `/cateror/additionalService` | GET | [`caterors/additionalServices.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/additionalServices.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Counter Master** | `/cateror/counter` | GET | [`caterors/counter.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/counter.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Banquet Venue Master** | `/cateror/banquet` | GET | [`caterors/banquet.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/banquet.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Dress Code Master** | `/cateror/dresscode` | GET | [`caterors/dressCode.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/dressCode.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Manager Posts Master** | `/cateror/managerPosts` | GET | [`caterors/managerPosts.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/managerPosts.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |
| **Terms & Conditions Master** | `/cateror/terms` | GET | [`caterors/termsAndConditions.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/termsAndConditions.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, search & count metadata |

---

### 4. Entity, Vendor & Directory Masters (`/api/v1/cateror`)

| Master Category | Base Route | HTTP | Source Files | Query Parameters | Changes Implemented |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Client Directory Master** | `/cateror/clients` | GET | [`client.controller.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/controllers/cateror/client.controller.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, name/phone search & count metadata |
| **Maharaj (Chef) Master** | `/cateror/maharajs` | GET | [`maharaj.controller.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/controllers/cateror/maharaj.controller.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, fullname search & count metadata |
| **Employee / Staff Master** | `/cateror/employee` | GET | [`caterors/employee.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/employee.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, staff name/phone search & count metadata |
| **RM Vendor Master** | `/cateror/RMvendors` | GET | [`caterors/RMvendor.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/RMvendor.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, vendor name search & count metadata |
| **Display Vendor Master** | `/cateror/display` | GET | [`caterors/displayVendor.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/displayVendor.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, vendor name search & count metadata |
| **Disposal Vendor Master** | `/cateror/disposalsVendors` | GET | [`caterors/disposalVendor.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/disposalVendor.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, vendor name search & count metadata |
| **Additional Vendor Master** | `/cateror/additional/vendors` | GET | [`caterors/additionalVendor.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/additionalVendor.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, vendor name search & count metadata |
| **CRM Process Stage Master** | `/cateror/crm` | GET | [`caterors/crmProcess.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/crmProcess.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, process name search & count metadata |
| **Transport & Fuel Master** | `/cateror/transport` | GET | [`caterors/transport.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/transport.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, vehicle name/number search & count metadata |

---

### 5. Inventory & Financial Ledger Masters (`/api/v1/cateror`)

| Master Category | Base Route | HTTP | Source Files | Query Parameters | Changes Implemented |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Caterer Expense Master** | `/cateror/expenses` | GET | [`caterors/caterorExpense.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/caterorExpense.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, particular/vendor/category search & count metadata |
| **Store Inward Register** | `/cateror/store/inword` | GET | [`caterors/store.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/store.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, bill/event search & count metadata |
| **Store Outward Register** | `/cateror/store/outword` | GET | [`caterors/store.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/store.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, bill/event search & count metadata |
| **Disposal Stock Inventory**| `/cateror/inventory/disposal` | GET | [`caterors/disposalInventory.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/disposalInventory.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, item name search & count metadata |
| **Bank Account Details** | `/cateror/bank` | GET | [`caterors/bankDetails.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/bankDetails.service.ts) | — | 1-to-1 account record per caterer account |
| **Wastage Log Report** | `/cateror/wastage/report` | GET | [`caterors/wastage.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/wastage.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, dish name search & count metadata |
| **Amount & Rate Master** | `/cateror/amount` | GET | [`caterors/amount.service.ts`](file:///c:/Users/LENOVO/OneDrive/Documents/MY%20WORK/phygital/siddhraj/backend/src/services/caterors/amount.service.ts) | `page`, `limit`, `searchTerm` | Added Prisma `skip`/`take`, raw material search & count metadata |
