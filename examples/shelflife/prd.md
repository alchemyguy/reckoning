# ShelfLife: Spoilage Prediction for Independent Grocers

## Problem
Independent grocery stores (1–5 locations) throw away 8–12% of fresh inventory (produce, dairy, bakery) every week. Owners order by gut feel and yesterday's sales, so they over-order perishables to avoid empty shelves. Large chains solve this with in-house forecasting teams; independents have nothing between a spreadsheet and a $50k enterprise system.

## Target users
- **Store owner / buyer (primary):** places orders with 3–8 suppliers, usually late at night after close.
- **Department lead (secondary):** produce or dairy lead who does the morning walk and markdowns.

## Solution
A web app that connects to the store's point-of-sale (POS) system, learns sales patterns per item, and each evening recommends tomorrow's order quantity for every perishable SKU. It also flags items likely to spoil in the next 48 hours so staff can mark them down early.

## Scope (MVP)
- POS integrations: Square, Clover, Lightspeed, Toast, NCR Counterpoint, and any POS via CSV upload
- Order recommendations for all perishable SKUs
- 48-hour spoilage alerts with suggested markdown price
- Weather and local-events adjustment to forecasts
- Mobile app for the morning walk (iOS + Android)

**Non-goals:** supplier ordering (we recommend, owners still place orders), non-perishables, multi-chain enterprise features.

## Success metrics
- Reduce spoilage by **50%** for every customer within the first month
- 500 paying stores within 6 months of launch
- Net revenue retention above 120%

## Business model
$49/month per store, flat. No setup fee. Sold through self-serve signup and Facebook ads targeting grocery owners.

## Technical approach
- Forecasting: gradient-boosted model per store, retrained nightly
- Cold start: new stores get accurate forecasts from day one using our proprietary model
- Data stays in the customer's POS; we only read sales data and never store it
- Team: 2 engineers, 1 designer; MVP in 10 weeks

## Risks
- POS APIs may rate-limit or change.
- Owners may not trust recommendations at first.
