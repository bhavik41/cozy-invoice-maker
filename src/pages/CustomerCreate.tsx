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

// Indian states with their codes
const INDIAN_STATES = [
  { name: 'Andhra Pradesh', code: '37' },
  { name: 'Arunachal Pradesh', code: '12' },
  { name: 'Assam', code: '18' },
  { name: 'Bihar', code: '10' },
  { name: 'Chhattisgarh', code: '22' },
  { name: 'Goa', code: '30' },
  { name: 'Gujarat', code: '24' },
  { name: 'Haryana', code: '06' },
  { name: 'Himachal Pradesh', code: '02' },
  { name: 'Jharkhand', code: '20' },
  { name: 'Karnataka', code: '29' },
  { name: 'Kerala', code: '32' },
  { name: 'Madhya Pradesh', code: '23' },
  { name: 'Maharashtra', code: '27' },
  { name: 'Manipur', code: '14' },
  { name: 'Meghalaya', code: '17' },
  { name: 'Mizoram', code: '15' },
  { name: 'Nagaland', code: '13' },
  { name: 'Odisha', code: '21' },
  { name: 'Punjab', code: '03' },
  { name: 'Rajasthan', code: '08' },
  { name: 'Sikkim', code: '11' },
  { name: 'Tamil Nadu', code: '33' },
  { name: 'Telangana', code: '36' },
  { name: 'Tripura', code: '16' },
  { name: 'Uttar Pradesh', code: '09' },
  { name: 'Uttarakhand', code: '05' },
  { name: 'West Bengal', code: '19' },
  { name: 'Andaman and Nicobar Islands', code: '35' },
  { name: 'Chandigarh', code: '04' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: '26' },
  { name: 'Delhi', code: '07' },
  { name: 'Jammu and Kashmir', code: '01' },
  { name: 'Ladakh', code: '38' },
  { name: 'Lakshadweep', code: '31' },
  { name: 'Puducherry', code: '34' }
];

const CustomerCreate = () => {
  const navigate = useNavigate();
  const { addCustomer, currentSeller, setCurrentSeller } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    gstin: '',
    state: '',
    stateCode: '',
    contact: '',
    email: '',
    pan: '',
    isSellerProfile: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'state') {
      const selectedState = INDIAN_STATES.find(state => state.name === value);
      setFormData({
        ...formData,
        state: value,
        stateCode: selectedState ? selectedState.code : '',
      });
    } else if (name === 'gstin' && value.length > 0) {
      // If GSTIN is being entered, extract PAN from it (characters 3-12)
      if (value.length >= 12) {
        const panFromGstin = value.substring(2, 12);
        setFormData({
          ...formData,
          [name]: value,
          pan: panFromGstin
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      isSellerProfile: e.target.checked
    });
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.gstin.trim()) {
      newErrors.gstin = 'GSTIN is required';
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = 'Invalid PAN format';
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
    
    const newCustomer = {
      id: generateId(),
      name: formData.name,
      address: formData.address,
      gstin: formData.gstin,
      state: formData.state,
      stateCode: formData.stateCode,
      contact: formData.contact,
      email: formData.email,
      pan: formData.pan,
    };
    
    addCustomer(newCustomer);
    
    if (formData.isSellerProfile) {
      setCurrentSeller(newCustomer);
      toast.success('Customer added as your business profile');
    } else {
      toast.success('Customer added successfully');
    }
    
    navigate('/customers');
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/customers')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold">Add New Customer</h2>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gstin">
                  GSTIN <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="gstin"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="Enter GSTIN"
                  className={errors.gstin ? 'border-red-500' : ''}
                />
                {errors.gstin && <p className="text-red-500 text-sm">{errors.gstin}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows={3}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state.code} value={state.name}>
                      {state.name} ({state.code})
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stateCode">State Code</Label>
                <Input
                  id="stateCode"
                  name="stateCode"
                  value={formData.stateCode}
                  readOnly
                  placeholder="Auto-filled from state selection"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pan">PAN</Label>
                <Input
                  id="pan"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="Enter PAN"
                  className={errors.pan ? 'border-red-500' : ''}
                />
                {errors.pan && <p className="text-red-500 text-sm">{errors.pan}</p>}
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSellerProfile"
                checked={formData.isSellerProfile}
                onChange={handleCheckboxChange}
                className="mr-2 h-4 w-4"
              />
              <Label htmlFor="isSellerProfile" className="cursor-pointer">
                Set as my business profile (for invoices)
              </Label>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/customers')} className="mr-2">
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Customer
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerCreate;
