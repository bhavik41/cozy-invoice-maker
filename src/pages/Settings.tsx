
import React from 'react';
import { Card } from '@/components/ui/card';

const Settings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>
      
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Application settings will be available here</p>
          <p className="text-gray-500 mt-2">Configure preferences, tax rates, and more</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
