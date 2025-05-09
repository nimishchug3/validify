
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ChevronRight, FileText, ShieldCheck, Star, Upload } from "lucide-react";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Upload className="h-8 w-8 text-primary" />,
      title: "Easy Document Upload",
      description: "Upload your documents securely with just a few clicks"
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Instant Verification",
      description: "Get your documents verified instantly with our AI-powered system"
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Document Management",
      description: "Manage all your documents in one secure place"
    }
  ];

  const testimonials = [
    {
      content: "DocuVerify has simplified our verification process tremendously. What used to take days now takes minutes.",
      author: "John Smith",
      position: "HR Manager"
    },
    {
      content: "The platform is incredibly intuitive and the verification process is seamless. Highly recommended!",
      author: "Sarah Johnson",
      position: "Operations Director"
    },
    {
      content: "We've been able to reduce our document processing time by 80% thanks to DocuVerify's efficient system.",
      author: "Michael Chen",
      position: "University Registrar"
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Layout>
      <PageTransition>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"></div>
          </div>
          
          <div className="container relative px-4">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="text-center md:text-left"
              >
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                  Secure Document Verification
                </div>
                <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  Verify Documents with <span className="text-gradient">Confidence</span>
                </h1>
                <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                  A secure, fast, and reliable platform for document verification. 
                  Upload, verify, and manage all your important documents in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button size="lg" onClick={() => navigate("/signup")} className="gap-2">
                    Get Started <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="relative mx-auto w-full max-w-md">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-200/50">
                    <img
                      src="https://images.unsplash.com/photo-1568219656418-15e329bd2513?q=80&w=1000&auto=format&fit=crop"
                      alt="Document Verification"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                  
                  <div className="absolute -bottom-6 -right-6 rounded-lg bg-white p-4 shadow-lg ring-1 ring-gray-200/50">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Verified Successfully</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Streamlined Verification Process
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform simplifies document verification with powerful features designed to save you time and resources.
              </p>
            </div>
            
            <motion.div 
              className="grid gap-8 md:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="glass-card rounded-xl p-6 transition-all hover:shadow-lg"
                >
                  <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our simple three-step process makes document verification quick and hassle-free.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3 relative">
              {/* Connecting line (hidden on mobile) */}
              <div className="absolute top-12 left-0 right-0 h-0.5 bg-primary/20 hidden md:block"></div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">Upload Documents</h3>
                <p className="text-muted-foreground">
                  Securely upload your documents through our intuitive interface
                </p>
              </div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">Verify</h3>
                <p className="text-muted-foreground">
                  Our system automatically verifies your documents for authenticity
                </p>
              </div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">Get Results</h3>
                <p className="text-muted-foreground">
                  Receive instant verification results and manage your documents
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                What Our Users Say
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of satisfied users who trust DocuVerify for their document verification needs.
              </p>
            </div>
            
            <motion.div 
              className="grid gap-8 md:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="glass-card rounded-xl p-6"
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="mb-4 text-muted-foreground italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4">
            <Card className="glass-card bg-white/80 mx-auto max-w-4xl overflow-hidden rounded-xl">
              <CardContent className="p-8 md:p-12">
                <div className="grid gap-8 md:grid-cols-2 items-center">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-4">
                      Ready to Get Started?
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                      Join thousands of users who trust DocuVerify for their document verification needs. Sign up today and experience the difference.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button size="lg" onClick={() => navigate("/signup")}>
                        Create Account
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                        Login
                      </Button>
                    </div>
                  </div>
                  <div className="relative hidden md:block">
                    <img
                      src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=1000&auto=format&fit=crop"
                      alt="Document Verification"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default Landing;
