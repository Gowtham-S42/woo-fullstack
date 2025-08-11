# Woo Commerce Fullstack — WooCommerce ingestion + segmentation

Tech: Node.js, MySQL, HTML/CSS/JS. Microservices:
- product-service: Ingests WooCommerce products and exposes GET /products.
- segment-service: Text-based rules → POST /segments/evaluate.
- frontend-service: UI for listing products and evaluating segments.

## Live deployments
- Frontend: <your-frontend-url>   MyLocal :http://localhost:4000/ 
- Product API: <your-product-api-url>   MyLocal :http://localhost:4001/
- Segment API: <your-segment-api-url>   MyLocal :http://localhost:4002/

## Setup

1) Install MySQL locally and create a database:
- DB name: woo_products
- Run sql/schema.sql

2) Configure env files:
- Copy `.env.example` to `.env` in project root and in each service folder, or just edit service-level `.env` files.

3) Install dependencies and run services:
- For each service directory:
  - npm install
  - npm run start

4) Configure frontend-service/public/config.json to point to your Product and Segment API URLs.

## Ingestion
- POST to /ingest on product-service to ingest now.
- Or set AUTO_INGEST=true for ingestion at startup.
- Optional simple intervaling via INGEST_INTERVAL_MINUTES.

## Endpoints
- product-service:
  - GET /products — returns all stored products
  - POST /ingest — fetches from WooCommerce and upserts

- segment-service:
  - POST /segments/evaluate
    - body: { "rulesText": "price > 5000\nstock_status = instock\non_sale = true" }

## Supported fields for segmentation
- id (number, equality only)
- title (string, = / != exact match, case-insensitive)
- price (numeric operators and equality; stored as string but cast to number)
- stock_status (= / !=)
- stock_quantity (numeric operators)
- category (= / !=)
- tags (= / !=) — interpreted as "contains" / "does not contain"
- on_sale (= / !=) — boolean (true/false, 1/0)
- created_at (= / !=) exact string match

## Examples (one rule per line)
- price > 5000
- category = Smartphones
- stock_status = instock
- on_sale = true
- tags != Samsung
- stock_quantity >= 10

## AI Usage Notes
- Tool: Copilot
- Assistance: Designed architecture outline, wrote boilerplate Express servers, ingestion loop, rule parser, and frontend scaffolding.
- Manually by myself : Verified WooCommerce field mappings, wrote MySQL schema, buildUpsertSQL in product folder, added validation, refined rule semantics for tags, booleans, and numbers, Manually I modified Some Frontend Side of UI Things .
## During On your implement in vendor Systems Notes
- 1.Create DB and table
Open a terminal in your project root (woo-fullstack).
Run the schema script:
C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < .\sql\schema.sql (This is only for windows)"# woo-fullstack" 
