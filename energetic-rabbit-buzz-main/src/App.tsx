import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import CustomRequest from "./pages/CustomRequest";
import CustomRequestDetail from "./pages/CustomRequestDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import Account from "./pages/Account";
import OrderDetail from "./pages/OrderDetail";
import SearchPage from "./pages/SearchPage";
import AdminCategories from "./pages/AdminCategories";
import AdminHotItems from "./pages/AdminHotItems";
import AddProductPage from "./pages/admin/AddProductPage";
import AdminDashboard from "./pages/AdminDashboard";
import CustomRequestsList from "./pages/admin/CustomRequestsList";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/custom-request" element={<CustomRequest />} />
              <Route path="/custom-request/:requestId" element={<CustomRequestDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/product/:productId" element={<ProductPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/account" element={<Account />} />
              <Route path="/order/:orderId" element={<OrderDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/hot-items" element={<AdminHotItems />} />
              <Route path="/admin/products/new" element={<AddProductPage />} />
              <Route path="/admin/custom-requests" element={<CustomRequestsList />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;