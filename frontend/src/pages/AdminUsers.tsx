
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDocuments } from "../context/DocumentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, Users, Eye, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageTransition from "@/components/PageTransition";
import Layout from "@/components/Layout";
import TabNavigation from "@/components/TabNavigation";
import { toast } from "sonner";

const AdminUsers = () => {
  const { user, users } = useAuth();
  const { getDocumentsByUser, updateDocumentStatus } = useDocuments();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  if (!user || user.role !== "admin") {
    navigate("/login");
    return null;
  }
  
  const filteredUsers = searchTerm
    ? users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;
    
  const userDocs = selectedUser ? getDocumentsByUser(selectedUser.id) : [];
  
  const handleVerifyDocument = (docId, status) => {
    updateDocumentStatus(docId, status);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "verified":
        return <Badge variant="default" className="bg-green-500">Verified</Badge>;
      case "manual_verification":
        return <Badge variant="secondary">Manual Verification</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  return (
    <Layout>
      <TabNavigation />
      <PageTransition>
        <div className="container py-8 px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-1">View and manage user accounts and documents</p>
          </header>
          
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <Users className="mr-2 h-5 w-5" /> All Users ({filteredUsers.length})
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Manual Verification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const userDocuments = getDocumentsByUser(u.id);
                    const pendingVerification = userDocuments.filter(doc => doc.status === "manual_verification").length;
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "outline"}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{userDocuments.length} Documents</TableCell>
                        <TableCell>
                          {pendingVerification > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {pendingVerification} Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedUser(u);
                              setActiveTab(pendingVerification > 0 ? "documents" : "profile");
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* User Details Dialog */}
          {selectedUser && (
            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                  <DialogDescription>
                    View information and documents for {selectedUser.name}
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="documents">
                      Documents ({userDocs.length})
                      {userDocs.filter(doc => doc.status === "manual_verification").length > 0 && (
                        <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                          {userDocs.filter(doc => doc.status === "manual_verification").length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                        <p>{selectedUser.name || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                        <p>{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Role</p>
                        <Badge variant={selectedUser.role === "admin" ? "default" : "outline"}>
                          {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Joined</p>
                        <p>23 May 2023</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Mother's Name</p>
                        <p>{selectedUser.motherName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Father's Name</p>
                        <p>{selectedUser.fatherName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Age</p>
                        <p>{selectedUser.age || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Gender</p>
                        <p>{selectedUser.gender ? (selectedUser.gender.charAt(0).toUpperCase() + selectedUser.gender.slice(1)) : "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Domicile State</p>
                        <p>{selectedUser.domicileState || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Domicile Certificate Number</p>
                        <p>{selectedUser.domicileCertificateNumber || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                        <p>{selectedUser.category ? (selectedUser.category.charAt(0).toUpperCase() + selectedUser.category.slice(1)) : "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Documents</p>
                        <p>{userDocs.length} documents</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents">
                    {userDocs.length === 0 ? (
                      <div className="text-center py-6">
                        <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p>No documents found</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {userDocs.map(doc => (
                          <Card key={doc.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{doc.name}</h3>
                                    <p className="text-sm text-muted-foreground capitalize">{doc.type}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Uploaded: {doc.uploadDate.toLocaleDateString()}
                                    </p>
                                    {doc.description && (
                                      <p className="text-sm mt-1">{doc.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                  {getStatusBadge(doc.status)}
                                  
                                  {doc.status === "manual_verification" && (
                                    <div className="flex gap-2 mt-2">
                                      <Button 
                                        size="sm" 
                                        className="bg-green-500 hover:bg-green-600"
                                        onClick={() => handleVerifyDocument(doc.id, "verified")}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => handleVerifyDocument(doc.id, "rejected")}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                      </Button>
                                    </div>
                                  )}
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => window.open(doc.file, '_blank')}
                                  >
                                    <Eye className="h-4 w-4 mr-1" /> View Document
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </PageTransition>
    </Layout>
  );
};

export default AdminUsers;
