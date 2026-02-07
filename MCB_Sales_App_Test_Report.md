# MCB On-Site Sales App — QA Test Report

**App URL:** https://mcbsalesonsite1.vercel.app/
**Tested:** February 6, 2026
**Tested as:** A non-technical salesperson clicking through every button, link, form, and edge case

---

## Executive Summary

The app is partially functional. The dashboard, New Quote form (via client-side navigation), and Clients pages load. However, half the routes still 404, the Save Quote button freezes the page, the logout button does nothing, and there are data quality and validation issues throughout. A salesperson could build a quote in theory, but couldn't save it, couldn't view past quotes, and couldn't log out.

---

## CRITICAL BUGS (P0) — App-breaking

### 1. Save Quote Button Freezes the Entire Page
**Steps:** Add an item to the quote → click "Save Quote"
**Result:** The page hangs completely for 30+ seconds. No spinner, no error, no feedback. The browser tab becomes unresponsive. Had to navigate away to recover.
**Impact:** A salesperson finishes building a quote in front of a customer, hits Save, and... nothing. The app is frozen. They lose everything.

### 2. Multiple Routes Still Return 404
These pages give a raw Vercel 404 error:

| Page | Route | Status |
|---|---|---|
| Quotes list | `/quotes` | **404** |
| Voice Notes | `/notes` | **404** |
| Site Photos | `/photos` | **404** |
| Admin Settings | `/admin` | **404** |

### 3. Direct URL Access Is Unreliable
`/quotes/new` works when clicked from within the app (client-side routing) but returns **404 when accessed directly** via URL or page refresh. This means if a salesperson bookmarks the New Quote page, or refreshes mid-quote, they get a 404. This is a classic SPA routing issue — the server only knows about a few routes.

### 4. Logout Button Does Nothing
**Steps:** Click the logout icon in the sidebar
**Result:** Nothing happens. The icon highlights orange, but the user stays on the dashboard, still logged in. No redirect, no confirmation, no action.
**Impact:** The salesperson can't log out. If they hand the device to someone else, that person has full access.

---

## HIGH PRIORITY BUGS (P1)

### 5. Negative Dimensions Accepted
**Steps:** Enter `-500` in the Width field
**Result:** The app accepts it. No validation, no error, no clamping to zero.
**Impact:** A salesperson could accidentally generate a quote with negative dimensions, resulting in incorrect pricing. The dimension fields should only accept positive numbers.

### 6. Adding Item With No Fabric = Silent Failure
**Steps:** Leave fabric as "Select Fabric..." → scroll down → click "Add Item to Quote"
**Result:** Nothing happens. No error message, no red border, no toast notification. The button appears to do absolutely nothing.
**Impact:** A confused salesperson clicks repeatedly thinking the app is broken. There needs to be a clear message: "Please select a fabric first."

### 7. Duplicate Items in Motorisation Accessories List
These items appear twice in the Motorisation section, each at the same price:
- **Altus 40 RTS 3/30** — $208 (appears 2x)
- **E6 Motor 6/28** — $144 (appears 2x)
- **M6 Motor 6/28** — $106 (appears 2x)

A salesperson won't know which duplicate to pick, or may accidentally add both thinking they're different products.

### 8. No Edit Client Button
**Steps:** Open a client's detail page
**Result:** There's a Delete button but no Edit button.
**Impact:** If a salesperson misspells a client name or enters the wrong phone number, they have to delete the entire client and recreate them from scratch. Real-world example: the test client shows "Zac Wlikes" (likely meant to be "Wilkes") with no way to fix it.

### 9. Quote Doesn't Persist After Save Attempt
**Steps:** Build a quote with items → attempt to save → navigate back to dashboard
**Result:** Dashboard still shows "Total Quotes: 0" and "No quotes yet." The quote was lost.
**Impact:** All work building the quote was wasted.

---

## MEDIUM PRIORITY (P2) — UX / Sniff Test Failures

### 10. Price Dimensions Don't Match User Input
**Steps:** Enter Width: 1500, Drop: 2000
**Result:** Price bar at bottom shows "Priced @ 1510W x 2100D — $138.00"
**Impact:** The salesperson typed 1500x2000 but the app shows 1510x2100. There's no explanation that prices are rounded to standard size brackets. A customer looking at the screen would question why the numbers don't match. Add a note like "Rounded to nearest pricing bracket."

### 11. Default Price Shows $66 With Zero Dimensions and No Fabric
**Steps:** Land on New Quote page with defaults (Width: 0, Drop: 0, no fabric)
**Result:** Bottom of page shows "Priced @ 610W x 600D — $66.00"
**Impact:** Where did $66 come from? The user entered nothing. This looks like a pricing bug or a confusing default. Dimensions of 0 should show $0 or "Enter dimensions to see pricing."

### 12. Fabric Dropdown Has 70+ Options With No Search
The fabric dropdown contains 70+ options in a single flat list. A salesperson on-site trying to find "Texstyle Kleenscreen" has to slowly scroll through the entire list. Needs a search/filter input — especially for mobile use.

