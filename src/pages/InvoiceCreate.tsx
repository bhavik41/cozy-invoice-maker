
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const InvoiceCreate = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/invoices')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold">Create New Invoice</h2>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Invoice creation form will be implemented here</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceCreate;
