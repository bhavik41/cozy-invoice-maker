import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceDetail from './pages/InvoiceDetail';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import CustomerCreate from './pages/CustomerCreate';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ProductCreate from './pages/ProductCreate';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Backup from './pages/Backup';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// The App structure remains the same, but now we've ensured that
// the AuthProvider wraps AppProvider, so the company-based filtering
// will work properly. The actual filtering happens in AppContext.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth Routes (Public) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />
                  
                  <Route path="invoices">
                    <Route index element={<InvoiceList />} />
                    <Route path="new" element={<InvoiceCreate />} />
                    <Route path=":id" element={<InvoiceDetail />} />
                  </Route>
                  
                  <Route path="customers">
                    <Route index element={<CustomerList />} />
                    <Route path="new" element={<CustomerCreate />} />
                    <Route path=":id" element={<CustomerDetail />} />
                  </Route>
                  
                  <Route path="products">
                    <Route index element={<ProductList />} />
                    <Route path="new" element={<ProductCreate />} />
                    <Route path=":id" element={<ProductDetail />} />
                  </Route>
                  
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="backup" element={<Backup />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