### 13. Quote Line Item Doesn't Show Fabric Name
**Steps:** Add a Shaw Duo B/O blind to the quote
**Result:** Quote panel shows "Creative - Creative Internal Blinds — 1500x2000mm • Qty 1"
**Impact:** The fabric name isn't shown. If a salesperson adds multiple items with the same dimensions but different fabrics, they can't tell them apart in the quote summary.

### 14. Form Resets After Adding Item
After clicking "Add Item to Quote," all fields (width, drop, fabric) reset to defaults (0, 0, "Select Fabric..."). This makes sense if the salesperson is adding a new item, but it's disorienting — especially since there's no success feedback (no toast, no animation, no "Item added!" message). The salesperson doesn't know if the add worked until they look at the quote panel.

### 15. Redundant Naming: "Creative - Creative Internal Blinds"
The quote line item says "Creative - Creative Internal Blinds." The word "Creative" appears twice, which looks like a data/category naming issue. Should probably just say "Creative Internal Blinds."

### 16. Inconsistent Group Labels in Fabric Dropdown
Some fabrics say "(Grp 1)" while others say "(Grp Group 1)." For example:
- "Shaw Vibe B/O **(Grp Group 1)**"
- "Shaw Vibe Roller **(Grp 1)**"

This inconsistency will confuse a salesperson trying to match fabrics to pricing groups.

### 17. Tab Title Says "mcb-quote-tool"
The browser tab shows "mcb-quote-tool" — a developer project name, not a professional sales tool. Should be something like "MCB Quoting" or "Modern Curtains & Blinds."

---

## LOW PRIORITY (P3) — Polish

### 18. "View All" Under Recent Quotes Goes to 404
The "View All →" link in the Recent Quotes section navigates to `/quotes`, which is a 404 page.

### 19. Voice Notes and Site Photos Buttons Go Nowhere
Both dashboard buttons navigate to 404 pages (`/notes` and `/photos`). If these features aren't built yet, the buttons should either be hidden, disabled, or show a "Coming Soon" state.

### 20. No Friendly 404 Page
When a route fails, the user sees a raw Vercel error: "404: NOT_FOUND, Code: NOT_FOUND, ID: syd1::zph6s-1770368317923-00ba4d622beb". A non-technical salesperson would panic. Add a branded 404 page with a "Go back to Dashboard" button.

### 21. Sidebar Icons Have No Text Labels
In the icon-only sidebar view, the navigation icons (grid, people, document, +, gear, arrow) have no text labels or tooltips. A salesperson won't know what they mean. Note: hovering on the Clients icon does show a "Clients" tooltip in some cases — this behavior should be consistent for all icons.

### 22. No Mobile Responsiveness
At narrow viewport widths, the dashboard layout doesn't adapt. The 4-column stat grid, sidebar, and buttons stay desktop-sized. For an "on-site" sales tool used on phones and iPads, this is a problem.

---

## What Works

To be fair, here's what does function:

- **Dashboard** renders with correct stats layout and branding
- **New Quote form** loads (via client-side navigation) with product tabs, dimension inputs, fabric dropdown, quantity selector, and accessory checkboxes
- **Pricing calculation** works — changes when dimensions and fabric are selected
- **Add Item to Quote** works (when fabric is selected) — item appears in the quote panel with correct price
- **Margin calculator** works — 45% target margin correctly inflates $138 cost to $200.10
- **Quantity controls** work — minus button correctly prevents going below 1
- **Clients page** loads with search bar and client list
- **Client detail page** loads with contact info and quote history
- **Product category tabs** (Creative Curtains, External Blinds, Internal Blinds, Security Doors) are present
- **Accordion sections** for extras (Motorisation, Roman Blinds, Pelmets, Bonded Blinds, Agencies/Install, Services) expand and collapse

---

## Recommended Fix Order

1. **Fix Save Quote** — this is the #1 blocker. Nothing else matters if quotes can't be saved.
2. **Fix routing** — add a `vercel.json` rewrite or fix Next.js page generation so all routes work on direct access and refresh.
3. **Fix Logout** — needs to actually sign the user out.
4. **Add form validation** — prevent negative dimensions, require fabric selection before adding to quote, require customer name before saving.
5. **Clean up duplicate motorisation items** in the database/data source.
6. **Add Edit Client** button to client detail page.
7. **Add success/error feedback** — toast messages for "Item added," "Quote saved," validation errors, etc.
8. **Add fabric search/filter** to the dropdown.
9. **Show fabric name** in quote line items.
10. **Fix inconsistent naming** ("Grp" vs "Grp Group," "Creative - Creative").
11. **Add mobile responsiveness** — critical for on-site use.
12. **Rename browser tab** to something professional.
13. **Add a friendly 404 page.**
14. **Disable or label unbuilt features** (Voice Notes, Site Photos).
