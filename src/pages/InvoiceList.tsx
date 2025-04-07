
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const InvoiceList = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Invoices</h2>
        <Button asChild>
          <Link to="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Your invoices will appear here</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Invoice
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceList;
