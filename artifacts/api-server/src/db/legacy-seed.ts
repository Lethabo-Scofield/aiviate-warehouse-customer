import bcrypt from "bcryptjs";
import { pool } from "../lib/pool";

const demoUser = {
  name: "Demo Buyer",
  company: "Demo Supermarket",
  phone: "+27 00 000 0000",
  email: "demo@bulkmart.com",
  password: "demo1234",
};

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
  { name: 'Premium Olive Oil', description: 'Bulk case: 12 x 1L cold-pressed extra virgin olive oil', price: 1899, stock: 40, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/olive-oil.jpg', categorySlug: 'household' },
  { name: 'Sparkling Mineral Water', description: 'Bulk pack: 48 bottles (4 x 12-pack) natural mineral water', price: 329, stock: 120, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/water.jpg', categorySlug: 'beverages' },
  { name: 'Whole Grain Bread', description: 'Bakers tray: 10 fresh baked whole grain loaves', price: 289, stock: 30, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/whole-wheat-bread.jpg', categorySlug: 'bakery' },
  { name: 'Greek Yogurt', description: 'Case of 12 x 500g plain Greek yogurt', price: 419, stock: 45, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/plain-yogurt.jpg', categorySlug: 'dairy' },
  { name: 'Mixed Nuts', description: 'Bulk box: 6 x 1kg roasted unsalted mixed nuts', price: 899, stock: 25, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/nuts-mixed.jpg', categorySlug: 'snacks' },
  { name: 'Fresh Milk', description: 'Crate of 24 x 1L full cream milk', price: 479, stock: 60, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/milk.jpg', categorySlug: 'dairy' },
  { name: 'Cheddar Cheese Block', description: 'Catering pack: 4 x 2kg aged cheddar blocks', price: 1099, stock: 20, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/cheddar-cheese.jpg', categorySlug: 'dairy' },
  { name: 'Creamy Butter', description: 'Case of 20 x 500g salted butter bricks', price: 1199, stock: 30, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/butter.jpg', categorySlug: 'dairy' },
  { name: 'Farm Eggs', description: 'Wholesale stack: 180 large free-range eggs (5 x 36 trays)', price: 599, stock: 40, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/egg.jpg', categorySlug: 'dairy' },
  { name: 'Chicken Breast Fillets', description: 'Bulk carton: 10kg skinless chicken breast portions', price: 899, stock: 25, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/chicken-breasts.jpg', categorySlug: 'meat-seafood' },
  { name: 'Atlantic Salmon Fillet', description: 'Bulk box: 5kg fresh salmon fillet cuts', price: 1499, stock: 15, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/salmon.jpg', categorySlug: 'meat-seafood' },
  { name: 'Spaghetti Pasta', description: 'Case of 20 x 500g durum wheat spaghetti', price: 349, stock: 50, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/spaghetti.jpg', categorySlug: 'pantry' },
  { name: 'Rice Noodles', description: 'Case of 30 x 400g thin rice noodles', price: 449, stock: 40, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/rice-noodles.jpg', categorySlug: 'pantry' },
  { name: 'Ground Coffee', description: 'Bulk case: 8 x 1kg medium roast ground coffee', price: 1599, stock: 20, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/coffee.jpg', categorySlug: 'beverages' },
  { name: 'Orange Juice', description: 'Case of 12 x 1.5L 100% orange juice', price: 479, stock: 45, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/orange-juice.jpg', categorySlug: 'beverages' },
  { name: 'Salted Crackers', description: 'Case of 24 x 200g lightly salted crackers', price: 389, stock: 60, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/crackers.jpg', categorySlug: 'snacks' },
  { name: 'Potato Chips', description: 'Display box: 48 x 125g classic salted potato chips', price: 649, stock: 50, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/potato-chips.jpg', categorySlug: 'snacks' },
  { name: 'Chocolate Chips', description: 'Bakery bulk bag: 10kg baking chocolate chips', price: 1299, stock: 15, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/chocolate-chips.jpg', categorySlug: 'snacks' },
  { name: 'Vanilla Ice Cream', description: 'Case of 6 x 5L creamy vanilla ice cream tubs', price: 999, stock: 18, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/vanilla-ice-cream.jpg', categorySlug: 'frozen' },
  { name: 'Frozen Green Peas', description: 'Bulk case: 10 x 1kg IQF green peas', price: 449, stock: 35, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/peas.jpg', categorySlug: 'frozen' },
  { name: 'All Purpose Flour', description: 'Bulk sack: 25kg fine all-purpose flour', price: 379, stock: 40, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/flour.jpg', categorySlug: 'pantry' },
  { name: 'Sea Salt', description: 'Bulk bag: 25kg natural sea salt crystals', price: 299, stock: 30, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/salt.jpg', categorySlug: 'pantry' },
  { name: 'Fresh Apples', description: 'Wholesale carton: 12kg crisp red apples', price: 349, stock: 40, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/apple.jpg', categorySlug: 'produce' },
  { name: 'Fresh Oranges', description: 'Wholesale pocket: 15kg sweet juicy oranges', price: 329, stock: 40, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/orange.jpg', categorySlug: 'produce' },
  { name: 'Fresh Tomatoes', description: 'Wholesale box: 10kg ripe salad tomatoes', price: 289, stock: 35, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/tomato.jpg', categorySlug: 'produce' },
  { name: 'Fresh Cucumbers', description: 'Wholesale box: 10kg crunchy green cucumbers', price: 249, stock: 30, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/cucumber.jpg', categorySlug: 'produce' },
  { name: 'Fresh Broccoli', description: 'Bulk crate: 8kg fresh broccoli heads', price: 329, stock: 25, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/broccoli.jpg', categorySlug: 'produce' },
  { name: 'Red Onions', description: 'Bulk pocket: 10kg fresh red onions', price: 199, stock: 45, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/red-onion.jpg', categorySlug: 'produce' },
  { name: 'Tomato Ketchup', description: 'Catering case: 12 x 750ml classic tomato ketchup', price: 549, stock: 40, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/ketchup.jpg', categorySlug: 'condiments' },
  { name: 'Classic Mayonnaise', description: 'Catering case: 12 x 750ml rich and creamy mayonnaise', price: 599, stock: 40, imageUrl: 'https://img.spoonacular.com/ingredients_500x500/mayonnaise.jpg', categorySlug: 'condiments' }
];

export const seedDatabase = async () => {
  const existingDemo = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [demoUser.email]
  );

  if (existingDemo.rows.length === 0) {
    const passwordHash = await bcrypt.hash(demoUser.password, 10);
    await pool.query(
      `INSERT INTO users (name, company, phone, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [demoUser.name, demoUser.company, demoUser.phone, demoUser.email, passwordHash]
    );
  }

  for (const category of defaultCategories) {
    await pool.query(
      `INSERT INTO categories (name, slug)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO NOTHING`,
      [category.name, category.slug]
    );
  }

  const categoryRows = await pool.query('SELECT id, slug FROM categories');
  const categoryIdBySlug = new Map(
    categoryRows.rows.map((row: any) => [row.slug, row.id]),
  );

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
