/**
 * CGAPH - Products Catalog & Firestore Data Layer
 */

import { db, collection, getDocs, doc, setDoc, deleteDoc } from './firebase-config.js';

// Base demo products adhering strictly to requested catalog specs
export const DEMO_PRODUCTS = [
  {
    id: "prod-atomic-tee",
    name: "I Am Atomic Graphic Tee",
    category: "Custom printed T-shirts",
    price: 38.00,
    rating: 5.0,
    reviewsCount: 142,
    badge: "Signature Collection",
    isFeatured: true,
    colors: ["#0B0B0E", "#1F1F24", "#E50914"],
    colorNames: ["Void Black", "Phantom Charcoal", "Crimson Core"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    stock: 85,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "The crown jewel of the CGAPH monochrome series. Crafted from 260 GSM combed ring-spun organic cotton with high-definition digital discharge print.",
    printQuote: "If I don't want to be vaporized in a nuclear explosion, I simply have to become nuclear myself… I am Atomic. — Shadow write this not different",
    specs: {
      material: "100% Ring-spun Heavyweight Cotton (260 GSM)",
      fit: "Tailored Streetwear Relaxed Cut",
      printMethod: "Direct-to-Garment (DTG) with Japanese Pigment Inks",
      care: "Machine wash cold inside out, hang dry"
    }
  },
  {
    id: "prod-oversized-tee",
    name: "Architectural Oversized T-Shirt",
    category: "Oversized T-shirts",
    price: 42.00,
    rating: 4.8,
    reviewsCount: 89,
    badge: "Bestseller",
    isFeatured: true,
    colors: ["#17171C", "#F4F4F6", "#454550"],
    colorNames: ["Pitch Black", "Off-White", "Washed Slate"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Extra heavy drop-shoulder silhouette built for effortless layering and all-day architectural drape.",
    specs: {
      material: "100% Combed Compact Cotton (280 GSM)",
      fit: "Drop Shoulder Boxy Silhouette",
      printMethod: "Precision Screen Printing",
      care: "Cold wash, do not tumble dry"
    }
  },
  {
    id: "prod-cyber-hoodie",
    name: "Minimalist Heavy Cyber Hoodie",
    category: "Hoodies",
    price: 78.00,
    rating: 4.9,
    reviewsCount: 215,
    badge: "Winter Heavyweight",
    isFeatured: true,
    colors: ["#0E0E12", "#2B2B33", "#E50914"],
    colorNames: ["Obsidian", "Gunmetal", "Apex Red"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    stock: 64,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "450 GSM French Terry brushed interior hoodie with double-needle structured hood and hidden kangaroo media pocket.",
    specs: {
      material: "85% Organic Cotton, 15% Recycled Polyester (450 GSM)",
      fit: "True-to-Size Structured Heavy",
      printMethod: "High-Density Puff Print & Embroidery",
      care: "Hand wash or gentle cycle cold"
    }
  },
  {
    id: "prod-crew-sweatshirt",
    name: "Raw Seam Thermal Sweatshirt",
    category: "Sweatshirts",
    price: 64.00,
    rating: 4.7,
    reviewsCount: 73,
    badge: "Eco-Cotton",
    isFeatured: false,
    colors: ["#1B1B20", "#3E4149", "#D9D9DF"],
    colorNames: ["Onyx", "Heather Charcoal", "Frost Gray"],
    sizes: ["S", "M", "L", "XL"],
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Clean crewneck silhouette with ribbed side gussets, engineered collar tension, and minimalist back typography.",
    specs: {
      material: "100% Organic Loopback French Terry (380 GSM)",
      fit: "Relaxed Modern Fit",
      printMethod: "Water-based discharge ink",
      care: "Wash with like colors"
    }
  },
  {
    id: "prod-structured-cap",
    name: "Structured 6-Panel Embroidered Cap",
    category: "Caps",
    price: 32.00,
    rating: 4.8,
    reviewsCount: 96,
    badge: "Limited Drop",
    isFeatured: true,
    colors: ["#111115", "#E50914", "#EAEAEF"],
    colorNames: ["Matte Black", "Racing Red", "Chalk White"],
    sizes: ["One Size Fits All"],
    stock: 140,
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Structured high-profile crown with curved brim and matte gunmetal brass buckle closure. 3D raised CGAPH monogram embroidery.",
    specs: {
      material: "100% Chino Cotton Twill",
      fit: "Adjustable 54cm - 62cm with brass buckle",
      printMethod: "High-Precision 3D Raised Embroidery",
      care: "Spot clean with damp cloth"
    }
  },
  {
    id: "prod-canvas-tote",
    name: "Heavy Utility Canvas Tote Bag",
    category: "Tote bags",
    price: 28.00,
    rating: 4.9,
    reviewsCount: 160,
    badge: "Eco Choice",
    isFeatured: false,
    colors: ["#F2F2F6", "#141418"],
    colorNames: ["Raw Canvas Ecru", "Pitch Black"],
    sizes: ["Universal (16\" x 15\" x 4\")"],
    stock: 200,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Indestructible 16 oz heavy duck canvas tote featuring reinforced cross-stitched handles and interior zipper security compartment.",
    specs: {
      material: "16 oz Heavy Duck Cotton Canvas",
      capacity: "22 Liters with reinforced webbing straps",
      printMethod: "Ultra-Durable Thermal Sublimation",
      care: "Spot clean or gentle hand wash"
    }
  },
  {
    id: "prod-tactical-backpack",
    name: "Modular Waterproof Urban Backpack",
    category: "Backpacks",
    price: 110.00,
    rating: 5.0,
    reviewsCount: 88,
    badge: "Techwear Elite",
    isFeatured: true,
    colors: ["#0B0B0E", "#22222A"],
    colorNames: ["Tactical Black", "Shadow Camo"],
    sizes: ["28L Capacity"],
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Engineered from ballistic Cordura 1000D with water-repellent YKK AquaGuard zippers and padded 16\" MacBook sleeve.",
    specs: {
      material: "1000D Ballistic Nylon + Cordura",
      dimensions: "48cm x 32cm x 18cm (28L)",
      features: "Magnetic Fidlock Buckles, Ergonomic EVA back panel",
      care: "Wipe clean with tech spray"
    }
  },
  {
    id: "prod-ceramic-mug",
    name: "Dual Tone Matte Ceramic Mug",
    category: "Mugs",
    price: 18.00,
    rating: 4.8,
    reviewsCount: 124,
    badge: "Staff Pick",
    isFeatured: false,
    colors: ["#18181D", "#E50914", "#F7F7FA"],
    colorNames: ["Matte Charcoal", "Crimson Glaze", "Gloss White"],
    sizes: ["12 oz (350ml)", "15 oz (450ml)"],
    stock: 180,
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Ergonomic ceramic coffee mug with soft-touch non-slip matte exterior and scratch-resistant porcelain interior.",
    specs: {
      material: "High-fired Stoneware Ceramic",
      capacity: "12 oz (350ml)",
      features: "Microwave safe, dishwasher tested for 1000+ cycles",
      care: "Dishwasher and handwash safe"
    }
  },
  {
    id: "prod-phone-case",
    name: "MagSafe Impact Armor Phone Case",
    category: "Phone cases",
    price: 34.00,
    rating: 4.9,
    reviewsCount: 310,
    badge: "10ft Drop Tested",
    isFeatured: false,
    colors: ["#121217", "#E50914", "#30303D"],
    colorNames: ["Stealth Black", "Hyper Red", "Smoke Gray"],
    sizes: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 15 Pro Max", "Samsung S24 Ultra", "Pixel 9 Pro"],
    stock: 250,
    images: [
      "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Military-spec shock-absorbing TPU bumper with scratch-resistant poly-carbonate back plate and 38-piece neodymium magnet array.",
    specs: {
      protection: "Certified MIL-STD-810G 3-meter drop protection",
      compatibility: "Full Apple MagSafe & Qi2 Wireless Charger support",
      finish: "Anti-fingerprint oleophobic coating",
      warranty: "Lifetime anti-yellowing guarantee"
    }
  },
  {
    id: "prod-art-poster",
    name: "Archival Museum-Grade Art Poster",
    category: "Posters",
    price: 24.00,
    rating: 4.9,
    reviewsCount: 82,
    badge: "Fine Art Print",
    isFeatured: false,
    colors: ["#FFFFFF"],
    colorNames: ["Museum Paper"],
    sizes: ["A3 (30x42cm)", "A2 (42x59cm)", "24\"x36\" (61x91cm)"],
    stock: 300,
    images: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Printed on 250 GSM acid-free museum-grade paper with 12-color archival giclée pigment inks guaranteed not to fade for 100+ years.",
    specs: {
      paper: "Hahnemühle Photo Rag 250 GSM Cotton",
      finish: "Anti-reflective Velvet Matte",
      packaging: "Shipped in reinforced triangular craft tube",
      framing: "Unframed, fits standard Scandinavian frames"
    }
  },
  {
    id: "prod-sticker-pack",
    name: "Holographic Vinyl Die-Cut Sticker Pack",
    category: "Stickers",
    price: 14.00,
    rating: 4.9,
    reviewsCount: 220,
    badge: "Waterproof & UV Safe",
    isFeatured: false,
    colors: ["#E50914"],
    colorNames: ["Holographic"],
    sizes: ["Pack of 10 Assorted (3\" to 4\")"],
    stock: 500,
    images: [
      "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "10-piece die-cut collection printed on iridescent holographic vinyl. 100% waterproof, weatherproof, and dishwasher-safe for laptops and bottles.",
    specs: {
      material: "6 mil thick Heavyweight Holographic Vinyl",
      lamination: "UV-Resistant Protective Matte Clear Coat",
      quantity: "10 unique custom illustrations",
      adhesive: "Removable without residue"
    }
  },
  {
    id: "prod-custom-keychain",
    name: "Tactical Woven Jacquard Wrist Lanyard",
    category: "Custom accessories",
    price: 16.00,
    rating: 4.8,
    reviewsCount: 145,
    badge: "Hardware Grade",
    isFeatured: false,
    colors: ["#0B0B0E", "#E50914"],
    colorNames: ["Pitch Black", "Cyber Red"],
    sizes: ["Standard 18cm Wrist Loop"],
    stock: 350,
    images: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "High-density nylon webbing with woven CGAPH monogram and black oxide stainless steel quick-release spring clip.",
    specs: {
      hardware: "Matte Black PVD Coated Stainless Steel",
      strap: "High-Tensile Woven Jacquard Ribbon",
      length: "18 cm total drop length",
      weight: "48 grams"
    }
  }
];

const STORAGE_KEY = 'cgaph_products_v1';

/**
 * Initialize product catalog in local cache
 */
export function initProducts() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PRODUCTS));
  }
}

/**
 * Fetch all active products
 */
export async function getProducts() {
  initProducts();
  try {
    if (db) {
      const snap = await getDocs(collection(db, 'products'));
      if (snap && snap.docs && snap.docs.length > 0) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    }
  } catch (err) {
    console.warn("Using local product storage (Firestore offline or fallback):", err.message);
  }
  const local = localStorage.getItem(STORAGE_KEY);
  return local ? JSON.parse(local) : DEMO_PRODUCTS;
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id) {
  const all = await getProducts();
  return all.find(p => p.id === id) || null;
}

/**
 * Save / Update a product (Admin capability)
 */
export async function saveProduct(product) {
  const all = await getProducts();
  const existingIndex = all.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    all[existingIndex] = { ...all[existingIndex], ...product, updatedAt: new Date().toISOString() };
  } else {
    product.id = product.id || 'prod-' + Date.now();
    product.createdAt = new Date().toISOString();
    all.unshift(product);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  // Sync to Firestore if available
  try {
    if (db) {
      await setDoc(doc(db, 'products', product.id), product);
    }
  } catch (e) {
    console.warn("Could not sync product to Firestore:", e.message);
  }

  return product;
}

/**
 * Delete product by ID
 */
export async function deleteProduct(id) {
  let all = await getProducts();
  all = all.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  try {
    if (db) {
      await deleteDoc(doc(db, 'products', id));
    }
  } catch (e) {
    console.warn("Could not delete from Firestore:", e.message);
  }
}

/**
 * Seed demo products to Firestore
 */
export async function seedProductsToFirestore() {
  if (!db) {
    throw new Error("Firestore instance is not available. Please configure Firebase.");
  }
  let count = 0;
  for (const item of DEMO_PRODUCTS) {
    await setDoc(doc(db, 'products', item.id), item);
    count++;
  }
  return count;
}
