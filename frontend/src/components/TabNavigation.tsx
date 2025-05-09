
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User, FileText, Upload, Users, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TabNavigationProps {
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ className }) => {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();
  
  const userTabs = [
    {
      name: "Profile",
      path: "/profile",
      icon: User
    },
    {
      name: "Documents",
      path: "/dashboard",
      icon: FileText
    },
    {
      name: "Upload",
      path: "/upload",
      icon: Upload
    }
  ];
  
  const adminTabs = [
    {
      name: "Documents",
      path: "/admin",
      icon: FileText
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings
    }
  ];
  
  const tabs = user?.role === "admin" ? adminTabs : userTabs;

  return (
    <div className={cn("border-b flex justify-center bg-background", className)}>
      <div className="container">
        <nav className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = path === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 hover:text-primary",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
