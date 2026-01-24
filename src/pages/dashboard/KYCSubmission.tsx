import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Upload, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  CreditCard,
  Shield,
  Loader2,
  Image as ImageIcon,
  X,
  Mail,
  Phone
} from 'lucide-react';

const KYCSubmission: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gmail, setGmail] = useState(profile?.kyc_gmail || '');
  const [whatsapp, setWhatsapp] = useState(profile?.kyc_whatsapp || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateGmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return gmailRegex.test(email);
  };

  const validateWhatsapp = (phone: string) => {
    // Basic phone validation - at least 10 digits
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

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
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      // Update profile with KYC document URL and contact info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          kyc_document_url: fileName,
          kyc_status: 'pending',
          kyc_submitted_at: new Date().toISOString(),
          kyc_gmail: gmail.trim().toLowerCase(),
          kyc_whatsapp: whatsapp.trim(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Document uploaded successfully! Your KYC is under review.');
      clearSelection();
      refreshProfile();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
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
          description: 'Your document was not accepted. Please upload a clear, valid document.',
          badgeClass: 'badge-error',
        };
      default:
        return {
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          title: 'KYC Pending',
          description: profile?.kyc_document_url 
            ? 'Your document is being reviewed. This usually takes 24-48 hours.'
            : 'Please upload your National ID Card or Passport to verify your identity.',
          badgeClass: 'badge-warning',
        };
    }
  };

  const statusInfo = getStatusInfo();

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

      {/* Upload Section - Only show if not approved */}
      {profile?.kyc_status !== 'approved' && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Identity Document
            </CardTitle>
            <CardDescription>
              Upload a clear photo of your National ID Card or Passport
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-secondary/30">
                <CreditCard className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">National ID Card</p>
                  <p className="text-sm text-muted-foreground">Front side with photo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-secondary/30">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Passport</p>
                  <p className="text-sm text-muted-foreground">Photo page only</p>
                </div>
              </div>
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

            {/* Upload Area */}
            <div 
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all
                ${selectedFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
            >
              {!selectedFile ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-primary/10">
                      <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or PDF (max 5MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="kyc-upload"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {previewUrl && (
                    <div className="flex justify-center">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-48 rounded-lg object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <FileCheck className="w-5 h-5 text-green-500" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-muted-foreground text-sm">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={clearSelection}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || uploading || !gmail.trim() || !whatsapp.trim()}
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
                  <li>Ensure the document is clearly visible and not blurry</li>
                  <li>All corners of the document must be visible</li>
                  <li>No glare or shadows covering the text</li>
                  <li>Document must be valid and not expired</li>
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
    </div>
  );
};

export default KYCSubmission;
