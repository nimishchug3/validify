
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

type UserRole = "user" | "admin";
type Gender = "male" | "female" | "other";
type Category = "general" | "obc" | "sc" | "st";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Additional profile fields
  motherName?: string;
  fatherName?: string;
  age?: number;
  gender?: Gender;
  domicileState?: string;
  domicileCertificateNumber?: string;
  domicileCity?: string;
  domicileIssueDate ?: Date;
  category?: Category;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (userData: Partial<User>) => void;
}

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "user@example.com",
    role: "user",
    motherName: "Jane Doe",
    fatherName: "Jack Doe",
    age: 28,
    gender: "male",
    domicileState: "California",
    domicileCertificateNumber: "CA-12345-2023",
    category: "general"
  },
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin"
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([...MOCK_USERS]);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedInUser = localStorage.getItem("validify-user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    
    // Load users from localStorage if available
    const savedUsers = localStorage.getItem("validify-users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem("validify-users", JSON.stringify(users));
  }, [users]);

  const isAuthenticated = user !== null;

  const updateProfile = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Update user in users array
    const updatedUsers = users.map(u => 
      u.id === user.id ? updatedUser : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem("validify-user", JSON.stringify(updatedUser));
    localStorage.setItem("validify-users", JSON.stringify(updatedUsers));
    
    toast.success("Profile updated successfully");
  };

  const login = async (email: string, password: string) => {
    try {
      // In a real app, you would call an API here
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        toast.error("Invalid email or password");
        return Promise.reject("Invalid email or password");
      }
      
      // In a real app, you would verify the password
      if (password !== "password") {
        toast.error("Invalid email or password");
        return Promise.reject("Invalid email or password");
      }
      
      setUser(foundUser);
      localStorage.setItem("validify-user", JSON.stringify(foundUser));
      toast.success("Login successful");
      return Promise.resolve();
    } catch (error) {
      toast.error("Login failed");
      return Promise.reject(error);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      // Check if user already exists
      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (userExists) {
        toast.error("User with this email already exists");
        return Promise.reject("User with this email already exists");
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role
      };
      
      setUsers(prev => [...prev, newUser]);
      setUser(newUser);
      localStorage.setItem("validify-user", JSON.stringify(newUser));
      toast.success("Account created successfully");
      return Promise.resolve();
    } catch (error) {
      toast.error("Signup failed");
      return Promise.reject(error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("validify-user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      signup,
      logout,
      isAuthenticated,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
