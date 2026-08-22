const fs = require('fs');
const path = require('path');
const https = require('https');

const BRANDS = [
  { name: 'Toyota', slug: 'toyota' },
  { name: 'Honda', slug: 'honda' },
  { name: 'BMW', slug: 'bmw' },
  { name: 'Mercedes-Benz', slug: 'mercedes' },
  { name: 'Mitsubishi', slug: 'mitsubishi' },
  { name: 'Hyundai', slug: 'hyundai' },
  { name: 'Suzuki', slug: 'suzuki' },
  { name: 'Mazda', slug: 'mazda' },
  { name: 'Audi', slug: 'audi' },
  { name: 'Ford', slug: 'ford' },
  { name: 'Nissan', slug: 'nissan' },
  { name: 'Ferrari', slug: 'ferrari' },
  { name: 'Porsche', slug: 'porsche' },
  { name: 'Lexus', slug: 'lexus' },
  { name: 'Tesla', slug: 'tesla' },
  { name: 'Chevrolet', slug: 'chevrolet' },
  { name: 'Aston Martin', slug: 'astonmartin' },
];

const outDir = path.join(__dirname, '../public/brands');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function fetchSvg(slug) {
  return new Promise((resolve, reject) => {
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${slug}: status ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading brand SVGs...');
  for (const b of BRANDS) {
    try {
      const svg = await fetchSvg(b.slug);
      const filePath = path.join(outDir, `${b.slug}.svg`);
      fs.writeFileSync(filePath, svg, 'utf8');
      console.log(`[SUCCESS] ${b.name} -> /brands/${b.slug}.svg`);
    } catch (err) {
      console.error(`[ERROR] ${b.name}:`, err.message);
    }
  }
  console.log('Done!');
}

run();
