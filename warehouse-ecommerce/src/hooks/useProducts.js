import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All']);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // If no products from API, use fallback
        const fallbackProducts = await import('../data/fallbackProducts').then(m => m.FALLBACK_PRODUCTS);
        setProducts(fallbackProducts);
        setError('Using fallback products - API returned empty');
      }
      
      return data;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load products');
      
      // Load fallback products
      const fallbackProducts = await import('../data/fallbackProducts').then(m => m.FALLBACK_PRODUCTS);
      setProducts(fallbackProducts);
      
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      return ['All'];
    }
  }, []);

  // Search products
  const searchProducts = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      return await fetchProducts();
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await productService.searchProducts(query);
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([]);
        setError('No products found');
      }
      
      return data;
    } catch (err) {
      console.error('Failed to search products:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Get products by category
  const getProductsByCategory = useCallback(async (category) => {
    if (category === 'All') {
      return await fetchProducts();
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductsByCategory(category);
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([]);
        setError('No products found in this category');
      }
      
      return data;
    } catch (err) {
      console.error(`Failed to fetch products in ${category}:`, err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Load products and categories on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
    };
    loadData();
  }, [fetchProducts, fetchCategories]);

  // Refetch products (useful after CRUD operations)
  const refetch = useCallback(async () => {
    return await fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    categories,
    fetchProducts,
    fetchCategories,
    searchProducts,
    getProductsByCategory,
    refetch
  };
};