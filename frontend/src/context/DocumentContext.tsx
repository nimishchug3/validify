import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export type DocumentStatus = "pending" | "verified" | "manual_verification" | "rejected";

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: string;
  description?: string;
  file: string; // URL to the file
  status: DocumentStatus;
  uploadDate: Date;
  verificationDate?: Date;
}

interface DocumentContextType {
  documents: Document[];
  uploadDocument: (type: string, name: string, file: File, description?: string) => Promise<void>;
  verifyDocument: (documentId: string) => Promise<void>;
  getDocuments: () => Document[];
  getDocumentsByUser: (userId: string) => Document[];
  updateDocumentStatus: (documentId: string, status: DocumentStatus) => void;
}

// Mock documents for demo
const MOCK_DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    userId: "user-1",
    name: "Passport",
    type: "identification",
    description: "International passport for travel and identification",
    file: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?q=80&w=1000&auto=format&fit=crop",
    status: "verified",
    uploadDate: new Date(2023, 0, 15),
    verificationDate: new Date(2023, 0, 16)
  },
  {
    id: "doc-2",
    userId: "user-1",
    name: "Domicile Certificate",
    type: "residence",
    description: "Certificate of permanent residence",
    file: "https://images.unsplash.com/photo-1556125574-d7f27ec36a06?q=80&w=1000&auto=format&fit=crop",
    status: "pending",
    uploadDate: new Date(2023, 1, 10)
  },
  {
    id: "doc-3",
    userId: "user-1",
    name: "Birth Certificate",
    type: "identification",
    description: "Official birth record issued by government",
    file: "https://images.unsplash.com/photo-1580121441575-41bcb5c6b47c?q=80&w=1000&auto=format&fit=crop",
    status: "manual_verification",
    uploadDate: new Date(2023, 2, 5)
  }
];

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([...MOCK_DOCUMENTS]);

  useEffect(() => {
    // Load documents from localStorage if available
    const savedDocuments = localStorage.getItem("validify-documents");
    if (savedDocuments) {
      // Convert date strings back to Date objects
      const parsedDocs = JSON.parse(savedDocuments).map((doc: any) => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate),
        verificationDate: doc.verificationDate ? new Date(doc.verificationDate) : undefined
      }));
      setDocuments(parsedDocs);
    }
  }, []);

  // Save documents to localStorage
  useEffect(() => {
    localStorage.setItem("validify-documents", JSON.stringify(documents));
  }, [documents]);

  const uploadDocument = async (type: string, name: string, file: File, description?: string) => {
    if (!user) {
      toast.error("You must be logged in to upload documents");
      return Promise.reject("Not authenticated");
    }

    try {
      // In a real app, you would upload to a server/cloud storage
      // For this demo, we'll create a fake URL using object URL
      const fileUrl = URL.createObjectURL(file);
      
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        userId: user.id,
        name,
        type,
        description,
        file: fileUrl,
        status: "pending",
        uploadDate: new Date()
      };
      
      setDocuments(prev => [...prev, newDocument]);
      toast.success("Document uploaded successfully");
      return Promise.resolve();
    } catch (error) {
      toast.error("Failed to upload document");
      return Promise.reject(error);
    }
  };

  const verifyDocument = async (documentId: string) => {
    try {
      // Simulate verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly determine if verification passes or fails
      const isVerified = Math.random() > 0.3;
      
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          return {
            ...doc,
            status: isVerified ? "verified" : "manual_verification",
            verificationDate: isVerified ? new Date() : undefined
          };
        }
        return doc;
      }));
      
      if (isVerified) {
        toast.success("Document verified successfully");
      } else {
        toast.info("Document sent for manual verification");
      }
      
      return Promise.resolve();
    } catch (error) {
      toast.error("Verification process failed");
      return Promise.reject(error);
    }
  };

  const getDocuments = () => {
    return documents;
  };

  const getDocumentsByUser = (userId: string) => {
    return documents.filter(doc => doc.userId === userId);
  };

  const updateDocumentStatus = (documentId: string, status: DocumentStatus) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          status,
          verificationDate: status === "verified" ? new Date() : undefined
        };
      }
      return doc;
    }));
    
    let statusDisplay = status.replace('_', ' ');
    if (status === "verified") {
      toast.success(`Document verified successfully`);
    } else if (status === "rejected") {
      toast.error(`Document rejected`);
    } else {
      toast.info(`Document status updated to ${statusDisplay}`);
    }
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      uploadDocument,
      verifyDocument,
      getDocuments,
      getDocumentsByUser,
      updateDocumentStatus
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
};
