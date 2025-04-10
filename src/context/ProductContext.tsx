
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductFilter } from '@/types';
import { toast } from 'sonner';
import { useBaseData } from './BaseDataContext';
import * as storage from '@/utils/storage';

interface ProductContextProps {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  filterProducts: (filter: ProductFilter) => Product[];
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const { filterByCompany, addCompanyId } = useBaseData();
  
  // Filtered products based on current user's company
  const products = filterByCompany(allProducts);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      const loadedProducts = await storage.getItems<Product>('products');
      setAllProducts(loadedProducts);
    };
    
    loadProducts();
  }, []);

  // Save products when they change (localStorage only)
  useEffect(() => {
    if (!storage.isElectron) {
      storage.saveItems('products', allProducts);
    }
  }, [allProducts]);

  // Add a product
  const addProduct = async (product: Product): Promise<void> => {
    try {
      // Add company ID
      const productWithCompany = addCompanyId(product);
      
      // Add to storage
      await storage.addItem('products', productWithCompany);
      
      // Update state
      setAllProducts(prev => [...prev, productWithCompany]);
      toast.success('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  // Update a product
  const updateProduct = async (product: Product): Promise<void> => {
    try {
      // Get existing product
      const existingProduct = allProducts.find(p => p.id === product.id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }
      
      // Ensure product has the same companyId as before
      const companyId = (existingProduct as any)?.companyId || 'company-1';
      const updatedProduct = {
        ...product,
        companyId
      } as Product & { companyId: string };
      
      // Update in storage
      await storage.updateItem('products', updatedProduct);
      
      // Update state
      setAllProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  // Delete a product
  const deleteProduct = async (id: string): Promise<void> => {
    try {
      // Delete from storage
      await storage.deleteItem<Product>('products', id);
      
      // Update state
      setAllProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Get a product by ID
  const getProduct = (id: string): Product | undefined => {
    // First check filtered products (which respect company isolation)
    return products.find(p => p.id === id);
  };

  // Filter products
  const filterProducts = (filter: ProductFilter): Product[] => {
    let filtered = [...products];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }

    if (filter.gstRate !== undefined) {
      filtered = filtered.filter(p => p.gstRate === filter.gstRate);
    }

    if (filter.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filter.maxPrice!);
    }

    return filtered;
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      filterProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
