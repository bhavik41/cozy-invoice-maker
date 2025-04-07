
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const CustomerList = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Customers</h2>
        <Button asChild>
          <Link to="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Your customers will appear here</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Customer
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CustomerList;
