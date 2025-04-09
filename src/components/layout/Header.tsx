
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/invoices':
        return 'Invoices';
      case '/customers':
        return 'Customers';
      case '/products':
        return 'Products';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      case '/backup':
        return 'Backup & Restore';
      default:
        if (location.pathname.startsWith('/invoices/')) {
          return 'Invoice Details';
        } else if (location.pathname.startsWith('/customers/')) {
          return 'Customer Details';
        } else if (location.pathname.startsWith('/products/')) {
          return 'Product Details';
        } else if (location.pathname === '/invoices/new') {
          return 'Create New Invoice';
        } else if (location.pathname === '/customers/new') {
          return 'Add New Customer';
        } else if (location.pathname === '/products/new') {
          return 'Add New Product';
        }
        return 'Page Not Found';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center">
        <div className="relative mr-4">
          <input
            type="text"
            placeholder="Quick search..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-invoice-primary focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative mr-3">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <div className="flex h-10 w-10 rounded-full bg-invoice-primary text-white items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
