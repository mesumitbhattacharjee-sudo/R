/**
 * CGAPH - SaaS Admin Dashboard Logic
 */

import { getProducts, saveProduct, deleteProduct, seedProductsToFirestore, DEMO_PRODUCTS } from './products.js';
import { db, collection, getDocs, doc, updateDoc } from './firebase-config.js';
import { showToast } from './app.js';

const ORDERS_STORAGE_KEY = 'cgaph_orders_v1';

// Initial demo orders for immediate SaaS metric visualization
export const DEMO_ORDERS = [
  {
    orderId: "ORD-98214",
    userId: "usr_101",
    customerName: "Alex Vance",
    customerEmail: "alex.vance@blackmesa.org",
    total: 116.00,
    items: [
      { name: "I Am Atomic Graphic Tee", size: "L", color: "Void Black", quantity: 2, price: 38.00 },
      { name: "Minimalist Heavy Cyber Hoodie", size: "XL", color: "Obsidian", quantity: 1, price: 78.00 }
    ],
    shippingAddress: "404 Gordon St, City 17, WA, 98101",
    status: "processing",
    trackingNumber: "FEDX-984392019",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    orderId: "ORD-98188",
    userId: "usr_102",
    customerName: "Elena Rostova",
    customerEmail: "elena.r@neotokyo.io",
    total: 82.00,
    items: [
      { name: "Architectural Oversized T-Shirt", size: "M", color: "Pitch Black", quantity: 1, price: 42.00 },
      { name: "Heavy Utility Canvas Tote Bag", size: "Universal", color: "Raw Canvas Ecru", quantity: 1, price: 28.00 }
    ],
    shippingAddress: "Shibuya-ku 2-14, Tokyo, JP",
    status: "shipped",
    trackingNumber: "DHL-773829104",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    orderId: "ORD-98150",
    userId: "usr_103",
    customerName: "Marcus Sterling",
    customerEmail: "m.sterling@apex.net",
    total: 144.00,
    items: [
      { name: "Modular Waterproof Urban Backpack", size: "28L", color: "Tactical Black", quantity: 1, price: 110.00 },
      { name: "Structured 6-Panel Embroidered Cap", size: "One Size", color: "Matte Black", quantity: 1, price: 32.00 }
    ],
    shippingAddress: "88 Wall Street, New York, NY 10005",
    status: "delivered",
    trackingNumber: "UPS-1Z999999999",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

export function getOrders() {
  const local = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!local) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(DEMO_ORDERS));
    return DEMO_ORDERS;
  }
  return JSON.parse(local);
}

export function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  return order;
}

export function updateOrderStatus(orderId, newStatus, tracking = null) {
  const orders = getOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (order) {
    order.status = newStatus;
    if (tracking !== null) order.trackingNumber = tracking;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    try {
      if (db) {
        updateDoc(doc(db, 'orders', orderId), { status: newStatus, ...(tracking ? { trackingNumber: tracking } : {}) });
      }
    } catch (e) {
      console.warn("Firestore order update fallback:", e.message);
    }
  }
  return orders;
}

export class AdminDashboard {
  constructor() {
    this.currentTab = 'overview';
    this.products = [];
    this.orders = [];
  }

  async init() {
    this.products = await getProducts();
    this.orders = getOrders();
    this.renderKPIs();
    this.renderProductsTable();
    this.renderOrdersTable();
    this.setupEventListeners();
  }

