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
    cgst: '',
    sgst: '',
    igst: '',
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
    
    // Calculate total GST rate
    const cgstRate = formData.cgst ? Number(formData.cgst) : 0;
    const sgstRate = formData.sgst ? Number(formData.sgst) : 0;
    const igstRate = formData.igst ? Number(formData.igst) : 0;
    const totalGstRate = cgstRate + sgstRate + igstRate;

    const newProduct = {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      hsnCode: formData.hsnCode,
      gstRate: totalGstRate,
      cgst: cgstRate,
      sgst: sgstRate,
      igst: igstRate,
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
                <Label htmlFor="cgst">CGST Rate (%)</Label>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sgst">SGST Rate (%)</Label>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="igst">IGST Rate (%)</Label>
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
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
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
