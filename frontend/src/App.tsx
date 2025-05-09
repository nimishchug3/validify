
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DocumentProvider } from "./context/DocumentContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";

// Add framer-motion
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DocumentProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Redirect root to login */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/upload" element={<Upload />} />
                  
                  {/* Redirect /index to /login */}
                  <Route path="/index" element={<Navigate to="/login" replace />} />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </TooltipProvider>
        </DocumentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
