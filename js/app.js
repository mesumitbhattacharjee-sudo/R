/**
 * CGAPH - Global Application Orchestrator
 * Controls themes, toast notifications, navbar states, mobile drawer, and shared UI
 */

import { getCart } from './cart.js';
import { getWishlist } from './cart.js';
import { getCurrentUser, logoutUser } from './auth.js';

// Initialize Toast Container
let toastContainer = null;
export function showToast(message, type = 'info') {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <button type="button" class="toast-close" aria-label="Dismiss">✕</button>
  `;

  toastContainer.appendChild(toast);

  const dismiss = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, 3800);
}

// Global Theme Management
export function initTheme() {
  const saved = localStorage.getItem('cgaph_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const activeTheme = saved || (prefersDark ? 'dark' : 'dark'); // Default to sleek dark luxury mode
  document.documentElement.setAttribute('data-theme', activeTheme);
  updateThemeToggleButtons(activeTheme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('cgaph_theme', next);
  updateThemeToggleButtons(next);
  showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
}

function updateThemeToggleButtons(theme) {
  document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
    btn.innerHTML = theme === 'dark' 
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
  });
}

// Update Navbar Badges
export function updateNavbarBadges() {
  const cart = getCart();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.textContent = cartCount.toString();
    el.style.display = cartCount > 0 ? 'flex' : 'none';
  });

  const wishlist = getWishlist();
  const wishCount = wishlist.length;
  document.querySelectorAll('.wishlist-badge-count').forEach(el => {
    el.textContent = wishCount.toString();
    el.style.display = wishCount > 0 ? 'flex' : 'none';
  });
}

// Update Account Link in Navbar
export function updateAuthNav() {
  const user = getCurrentUser();
  document.querySelectorAll('.nav-auth-container').forEach(container => {
    if (user) {
      container.innerHTML = `
        <div style="position: relative;" class="user-dropdown-wrapper">
          <button class="icon-btn" id="userMenuBtn" aria-label="Account">
            <span style="font-weight: 800; font-size: 0.8125rem; color: var(--color-primary);">${(user.name || user.email || 'U')[0].toUpperCase()}</span>
          </button>
          <div class="user-dropdown-menu" id="userMenuDropdown" style="display: none; position: absolute; right: 0; top: 110%; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); box-shadow: var(--shadow-lg); width: 190px; padding: 6px; z-index: 100;">
            <div style="padding: 8px 12px; border-bottom: 1px solid var(--border-subtle); font-size: 0.8125rem;">
              <strong style="display: block; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden;">${user.name || 'Account'}</strong>
              <span style="color: var(--text-muted); font-size: 0.75rem;">${user.role === 'admin' ? 'Store Administrator' : 'Customer'}</span>
            </div>
            <a href="/pages/profile.html" style="display: block; padding: 8px 12px; font-size: 0.8125rem; color: var(--text-secondary); text-decoration: none; border-radius: 4px;">My Profile & Orders</a>
            ${user.role === 'admin' ? '<a href="/pages/admin.html" style="display: block; padding: 8px 12px; font-size: 0.8125rem; color: var(--color-primary); font-weight: 700; text-decoration: none; border-radius: 4px;">Admin Dashboard</a>' : ''}
            <button type="button" id="btnSignOutDropdown" style="width: 100%; text-align: left; background: none; border: none; padding: 8px 12px; font-size: 0.8125rem; color: var(--color-danger); cursor: pointer; border-radius: 4px;">Sign Out</button>
          </div>
        </div>
      `;
      const btn = container.querySelector('#userMenuBtn');
      const menu = container.querySelector('#userMenuDropdown');
      if (btn && menu) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });
        document.addEventListener('click', () => { menu.style.display = 'none'; });
      }
      const outBtn = container.querySelector('#btnSignOutDropdown');
      if (outBtn) {
        outBtn.addEventListener('click', async () => {
          await logoutUser();
          showToast('Signed out successfully', 'info');
          window.location.reload();
        });
      }
    } else {
      container.innerHTML = `
        <a href="/pages/login.html" class="icon-btn" aria-label="Sign In">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
      `;
    }
  });
}

// Setup Mobile Navigation Drawer
export function setupMobileNav() {
  const hamburger = document.querySelector('.hamburger-btn');
  const backdrop = document.querySelector('.mobile-drawer-backdrop');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.mobile-drawer-close');

  if (hamburger && drawer && backdrop) {
    const openDrawer = () => {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
  }
}

// Bootstrap shared listeners
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateNavbarBadges();
  updateAuthNav();
  setupMobileNav();

  document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  window.addEventListener('cart:updated', updateNavbarBadges);
  window.addEventListener('wishlist:updated', updateNavbarBadges);
  window.addEventListener('auth:changed', updateAuthNav);
});
