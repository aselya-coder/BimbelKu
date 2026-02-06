import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminRoute } from "@/components/auth/AdminRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import PackagesPage from "./pages/PackagesPage";
import PackageDetailPage from "./pages/PackageDetailPage";
import RegistrationPage from "./pages/RegistrationPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSubjectsPage from "./pages/admin/AdminSubjectsPage";
import AdminCitiesPage from "./pages/admin/AdminCitiesPage";
import AdminLocationsPage from "./pages/admin/AdminLocationsPage";
import AdminPackagesPage from "./pages/admin/AdminPackagesPage";
import AdminSchedulesPage from "./pages/admin/AdminSchedulesPage";
import AdminRegistrationsPage from "./pages/admin/AdminRegistrationsPage";
import AdminTestimonialsPage from "./pages/admin/AdminTestimonialsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/packages/:id" element={<PackageDetailPage />} />
              <Route path="/register" element={<RegistrationPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="subjects" element={<AdminSubjectsPage />} />
              <Route path="cities" element={<AdminCitiesPage />} />
              <Route path="locations" element={<AdminLocationsPage />} />
              <Route path="packages" element={<AdminPackagesPage />} />
              <Route path="schedules" element={<AdminSchedulesPage />} />
              <Route path="registrations" element={<AdminRegistrationsPage />} />
              <Route path="testimonials" element={<AdminTestimonialsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