  renderKPIs() {
    const totalRev = this.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrdersCount = this.orders.length;
    const avgOrderValue = totalOrdersCount > 0 ? (totalRev / totalOrdersCount) : 0;
    const activeProductsCount = this.products.length;

    const revEl = document.getElementById('kpiTotalRevenue');
    const ordersEl = document.getElementById('kpiTotalOrders');
    const aovEl = document.getElementById('kpiAOV');
    const productsEl = document.getElementById('kpiActiveProducts');

    if (revEl) revEl.textContent = `$${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (ordersEl) ordersEl.textContent = totalOrdersCount.toString();
    if (aovEl) aovEl.textContent = `$${avgOrderValue.toFixed(2)}`;
    if (productsEl) productsEl.textContent = activeProductsCount.toString();
  }

  renderProductsTable() {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.products.forEach(p => {
      const tr = document.createElement('tr');
      const thumb = p.images && p.images[0] ? p.images[0] : '';
      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${thumb}" alt="${p.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-xs); background: var(--bg-alt);">
            <div>
              <strong style="color: var(--text-primary); display: block; font-size: 0.875rem;">${p.name}</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${p.id}</span>
            </div>
          </div>
        </td>
        <td><span class="badge badge-dark">${p.category}</span></td>
        <td><strong>$${Number(p.price).toFixed(2)}</strong></td>
        <td>${p.stock || 0} in stock</td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-secondary btn-edit-product" data-id="${p.id}">Edit</button>
            <button class="btn btn-sm btn-outline btn-delete-product" data-id="${p.id}" style="color: var(--color-danger); border-color: rgba(239, 68, 68, 0.3);">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Wire edit and delete buttons
    tbody.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.btn-delete-product').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this product?')) {
          await deleteProduct(btn.dataset.id);
          this.products = await getProducts();
          this.renderProductsTable();
          this.renderKPIs();
          showToast('Product removed successfully', 'info');
        }
      });
    });
  }

  renderOrdersTable() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.orders.forEach(o => {
      const tr = document.createElement('tr');
      const statusClass = o.status === 'delivered' ? 'badge-success' : (o.status === 'shipped' ? 'badge-primary' : 'badge-warning');
      const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      tr.innerHTML = `
        <td><strong>${o.orderId}</strong></td>
        <td>
          <div style="font-weight: 600;">${o.customerName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${o.customerEmail}</div>
        </td>
        <td>${dateStr}</td>
        <td><strong>$${Number(o.total).toFixed(2)}</strong></td>
        <td><span class="badge ${statusClass}">${o.status.toUpperCase()}</span></td>
        <td><span style="font-family: var(--font-mono); font-size: 0.8125rem;">${o.trackingNumber || 'Unassigned'}</span></td>
        <td>
          <select class="form-select status-select" data-id="${o.orderId}" style="padding: 4px 8px; font-size: 0.8125rem;">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const orderId = e.target.dataset.id;
        const newStatus = e.target.value;
        let tracking = null;
        if (newStatus === 'shipped') {
          tracking = prompt('Enter Carrier Tracking Number:', 'FEDX-' + Math.floor(100000000 + Math.random() * 900000000));
        }
        updateOrderStatus(orderId, newStatus, tracking);
        this.orders = getOrders();
        this.renderOrdersTable();
        showToast(`Order ${orderId} status set to ${newStatus}`, 'success');
      });
    });
  }

  openEditModal(productId = null) {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    const form = document.getElementById('productForm');
    form.reset();

    if (productId) {
      const p = this.products.find(x => x.id === productId);
      if (p) {
        document.getElementById('modalProductId').value = p.id;
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('prodNameInput').value = p.name;
        document.getElementById('prodCategorySelect').value = p.category;
        document.getElementById('prodPriceInput').value = p.price;
        document.getElementById('prodStockInput').value = p.stock || 50;
        document.getElementById('prodImageInput').value = (p.images && p.images[0]) || '';
        document.getElementById('prodDescInput').value = p.description || '';
      }
    } else {
      document.getElementById('modalProductId').value = '';
      document.getElementById('productModalTitle').textContent = 'Create New Product';
    }

    modal.classList.add('is-open');
  }

  setupEventListeners() {
    // New Product button
    const btnNew = document.getElementById('btnNewProduct');
    if (btnNew) {
      btnNew.addEventListener('click', () => this.openEditModal(null));
    }

    // Modal Close
    const closeBtn = document.getElementById('closeProductModal');
    const cancelBtn = document.getElementById('cancelProductModal');
    const modal = document.getElementById('productModal');
    [closeBtn, cancelBtn].forEach(btn => {
      if (btn && modal) {
        btn.addEventListener('click', () => modal.classList.remove('is-open'));
      }
    });

    // Product Form Submit
    const form = document.getElementById('productForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('modalProductId').value;
        const name = document.getElementById('prodNameInput').value;
        const category = document.getElementById('prodCategorySelect').value;
        const price = parseFloat(document.getElementById('prodPriceInput').value);
        const stock = parseInt(document.getElementById('prodStockInput').value, 10);
        const image = document.getElementById('prodImageInput').value || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80';
        const description = document.getElementById('prodDescInput').value;

        const productPayload = {
          id: id || undefined,
          name,
          category,
          price,
          stock,
          images: [image],
          description,
          sizes: ["S", "M", "L", "XL"],
          colors: ["#0B0B0E", "#E50914"],
          rating: 5.0,
          reviewsCount: 1
        };

        await saveProduct(productPayload);
        this.products = await getProducts();
        this.renderProductsTable();
        this.renderKPIs();
        modal.classList.remove('is-open');
        showToast(id ? 'Product updated successfully' : 'New product created', 'success');
      });
    }

    // Seed Demo Data button
    const seedBtn = document.getElementById('btnSeedFirestore');
    if (seedBtn) {
      seedBtn.addEventListener('click', async () => {
        seedBtn.disabled = true;
        seedBtn.textContent = 'Syncing to Cloud...';
        try {
          const count = await seedProductsToFirestore();
          showToast(`Successfully synced ${count} products to Firestore!`, 'success');
        } catch (err) {
          showToast(err.message, 'warning');
        } finally {
          seedBtn.disabled = false;
          seedBtn.textContent = 'Sync Catalog to Firestore';
        }
      });
    }
  }
}
