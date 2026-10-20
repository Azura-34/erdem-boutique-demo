const fmt = n => new Intl.NumberFormat('tr-TR').format(Number(n || 0)) + ' TL';
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const getCart = () => JSON.parse(localStorage.getItem('erdemCart') || '[]');
const saveCart = cart => {
  localStorage.setItem('erdemCart', JSON.stringify(cart));
  updateCount();
};
const updateCount = () => {
  const count = getCart().reduce((total, item) => total + item.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
};
const image = product => product.image_url || product.image || `assets/products/${product.slug}.svg`;
let PRODUCTS_CACHE = null;

async function products() {
  if (PRODUCTS_CACHE) return PRODUCTS_CACHE;
  try {
    const response = await fetch('api.php?action=products', {cache:'no-store'});
    const data = await response.json();
    if (data.ok && Array.isArray(data.products)) return PRODUCTS_CACHE = data.products;
  } catch (error) {
    // Static hosting uses the checked-in seed catalog below.
  }
  try {
    const data = await window.loadSeedProducts();
    return PRODUCTS_CACHE = data;
  } catch (error) {
    // The empty state below explains when no catalog could be loaded.
  }
  return PRODUCTS_CACHE = [];
}

const productCard = product => {
  const favorites = JSON.parse(localStorage.getItem('erdemFavorites') || '[]');
  const favorite = favorites.includes(product.slug);
  const comparePrice = Number(product.compare_price || 0);
  return `<article class="product-card">
    <a href="product.html?id=${encodeURIComponent(product.slug)}"><img src="${esc(image(product))}" alt="${esc(product.name)}" loading="lazy"></a>
    ${product.badge ? `<span class="badge">${esc(product.badge)}</span>` : ''}
    <button class="heart${favorite ? ' is-favorite' : ''}" type="button" data-favorite="${esc(product.slug)}" aria-label="${favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}" aria-pressed="${favorite}">${favorite ? '♥' : '♡'}</button>
    <div class="product-info"><small>${esc(product.category)}</small><h3><a href="product.html?id=${encodeURIComponent(product.slug)}">${esc(product.name)}</a></h3>
      <span class="price">${fmt(product.price)}</span>${comparePrice > Number(product.price) ? `<del class="compare-price">${fmt(comparePrice)}</del>` : ''}
    </div>
  </article>`;
};

function renderGrid(items) {
  const grid = document.querySelector('#productGrid');
  if (!grid) return;
  grid.innerHTML = items.length ? items.map(productCard).join('') : '<p class="empty-results">Bu ölçütlerde ürün bulunamadı.</p>';
  grid.querySelectorAll('[data-favorite]').forEach(button => button.onclick = () => {
    const favorites = JSON.parse(localStorage.getItem('erdemFavorites') || '[]');
    const slug = button.dataset.favorite;
    const next = favorites.includes(slug) ? favorites.filter(item => item !== slug) : [...favorites, slug];
    localStorage.setItem('erdemFavorites', JSON.stringify(next));
    const active = next.includes(slug);
    button.classList.toggle('is-favorite', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Favorilerden çıkar' : 'Favorilere ekle');
    button.textContent = active ? '♥' : '♡';
  });
}

async function initHome() {
  const catalog = await products();
  renderGrid(catalog.slice(0, 8));
  const gallery = document.querySelector('#collectionGallery');
  if (gallery) gallery.innerHTML = catalog.slice(0, 8).map(product =>
    `<a href="product.html?id=${encodeURIComponent(product.slug)}"><img src="${esc(image(product))}" alt="${esc(product.name)}" loading="lazy"></a>`
  ).join('');
  document.querySelectorAll('.cat-card').forEach(link => link.onclick = () => {
    localStorage.setItem('filter', link.dataset.cat);
  });
}

async function initShop() {
  const catalog = await products();
  const filters = document.querySelectorAll('.filters button');
  const search = document.querySelector('#productSearch');
  const sort = document.querySelector('#productSort');
  const resultCount = document.querySelector('#resultCount');
  let category = localStorage.getItem('filter') || 'Tümü';
  localStorage.removeItem('filter');

  function update() {
    const query = (search?.value || '').trim().toLocaleLowerCase('tr-TR');
    const matching = catalog.filter(product =>
      (category === 'Tümü' || product.category === category) &&
      (!query || `${product.name} ${product.category}`.toLocaleLowerCase('tr-TR').includes(query))
    );
    if (sort?.value === 'price-asc') matching.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort?.value === 'price-desc') matching.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort?.value === 'name') matching.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    renderGrid(matching);
    if (resultCount) resultCount.textContent = `${matching.length} ürün`;
    filters.forEach(button => button.classList.toggle('selected', button.dataset.filter === category));
  }
  filters.forEach(button => button.onclick = () => {
    category = button.dataset.filter;
    update();
  });
  search?.addEventListener('input', update);
  sort?.addEventListener('change', update);
  update();
}

