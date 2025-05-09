
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Settings, Shield, FileText, Bell, Lock } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import Layout from "@/components/Layout";
import TabNavigation from "@/components/TabNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    autoVerification: true,
    emailNotifications: true,
    manualReviewThreshold: 0.7,
    documentRetentionDays: 30
  });

  if (!user || user.role !== "admin") {
    navigate("/login");
    return null;
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <Layout>
      <TabNavigation />
      <PageTransition>
        <div className="container py-8 px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground mt-1">Configure system settings and preferences</p>
          </header>
          
          <Tabs defaultValue="general">
            <TabsList className="mb-6">
              <TabsTrigger value="general">
                <Settings className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="verification">
                <FileText className="h-4 w-4 mr-2" />
                Verification
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>General Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure general system settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="retention">Document Retention (days)</Label>
                    <Input 
                      id="retention" 
                      type="number" 
                      value={settings.documentRetentionDays} 
                      onChange={(e) => handleSettingChange('documentRetentionDays', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of days to keep documents after verification
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings}>Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Verification Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure how documents are verified in the system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-verification">Automatic Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable automatic verification of documents
                      </p>
                    </div>
                    <Switch 
                      id="auto-verification" 
                      checked={settings.autoVerification}
                      onCheckedChange={(checked) => handleSettingChange('autoVerification', checked)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="threshold">Manual Review Threshold</Label>
                    <Input 
                      id="threshold" 
                      type="number" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={settings.manualReviewThreshold}
                      onChange={(e) => handleSettingChange('manualReviewThreshold', parseFloat(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Confidence threshold below which documents require manual verification (0-1)
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings}>Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Notification Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure email and system notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications for verification status changes
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings}>Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle>Security Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure security and access control settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Security settings will be implemented in a future update.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings}>Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default AdminSettings;
