const API_BASE = 'https://dummyjson.com';

export const dummyJsonService = {
  getProducts: async (limit = 30) => {
    try {
      const response = await fetch(`${API_BASE}/products?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`DummyJSON error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products from DummyJSON:', error);
      throw error;
    }
  },

  searchProducts: async (query, limit = 30) => {
    try {
      const response = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`DummyJSON search error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error searching products on DummyJSON:', error);
      throw error;
    }
  },

  getProductsByCategory: async (category, limit = 30) => {
    try {
      const normalized = category.toLowerCase();
      const categoriesMap = {
        'beverages': 'groceries',
        'bakery': 'groceries',
        'canned goods': 'groceries',
        'dairy': 'groceries',
        'fruits & vegetables': 'groceries',
        'grains & pasta': 'groceries',
        'meat & seafood': 'groceries',
        'oils & vinegars': 'groceries',
        'snacks': 'groceries',
        'spices & seasonings': 'groceries',
        'sauces & condiments': 'groceries'
      };
      const targetCategory = categoriesMap[normalized] || normalized;
      const response = await fetch(`${API_BASE}/products/category/${encodeURIComponent(targetCategory)}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`DummyJSON category error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error(`Error fetching DummyJSON category ${category}:`, error);
      throw error;
    }
  },

  transformProduct: (product) => {
    const categoryMap = {
      groceries: 'Groceries',
      smartphones: 'Electronics',
      laptops: 'Electronics',
      fragrances: 'Personal Care',
      skincare: 'Personal Care',
      'home-decoration': 'Home',
      furniture: 'Home',
      tops: 'Apparel',
      "women's dresses": 'Apparel',
      "women's shoes": 'Apparel',
      "men's shirts": 'Apparel',
      "men's shoes": 'Apparel',
      "men's watches": 'Accessories',
      "women's watches": 'Accessories',
      "women's bags": 'Accessories',
      "women's jewellery": 'Accessories',
      sunglasses: 'Accessories',
      automotive: 'Auto',
      motorcycle: 'Auto',
      lighting: 'Home'
    };

    return {
      id: product.id,
      name: product.title,
      category: categoryMap[product.category] || product.category || 'Warehouse',
      description: product.description || product.brand || 'Quality warehouse item',
      pricePerUnit: product.price || 0,
      unit: product.unit || 'unit',
      minOrder: Math.max(1, Math.floor((product.stock || 10) / 20)),
      stock: product.stock || 100,
      image: product.thumbnail || (product.images && product.images[0]) || 'https://via.placeholder.com/300?text=Product',
      barcode: product.id?.toString() || '0000',
      brand: product.brand || 'Warehouse',
      nutrition_grade: 'N/A',
      nutriscore: 'N/A',
      ingredients: product.description || 'No ingredients listed',
      rating: product.rating || 4.5,
      reviews: product.stock ? Math.min(200, product.stock * 2) : 40
    };
  },

  transformSearchResults: (products) => {
    if (!Array.isArray(products)) return [];
    return products.map(product => dummyJsonService.transformProduct(product));
  }
};
