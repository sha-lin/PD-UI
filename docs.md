## Next Build Plan — New Product Flow

---

### Phase 1 — Database (foundation)
- Fix `signals.py`, `api_serializers.py`, `api_views.py` deprecated imports (minimum needed to unblock migrations)
- Run `makemigrations` + `migrate`
- Schema is live in DB

---

### Phase 2 — Backend API
Build in this order (each depends on the previous):

1. **Category APIs** — `PrintCategory`, `ProductCategory`, `ProductSubCategory`, `ProductFamily`, `ProductTag` (CRUD, admin-only)
2. **Spec Group Library APIs** — `SpecGroupLibrary` + `SpecGroupLibraryOption` (CRUD, admin-only)
3. **Product CRUD API** — create/read/update/delete `Product` with all related one-to-ones (`ProductProduction`, `ProductSEO`, `ProductShipping`, `ProductLegal`)
4. **Product Spec Groups API** — scoped under product: add/edit/reorder `ProductSpecGroup`, `SpecOption`, `SpecOptionRange`
5. **Price Preview endpoint** — `POST /products/{id}/calculate-price/` runs `calculate_product_price()` live, returns breakdown
6. **Compatibility Rules API** — manage `ProductCompatibilityRule` per product

---

### Phase 3 — Admin Dashboard (internal product builder)
The staff UI in Next.js for creating/editing products:

1. **Product list page** — table with status, category, pricing_mode filter
2. **Product create/edit form** — tabbed layout:
   - *Basic* (name, category FKs, print_category, pricing_mode)
   - *Spec Groups* — drag-and-drop builder to add library groups or custom groups, set options with prices
   - *Production* (pre-press, BOM, finishing)
   - *Media* (images linked to spec options)
   - *Content* (SEO, FAQs, shipping, legal)
3. **Spec Group Library manager** — standalone page to create reusable groups
4. **Price preview panel** — live sidebar showing calculated price as specs are filled

---

### Phase 4 — Storefront Configurator (customer-facing)
1. **Product page** — renders spec groups in order, respects `parent_option` conditional logic
2. **Live price calculator** — calls `/calculate-price/` on selection change, shows itemised breakdown
3. **Compatibility rule enforcement** — client-side + server-side validation
4. **Add to cart** — snapshots the selections + prices into `CartItem`

---

### Phase 5 — Quote/Order integration
- `QuoteLineItem` captures spec selections as JSON snapshot + calculated price
- `OrderItem` mirrors the same snapshot
- Production team sees full spec breakdown on job cards

---

### Phase 6 — TypeScript types + frontend services
- Update products.ts to match new schema
- Write API service functions for all new endpoints

---

**Recommended start:** Phase 1 (unblock migrations) → Phase 2 (API) → Phase 3 (builder UI). Phases 4-6 can overlap once Phase 2 is stable.

Ready to start Phase 1 on your call.