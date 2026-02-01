import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import ImageCropper from '@/components/ImageCropper';
import { 
  Upload, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  CreditCard,
  Loader2,
  Image as ImageIcon,
  X,
  Mail,
  Phone,
  PenLine,
  Video,
  Image,
  Mic,
  Search,
  Users,
  Briefcase,
  FileText,
  BookOpen
} from 'lucide-react';

const specialtyConfig = {
  script_writer: { label: 'Script Writer', icon: PenLine, color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  video_editor: { label: 'Video Editor', icon: Video, color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  thumbnail_designer: { label: 'Thumbnail Designer', icon: Image, color: 'bg-pink-500/10 text-pink-500 border-pink-500/30' },
  voice_over_artist: { label: 'Voice Over Artist', icon: Mic, color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
  seo_specialist: { label: 'SEO Specialist', icon: Search, color: 'bg-green-500/10 text-green-500 border-green-500/30' },
  channel_manager: { label: 'Channel Manager', icon: Users, color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' },
} as const;

type DocumentType = 'cnic' | 'passport' | 'form_b';

interface SelectedDocument {
  file: File | null;
  previewUrl: string | null;
  croppedBlob: Blob | null;
  croppedUrl: string | null;
}

const documentTypeConfig = {
  cnic: {
    label: 'CNIC',
    description: 'National Identity Card (Front & Back)',
    icon: CreditCard,
    requiresBack: true,
    aspectRatio: 1.586,
  },
  passport: {
    label: 'Passport',
    description: 'Valid Passport (Photo Page)',
    icon: BookOpen,
    requiresBack: false,
    aspectRatio: 0.707, // A4/Passport page aspect ratio
  },
  form_b: {
    label: 'Form B',
    description: 'Child Registration Certificate',
    icon: FileText,
    requiresBack: false,
    aspectRatio: 0.707,
  },
};

const KYCSubmission: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [gmail, setGmail] = useState(profile?.kyc_gmail || '');
  const [whatsapp, setWhatsapp] = useState(profile?.kyc_whatsapp || '');
  const [documentType, setDocumentType] = useState<DocumentType>('cnic');
  
  // Front side document (or single document for passport/form_b)
  const [frontDoc, setFrontDoc] = useState<SelectedDocument>({
    file: null,
    previewUrl: null,
    croppedBlob: null,
    croppedUrl: null,
  });
  const frontInputRef = useRef<HTMLInputElement>(null);
  const [showFrontCropper, setShowFrontCropper] = useState(false);
  
  // Back side document (only for CNIC)
  const [backDoc, setBackDoc] = useState<SelectedDocument>({
    file: null,
    previewUrl: null,
    croppedBlob: null,
    croppedUrl: null,
  });
  const backInputRef = useRef<HTMLInputElement>(null);
  const [showBackCropper, setShowBackCropper] = useState(false);

  const currentDocConfig = documentTypeConfig[documentType];

  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    // Clear documents when switching type
    clearFrontSelection();
    clearBackSelection();
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - only images for cropping
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPG or PNG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const url = URL.createObjectURL(file);
      
      if (side === 'front') {
        setFrontDoc({ file, previewUrl: url, croppedBlob: null, croppedUrl: null });
        setShowFrontCropper(true);
      } else {
        setBackDoc({ file, previewUrl: url, croppedBlob: null, croppedUrl: null });
        setShowBackCropper(true);
      }
    }
  };

  const handleFrontCropComplete = (blob: Blob, url: string) => {
    setFrontDoc(prev => ({ ...prev, croppedBlob: blob, croppedUrl: url }));
  };

  const handleBackCropComplete = (blob: Blob, url: string) => {
    setBackDoc(prev => ({ ...prev, croppedBlob: blob, croppedUrl: url }));
  };

  const clearFrontSelection = () => {
    if (frontDoc.previewUrl) URL.revokeObjectURL(frontDoc.previewUrl);
    if (frontDoc.croppedUrl) URL.revokeObjectURL(frontDoc.croppedUrl);
    setFrontDoc({ file: null, previewUrl: null, croppedBlob: null, croppedUrl: null });
    if (frontInputRef.current) frontInputRef.current.value = '';
  };

  const clearBackSelection = () => {
    if (backDoc.previewUrl) URL.revokeObjectURL(backDoc.previewUrl);
    if (backDoc.croppedUrl) URL.revokeObjectURL(backDoc.croppedUrl);
    setBackDoc({ file: null, previewUrl: null, croppedBlob: null, croppedUrl: null });
    if (backInputRef.current) backInputRef.current.value = '';
  };

  const validateGmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return gmailRegex.test(email);
  };

  const validateWhatsapp = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const handleUpload = async () => {
    if (!frontDoc.croppedBlob || !user) return;
    
    // For CNIC, back is also required
    if (currentDocConfig.requiresBack && !backDoc.croppedBlob) {
      toast.error('Please upload both front and back sides of your CNIC');
      return;
    }

    // Validate Gmail
    if (!gmail.trim()) {
      toast.error('Please enter your Gmail address');
      return;
    }
    if (!validateGmail(gmail)) {
      toast.error('Please enter a valid Gmail address (must end with @gmail.com)');
      return;
    }

    // Validate WhatsApp
    if (!whatsapp.trim()) {
      toast.error('Please enter your WhatsApp number');
      return;
    }
    if (!validateWhatsapp(whatsapp)) {
      toast.error('Please enter a valid WhatsApp number (include country code, e.g., +1234567890)');
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      
      // Upload front side / main document
      const frontFileName = `${user.id}/${timestamp}_${documentType}_front.jpg`;
      const { error: frontUploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(frontFileName, frontDoc.croppedBlob);
      if (frontUploadError) throw frontUploadError;

      let backFileName: string | null = null;
      
      // Upload back side only for CNIC
      if (currentDocConfig.requiresBack && backDoc.croppedBlob) {
        backFileName = `${user.id}/${timestamp}_${documentType}_back.jpg`;
        const { error: backUploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(backFileName, backDoc.croppedBlob);
        if (backUploadError) throw backUploadError;
      }

      // Update profile with document URLs and contact info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          kyc_document_url: frontFileName,
          kyc_document_back_url: backFileName,
          kyc_status: 'pending',
          kyc_submitted_at: new Date().toISOString(),
          kyc_gmail: gmail.trim().toLowerCase(),
          kyc_whatsapp: whatsapp.trim(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Documents uploaded successfully! Your KYC is under review.');
      clearFrontSelection();
      clearBackSelection();
      refreshProfile();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const getStatusInfo = () => {
    switch (profile?.kyc_status) {
      case 'approved':
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
          title: 'KYC Approved',
          description: 'Your identity has been verified successfully.',
          badgeClass: 'badge-success',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          title: 'KYC Rejected',
          description: 'Your document was not accepted. Please upload clear, valid documents.',
          badgeClass: 'badge-error',
        };
      default:
        return {
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          title: 'KYC Pending',
          description: profile?.kyc_document_url 
            ? 'Your documents are being reviewed. This usually takes 24-48 hours.'
            : 'Please upload your identity document to verify your identity.',
          badgeClass: 'badge-warning',
        };
    }
  };

  const statusInfo = getStatusInfo();
  
  // Check if can submit based on document type
  const canSubmit = frontDoc.croppedBlob && 
    (!currentDocConfig.requiresBack || backDoc.croppedBlob) && 
    gmail.trim() && 
    whatsapp.trim();

  const getDocumentLabel = () => {
    switch (documentType) {
      case 'cnic':
        return { front: 'Front of CNIC', back: 'Back of CNIC' };
      case 'passport':
        return { front: 'Passport Photo Page', back: '' };
      case 'form_b':
        return { front: 'Form B Document', back: '' };
    }
  };

  const docLabels = getDocumentLabel();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">KYC Verification</h1>
        <p className="text-muted-foreground mt-1">
          Verify your identity to unlock full platform access.
        </p>
      </div>

      {/* Status Card */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {statusInfo.icon}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{statusInfo.title}</h3>
                <Badge className={statusInfo.badgeClass}>
                  {profile?.kyc_status || 'pending'}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {statusInfo.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Skills Card */}
      {(profile?.specialties && profile.specialties.length > 0) || profile?.specialty ? (
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-primary" />
              Professional Skills
            </CardTitle>
            <CardDescription>Your selected areas of expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(profile?.specialties || (profile?.specialty ? [profile.specialty] : [])).map((specialty) => {
                const config = specialtyConfig[specialty as keyof typeof specialtyConfig];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <div
                    key={specialty}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border ${config.color} transition-all hover:scale-105`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Upload Section - Only show if not approved */}
      {profile?.kyc_status !== 'approved' && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Identity Document
            </CardTitle>
            <CardDescription>
              Choose your document type and upload clear photos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Document Type <span className="text-destructive">*</span></Label>
              <RadioGroup 
                value={documentType} 
                onValueChange={(value) => handleDocumentTypeChange(value as DocumentType)}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                {(Object.entries(documentTypeConfig) as [DocumentType, typeof documentTypeConfig[DocumentType]][]).map(([type, config]) => {
                  const Icon = config.icon;
                  const isSelected = documentType === type;
                  return (
                    <div key={type}>
                      <RadioGroupItem value={type} id={type} className="sr-only" />
                      <Label
                        htmlFor={type}
                        className={`
                          flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                          }
                        `}
                      >
                        <div className={`p-3 rounded-full ${isSelected ? 'bg-primary/20' : 'bg-secondary'}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold ${isSelected ? 'text-primary' : ''}`}>{config.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Document Upload Areas */}
            <div className={`grid grid-cols-1 ${currentDocConfig.requiresBack ? 'md:grid-cols-2' : ''} gap-4`}>
              {/* Front Side / Main Document Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {currentDocConfig.requiresBack ? 'Front Side' : 'Document'} <span className="text-destructive">*</span>
                </Label>
                <div 
                  className={`
                    border-2 border-dashed rounded-xl p-4 text-center transition-all min-h-[180px] flex flex-col items-center justify-center
                    ${frontDoc.croppedUrl ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                >
                  {!frontDoc.croppedUrl ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-primary/10">
                          <ImageIcon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{docLabels.front}</p>
                        <p className="text-xs text-muted-foreground">JPG or PNG (max 5MB)</p>
                      </div>
                      <input
                        ref={frontInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => handleFileSelect(e, 'front')}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => frontInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 w-full">
                      <img 
                        src={frontDoc.croppedUrl} 
                        alt="Document preview" 
                        className="max-h-28 rounded-lg object-contain mx-auto"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <FileCheck className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Document ready</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={clearFrontSelection}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Side Upload - Only for CNIC */}
              {currentDocConfig.requiresBack && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Back Side <span className="text-destructive">*</span></Label>
                  <div 
                    className={`
                      border-2 border-dashed rounded-xl p-4 text-center transition-all min-h-[180px] flex flex-col items-center justify-center
                      ${backDoc.croppedUrl ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    `}
                  >
                    {!backDoc.croppedUrl ? (
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <div className="p-3 rounded-full bg-primary/10">
                            <ImageIcon className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{docLabels.back}</p>
                          <p className="text-xs text-muted-foreground">JPG or PNG (max 5MB)</p>
                        </div>
                        <input
                          ref={backInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={(e) => handleFileSelect(e, 'back')}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => backInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Select Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 w-full">
                        <img 
                          src={backDoc.croppedUrl} 
                          alt="Back side preview" 
                          className="max-h-28 rounded-lg object-contain mx-auto"
                        />
                        <div className="flex items-center justify-center gap-2">
                          <FileCheck className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Back side ready</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={clearBackSelection}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Gmail Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="gmail"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Must be a valid Gmail address
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+1234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +92, +1)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleUpload}
                disabled={!canSubmit || uploading}
                className="min-w-[150px]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>

            {/* Guidelines */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Document Guidelines:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  {documentType === 'cnic' && (
                    <li>Ensure both sides of the CNIC are clearly visible</li>
                  )}
                  {documentType === 'passport' && (
                    <li>Upload the photo page of your passport with all details visible</li>
                  )}
                  {documentType === 'form_b' && (
                    <li>Upload a clear photo of the complete Form B document</li>
                  )}
                  <li>All corners of the document must be visible</li>
                  <li>No glare or shadows covering the text</li>
                  <li>Document must be valid and not expired</li>
                  <li>Use the crop tool to adjust the image if needed</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Success Message for Approved */}
      {profile?.kyc_status === 'approved' && (
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Verification Complete</h3>
                <p className="text-muted-foreground">
                  You have full access to all platform features. Thank you for verifying your identity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Croppers */}
      {frontDoc.previewUrl && (
        <ImageCropper
          open={showFrontCropper}
          onClose={() => setShowFrontCropper(false)}
          imageSrc={frontDoc.previewUrl}
          onCropComplete={handleFrontCropComplete}
          aspectRatio={currentDocConfig.aspectRatio}
          title={`Crop ${docLabels.front}`}
          description={`Adjust the crop area to fit your ${currentDocConfig.label}`}
        />
      )}
      
      {backDoc.previewUrl && currentDocConfig.requiresBack && (
        <ImageCropper
          open={showBackCropper}
          onClose={() => setShowBackCropper(false)}
          imageSrc={backDoc.previewUrl}
          onCropComplete={handleBackCropComplete}
          aspectRatio={currentDocConfig.aspectRatio}
          title={`Crop ${docLabels.back}`}
          description={`Adjust the crop area to fit your ${currentDocConfig.label} back side`}
        />
      )}
    </div>
  );
};

export default KYCSubmission;
