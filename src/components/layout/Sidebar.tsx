import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  ShoppingBag,
  Settings,
  Database,
  HelpCircle,
  FileBarChart,
  UserCircle,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';

const Sidebar = () => {
  const location = useLocation();
  const { currentSeller } = useAppContext();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    { name: 'Financial Year', path: '/financial-year', icon: Calendar },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Backup', path: '/backup', icon: Database },
  ];

  return (
    <div className="h-screen bg-gray-100 border-r border-gray-200 pt-5 w-64 flex flex-col">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-invoice-primary mb-1">Invoice Pro</h1>
        <p className="text-sm text-gray-500">Billing Management System</p>
      </div>

      {currentSeller && (
        <div className="px-6 py-3 bg-white mx-3 rounded-lg shadow-sm mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-invoice-primary text-white flex items-center justify-center">
              <UserCircle size={24} />
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-sm">{currentSeller.name}</h3>
              <p className="text-xs text-gray-500">{currentSeller.gstin}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md",
                  location.pathname === item.path
                    ? "bg-invoice-primary text-white"
                    : "text-gray-700 hover:bg-gray-200"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <HelpCircle className="h-5 w-5 text-gray-500" />
          <span className="ml-2 text-sm text-gray-500">Need help?</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
