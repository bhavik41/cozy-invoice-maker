
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, deleteCustomer } = useAppContext();
  const [customer, setCustomer] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      const customerData = getCustomer(id);
      if (customerData) {
        setCustomer(customerData);
      } else {
        // Handle case where customer is not found
        toast.error('Customer not found');
      }
    }
  }, [id, getCustomer]);
  
  const confirmDelete = () => {
    if (id) {
      deleteCustomer(id);
      toast.success('Customer deleted successfully');
      navigate('/customers');
    }
  };
  
  if (!customer) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-500">Customer not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/customers')}>
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/customers')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/customers/edit/${customer.id}`}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="flex items-start gap-4">
          {customer.logo && (
            <img 
              src={customer.logo} 
              alt={`${customer.name} Logo`} 
              className="h-24 w-auto object-contain border rounded p-2"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">{customer.name}</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6 mt-4">
          <div>
            <p className="text-sm text-gray-500">Contact Details</p>
            <p className="font-medium">Email: {customer.email || 'N/A'}</p>
            <p className="font-medium">Phone: {customer.contact || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">GST Information</p>
            <p className="font-medium">GSTIN: {customer.gstin}</p>
            <p className="font-medium">PAN: {customer.pan || 'N/A'}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-500">Address</p>
          <p className="whitespace-pre-line">{customer.address}</p>
          <p>{customer.state} - {customer.stateCode}</p>
        </div>

        {customer.bankDetails && (
          <div className="mb-6">
            <p className="text-sm text-gray-500">Bank Details</p>
            <p><strong>Bank Name:</strong> {customer.bankDetails.bankName || 'N/A'}</p>
            <p><strong>Account Number:</strong> {customer.bankDetails.accountNumber || 'N/A'}</p>
            <p><strong>Branch:</strong> {customer.bankDetails.branch || 'N/A'}</p>
            <p><strong>IFSC Code:</strong> {customer.bankDetails.ifscCode || 'N/A'}</p>
          </div>
        )}
        
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">Additional Information</p>
          <p>{customer.notes || 'No additional notes'}</p>
        </div>
      </Card>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete customer <span className="font-medium">{customer.name}</span>? 
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

export default CustomerDetail;
