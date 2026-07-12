// Open Food Facts API Service
const API_BASE = 'https://world.openfoodfacts.org';

export const openFoodFactsService = {
  // Search products by query
  searchProducts: async (query, page = 1, pageSize = 20) => {
    try {
      const response = await fetch(
        `${API_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get product by barcode
  getProductByBarcode: async (barcode) => {
    try {
      const response = await fetch(`${API_BASE}/api/v0/product/${barcode}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching product with barcode ${barcode}:`, error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/v0/product/${id}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category, page = 1, pageSize = 20) => {
    try {
      const response = await fetch(
        `${API_BASE}/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}&json=1&page=${page}&page_size=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error);
      throw error;
    }
  },

  // Transform Open Food Facts product to our app format
  transformProduct: (product) => {
    // Determine category from tags or use default
    let category = 'Uncategorized';
    if (product.categories_tags && product.categories_tags.length > 0) {
      // Clean up category name
      category = product.categories_tags[0]
        .replace('en:', '')
        .replace('-', ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Get product image - prioritize front image
    const image = product.image_front_url || 
                  product.image_url || 
                  product.image_small_url || 
                  '📦';

    // Get product name
    const name = product.product_name || 
                 product.generic_name || 
                 product.brands || 
                 'Unknown Product';

    // Get price - Open Food Facts doesn't have prices, we'll generate a realistic one
    // In production, you'd get this from a pricing API or your own database
    const pricePerUnit = (Math.random() * 30 + 5).toFixed(2); // Random price between R5-R35

    return {
      id: product.id || product.code || Date.now(),
      name: name,
      category: category,
      description: product.ingredients_text || product.generic_name || 'Premium quality product',
      pricePerUnit: parseFloat(pricePerUnit),
      unit: product.quantity || 'unit',
      minOrder: Math.floor(Math.random() * 5) + 1, // Random min order 1-5
      stock: Math.floor(Math.random() * 200) + 50, // Random stock 50-250
      image: image,
      barcode: product.code || 'N/A',
      brand: product.brands || 'Generic',
      nutrition_grade: product.nutrition_grades || 'N/A',
      nutriscore: product.nutriscore_grade || 'N/A',
      ingredients: product.ingredients_text || 'No ingredients listed',
      rating: 4.5 + (Math.random() * 0.5 - 0.25), // Random rating 4.25-4.75
      reviews: Math.floor(Math.random() * 100) + 20 // Random reviews 20-120
    };
  },

  // Transform search results to our app format
  transformSearchResults: (data) => {
    if (!data || !data.products) return [];
    
    return data.products
      .filter(product => product.product_name) // Filter out products without names
      .map(product => openFoodFactsService.transformProduct(product));
  },

  // Get popular/searchable categories for supermarket
  getCategories: async () => {
    // Since Open Food Facts doesn't have a direct categories endpoint,
    // we'll return predefined supermarket categories
    return [
      'All',
      'Beverages',
      'Bakery',
      'Canned Goods',
      'Dairy',
      'Fruits & Vegetables',
      'Grains & Pasta',
      'Meat & Seafood',
      'Oils & Vinegars',
      'Snacks',
      'Spices & Seasonings',
      'Sauces & Condiments'
    ];
  },

  // Get products by multiple barcodes (batch)
  getProductsByBarcodes: async (barcodes) => {
    try {
      const promises = barcodes.map(barcode => 
        openFoodFactsService.getProductByBarcode(barcode)
      );
      const results = await Promise.allSettled(promises);
      
      return results
        .filter(result => result.status === 'fulfilled' && result.value && result.value.product)
        .map(result => openFoodFactsService.transformProduct(result.value.product));
    } catch (error) {
      console.error('Error fetching products by barcodes:', error);
      throw error;
    }
  }
};