const state = {
  config: null,
  products: []
};

async function loadConfig() {
  const res = await fetch('./config.json');
  state.config = await res.json();
}

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else e.setAttribute(k, v);
  });
  children.forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}

function renderProducts() {
  const mount = document.getElementById('products');
  mount.innerHTML = '';
  state.products.forEach(p => {
    const badges = [];
    badges.push(el('span', { class: `badge ${p.stock_status === 'instock' ? 'green' : 'red'}` }, [p.stock_status || 'unknown']));
    if (p.on_sale) badges.push(el('span', { class: 'badge blue' }, ['on sale']));
    if (p.category) badges.push(el('span', { class: 'badge' }, [p.category]));
    const tagsList = Array.isArray(p.tags) ? p.tags.join(', ') : '';
    const card = el('div', { class: 'card' }, [
      el('h3', {}, [p.title || '(no title)']),
      el('div', { class: 'meta' }, [`ID: ${p.id}`]),
      el('div', { class: 'price' }, [p.price ? `₹ ${p.price}` : 'No price']),
      el('div', {}, badges),
      el('div', { class: 'meta' }, [tagsList ? `Tags: ${tagsList}` : ''])
    ]);
    mount.appendChild(card);
  });
}

async function fetchProducts() {
  const status = document.getElementById('status');
  status.textContent = 'Loading products...';
  try {
    const res = await fetch(`${state.config.PRODUCT_API_BASE}/products`);
    const data = await res.json();
    state.products = data;
    renderProducts();
    status.textContent = `Loaded ${data.length} products`;
  } catch (e) {
    console.error(e);
    status.textContent = 'Failed to load products';
  }
}

async function ingestNow() {
  const status = document.getElementById('status');
  status.textContent = 'Ingesting...';
  try {
    const res = await fetch(`${state.config.PRODUCT_API_BASE}/ingest`, {
      method: 'POST'
    });
    const data = await res.json();
    status.textContent = data.error ? `Ingest error: ${data.error}` : 'Ingested. Refreshing...';
    if (!data.error) {
      await fetchProducts();
    }
  } catch (e) {
    console.error(e);
    status.textContent = 'Ingest failed';
  }
}

async function evaluateRules() {
  const rulesText = document.getElementById('rules').value;
  const result = document.getElementById('result');
  result.textContent = 'Evaluating...';
  try {
    const res = await fetch(`${state.config.SEGMENT_API_BASE}/segments/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rulesText })
    });
    const data = await res.json();
    result.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    console.error(e);
    result.textContent = JSON.stringify({ error: 'Failed to evaluate' }, null, 2);
  }
}

function resetRules() {
  document.getElementById('rules').value = '';
  document.getElementById('result').textContent = '';
}

async function main() {
  await loadConfig();
  document.getElementById('refresh').addEventListener('click', fetchProducts);
  document.getElementById('ingest').addEventListener('click', ingestNow);
  document.getElementById('evaluate').addEventListener('click', evaluateRules);
  document.getElementById('reset').addEventListener('click', resetRules);
  await fetchProducts();
}

main();
