import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload } from "lucide-react";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../config";
import axios from "axios";

const UploadPage = () => {
  const navigate = useNavigate();
  const user = sessionStorage.getItem("email");

  // State management remains the same as previous version
  const [activeTab, setActiveTab] = useState("ssc");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for documents
  const [sscFile, setSscFile] = useState(null);
  const [sscData, setSscData] = useState({
    name: "",
    roll_no: "",
    result: "Pass"
  });

  const [domicileFile, setDomicileFile] = useState(null);
  const [domicileData, setDomicileData] = useState({
    name: "",
    certificate_number: "",
    state: "Maharashtra"
  });

  const [cetFile, setCetFile] = useState(null);
  const [cetData, setCetData] = useState({
    name: "",
    roll_no: "",
    application_no: "",
    category: "OPEN",
    mothers_name: ""
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  // File change handler remains the same
  const handleFileChange = (e, setFile) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only PDF, JPEG, or PNG files are allowed");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  // Cloudinary upload function
  const uploadToCloudinary = async (file, docType) => {
    const formData = new FormData();
    
    // Direct configuration
    const cloudName = 'dbyj348bv';
    const uploadPreset = 'document_upload';
    const apiKey = '987225199998984';
  
    // Timestamp for signature
    const timestamp = Math.round((new Date).getTime()/1000);
    
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `document_verification/${docType}`);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      return {
        url: response.data.secure_url,
        publicId: response.data.public_id
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error.response ? error.response.data : error.message);
      throw new Error('Failed to upload file to Cloudinary');
    }
  };

  // Document verification function (can be modified as needed)
  const handleDocumentUpload = async (docType, formData, file) => {
    const data = new FormData();
    
    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    
    // Add file
    data.append("document_file", file);

    const response = await fetch(`http://127.0.0.1:8000/api/${docType}/`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    return await response.json();
  };

  // Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsUploading(true);
  
    try {
      // Determine which document we're uploading based on active tab
      let docType, formData, file, docName;
      
      switch (activeTab) {
        case "ssc":
          docType = "ssc";
          formData = sscData;
          file = sscFile;
          docName = "10th Marksheet";
          break;
        case "domicile":
          docType = "domicile";
          formData = domicileData;
          file = domicileFile;
          docName = "Domicile Certificate";
          break;
        case "cet":
          docType = "cet";
          formData = cetData;
          file = cetFile;
          docName = "CET Marksheet";
          break;
        default:
          throw new Error("Invalid document type");
      }
  
      // Validate required fields
      if (!file) {
        throw new Error(`Please select a file for ${docName}`);
      }
  
      // Check all required fields are filled
      const requiredFields = {
        ssc: ["name", "roll_no"],
        domicile: ["name", "certificate_number", "state"],
        cet: ["name", "roll_no", "application_no", "category", "mothers_name"]
      }[docType];
  
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill all required fields for ${docName}`);
      }
  
      // Upload document to verification API
      const verificationResult = await handleDocumentUpload(docType, formData, file);
  
      // Upload file to Cloudinary
      const cloudinaryUpload = await uploadToCloudinary(file, docType);
  
      // Check verification status
      const isVerified = Object.values(verificationResult).every(
        value => value === "Match"
      );
  
      // Prepare document data for Firestore
      const docData = {
        user,
        documentType: docType,
        documentName: docName,
        fileName: file.name,
        fileSize: file.size,
        status: isVerified ? "verified" : "pending",
        timestamp: new Date(),
        cloudinaryUrl: cloudinaryUpload.url,
        cloudinaryPublicId: cloudinaryUpload.publicId,
        ...formData,
        verificationResult
      };
  
      // Store in Firestore
      const collectionName = isVerified ? "verified" : "pending";
      const docRef = doc(db, collectionName, `${user}_${docType}_${Date.now()}`);
      await setDoc(docRef, docData);
  
      setSuccess(
        `${docName} ${isVerified ? "verified and " : ""}uploaded successfully!`
      );
  
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "An error occurred during upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <PageTransition>
        <div className="container max-w-3xl mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload and verify your academic documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ssc">10th Marksheet</TabsTrigger>
                  <TabsTrigger value="domicile">Domicile</TabsTrigger>
                  <TabsTrigger value="cet">CET Marksheet</TabsTrigger>
                </TabsList>

                {error && (
                  <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mt-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* SSC Marksheet Tab */}
                  <TabsContent value="ssc" className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="ssc-name">Full Name *</Label>
                      <Input
                        id="ssc-name"
                        value={sscData.name}
                        onChange={(e) => setSscData({...sscData, name: e.target.value})}
                        placeholder="As it appears on your marksheet"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ssc-roll_no">Roll Number *</Label>
                      <Input
                        id="ssc-roll_no"
                        value={sscData.roll_no}
                        onChange={(e) => setSscData({...sscData, roll_no: e.target.value})}
                        placeholder="Your examination roll number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ssc-result">Result</Label>
                      <Select
                        value={sscData.result}
                        onValueChange={(value) => setSscData({...sscData, result: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pass">Pass</SelectItem>
                          <SelectItem value="Fail">Fail</SelectItem>
                          <SelectItem value="Compartment">Compartment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ssc-file">Marksheet File *</Label>
                      <Input
                        id="ssc-file"
                        type="file"
                        onChange={(e) => handleFileChange(e, setSscFile)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        PDF, JPEG, or PNG (Max 5MB)
                      </p>
                    </div>
                  </TabsContent>

                  {/* Domicile Certificate Tab */}
                  <TabsContent value="domicile" className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="domicile-name">Full Name *</Label>
                      <Input
                        id="domicile-name"
                        value={domicileData.name}
                        onChange={(e) => setDomicileData({...domicileData, name: e.target.value})}
                        placeholder="As it appears on your certificate"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domicile-certificate_number">Certificate Number *</Label>
                      <Input
                        id="domicile-certificate_number"
                        value={domicileData.certificate_number}
                        onChange={(e) => setDomicileData({...domicileData, certificate_number: e.target.value})}
                        placeholder="Certificate number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domicile-state">State *</Label>
                      <Input
                        id="domicile-state"
                        value={domicileData.state}
                        onChange={(e) => setDomicileData({...domicileData, state: e.target.value})}
                        placeholder="State"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domicile-file">Certificate File *</Label>
                      <Input
                        id="domicile-file"
                        type="file"
                        onChange={(e) => handleFileChange(e, setDomicileFile)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        PDF, JPEG, or PNG (Max 5MB)
                      </p>
                    </div>
                  </TabsContent>

                  {/* CET Marksheet Tab */}
                  <TabsContent value="cet" className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cet-name">Full Name *</Label>
                      <Input
                        id="cet-name"
                        value={cetData.name}
                        onChange={(e) => setCetData({...cetData, name: e.target.value})}
                        placeholder="As it appears on your marksheet"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cet-roll_no">Roll Number *</Label>
                      <Input
                        id="cet-roll_no"
                        value={cetData.roll_no}
                        onChange={(e) => setCetData({...cetData, roll_no: e.target.value})}
                        placeholder="Your CET roll number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cet-application_no">Application Number *</Label>
                      <Input
                        id="cet-application_no"
                        value={cetData.application_no}
                        onChange={(e) => setCetData({...cetData, application_no: e.target.value})}
                        placeholder="Your CET application number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cet-category">Category *</Label>
                      <Select
                        value={cetData.category}
                        onValueChange={(value) => setCetData({...cetData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">OPEN</SelectItem>
                          <SelectItem value="OBC">OBC</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="ST">ST</SelectItem>
                          <SelectItem value="NT">NT</SelectItem>
                          <SelectItem value="EWS">EWS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cet-mothers_name">Mother's Name *</Label>
                      <Input
                        id="cet-mothers_name"
                        value={cetData.mothers_name}
                        onChange={(e) => setCetData({...cetData, mothers_name: e.target.value})}
                        placeholder="Mother's name as on marksheet"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cet-file">Marksheet File *</Label>
                      <Input
                        id="cet-file"
                        type="file"
                        onChange={(e) => handleFileChange(e, setCetFile)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        PDF, JPEG, or PNG (Max 5MB)
                      </p>
                    </div>
                  </TabsContent>

                  <CardFooter className="flex justify-end gap-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Document
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default UploadPage;