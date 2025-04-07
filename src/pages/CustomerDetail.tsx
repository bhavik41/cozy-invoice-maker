
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/customers')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold">Customer Details</h2>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Customer ID: {id}</p>
          <p className="text-gray-500 mt-2">Customer details will be displayed here</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/customers')}>
            Back to Customers
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CustomerDetail;
