import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Clock, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import Layout from "@/components/Layout";
import TabNavigation from "@/components/TabNavigation";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../config";

interface Document {
  id: string;
  name: string;
  type: string;
  status: "pending" | "verified" | "manual_verification";
  fileName: string;
  fileSize: number;
  timestamp: Date;
  verificationResult?: Record<string, string>;
  user: string;
}

const UserDashboard = () => {
  const user = sessionStorage.getItem("email");
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchDocuments();
    }
  }, [user, navigate]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Query both verified and pending collections
      const verifiedQuery = query(
        collection(db, "verified"),
        where("user", "==", user)
      );
      const pendingQuery = query(
        collection(db, "pending"),
        where("user", "==", user)
      );

      const [verifiedSnapshot, pendingSnapshot] = await Promise.all([
        getDocs(verifiedQuery),
        getDocs(pendingQuery)
      ]);

      const docs: Document[] = [];

      verifiedSnapshot.forEach((docSnapshot) => {
        docs.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
          status: "verified"
        } as Document);
      });

      pendingSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        docs.push({
          id: docSnapshot.id,
          ...data,
          status: data.status === "manual_verification" ? "manual_verification" : "pending"
        } as Document);
      });

      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyDocument = async (documentId: string) => {
    setIsVerifying(documentId);
    try {
      // Find the document
      const docToVerify = documents.find(d => d.id === documentId);
      if (!docToVerify) return;

      // In a real app, you would call your verification API here
      // For demo, we'll just move it to verified after 1 second
      setTimeout(async () => {
        // Remove from pending and add to verified in Firestore
        const docRef = doc(db, "pending", documentId);
        await updateDoc(docRef, { status: "verified" });
        
        // Refresh documents
        await fetchDocuments();
      }, 1000);
    } catch (error) {
      console.error("Error verifying document:", error);
    } finally {
      setIsVerifying(null);
    }
  };

  const pendingDocuments = documents.filter(doc => doc.status === "pending");
  const verifiedDocuments = documents.filter(doc => doc.status === "verified");
  const manualVerificationDocuments = documents.filter(doc => doc.status === "manual_verification");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "manual_verification":
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" /> Manual Review</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | { toDate: () => Date }) => {
    const jsDate = date instanceof Date ? date : date.toDate();
    return jsDate.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Layout>
        <PageTransition>
          <div className="container py-8 px-4">
            <p>Loading documents...</p>
          </div>
        </PageTransition>
      </Layout>
    );
  }

  return (
    <Layout>
      <TabNavigation />
      <PageTransition>
        <div className="container py-8 px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Your Documents</h1>
            <p className="text-muted-foreground mt-1">Manage and verify your documents</p>
          </header>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{documents.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{verifiedDocuments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingDocuments.length + manualVerificationDocuments.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Document List</h2>
            <Button onClick={() => navigate("/upload")} className="gap-2">
              <Upload className="h-4 w-4" /> Upload New
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="manual">Under Review</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {documents.length === 0 ? (
                <p className="text-muted-foreground">No documents available.</p>
              ) : (
                <div className="space-y-4">
                  {documents.map(doc => (
                    <Card key={doc.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground">{doc.type}</p>
                        </div>
                        {getStatusBadge(doc.status)}
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div className="flex justify-between">
                          <span>Uploaded: {formatDate(doc.timestamp)}</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {pendingDocuments.length === 0 ? (
                <p className="text-muted-foreground">No pending documents.</p>
              ) : (
                <div className="space-y-4">
                  {pendingDocuments.map(doc => (
                    <Card key={doc.id}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground">{doc.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(doc.status)}
                          <Button 
                            size="sm" 
                            onClick={() => verifyDocument(doc.id)}
                            disabled={isVerifying === doc.id}
                          >
                            {isVerifying === doc.id ? "Verifying..." : "Verify"}
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="verified">
              {verifiedDocuments.length === 0 ? (
                <p className="text-muted-foreground">No verified documents.</p>
              ) : (
                <div className="space-y-4">
                  {verifiedDocuments.map(doc => (
                    <Card key={doc.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground">{doc.type}</p>
                        </div>
                        {getStatusBadge(doc.status)}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual">
              {manualVerificationDocuments.length === 0 ? (
                <p className="text-muted-foreground">No documents under review.</p>
              ) : (
                <div className="space-y-4">
                  {manualVerificationDocuments.map(doc => (
                    <Card key={doc.id}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground">{doc.type}</p>
                        </div>
                        {getStatusBadge(doc.status)}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {selectedDocument && (
            <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedDocument.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(selectedDocument.status)}
                  </div>
                  <div>
                    <p className="font-medium">Document Type:</p>
                    <p>{selectedDocument.type}</p>
                  </div>
                  <div>
                    <p className="font-medium">File Name:</p>
                    <p>{selectedDocument.fileName}</p>
                  </div>
                  <div>
                    <p className="font-medium">File Size:</p>
                    <p>{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Uploaded On:</p>
                    <p>{formatDate(selectedDocument.timestamp)}</p>
                  </div>
                  {selectedDocument.verificationResult && (
                    <div>
                      <p className="font-medium">Verification Results:</p>
                      <pre className="bg-gray-100 p-2 rounded text-sm">
                        {JSON.stringify(selectedDocument.verificationResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </PageTransition>
    </Layout>
  );
};

export default UserDashboard;