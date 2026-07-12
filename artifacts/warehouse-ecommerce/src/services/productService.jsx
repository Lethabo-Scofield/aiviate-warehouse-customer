import { openFoodFactsService } from './openFoodFactsService';
import { dummyJsonService } from './dummyJsonService';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

const API_URL = '';
const LOCAL_FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="100%" height="100%" fill="%23f0fdfa"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%230f766e" font-size="22" font-family="Arial">No Image</text></svg>';

const defaultImageByCategory = {
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

const toSlug = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const normalizeBackendProduct = (product) => {
  const numericPrice = Number(product?.pricePerUnit ?? product?.price ?? 0);
  const categoryName = product?.category || 'General';
  const categorySlug = toSlug(categoryName);
  const image = product?.image || defaultImageByCategory[categorySlug] || LOCAL_FALLBACK_IMAGE;

  let proxiedImage = image;
  if (typeof image === 'string' && /^https?:\/\//i.test(image)) {
    proxiedImage = `${API_URL}/api/images?url=${encodeURIComponent(image)}`;
  }

  return {
    ...product,
    category: categoryName,
    price: numericPrice,
    pricePerUnit: numericPrice,
    unit: product?.unit || 'unit',
    minOrder: Number(product?.minOrder ?? 1),
    stock: Number(product?.stock ?? 0),
    rating: Number(product?.rating ?? 4.5),
    reviews: Number(product?.reviews ?? 0),
    image: proxiedImage
  };
};

const fetchBackend = async (path) => {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status})`);
  }
  return response.json();
};

const tryPrimaryThenFallback = async (primaryFn, fallbackFn) => {
  try {
    return await primaryFn();
  } catch (primaryError) {
    console.warn('Primary API failed, switching to fallback service.', primaryError);
    try {
      return await fallbackFn();
    } catch (fallbackError) {
      console.warn('Fallback service also failed, using local fallback products.', fallbackError);
      return FALLBACK_PRODUCTS;
    }
  }
};

// Product API service using Open Food Facts and DummyJSON fallback
export const productService = {
  // Fetch all products (using a default search term)
  getAllProducts: async () => {
    return tryPrimaryThenFallback(
      async () => {
        const backendData = await fetchBackend('/api/products');
        if (backendData?.ok && Array.isArray(backendData.products) && backendData.products.length > 0) {
          return backendData.products.map(normalizeBackendProduct);
        }

        const searchTerms = ['food', 'organic', 'natural', 'grocery', 'warehouse'];
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        const data = await openFoodFactsService.searchProducts(randomTerm, 1, 30);
        const products = openFoodFactsService.transformSearchResults(data);
        if (!products || products.length === 0) {
          throw new Error('OpenFoodFacts returned no products');
        }
        return products;
      },
      async () => {
        const products = await dummyJsonService.getProducts(30);
        return dummyJsonService.transformSearchResults(products);
      }
    );
  },

  // Search products by query
  searchProducts: async (query) => {
    return tryPrimaryThenFallback(
      async () => {
        const backendData = await fetchBackend(`/api/products?search=${encodeURIComponent(query)}`);
        if (backendData?.ok && Array.isArray(backendData.products) && backendData.products.length > 0) {
          return backendData.products.map(normalizeBackendProduct);
        }

        const data = await openFoodFactsService.searchProducts(query, 1, 30);
        const products = openFoodFactsService.transformSearchResults(data);
        if (!products || products.length === 0) {
          throw new Error(`OpenFoodFacts search returned no products for ${query}`);
        }
        return products;
      },
      async () => {
        const products = await dummyJsonService.searchProducts(query, 30);
        return dummyJsonService.transformSearchResults(products);
      }
    );
  },

  // Get product by ID/barcode
  getProductById: async (id) => {
    return tryPrimaryThenFallback(
      async () => {
        const backendData = await fetchBackend(`/api/products/${encodeURIComponent(id)}`);
        if (backendData?.ok && backendData.product) {
          return normalizeBackendProduct(backendData.product);
        }

        const data = await openFoodFactsService.getProductById(id);
        if (data && data.product) {
          return openFoodFactsService.transformProduct(data.product);
        }
        throw new Error('Product not found in OpenFoodFacts');
      },
      async () => {
        return null;
      }
    );
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    return tryPrimaryThenFallback(
      async () => {
        const categorySlug = toSlug(category);
        const backendData = await fetchBackend(`/api/products?category=${encodeURIComponent(categorySlug)}`);
        if (backendData?.ok && Array.isArray(backendData.products) && backendData.products.length > 0) {
          return backendData.products.map(normalizeBackendProduct);
        }

        const data = await openFoodFactsService.getProductsByCategory(category, 1, 30);
        const products = openFoodFactsService.transformSearchResults(data);
        if (!products || products.length === 0) {
          throw new Error(`OpenFoodFacts category returned no products for ${category}`);
        }
        return products;
      },
      async () => {
        const products = await dummyJsonService.getProductsByCategory(category, 30);
        return dummyJsonService.transformSearchResults(products);
      }
    );
  },

  // Get categories (predefined supermarket categories)
  getCategories: async () => {
    try {
      const backendData = await fetchBackend('/api/categories');
      if (backendData?.ok && Array.isArray(backendData.categories) && backendData.categories.length > 0) {
        return ['All', ...backendData.categories.map((category) => category.name)];
      }
      return await openFoodFactsService.getCategories();
    } catch (error) {
      console.error('Error fetching categories:', error);
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
    }
  },

  // Get featured products (using specific barcodes)
  getFeaturedProducts: async () => {
    const featuredBarcodes = [
      '737628064502',
      '7622300349888',
      '5000157037790',
      '5449000000996',
      '5000112543452'
    ];

    try {
      const products = await openFoodFactsService.getProductsByBarcodes(featuredBarcodes);
      if (products && products.length > 0) return products;
      throw new Error('No featured products available from OpenFoodFacts');
    } catch (error) {
      console.warn('Featured products fallback active:', error);
      return FALLBACK_PRODUCTS.slice(0, 5);
    }
  }
};