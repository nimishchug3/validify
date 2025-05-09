import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, UserPlus } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [adminCode, setAdminCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (role === "admin" && adminCode !== "ADMIN123") { // Replace with your actual admin code
      setError("Invalid admin code");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        uid: user.uid,
        createdAt: new Date()
      });

      // Redirect based on role
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="bg-primary md:w-1/2 p-8 text-white flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Validify</h1>
            </div>
            <h2 className="text-2xl font-bold mb-6">Secure Document Verification Platform</h2>
            <p className="text-primary-foreground/80">
              {role === "admin" 
                ? "Admin portal for document verification management"
                : "User portal for document submission and tracking"}
            </p>
          </div>
        </div>
        <div className="md:w-1/2 p-8 flex items-center justify-center bg-background">
          <div className="w-full max-w-md">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-1 items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>Enter your details to create your account</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      minLength={6}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password *</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      minLength={6}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type *</Label>
                    <Select 
                      value={role} 
                      onValueChange={(value: "user" | "admin") => setRole(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {role === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="adminCode">Admin Code *</Label>
                      <Input 
                        id="adminCode" 
                        type="password" 
                        placeholder="Enter admin code" 
                        value={adminCode} 
                        onChange={(e) => setAdminCode(e.target.value)} 
                        required 
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        {role === "admin" ? "Creating admin account" : "Creating account"}
                      </>
                    ) : role === "admin" ? "Create Admin Account" : "Create Account"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-center w-full text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Signup;