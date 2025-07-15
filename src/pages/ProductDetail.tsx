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
    cgst: '',
    sgst: '',
    igst: '',
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
          cgst: (product.cgst || 0).toString(),
          sgst: (product.sgst || 0).toString(),
          igst: (product.igst || 0).toString(),
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
    
    // Validate CGST
    if (formData.cgst.trim() && (isNaN(Number(formData.cgst)) || Number(formData.cgst) < 0)) {
      newErrors.cgst = 'CGST rate must be a positive number';
    }
    
    // Validate SGST
    if (formData.sgst.trim() && (isNaN(Number(formData.sgst)) || Number(formData.sgst) < 0)) {
      newErrors.sgst = 'SGST rate must be a positive number';
    }
    
    // Validate IGST
    if (formData.igst.trim() && (isNaN(Number(formData.igst)) || Number(formData.igst) < 0)) {
      newErrors.igst = 'IGST rate must be a positive number';
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
        const cgstRate = formData.cgst ? Number(formData.cgst) : 0;
        const sgstRate = formData.sgst ? Number(formData.sgst) : 0;
        const igstRate = formData.igst ? Number(formData.igst) : 0;
        const totalGstRate = cgstRate + sgstRate + igstRate;

        const updatedProduct = {
          ...product,
          name: formData.name,
          description: formData.description,
          hsnCode: formData.hsnCode,
          gstRate: totalGstRate,
          cgst: cgstRate,
          sgst: sgstRate,
          igst: igstRate,
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
                <Label htmlFor="cgst">CGST Rate (%)</Label>
                {isEditing ? (
                  <>
                    <Input
                      id="cgst"
                      name="cgst"
                      type="number"
                      step="0.01"
                      value={formData.cgst}
                      onChange={handleChange}
                      placeholder="Enter CGST rate"
                      className={errors.cgst ? 'border-red-500' : ''}
                    />
                    {errors.cgst && <p className="text-red-500 text-sm">{errors.cgst}</p>}
                  </>
                ) : (
                  <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {product.cgst || 0}%
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sgst">SGST Rate (%)</Label>
                {isEditing ? (
                  <>
                    <Input
                      id="sgst"
                      name="sgst"
                      type="number"
                      step="0.01"
                      value={formData.sgst}
                      onChange={handleChange}
                      placeholder="Enter SGST rate"
                      className={errors.sgst ? 'border-red-500' : ''}
                    />
                    {errors.sgst && <p className="text-red-500 text-sm">{errors.sgst}</p>}
                  </>
                ) : (
                  <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {product.sgst || 0}%
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="igst">IGST Rate (%)</Label>
                {isEditing ? (
                  <>
                    <Input
                      id="igst"
                      name="igst"
                      type="number"
                      step="0.01"
                      value={formData.igst}
                      onChange={handleChange}
                      placeholder="Enter IGST rate"
                      className={errors.igst ? 'border-red-500' : ''}
                    />
                    {errors.igst && <p className="text-red-500 text-sm">{errors.igst}</p>}
                  </>
                ) : (
                  <div className="py-2 px-3 border border-gray-200 rounded-md bg-gray-50">
                    {product.igst || 0}%
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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