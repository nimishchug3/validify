import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Download, Eye, FileText, Search, User, ZoomIn, ZoomOut } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import Layout from "@/components/Layout";
import TabNavigation from "@/components/TabNavigation";
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config";

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Document {
  id: string;
  user: string;
  documentType: "ssc" | "domicile" | "cet";
  documentName: string;
  fileName: string;
  fileSize: number;
  fileType: "image" | "pdf";
  status: "pending" | "verified" | "rejected";
  timestamp: Date;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  verificationResult: Record<string, string>;
  name?: string;
  roll_no?: string;
  result?: string;
  certificate_number?: string;
  state?: string;
  application_no?: string;
  category?: string;
  mothers_name?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
}

const DocumentPreview = ({ document, zoom, containerRef }: { 
  document: Document, 
  zoom: number, 
  containerRef: React.RefObject<HTMLDivElement> 
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setPdfError(true);
  };

  if (document.fileType === 'pdf') {
    // If PDF fails to load, fall back to Google Docs viewer
    if (pdfError) {
      return (
        <div className="w-full h-full">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.cloudinaryUrl)}&embedded=true`}
            className="w-full h-full border-0"
            title="PDF document"
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full overflow-auto" ref={containerRef}>
        <Document
          file={{
            url: document.cloudinaryUrl,
            httpHeaders: {
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=31536000',
            }
          }}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="flex items-center justify-center h-full">Loading PDF...</div>}
          error={<div className="flex items-center justify-center h-full text-red-500">Failed to load PDF</div>}
          className="pdf-document"
        >
          <Page 
            pageNumber={pageNumber} 
            width={containerRef.current?.clientWidth ? Math.min(containerRef.current.clientWidth, 1000) : 600}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
        {numPages && (
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/50">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-auto" ref={containerRef}>
      <div className="relative">
        <img
          src={document.cloudinaryUrl}
          alt="Document preview"
          className="max-w-full max-h-full object-contain"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>
    </div>
  );
};

const DocumentStatsCard = ({ 
  title, 
  value, 
  icon,
  variant
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant: "pending" | "verified";
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {variant === "pending" ? "Awaiting verification" : "Successfully verified"}
        </p>
      </CardContent>
    </Card>
  );
};

const DocumentTable = ({ 
  documents, 
  onView,
  emptyMessage
}: {
  documents: Document[];
  onView: (doc: Document) => void;
  emptyMessage: string;
}) => {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Document</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {documents.map((document) => (
              <tr key={document.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{document.user}</span>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex flex-col">
                    <span className="font-medium">{document.documentName}</span>
                    <span className="text-xs text-muted-foreground">{document.fileName}</span>
                  </div>
                </td>
                <td className="p-4 align-middle capitalize">{document.documentType}</td>
                <td className="p-4 align-middle">
                  {document.status === "verified" ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  ) : document.status === "pending" ? (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" /> Pending
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Rejected
                    </Badge>
                  )}
                </td>
                <td className="p-4 align-middle text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onView(document)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AdminDashboard = () => {
  const user = sessionStorage.getItem("email");
  const role = sessionStorage.getItem("role");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [verifiedDocuments, setVerifiedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Zoom functionality
  const [documentPreviewZoom, setDocumentPreviewZoom] = useState(1);
  const [maxZoom] = useState(3);
  const [minZoom] = useState(0.5);
  const [zoomStep] = useState(0.25);
  const documentPreviewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || role !== "admin") {
      navigate("/login");
      return;
    }

    setLoading(true);

    const pendingQuery = query(collection(db, "pending"));
    const unsubscribePending = onSnapshot(pendingQuery, (querySnapshot) => {
      const docs: Document[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        docs.push({
          id: docSnapshot.id,
          user: data.user,
          documentType: data.documentType,
          documentName: data.documentName,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType || "image",
          status: data.status,
          timestamp: data.timestamp?.toDate() || new Date(),
          cloudinaryUrl: data.cloudinaryUrl,
          cloudinaryPublicId: data.cloudinaryPublicId,
          verificationResult: data.verificationResult || {},
          name: data.name,
          roll_no: data.roll_no,
          result: data.result,
          certificate_number: data.certificate_number,
          state: data.state,
          application_no: data.application_no,
          category: data.category,
          mothers_name: data.mothers_name,
        });
      });
      setPendingDocuments(docs);
    });

    const verifiedQuery = query(collection(db, "verified"));
    const unsubscribeVerified = onSnapshot(verifiedQuery, (querySnapshot) => {
      const docs: Document[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        docs.push({
          id: docSnapshot.id,
          user: data.user,
          documentType: data.documentType,
          documentName: data.documentName,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType || "image",
          status: data.status,
          timestamp: data.timestamp?.toDate() || new Date(),
          cloudinaryUrl: data.cloudinaryUrl,
          cloudinaryPublicId: data.cloudinaryPublicId,
          verificationResult: data.verificationResult || {},
          name: data.name,
          roll_no: data.roll_no,
          result: data.result,
          certificate_number: data.certificate_number,
          state: data.state,
          application_no: data.application_no,
          category: data.category,
          mothers_name: data.mothers_name,
          verifiedAt: data.verifiedAt?.toDate(),
          verifiedBy: data.verifiedBy,
        });
      });
      setVerifiedDocuments(docs);
      setLoading(false);
    });

    return () => {
      unsubscribePending();
      unsubscribeVerified();
    };
  }, [user, role, navigate]);

  // Add pinch-to-zoom functionality
  useEffect(() => {
    const container = documentPreviewContainerRef.current;
    if (!container || !selectedDocument) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -Math.sign(e.deltaY) * zoomStep * 0.5;
        setDocumentPreviewZoom(prev => 
          Math.min(maxZoom, Math.max(minZoom, prev + delta))
        );
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [selectedDocument, maxZoom, minZoom, zoomStep]);

  const handleVerifyDocument = async (documentId: string) => {
    try {
      const docRef = doc(db, "pending", documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error("Document not found");
      }

      const documentData = docSnap.data();
      
      await setDoc(doc(db, "verified", documentId), {
        ...documentData,
        status: "verified",
        verifiedAt: Timestamp.now(),
        verifiedBy: user
      });

      await deleteDoc(docRef);
      setSelectedDocument(null);
    } catch (error) {
      console.error("Error verifying document:", error);
    }
  };

  const handleRejectDocument = async (documentId: string, reason: string = "Manual rejection by admin") => {
    try {
      const docRef = doc(db, "pending", documentId);
      await updateDoc(docRef, {
        status: "rejected",
        rejectedAt: Timestamp.now(),
        rejectedBy: user,
        rejectionReason: reason
      });
      setSelectedDocument(null);
    } catch (error) {
      console.error("Error rejecting document:", error);
    }
  };

  const handleZoomIn = () => {
    setDocumentPreviewZoom(prevZoom => Math.min(maxZoom, prevZoom + zoomStep));
  };

  const handleZoomOut = () => {
    setDocumentPreviewZoom(prevZoom => Math.max(minZoom, prevZoom - zoomStep));
  };

  const handleResetZoom = () => {
    setDocumentPreviewZoom(1);
    if (documentPreviewContainerRef.current) {
      documentPreviewContainerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  const getDocumentSpecificFields = (document: Document) => {
    switch (document.documentType) {
      case "ssc":
        return (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Student Name</p>
              <p className="font-medium text-sm mt-1">{document.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roll Number</p>
              <p className="font-medium text-sm mt-1">{document.roll_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Result</p>
              <p className="font-medium text-sm mt-1 capitalize">{document.result}</p>
            </div>
          </>
        );
      case "domicile":
        return (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Certificate Holder</p>
              <p className="font-medium text-sm mt-1">{document.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Certificate Number</p>
              <p className="font-medium text-sm mt-1">{document.certificate_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">State</p>
              <p className="font-medium text-sm mt-1">{document.state}</p>
            </div>
          </>
        );
      case "cet":
        return (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Candidate Name</p>
              <p className="font-medium text-sm mt-1">{document.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roll Number</p>
              <p className="font-medium text-sm mt-1">{document.roll_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Application Number</p>
              <p className="font-medium text-sm mt-1">{document.application_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium text-sm mt-1">{document.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mother's Name</p>
              <p className="font-medium text-sm mt-1">{document.mothers_name}</p>
            </div>
          </>
        );
      default:
        return null;
    }
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

  if (!user || role !== "admin") {
    return null;
  }

  return (
    <Layout>
      <TabNavigation />
      <PageTransition>
        <div className="container py-8 px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manual Document Verification</p>
          </header>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <DocumentStatsCard 
              title="Pending Verification" 
              value={pendingDocuments.length} 
              icon={<Clock className="h-5 w-5" />}
              variant="pending"
            />
            <DocumentStatsCard 
              title="Verified Today" 
              value={verifiedDocuments.filter(doc => 
                doc.verifiedAt && doc.verifiedAt.toDateString() === new Date().toDateString()
              ).length} 
              icon={<CheckCircle className="h-5 w-5 text-green-500" />}
              variant="verified"
            />
            <DocumentStatsCard 
              title="Total Verified" 
              value={verifiedDocuments.length} 
              icon={<CheckCircle className="h-5 w-5 text-green-500" />}
              variant="verified"
            />
          </div>

          <div className="mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pending documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5" /> Documents Pending Verification
            </h2>
            <DocumentTable 
              documents={pendingDocuments.filter(doc => 
                searchTerm 
                  ? (doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    doc.user.toLowerCase().includes(searchTerm.toLowerCase()))
                  : true
              )} 
              onView={(doc) => setSelectedDocument(doc)} 
              emptyMessage="No documents pending verification"
            />
          </div>

          {selectedDocument && (
            <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
              <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-2xl truncate">{selectedDocument.documentName}</DialogTitle>
                  <DialogDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedDocument.timestamp.toLocaleDateString()}</span>
                    </div>
                    <span className="hidden sm:block">•</span>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium capitalize text-sm">{selectedDocument.documentType}</span>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                  <div className="flex flex-col border rounded-lg overflow-hidden bg-muted/20 h-full">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h4 className="font-medium flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Document Preview
                      </h4>
                      <div className="flex items-center gap-2">
                        {selectedDocument.fileType === 'image' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleZoomOut}
                              disabled={documentPreviewZoom <= minZoom}
                            >
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleResetZoom}
                            >
                              {Math.round(documentPreviewZoom * 100)}%
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleZoomIn}
                              disabled={documentPreviewZoom >= maxZoom}
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <a 
                          href={selectedDocument.cloudinaryUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                    <div 
                      className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 relative"
                    >
                      <DocumentPreview 
                        document={selectedDocument} 
                        zoom={documentPreviewZoom} 
                        containerRef={documentPreviewContainerRef}
                      />
                    </div>
                    <div className="p-4 border-t text-sm text-muted-foreground flex justify-between items-center">
                      <span>{selectedDocument.fileName}</span>
                      <span>{formatFileSize(selectedDocument.fileSize)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col border rounded-lg overflow-hidden bg-muted/20 h-full">
                    <div className="p-4 border-b">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Document Details
                      </h4>
                    </div>
                    <div className="flex-1 overflow-auto p-6 space-y-6">
                      <div className="space-y-4">
                        <h5 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                          Basic Information
                        </h5>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Document ID</p>
                            <p className="font-medium text-sm mt-1 break-all">
                              {selectedDocument.id}
                            </p>
                          </div>
                          {selectedDocument.verifiedAt && (
                            <div>
                              <p className="text-sm text-muted-foreground">Verified At</p>
                              <p className="font-medium text-sm mt-1">
                                {selectedDocument.verifiedAt.toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                          Document Information
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          {getDocumentSpecificFields(selectedDocument)}
                        </div>
                      </div>

                      {selectedDocument.verificationResult && (
                        <div className="space-y-4">
                          <h5 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                            Verification Results
                          </h5>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left pb-2 text-muted-foreground">Field</th>
                                    <th className="text-left pb-2 text-muted-foreground">Result</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(selectedDocument.verificationResult).map(([key, value]) => (
                                    <tr key={key} className="border-b last:border-b-0">
                                      <td className="py-2 capitalize">{key.replace(/_/g, ' ')}</td>
                                      <td className="py-2">
                                        <Badge 
                                          variant={value === "Match" ? "default" : "destructive"}
                                          className="capitalize"
                                        >
                                          {value}
                                        </Badge>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="gap-2 mt-4">
                  <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                    Close
                  </Button>
                  {selectedDocument.status === "pending" && (
                    <>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt("Please enter rejection reason:", "Manual rejection by admin");
                          if (reason) handleRejectDocument(selectedDocument.id, reason);
                        }}
                      >
                        Reject
                      </Button>
                      <Button 
                        onClick={() => handleVerifyDocument(selectedDocument.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve & Verify
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </PageTransition>
    </Layout>
  );
};

export default AdminDashboard;