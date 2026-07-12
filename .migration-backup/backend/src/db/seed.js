const pool = require('../config/db');

const defaultCategories = [
  { name: 'Beverages', slug: 'beverages' },
  { name: 'Bakery', slug: 'bakery' },
  { name: 'Dairy', slug: 'dairy' },
  { name: 'Snacks', slug: 'snacks' },
  { name: 'Household', slug: 'household' },
  { name: 'Produce', slug: 'produce' },
  { name: 'Pantry', slug: 'pantry' },
  { name: 'Frozen', slug: 'frozen' },
  { name: 'Meat & Seafood', slug: 'meat-seafood' },
  { name: 'Condiments', slug: 'condiments' }
];

const defaultProducts = [
  { name: 'Premium Olive Oil', description: 'Cold-pressed extra virgin olive oil', price: 21.5, stock: 120, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/olive-oil.jpg', categorySlug: 'household' },
  { name: 'Sparkling Mineral Water', description: 'Natural mineral water 12-pack', price: 8.9, stock: 340, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/water.jpg', categorySlug: 'beverages' },
  { name: 'Whole Grain Bread', description: 'Fresh baked whole grain loaf', price: 3.75, stock: 80, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/whole-wheat-bread.jpg', categorySlug: 'bakery' },
  { name: 'Greek Yogurt', description: 'Plain Greek yogurt 500g', price: 4.2, stock: 140, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/plain-yogurt.jpg', categorySlug: 'dairy' },
  { name: 'Mixed Nuts', description: 'Roasted unsalted nuts 1kg', price: 12.0, stock: 95, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/nuts-mixed.jpg', categorySlug: 'snacks' },
  { name: 'Fresh Milk', description: 'Full cream milk 1L', price: 2.6, stock: 220, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/milk.jpg', categorySlug: 'dairy' },
  { name: 'Cheddar Cheese Block', description: 'Aged cheddar cheese block', price: 6.8, stock: 75, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/cheddar-cheese.jpg', categorySlug: 'dairy' },
  { name: 'Creamy Butter', description: 'Salted creamy butter 500g', price: 5.25, stock: 110, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/butter.jpg', categorySlug: 'dairy' },
  { name: 'Farm Eggs', description: 'Large free-range eggs', price: 4.95, stock: 150, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/egg.jpg', categorySlug: 'dairy' },
  { name: 'Chicken Breast Fillets', description: 'Skinless chicken breast portions', price: 11.4, stock: 90, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/chicken-breasts.jpg', categorySlug: 'meat-seafood' },
  { name: 'Atlantic Salmon Fillet', description: 'Fresh salmon fillet cuts', price: 18.9, stock: 55, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/salmon.jpg', categorySlug: 'meat-seafood' },
  { name: 'Spaghetti Pasta', description: 'Durum wheat spaghetti', price: 3.2, stock: 160, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/spaghetti.jpg', categorySlug: 'pantry' },
  { name: 'Rice Noodles', description: 'Thin rice noodles', price: 4.1, stock: 130, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/rice-noodles.jpg', categorySlug: 'pantry' },
  { name: 'Ground Coffee', description: 'Medium roast ground coffee', price: 9.75, stock: 85, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/coffee.jpg', categorySlug: 'beverages' },
  { name: 'Orange Juice', description: '100% orange juice', price: 3.9, stock: 145, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/orange-juice.jpg', categorySlug: 'beverages' },
  { name: 'Salted Crackers', description: 'Lightly salted crackers', price: 2.2, stock: 200, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/crackers.jpg', categorySlug: 'snacks' },
  { name: 'Potato Chips', description: 'Classic salted potato chips', price: 2.7, stock: 175, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/potato-chips.jpg', categorySlug: 'snacks' },
  { name: 'Chocolate Chips', description: 'Baking chocolate chips', price: 4.6, stock: 120, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/chocolate-chips.jpg', categorySlug: 'snacks' },
  { name: 'Vanilla Ice Cream', description: 'Creamy vanilla ice cream tub', price: 6.3, stock: 70, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/vanilla-ice-cream.jpg', categorySlug: 'frozen' },
  { name: 'Frozen Green Peas', description: 'IQF green peas', price: 3.1, stock: 140, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/peas.jpg', categorySlug: 'frozen' },
  { name: 'All Purpose Flour', description: 'Fine all-purpose flour', price: 2.8, stock: 180, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/flour.jpg', categorySlug: 'pantry' },
  { name: 'Sea Salt', description: 'Natural sea salt crystals', price: 1.5, stock: 220, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/salt.jpg', categorySlug: 'pantry' },
  { name: 'Fresh Apples', description: 'Crisp red apples', price: 3.4, stock: 210, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/apple.jpg', categorySlug: 'produce' },
  { name: 'Fresh Oranges', description: 'Sweet juicy oranges', price: 3.6, stock: 195, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/orange.jpg', categorySlug: 'produce' },
  { name: 'Fresh Tomatoes', description: 'Ripe salad tomatoes', price: 2.9, stock: 205, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/tomato.jpg', categorySlug: 'produce' },
  { name: 'Fresh Cucumbers', description: 'Crunchy green cucumbers', price: 2.4, stock: 165, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/cucumber.jpg', categorySlug: 'produce' },
  { name: 'Fresh Broccoli', description: 'Fresh broccoli florets', price: 3.0, stock: 115, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/broccoli.jpg', categorySlug: 'produce' },
  { name: 'Red Onions', description: 'Fresh red onions', price: 2.1, stock: 170, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/red-onion.jpg', categorySlug: 'produce' },
  { name: 'Tomato Ketchup', description: 'Classic tomato ketchup', price: 2.8, stock: 130, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/ketchup.jpg', categorySlug: 'condiments' },
  { name: 'Classic Mayonnaise', description: 'Rich and creamy mayonnaise', price: 3.2, stock: 120, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/mayonnaise.jpg', categorySlug: 'condiments' }
];

const seedDatabase = async () => {
  for (const category of defaultCategories) {
    await pool.query(
      `INSERT INTO categories (name, slug)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO NOTHING`,
      [category.name, category.slug]
    );
  }

  const categoryRows = await pool.query('SELECT id, slug FROM categories');
  const categoryIdBySlug = new Map(categoryRows.rows.map((row) => [row.slug, row.id]));

  for (const product of defaultProducts) {
    const categoryId = categoryIdBySlug.get(product.categorySlug) || null;

    const existing = await pool.query(
      `SELECT id
       FROM products
       WHERE LOWER(name) = LOWER($1)
       ORDER BY id ASC`,
      [product.name]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO products (name, description, price, stock, image_url, category_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          product.imageUrl,
          categoryId
        ]
      );
      continue;
    }

    await pool.query(
      `UPDATE products
       SET
         description = COALESCE(NULLIF(description, ''), $2),
         price = CASE WHEN price IS NULL OR price <= 0 THEN $3 ELSE price END,
         stock = CASE WHEN stock IS NULL OR stock <= 0 THEN $4 ELSE stock END,
         image_url = $5,
         category_id = COALESCE(category_id, $6),
         updated_at = NOW()
       WHERE LOWER(name) = LOWER($1)`,
      [
        product.name,
        product.description,
        product.price,
        product.stock,
        product.imageUrl,
        categoryId
      ]
    );
  }
};

module.exports = {
  seedDatabase
};
