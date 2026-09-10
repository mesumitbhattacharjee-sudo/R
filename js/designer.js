/**
 * CGAPH - Custom Product Designer
 * HTML5 Canvas Studio for Custom Print-on-Demand Mockups
 */

import { addToCart } from './cart.js';
import { showToast } from './app.js';

export class CustomDesigner {
  constructor(canvasId, mockupContainerId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.mockupContainer = document.getElementById(mockupContainerId);

    // Default garment configuration
    this.productType = 't-shirt';
    this.garmentColor = '#0B0B0E';
    this.garmentName = 'Classic Heavyweight T-Shirt';
    this.basePrice = 36.00;

    // Design layers (text and images)
    this.layers = [];
    this.selectedLayerIndex = -1;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Garment mockup assets
    this.garmentTemplates = {
      't-shirt': {
        name: 'Classic Heavyweight T-Shirt',
        price: 36.00,
        printBox: { top: '24%', left: '30%', width: '40%', height: '48%' },
        bgUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'
      },
      'oversized-tee': {
        name: 'Oversized Boxy Tee',
        price: 42.00,
        printBox: { top: '25%', left: '28%', width: '44%', height: '50%' },
        bgUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80'
      },
      'hoodie': {
        name: 'Cyber Heavyweight Hoodie',
        price: 74.00,
        printBox: { top: '32%', left: '32%', width: '36%', height: '40%' },
        bgUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'
      },
      'cap': {
        name: '6-Panel Embroidered Cap',
        price: 32.00,
        printBox: { top: '35%', left: '34%', width: '32%', height: '28%' },
        bgUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80'
      },
      'tote-bag': {
        name: 'Heavy Cotton Canvas Tote',
        price: 28.00,
        printBox: { top: '36%', left: '26%', width: '48%', height: '44%' },
        bgUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
      },
      'mug': {
        name: 'Matte Ceramic Coffee Mug',
        price: 18.00,
        printBox: { top: '28%', left: '30%', width: '40%', height: '48%' },
        bgUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80'
      }
    };

    this.initCanvasSize();
    this.setupEventListeners();
    this.addDefaultGraphic();
    this.render();
  }

  initCanvasSize() {
    // 2x scale for crisp retina display
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 400;
    this.height = rect.height || 500;
    this.canvas.width = this.width * 2;
    this.canvas.height = this.height * 2;
    this.ctx.scale(2, 2);
  }

