
import React from 'react';
import { Card } from '@/components/ui/card';

const Reports = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Reports</h2>
      
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Reports functionality will be available here</p>
          <p className="text-gray-500 mt-2">Generate sales, inventory, and customer reports</p>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
