import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Product, ProductFilter } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { Edit2, Trash2, Plus, Search, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const ProductList = () => {
  const { products, deleteProduct, filterProducts } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const [filters, setFilters] = useState<ProductFilter>({
    search: '',
    minPrice: undefined,
    maxPrice: undefined,
    gstRate: undefined,
  });
  
  const filteredProducts = filterProducts(filters);
  
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleFilterChange = (key: keyof ProductFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      minPrice: undefined,
      maxPrice: undefined,
      gstRate: undefined,
    });
    setSearchTerm('');
  };
  
  const handleSearch = () => {
    handleFilterChange('search', searchTerm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
      
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-24 md:w-32"
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-24 md:w-32"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSearch} className="px-3">
                <Search className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" onClick={clearFilters} className="px-3">
                <FilterX className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>HSN/SAC</TableHead>
                  <TableHead>GST Rate</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <Link to={`/products/${product.id}`} className="hover:text-invoice-primary">
                        {product.name}
                      </Link>
                      <p className="text-xs text-gray-500">{product.description}</p>
                    </TableCell>
                    <TableCell>{product.hsnCode}</TableCell>
                    <TableCell>{product.gstRate}%</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/products/${product.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500 text-right">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </Card>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium">{productToDelete?.name}</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductList;
