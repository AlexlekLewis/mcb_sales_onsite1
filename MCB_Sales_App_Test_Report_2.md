# MCB Sales On-Site App — QA Test Report

**App:** https://mcbsalesonsite1.vercel.app/
**Tested:** February 6, 2026
**Tested as:** A non-technical sales rep using the app on-site
**Test rounds:** 3 (bugs re-checked each round to confirm fixes)

---

## Summary

The app's core quoting flow (create customer → add line items → save quote → view quote) now works end-to-end. Dashboard stats update correctly. However, several significant bugs remain that would block or frustrate a salesperson in the field.

**Fixed since first test:**
- Save Quote no longer freezes the page (was critical)
- Duplicate motorisation items removed from dropdowns

**Still broken:**
- PDF download fails silently (browser console error)
- Logout button does nothing
- Most routes 404 on direct URL access or page refresh
- No input validation (negative dimensions accepted)
- No search/filter on the 70+ fabric dropdown

---

## Critical (P0) — Blocks core sales workflow

### 1. Download PDF — "Buffer is not defined"
**Status:** NEW BUG (Round 3)
Clicking "Download PDF" on a saved quote does nothing visible. The browser console shows repeated `Buffer is not defined` errors from `pdf-vendor-DzQW86jK.js`. The PDF library is trying to use Node.js's `Buffer` API which doesn't exist in the browser. This is the single most important feature for a salesperson on-site — they need to hand a PDF to the customer.

**Console output:** ~12× "Buffer is not defined" warnings per click.

### 2. Direct URL access returns 404
**Status:** STILL BROKEN (all 3 rounds)
Navigating directly to any route other than `/` returns a Vercel 404 page:
- `/quotes/new` — 404
- `/quotes` — 404
- `/clients` — 404 (sometimes works)
- `/notes` — 404
- `/photos` — 404
- `/admin` — 404

These routes work fine via client-side navigation (clicking buttons/links within the app). This is a classic SPA deployment issue — needs a `vercel.json` rewrite rule to serve `index.html` for all routes.

**Why it matters:** If a salesperson bookmarks a quote, refreshes the page, or shares a link, they get a dead page.

### 3. Quote detail page render loop
**Status:** NEW BUG (Round 3)
Opening a saved quote's detail page triggers the same data fetch 6 times in rapid succession. Console shows "Fetching quote..." repeated 6× with "Buffer is not defined" warnings each time (~30 console messages total). This suggests an infinite or excessive re-render loop in the quote detail component — likely a `useEffect` dependency issue.

---

## High Priority (P1) — Breaks trust or causes confusion

### 4. Negative dimensions accepted
**Status:** STILL BROKEN
Entering `-500` in the width or drop field is accepted without error. A salesperson fat-fingering a minus key would get a nonsensical quote.

### 5. Adding item with no fabric = silent failure
**Status:** STILL BROKEN
If you click "Add to Quote" without selecting a fabric, nothing happens — no error message, no indication of what went wrong. The form just sits there.

### 6. Logout button does nothing
**Status:** STILL BROKEN (all 3 rounds)
The Logout button in the sidebar highlights orange on hover/click but performs no action. The user stays on the dashboard with all data visible. If multiple salespeople share a device, they can't switch accounts.

### 7. Price displayed when dimensions are 0/0
**Status:** STILL BROKEN
With width and drop both at 0, adding an item shows a price like "$66". There should be validation preventing a zero-dimension item from being added.

### 8. No form feedback after adding item
**Status:** STILL BROKEN
After clicking "Add to Quote" and successfully adding a line item, the form silently resets. There's no toast, flash message, or visual confirmation that the item was added. A salesperson would wonder "did that work?"

---

## Medium Priority (P2) — UX friction

### 9. Fabric dropdown has 70+ options with no search
**Status:** STILL BROKEN
The fabric dropdown is a plain `<select>` with 70+ options. On-site, a salesperson scrolling through this on a tablet would be painfully slow. Needs a searchable/filterable dropdown (e.g., react-select or combobox).

