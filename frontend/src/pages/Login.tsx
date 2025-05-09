import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      sessionStorage.setItem("email", user.email);
      
      // In a real app, you would check the user's role from Firestore here
      // For now, we'll assume admins have specific email patterns
      if (email.includes("@admin.")) {
        sessionStorage.setItem("role", "admin");
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
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
              <LogIn className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Validify</h1>
            </div>
            <h2 className="text-2xl font-bold mb-6">Secure Document Verification Platform</h2>
            <p className="text-primary-foreground/80">
              Sign in to access your document verification dashboard
            </p>
          </div>
        </div>
        <div className="md:w-1/2 p-8 flex items-center justify-center bg-background">
          <div className="w-full max-w-md">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-1 items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <LogIn className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>Enter your credentials to sign in</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in
                      </>
                    ) : "Sign In"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-center w-full text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;