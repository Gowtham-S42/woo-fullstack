export function mapWooToLocal(p) {
  const firstCategory = Array.isArray(p.categories) && p.categories.length > 0
    ? p.categories[0].name
    : null;

  const tagsArr = Array.isArray(p.tags) ? p.tags.map(t => t.name) : [];

  return {
    id: p.id,
    title: p.name ?? '',
    price: p.price ?? null, // keep as string per requirement
    stock_status: p.stock_status ?? null,
    stock_quantity: p.stock_quantity !== undefined ? p.stock_quantity : null,
    category: firstCategory,
    tags: JSON.stringify(tagsArr),
    on_sale: !!p.on_sale,
    created_at: p.date_created ?? new Date().toISOString()
  };
}

export function buildUpsertSQL() {
  return `
    INSERT INTO products (id, title, price, stock_status, stock_quantity, category, tags, on_sale, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      price = VALUES(price),
      stock_status = VALUES(stock_status),
      stock_quantity = VALUES(stock_quantity),
      category = VALUES(category),
      tags = VALUES(tags),
      on_sale = VALUES(on_sale),
      created_at = VALUES(created_at)
  `;
}
