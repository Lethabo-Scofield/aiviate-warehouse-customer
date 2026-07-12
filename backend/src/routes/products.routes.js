const express = require('express');
const pool = require('../config/db');

const router = express.Router();

const CATEGORY_IMAGES = {
  beverages: 'https://img.spoonacular.com/ingredients_500x500/water.jpg',
  bakery: 'https://img.spoonacular.com/ingredients_500x500/whole-wheat-bread.jpg',
  dairy: 'https://img.spoonacular.com/ingredients_500x500/plain-yogurt.jpg',
  snacks: 'https://img.spoonacular.com/ingredients_500x500/nuts-mixed.jpg',
  household: 'https://img.spoonacular.com/ingredients_500x500/olive-oil.jpg',
  produce: 'https://img.spoonacular.com/ingredients_500x500/tomato.jpg',
  pantry: 'https://img.spoonacular.com/ingredients_500x500/flour.jpg',
  frozen: 'https://img.spoonacular.com/ingredients_500x500/peas.jpg',
  'meat-seafood': 'https://img.spoonacular.com/ingredients_500x500/chicken-breasts.jpg',
  condiments: 'https://img.spoonacular.com/ingredients_500x500/ketchup.jpg'
};

const PRODUCT_KEYWORD_IMAGES = [
  { re: /yogh?urt|greek\s*yogh?urt/i, image: 'https://img.spoonacular.com/ingredients_500x500/plain-yogurt.jpg' },
  { re: /olive\s*oil|extra\s*virgin\s*oil/i, image: 'https://img.spoonacular.com/ingredients_500x500/olive-oil.jpg' },
  { re: /water|mineral\s*water|sparkling\s*water/i, image: 'https://img.spoonacular.com/ingredients_500x500/water.jpg' },
  { re: /bread|loaf|brioche|baguette|wheat\s*bread/i, image: 'https://img.spoonacular.com/ingredients_500x500/whole-wheat-bread.jpg' },
  { re: /nuts?|almond|cashew|peanut|pistachio|walnut|hazelnut/i, image: 'https://img.spoonacular.com/ingredients_500x500/nuts-mixed.jpg' },
  { re: /milk/i, image: 'https://img.spoonacular.com/ingredients_500x500/milk.jpg' },
  { re: /cheese|cheddar/i, image: 'https://img.spoonacular.com/ingredients_500x500/cheddar-cheese.jpg' },
  { re: /butter/i, image: 'https://img.spoonacular.com/ingredients_500x500/butter.jpg' },
  { re: /eggs?/i, image: 'https://img.spoonacular.com/ingredients_500x500/egg.jpg' },
  { re: /chicken|fillet/i, image: 'https://img.spoonacular.com/ingredients_500x500/chicken-breasts.jpg' },
  { re: /salmon|fish/i, image: 'https://img.spoonacular.com/ingredients_500x500/salmon.jpg' },
  { re: /spaghetti|pasta/i, image: 'https://img.spoonacular.com/ingredients_500x500/spaghetti.jpg' },
  { re: /noodles?/i, image: 'https://img.spoonacular.com/ingredients_500x500/rice-noodles.jpg' },
  { re: /flour/i, image: 'https://img.spoonacular.com/ingredients_500x500/flour.jpg' },
  { re: /salt/i, image: 'https://img.spoonacular.com/ingredients_500x500/salt.jpg' },
  { re: /coffee/i, image: 'https://img.spoonacular.com/ingredients_500x500/coffee.jpg' },
  { re: /orange\s*juice|juice/i, image: 'https://img.spoonacular.com/ingredients_500x500/orange-juice.jpg' },
  { re: /potato\s*chips|chips/i, image: 'https://img.spoonacular.com/ingredients_500x500/potato-chips.jpg' },
  { re: /crackers?/i, image: 'https://img.spoonacular.com/ingredients_500x500/crackers.jpg' },
  { re: /chocolate/i, image: 'https://img.spoonacular.com/ingredients_500x500/chocolate-chips.jpg' },
  { re: /ice\s*cream/i, image: 'https://img.spoonacular.com/ingredients_500x500/vanilla-ice-cream.jpg' },
  { re: /peas/i, image: 'https://img.spoonacular.com/ingredients_500x500/peas.jpg' },
  { re: /apples?/i, image: 'https://img.spoonacular.com/ingredients_500x500/apple.jpg' },
  { re: /oranges?/i, image: 'https://img.spoonacular.com/ingredients_500x500/orange.jpg' },
  { re: /tomatoes?/i, image: 'https://img.spoonacular.com/ingredients_500x500/tomato.jpg' },
  { re: /cucumbers?/i, image: 'https://img.spoonacular.com/ingredients_500x500/cucumber.jpg' },
  { re: /broccoli/i, image: 'https://img.spoonacular.com/ingredients_500x500/broccoli.jpg' },
  { re: /onions?/i, image: 'https://img.spoonacular.com/ingredients_500x500/red-onion.jpg' },
  { re: /ketchup/i, image: 'https://img.spoonacular.com/ingredients_500x500/ketchup.jpg' },
  { re: /mayonnaise|mayo/i, image: 'https://img.spoonacular.com/ingredients_500x500/mayonnaise.jpg' }
];

