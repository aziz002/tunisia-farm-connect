import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";

const Login = lazy(() => import("./pages/Login"));
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const MyPlugins = lazy(() => import("./pages/MyPlugins"));
const Livestock = lazy(() => import("./pages/Livestock"));
const SmartIrrigation = lazy(() => import("./pages/SmartIrrigation"));
const MarketplaceSeller = lazy(() => import("./pages/MarketplaceSeller"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route
                path="/my-plugins"
                element={
                  <ProtectedRoute>
                    <MyPlugins />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/smart-irrigation"
                element={
                  <ProtectedRoute>
                    <SmartIrrigation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/livestock"
                element={
                  <ProtectedRoute>
                    <Livestock />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace-seller"
                element={
                  <ProtectedRoute>
                    <MarketplaceSeller />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
