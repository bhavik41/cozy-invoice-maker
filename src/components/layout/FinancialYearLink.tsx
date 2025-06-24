
import React from 'react';
import { Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const FinancialYearLink = () => {
  const location = useLocation();
  const isActive = location.pathname === '/financial-year';

  return (
    <Link
      to="/financial-year"
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Calendar className="mr-3 h-4 w-4" />
      Financial Year
    </Link>
  );
};

export default FinancialYearLink;
