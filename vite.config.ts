import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(__dirname, 'public', 'assets', 'aistudio');
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (filePath.startsWith(aistudioDir + path.sep) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
              };
              res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [aistudioMediaPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        shop: path.resolve(__dirname, 'pages/shop.html'),
        product: path.resolve(__dirname, 'pages/product.html'),
        designer: path.resolve(__dirname, 'pages/custom-designer.html'),
        cart: path.resolve(__dirname, 'pages/cart.html'),
        checkout: path.resolve(__dirname, 'pages/checkout.html'),
        login: path.resolve(__dirname, 'pages/login.html'),
        profile: path.resolve(__dirname, 'pages/profile.html'),
        admin: path.resolve(__dirname, 'pages/admin.html'),
        wishlist: path.resolve(__dirname, 'pages/wishlist.html'),
        about: path.resolve(__dirname, 'pages/about.html'),
        legal: path.resolve(__dirname, 'pages/legal.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
