import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { generateId } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const ProductCreate = () => {
  const navigate = useNavigate();
  const { addProduct } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hsnCode: '',
    gstRate: '',
    price: '',
    unit: 'Piece',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    
    const newProduct = {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      hsnCode: formData.hsnCode,
      gstRate: Number(formData.gstRate),
      price: Number(formData.price),
      unit: formData.unit,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    addProduct(newProduct);
    toast.success('Product added successfully');
    navigate('/products');
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/products')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold">Add New Product</h2>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hsnCode">
                  HSN/SAC Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hsnCode"
                  name="hsnCode"
                  value={formData.hsnCode}
                  onChange={handleChange}
                  placeholder="Enter HSN/SAC code"
                  className={errors.hsnCode ? 'border-red-500' : ''}
                />
                {errors.hsnCode && <p className="text-red-500 text-sm">{errors.hsnCode}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstRate">
                  GST Rate (%) <span className="text-red-500">*</span>
                </Label>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price <span className="text-red-500">*</span>
                </Label>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit <span className="text-red-500">*</span>
                </Label>
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
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/products')} className="mr-2">
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Product
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductCreate;