function add(slug, size = '', color = '') {
  const cart = getCart();
  const index = cart.findIndex(item => item.slug === slug && item.size === size && item.color === color);
  if (index >= 0) cart[index].qty++;
  else cart.push({slug, qty:1, size, color});
  saveCart(cart);
  location.href = 'cart.html';
}

async function initProduct() {
  const catalog = await products();
  const slug = new URLSearchParams(location.search).get('id');
  const product = catalog.find(item => item.slug === slug) || catalog[0];
  const page = document.querySelector('#productPage');
  if (!product || !page) return;

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const gallery = [image(product), ...(Array.isArray(product.gallery) ? product.gallery : [])];
  const comparePrice = Number(product.compare_price || 0);
  page.innerHTML = `<div class="product-media"><img id="mainProductImage" src="${esc(gallery[0])}" alt="${esc(product.name)}">
      ${gallery.length > 1 ? `<div class="product-thumbs">${gallery.map(src => `<button type="button" data-image="${esc(src)}"><img src="${esc(src)}" alt="${esc(product.name)} görseli"></button>`).join('')}</div>` : ''}
    </div><div class="product-detail"><p class="eyebrow">${esc(product.category)}</p><h1>${esc(product.name)}</h1>
      <div class="big-price">${fmt(product.price)}${comparePrice > Number(product.price) ? ` <del class="compare-price">${fmt(comparePrice)}</del>` : ''}</div>
      <p class="product-description">${esc(product.description || 'Ürün açıklaması mağaza kaynağında paylaşılmadı. Beden, renk ve stok bilgilerini sipariş öncesinde işletme ile teyit edin.')}</p>
      ${sizes.length ? `<div class="option-label">BEDEN</div><div class="options" id="sizes">${sizes.map((size, index) => `<button type="button" class="${index === 0 ? 'selected' : ''}">${esc(size)}</button>`).join('')}</div>` : ''}
      ${colors.length ? `<div class="option-label">RENK</div><div class="options" id="colors">${colors.map((color, index) => `<button type="button" class="${index === 0 ? 'selected' : ''}">${esc(color)}</button>`).join('')}</div>` : ''}
      <button class="btn full" id="addBtn" type="button">Sepete Ekle <span>→</span></button>
      <p class="product-benefits">Stok ve sipariş detayları sipariş onayında teyit edilir.</p>
    </div>`;

  page.querySelectorAll('.options button').forEach(button => button.onclick = () => {
    button.parentElement.querySelectorAll('button').forEach(option => option.classList.remove('selected'));
    button.classList.add('selected');
  });
  page.querySelectorAll('[data-image]').forEach(button => button.onclick = () => {
    document.querySelector('#mainProductImage').src = button.dataset.image;
  });
  document.querySelector('#addBtn').onclick = () => add(
    product.slug,
    page.querySelector('#sizes .selected')?.textContent || '',
    page.querySelector('#colors .selected')?.textContent || ''
  );
}

async function initCart() {
  const box = document.querySelector('#cartPage');
  const catalog = await products();
  const cart = getCart().filter(item => catalog.some(product => product.slug === item.slug));
  saveCart(cart);
  if (!cart.length) {
    box.innerHTML = '<div class="empty"><h2>Sepetiniz boş</h2><p>Seçtiğiniz ürünler burada görünecek.</p><a class="btn" href="shop.html">Koleksiyona Git →</a></div>';
    return;
  }
  let total = 0;
  const rows = cart.map((item, index) => {
    const product = catalog.find(entry => entry.slug === item.slug);
    const line = Number(product.price) * item.qty;
    total += line;
    return `<div class="cart-row"><img src="${esc(image(product))}" alt="${esc(product.name)}"><div><b>${esc(product.name)}</b>
      <small class="cart-meta">${item.size ? `Beden: ${esc(item.size)}` : ''}${item.color ? ` · Renk: ${esc(item.color)}` : ''}</small><small class="cart-meta">${fmt(product.price)}</small>
      </div><div class="qty-controls"><button type="button" aria-label="Adedi azalt" onclick="changeQty(${index},-1)">−</button><span>${item.qty}</span><button type="button" aria-label="Adedi artır" onclick="changeQty(${index},1)">+</button></div>
      <div class="line-total">${fmt(line)}</div><button type="button" aria-label="Ürünü sepetten çıkar" onclick="removeItem(${index})">×</button></div>`;
  }).join('');
  box.innerHTML = rows + `<div class="cart-summary"><div class="cart-total-line"><span>Toplam</span><strong>${fmt(total)}</strong></div>
    <p class="cart-note">Stok ve ödeme bilgileri sipariş onayında teyit edilir.</p><a class="btn full" href="checkout.html">Siparişi Tamamla →</a></div>`;
}

window.changeQty = (index, delta) => {
  const cart = getCart();
  cart[index].qty = Math.max(1, Math.min(20, cart[index].qty + delta));
  saveCart(cart);
  initCart();
};
window.removeItem = index => {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  initCart();
};

updateCount();
if (document.querySelector('#productGrid')) (location.pathname.endsWith('shop.html') ? initShop : initHome)();
if (document.querySelector('#productPage')) initProduct();
if (document.querySelector('#cartPage')) initCart();
