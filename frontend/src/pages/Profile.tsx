import React, { useState, useEffect } from "react";
import { db } from "../config"; // Import Firestore instance
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import Layout from "@/components/Layout";
import TabNavigation from "@/components/TabNavigation";

const Profile = () => {
  const email = sessionStorage.getItem("email"); // Get email from sessionStorage
  const [profileData, setProfileData] = useState({
    name: "",
    motherName: "",
    fatherName: "",
    age: "",
    gender: "",
    domicileState: "",
    domicileCity: "",
    domicileIssueDate: "",
    domicileCertificateNumber: "",
    category: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return; // If no email in session, do nothing

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", email));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [email]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProfileData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsUpdating(true);
    try {
      await setDoc(doc(db, "users", email), {
        ...profileData,
        age: profileData.age ? parseInt(profileData.age, 10) : "",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!email) return <p className="text-center text-red-500">No user logged in.</p>;
  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <Layout>
      <TabNavigation />
      <PageTransition>
        <div className="container py-8 px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your personal information</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and details</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="documents">Domicile Info</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: "Full Name", id: "name" },
                        { label: "Mother's Name", id: "motherName" },
                        { label: "Father's Name", id: "fatherName" },
                      ].map(({ label, id }) => (
                        <div key={id} className="space-y-2">
                          <Label htmlFor={id}>{label}</Label>
                          <Input id={id} value={profileData[id]} onChange={handleChange} placeholder={label} required />
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" value={profileData.age} onChange={handleChange} placeholder="Your age" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value })}>
                          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" disabled={isUpdating} className="mt-4">
                      {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="documents">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: "Domicile State", id: "domicileState" },
                        { label: "Domicile City", id: "domicileCity" },
                        { label: "Domicile Certificate Number", id: "domicileCertificateNumber" },
                      ].map(({ label, id }) => (
                        <div key={id} className="space-y-2">
                          <Label htmlFor={id}>{label}</Label>
                          <Input id={id} value={profileData[id]} onChange={handleChange} placeholder={label} required />
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="domicileIssueDate">Domicile Issue Date</Label>
                        <Input id="domicileIssueDate" type="date" value={profileData.domicileIssueDate} onChange={handleChange} required />
                      </div>
                    </div>
                    <Button type="submit" disabled={isUpdating} className="mt-4">
                      {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Profile;

