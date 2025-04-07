
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from '@/utils/helpers';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, updateProduct, deleteProduct } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hsnCode: '',
    gstRate: '',
    price: '',
    unit: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      const product = getProduct(id);
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          hsnCode: product.hsnCode,
          gstRate: product.gstRate.toString(),
          price: product.price.toString(),
          unit: product.unit,
        });
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    }
  }, [id, getProduct, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.hsnCode.trim()) {
      newErrors.hsnCode = 'HSN/SAC code is required';
    }
    
    if (!formData.gstRate.trim()) {
      newErrors.gstRate = 'GST rate is required';
    } else if (isNaN(Number(formData.gstRate)) || Number(formData.gstRate) < 0) {
      newErrors.gstRate = 'GST rate must be a positive number';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    if (id) {
      const product = getProduct(id);
      if (product) {
        const updatedProduct = {
          ...product,
          name: formData.name,
          description: formData.description,
          hsnCode: formData.hsnCode,
          gstRate: Number(formData.gstRate),
          price: Number(formData.price),
          unit: formData.unit,
          updatedAt: new Date(),
        };
        
        updateProduct(updatedProduct);
        toast.success('Product updated successfully');
        setIsEditing(false);
      }
    }
  };
  
  const confirmDelete = () => {
    if (id) {
      deleteProduct(id);
      toast.success('Product deleted successfully');
      navigate('/products');
    }
  };
  
  const product = id ? getProduct(id) : null;
  
  if (!product) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/products')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h2 className="text-2xl font-semibold">Product Details</h2>
        </div>
        
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Product
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name {isEditing && <span className="text-red-500">*</span>}
                </Label>
                {isEditing ? (
                  <>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </>
                ) : (
                  <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {product.name}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hsnCode">
                  HSN/SAC Code {isEditing && <span className="text-red-500">*</span>}
                </Label>
                {isEditing ? (
                  <>
                    <Input
                      id="hsnCode"
                      name="hsnCode"
                      value={formData.hsnCode}
                      onChange={handleChange}
                      placeholder="Enter HSN/SAC code"
                      className={errors.hsnCode ? 'border-red-500' : ''}
                    />
                    {errors.hsnCode && <p className="text-red-500 text-sm">{errors.hsnCode}</p>}
                  </>
                ) : (
                  <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {product.hsnCode}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows={3}
                />
              ) : (
                <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50 min-h-[80px]">
                  {product.description || 'No description provided'}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstRate">
                  GST Rate (%) {isEditing && <span className="text-red-500">*</span>}
                </Label>
                {isEditing ? (
                  <>
                    <Input
                      id="gstRate"
                      name="gstRate"
                      type="number"
                      step="0.01"
                      value={formData.gstRate}
                      onChange={handleChange}
                      placeholder="Enter GST rate"
                      className={errors.gstRate ? 'border-red-500' : ''}
                    />
                    {errors.gstRate && <p className="text-red-500 text-sm">{errors.gstRate}</p>}
                  </>
                ) : (
                  <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {product.gstRate}%
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price {isEditing && <span className="text-red-500">*</span>}
                </Label>
                {isEditing ? (
                  <>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Enter price"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                  </>
                ) : (
                  <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {formatCurrency(product.price)}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit {isEditing && <span className="text-red-500">*</span>}
                </Label>
                {isEditing ? (
                  <>
                    <select
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.unit ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="Piece">Piece</option>
                      <option value="Kg">Kg</option>
                      <option value="Gram">Gram</option>
                      <option value="Liter">Liter</option>
                      <option value="Meter">Meter</option>
                      <option value="Box">Box</option>
                      <option value="Packet">Packet</option>
                      <option value="Dozen">Dozen</option>
                      <option value="M.T">M.T</option>
                      <option value="Quintal">Quintal</option>
                    </select>
                    {errors.unit && <p className="text-red-500 text-sm">{errors.unit}</p>}
                  </>
                ) : (
                  <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {product.unit}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 border-t pt-4">
              <div>
                <p>Created: {new Date(product.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p>Last Updated: {new Date(product.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            
            {isEditing && (
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="mr-2">
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </form>
      </Card>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium">{product.name}</span>? 
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

export default ProductDetail;