### 10. Dimension rounding without explanation
**Status:** STILL BROKEN
Entering 1200mm width produces "1210W" in the quote. Entering 2000mm produces "2100W". The app silently rounds to the nearest pricing bracket. There's no indication this happened or why. A customer reading the quote would question why the dimensions don't match what was measured.

### 11. Inconsistent group naming
**Status:** STILL BROKEN
The Group field shows options like "Grp 1", "Grp 2" etc. but some categories display "Grp Group 1" — a redundant double label.

### 12. Fabric name truncated in quote detail
**Status:** NEW (Round 3)
On the saved quote detail page, the fabric column shows truncated text like "Shaw Chatswort..." instead of the full fabric name. The column width is too narrow.

### 13. Redundant category naming
**Status:** STILL BROKEN
The product category dropdown shows "Creative - Creative Internal Blinds" — the word "Creative" appears twice and adds no information.

### 14. Quote line items don't show fabric name in builder
**Status:** STILL BROKEN
When items are added to the quote (before saving), the line item summary shows dimensions and price but not which fabric was selected. If a salesperson adds 5 items, they can't tell them apart.

### 15. No Edit Client option
**Status:** STILL BROKEN
Client detail pages show a Delete button but no Edit button. If a salesperson misspells a customer name or enters the wrong phone number, the only option is to delete and recreate.

### 16. No mobile/tablet responsiveness
**Status:** STILL BROKEN
The sidebar navigation doesn't collapse on smaller screens. For a tool meant to be used "on-site" (likely on a tablet), the layout doesn't adapt to smaller viewports.

---

## Low Priority (P3) — Polish

### 17. Browser tab title says "mcb-quote-tool"
**Status:** STILL BROKEN
The tab title is the internal project name. Should say something like "MCB Sales" or "Modern Curtains & Blinds."

### 18. Avg Quote rounding inconsistency
**Status:** NEW (Round 3)
Dashboard shows Pipeline Value as "$149.35" (exact) but Avg Quote Value as "$149" (rounded). Minor inconsistency — both should use the same precision.

### 19. No loading indicators
**Status:** STILL BROKEN
When saving a quote or loading the quotes list, there's no spinner or loading state. The UI just freezes momentarily.

### 20. Broken routes in sidebar navigation
**Status:** STILL BROKEN
Sidebar nav includes links to Notes, Photos, and Admin which all lead to 404 pages. If these features aren't built yet, the links should be hidden or marked as "Coming Soon."

---

## What Works Well

- Dashboard loads correctly with stats cards and action buttons
- Creating a new quote via the dashboard button works reliably
- Customer creation form works (name, email, phone, address)
- Product category and sub-category selection works
- Adding line items to a quote works (when fabric is selected)
- **Save Quote now works** — saves to database and redirects to quotes list ✓ (FIXED)
- Quote detail page shows comprehensive table with all item fields
- **Motorisation dropdown no longer has duplicates** ✓ (FIXED)
- Dashboard stats (Total Quotes, This Week, Pipeline Value, Avg Quote) update correctly after saving
- Quote detail page has useful action buttons: Edit Quote, Mark as Sent, Download PDF, Email Quote, Delete
- Client list page loads and shows created clients
- Margin calculation appears correct (cost × 1.45 = sell price)

---

## Recommended Fix Order

1. **vercel.json rewrites** — fix all 404s on direct URL access (5 min fix, biggest impact)
2. **PDF generation** — replace or polyfill `Buffer` for browser compatibility
3. **Fix render loop** — check `useEffect` dependencies on quote detail page
4. **Input validation** — reject negative/zero dimensions, require fabric selection, show error messages
5. **Add form feedback** — toast or flash message when item is added to quote
6. **Searchable fabric dropdown** — swap `<select>` for a combobox component
7. **Wire up Logout** — connect to auth signout
8. **Show dimension rounding** — add a note like "Rounded to 1210mm for pricing"
9. **Everything else** — naming, truncation, responsiveness, tab title