  setupEventListeners() {
    // Canvas pointer drag/drop
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    window.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    window.addEventListener('mouseup', () => this.handlePointerUp());

    // Touch support for tablets & mobile
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.handlePointerDown(touch);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        this.handlePointerMove(e.touches[0]);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => this.handlePointerUp());
  }

  setGarment(type) {
    if (this.garmentTemplates[type]) {
      this.productType = type;
      const t = this.garmentTemplates[type];
      this.garmentName = t.name;
      this.basePrice = t.price;

      if (this.mockupContainer) {
        this.mockupContainer.style.backgroundImage = `url('${t.bgUrl}')`;
        const printBoxEl = document.getElementById('printableArea');
        if (printBoxEl) {
          printBoxEl.style.top = t.printBox.top;
          printBoxEl.style.left = t.printBox.left;
          printBoxEl.style.width = t.printBox.width;
          printBoxEl.style.height = t.printBox.height;
        }
      }
      this.updatePriceDisplay();
      this.render();
    }
  }

  setGarmentColor(hex) {
    this.garmentColor = hex;
    const filterOverlay = document.getElementById('garmentColorFilter');
    if (filterOverlay) {
      filterOverlay.style.backgroundColor = hex;
    }
    this.render();
  }

  addText(text = 'ATOMIC', options = {}) {
    const newLayer = {
      type: 'text',
      text: text,
      x: this.width / 2,
      y: this.height / 2,
      font: options.font || "'Plus Jakarta Sans', sans-serif",
      fontSize: options.fontSize || 36,
      fontWeight: options.fontWeight || '800',
      color: options.color || '#FFFFFF',
      align: options.align || 'center',
      rotation: 0
    };
    this.layers.push(newLayer);
    this.selectedLayerIndex = this.layers.length - 1;
    this.render();
    this.updateLayersUI();
  }

  addImage(imgElement) {
    const aspect = imgElement.width / imgElement.height;
    const targetW = 160;
    const targetH = targetW / aspect;

    const newLayer = {
      type: 'image',
      image: imgElement,
      x: (this.width - targetW) / 2,
      y: (this.height - targetH) / 2,
      width: targetW,
      height: targetH,
      rotation: 0
    };
    this.layers.push(newLayer);
    this.selectedLayerIndex = this.layers.length - 1;
    this.render();
    this.updateLayersUI();
  }

  addDefaultGraphic() {
    // Default quote from requirement
    this.addText("I AM ATOMIC", {
      fontSize: 34,
      fontWeight: '900',
      color: '#E50914',
      align: 'center'
    });
    this.layers[0].y = this.height / 2 - 25;

    this.addText("CGAPH MONOCHROME LAB", {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      align: 'center'
    });
    this.layers[1].y = this.height / 2 + 25;
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  handlePointerDown(e) {
    const pos = this.getPointerPos(e);
    // Hit test from topmost layer to bottom
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (layer.type === 'text') {
        const textMetrics = this.ctx.measureText(layer.text);
        const textW = textMetrics.width || 120;
        const textH = layer.fontSize || 30;
        if (
          pos.x >= layer.x - textW / 2 &&
          pos.x <= layer.x + textW / 2 &&
          pos.y >= layer.y - textH &&
          pos.y <= layer.y + 10
        ) {
          this.selectedLayerIndex = i;
          this.isDragging = true;
          this.dragStartX = pos.x - layer.x;
          this.dragStartY = pos.y - layer.y;
          this.render();
          this.updateLayersUI();
          return;
        }
      } else if (layer.type === 'image') {
        if (
          pos.x >= layer.x &&
          pos.x <= layer.x + layer.width &&
          pos.y >= layer.y &&
          pos.y <= layer.y + layer.height
        ) {
          this.selectedLayerIndex = i;
          this.isDragging = true;
          this.dragStartX = pos.x - layer.x;
          this.dragStartY = pos.y - layer.y;
          this.render();
          this.updateLayersUI();
          return;
        }
      }
    }
    this.selectedLayerIndex = -1;
    this.render();
    this.updateLayersUI();
  }

  handlePointerMove(e) {
    if (!this.isDragging || this.selectedLayerIndex < 0) return;
    const pos = this.getPointerPos(e);
    const layer = this.layers[this.selectedLayerIndex];
    layer.x = pos.x - this.dragStartX;
    layer.y = pos.y - this.dragStartY;
    this.render();
  }

  handlePointerUp() {
    this.isDragging = false;
  }

  updateActiveLayer(properties) {
    if (this.selectedLayerIndex >= 0 && this.layers[this.selectedLayerIndex]) {
      Object.assign(this.layers[this.selectedLayerIndex], properties);
      this.render();
    }
  }

  removeActiveLayer() {
    if (this.selectedLayerIndex >= 0) {
      this.layers.splice(this.selectedLayerIndex, 1);
      this.selectedLayerIndex = Math.max(-1, this.layers.length - 1);
      this.render();
      this.updateLayersUI();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw layers
    this.layers.forEach((layer, index) => {
      this.ctx.save();
      if (layer.type === 'text') {
        this.ctx.font = `${layer.fontWeight || '700'} ${layer.fontSize || 32}px ${layer.font}`;
        this.ctx.fillStyle = layer.color || '#FFFFFF';
        this.ctx.textAlign = layer.align || 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(layer.text, layer.x, layer.y);

        // Highlight selected layer with sleek border
        if (index === this.selectedLayerIndex) {
          const metrics = this.ctx.measureText(layer.text);
          const w = metrics.width + 16;
          const h = layer.fontSize + 12;
          this.ctx.strokeStyle = '#E50914';
          this.ctx.lineWidth = 1.5;
          this.ctx.setLineDash([4, 4]);
          this.ctx.strokeRect(layer.x - w / 2, layer.y - h / 2, w, h);
        }
      } else if (layer.type === 'image') {
        this.ctx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
        if (index === this.selectedLayerIndex) {
          this.ctx.strokeStyle = '#E50914';
          this.ctx.lineWidth = 1.5;
          this.ctx.setLineDash([4, 4]);
          this.ctx.strokeRect(layer.x - 4, layer.y - 4, layer.width + 8, layer.height + 8);
        }
      }
      this.ctx.restore();
    });
  }

  updateLayersUI() {
    const listEl = document.getElementById('designerLayersList');
    if (!listEl) return;
    listEl.innerHTML = '';

    this.layers.forEach((layer, i) => {
      const item = document.createElement('div');
      item.className = `designer-layer-item ${i === this.selectedLayerIndex ? 'active' : ''}`;
      item.style.cssText = `
        display: flex; align-items: center; justify-content: space-between;
        padding: 8px 12px; border: 1px solid ${i === this.selectedLayerIndex ? 'var(--color-primary)' : 'var(--border-subtle)'};
        border-radius: var(--radius-sm); margin-bottom: 6px; cursor: pointer;
        background: ${i === this.selectedLayerIndex ? 'var(--color-primary-subtle)' : 'var(--bg-surface-elevated)'};
      `;

      const title = layer.type === 'text' ? `Text: "${layer.text.substring(0, 16)}"` : 'Custom Graphic';
      item.innerHTML = `
        <span style="font-size: 0.8125rem; font-weight: 600; color: var(--text-primary);">${title}</span>
        <button type="button" class="btn-delete-layer" style="background: transparent; border: none; color: var(--color-danger); cursor: pointer; font-size: 0.8125rem;">✕</button>
      `;

      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-delete-layer')) {
          this.selectedLayerIndex = i;
          this.render();
          this.updateLayersUI();
          this.syncInspectorForm();
        }
      });

      item.querySelector('.btn-delete-layer').addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedLayerIndex = i;
        this.removeActiveLayer();
      });

      listEl.appendChild(item);
    });

    this.syncInspectorForm();
  }

  syncInspectorForm() {
    const textInput = document.getElementById('layerTextInput');
    const colorInput = document.getElementById('layerColorInput');
    const sizeInput = document.getElementById('layerSizeInput');
    const fontSelect = document.getElementById('layerFontSelect');

    if (this.selectedLayerIndex >= 0 && this.layers[this.selectedLayerIndex].type === 'text') {
      const layer = this.layers[this.selectedLayerIndex];
      if (textInput) textInput.value = layer.text;
      if (colorInput) colorInput.value = layer.color;
      if (sizeInput) sizeInput.value = layer.fontSize;
      if (fontSelect) fontSelect.value = layer.font;
    }
  }

  updatePriceDisplay() {
    const el = document.getElementById('designerPriceTag');
    if (el) {
      el.textContent = `$${this.basePrice.toFixed(2)}`;
    }
  }

  exportComposite() {
    return this.canvas.toDataURL('image/png');
  }

  addToCart(size = 'L', quantity = 1) {
    const previewDataUrl = this.exportComposite();
    const customProduct = {
      id: `custom-${this.productType}-${Date.now()}`,
      name: `Bespoke ${this.garmentName}`,
      category: 'Custom Bespoke Apparel',
      price: this.basePrice,
      images: [previewDataUrl]
    };

    addToCart(customProduct, size, this.garmentColor, 'Custom Tint', quantity, {
      productType: this.productType,
      layersCount: this.layers.length,
      previewImage: previewDataUrl,
      timestamp: new Date().toISOString()
    });

    showToast(`Added Custom ${this.garmentName} to Cart!`, 'success');
  }
}
