CREATE DATABASE IF NOT EXISTS woo_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE woo_products;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  price VARCHAR(64),
  stock_status VARCHAR(64),
  stock_quantity INT NULL,
  category VARCHAR(255),
  tags JSON,
  on_sale TINYINT(1) NOT NULL DEFAULT 0,
  created_at VARCHAR(64) NOT NULL
);

CREATE INDEX idx_title ON products (title);
CREATE INDEX idx_category ON products (category);
CREATE INDEX idx_stock_status ON products (stock_status);
