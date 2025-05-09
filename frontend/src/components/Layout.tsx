import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, Shield, LayoutDashboard } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const storedEmail = sessionStorage.getItem("email");

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 w-full backdrop-blur-md bg-white/80">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">Validify</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated || storedEmail ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex items-center gap-2"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Apply
                </Button>
                
                {storedEmail && (
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {storedEmail}
                  </div>
                )}
                
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between px-4 md:px-6">
          <p className="text-sm text-muted-foreground">
            © 2023 Validify. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