const EXACT_NAME_IMAGES = {
  'premium olive oil': 'https://img.spoonacular.com/ingredients_500x500/olive-oil.jpg',
  'sparkling mineral water': 'https://img.spoonacular.com/ingredients_500x500/water.jpg',
  'whole grain bread': 'https://img.spoonacular.com/ingredients_500x500/whole-wheat-bread.jpg',
  'greek yogurt': 'https://img.spoonacular.com/ingredients_500x500/plain-yogurt.jpg',
  'mixed nuts': 'https://img.spoonacular.com/ingredients_500x500/nuts-mixed.jpg',
  'fresh milk': 'https://img.spoonacular.com/ingredients_500x500/milk.jpg',
  'cheddar cheese block': 'https://img.spoonacular.com/ingredients_500x500/cheddar-cheese.jpg',
  'creamy butter': 'https://img.spoonacular.com/ingredients_500x500/butter.jpg',
  'farm eggs': 'https://img.spoonacular.com/ingredients_500x500/egg.jpg',
  'chicken breast fillets': 'https://img.spoonacular.com/ingredients_500x500/chicken-breasts.jpg',
  'atlantic salmon fillet': 'https://img.spoonacular.com/ingredients_500x500/salmon.jpg',
  'spaghetti pasta': 'https://img.spoonacular.com/ingredients_500x500/spaghetti.jpg',
  'rice noodles': 'https://img.spoonacular.com/ingredients_500x500/rice-noodles.jpg',
  'ground coffee': 'https://img.spoonacular.com/ingredients_500x500/coffee.jpg',
  'orange juice': 'https://img.spoonacular.com/ingredients_500x500/orange-juice.jpg',
  'salted crackers': 'https://img.spoonacular.com/ingredients_500x500/crackers.jpg',
  'potato chips': 'https://img.spoonacular.com/ingredients_500x500/potato-chips.jpg',
  'chocolate chips': 'https://img.spoonacular.com/ingredients_500x500/chocolate-chips.jpg',
  'vanilla ice cream': 'https://img.spoonacular.com/ingredients_500x500/vanilla-ice-cream.jpg',
  'frozen green peas': 'https://img.spoonacular.com/ingredients_500x500/peas.jpg',
  'all purpose flour': 'https://img.spoonacular.com/ingredients_500x500/flour.jpg',
  'sea salt': 'https://img.spoonacular.com/ingredients_500x500/salt.jpg',
  'fresh apples': 'https://img.spoonacular.com/ingredients_500x500/apple.jpg',
  'fresh oranges': 'https://img.spoonacular.com/ingredients_500x500/orange.jpg',
  'fresh tomatoes': 'https://img.spoonacular.com/ingredients_500x500/tomato.jpg',
  'fresh cucumbers': 'https://img.spoonacular.com/ingredients_500x500/cucumber.jpg',
  'fresh broccoli': 'https://img.spoonacular.com/ingredients_500x500/broccoli.jpg',
  'red onions': 'https://img.spoonacular.com/ingredients_500x500/red-onion.jpg',
  'tomato ketchup': 'https://img.spoonacular.com/ingredients_500x500/ketchup.jpg',
  'classic mayonnaise': 'https://img.spoonacular.com/ingredients_500x500/mayonnaise.jpg'
};

const isBlockedImageHost = (url) => {
  if (!url) return true;
  const normalized = String(url).toLowerCase();
  return normalized.includes('openfoodfacts.org') || normalized.includes('dummyjson.com/image');
};

const normalizeProductName = (name) => String(name || '').trim().toLowerCase();

const resolveProductImage = (name, categorySlug, imageUrl) => {
  const safeName = String(name || '');
  const normalizedName = normalizeProductName(name);

  if (EXACT_NAME_IMAGES[normalizedName]) {
    return EXACT_NAME_IMAGES[normalizedName];
  }

  if (imageUrl && !isBlockedImageHost(imageUrl)) {
    return imageUrl;
  }

  for (const rule of PRODUCT_KEYWORD_IMAGES) {
    if (rule.re.test(safeName)) {
      return rule.image;
    }
  }

  const slug = String(categorySlug || '').toLowerCase();
  return CATEGORY_IMAGES[slug] || 'https://img.spoonacular.com/ingredients_500x500/olive-oil.jpg';
};

router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', limit = '50' } = req.query;
    const maxLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);

    const result = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.description,
         p.price,
         p.stock,
         p.image_url,
         c.name AS category,
         c.slug AS category_slug,
         p.is_active,
         p.created_at
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = TRUE
         AND ($1 = '' OR p.name ILIKE '%' || $1 || '%')
         AND ($2 = '' OR c.slug = $2)
       ORDER BY p.created_at DESC
       LIMIT $3`,
      [String(search).trim(), String(category).trim(), maxLimit]
    );

    const products = result.rows.map((row) => ({
      ...row,
      image: resolveProductImage(row.name, row.category_slug, row.image_url)
    }));

    return res.json({ ok: true, products });
  } catch (error) {
    console.error('Products list error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to load products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.description,
         p.price,
         p.stock,
         p.image_url,
         c.name AS category,
         c.slug AS category_slug,
         p.is_active,
         p.created_at
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Product not found' });
    }

    const row = result.rows[0];
    const product = {
      ...row,
      image: resolveProductImage(row.name, row.category_slug, row.image_url)
    };

    return res.json({ ok: true, product });
  } catch (error) {
    console.error('Product detail error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to load product' });
  }
});

module.exports = router;
