/**
 * @fileoverview Print Preview Page
 * 
 * Clinician-only page for reviewing the styled document,
 * printing, and publishing for patient access.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PrintableDocument } from '@/components/print/PrintableDocument';
import { usePublishedDocument } from '@/hooks/usePublishedDocument';
import { ChevronLeft, Printer, Share2, Copy, Check, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationState {
  sections: { title: string; content: string }[];
  clinicianName: string;
  language: string;
  hospitalName?: string;
}

/**
 * Print Preview page for clinicians
 */
export default function PrintPreview() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get data passed from approval page
  const state = location.state as LocationState | null;
  
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { 
    publishDocument, 
    getDocumentForCase,
    getDocumentUrl,
    isPublishing 
  } = usePublishedDocument();

  // Check for existing published document
  useEffect(() => {
    if (caseId) {
      getDocumentForCase(caseId).then(doc => {
        if (doc) {
          setPublishedUrl(getDocumentUrl(doc.access_token));
        }
      });
    }
  }, [caseId]);

  // Redirect if no state passed
  if (!state) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>No Document Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please go through the approval flow to access print preview.
            </p>
            <Button onClick={() => navigate('/app')}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { sections, clinicianName, language, hospitalName } = state;
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  /**
   * Handles browser print dialog
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Publishes document and generates shareable link
   */
  const handlePublish = async () => {
    if (!caseId) return;
    
    const token = await publishDocument(
      caseId,
      sections,
      clinicianName,
      language,
      hospitalName
    );
    
    if (token) {
      setPublishedUrl(getDocumentUrl(token));
    }
  };

  /**
   * Copies URL to clipboard
   */
  const handleCopyUrl = async () => {
    if (!publishedUrl) return;
    
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Patient document URL copied to clipboard'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  /**
   * Navigate back to approval step
   */
  const handleBack = () => {
    navigate('/app', { state: { returnToCaseId: caseId, navigateToStep: 'approval' } });
  };

  /**
   * Navigate to feedback step
   */
  const handleContinueToFeedback = () => {
    navigate('/app', { state: { returnToCaseId: caseId, navigateToStep: 'feedback' } });
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Action Bar - Hidden on print */}
      <div className="no-print sticky top-0 z-10 bg-background border-b p-4">
        <div className="max-w-[210mm] mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print for Patient
            </Button>
            
            {!publishedUrl ? (
              <Button 
                onClick={handlePublish} 
                disabled={isPublishing}
                variant="outline"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Publish & Share
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input 
                  value={publishedUrl} 
                  readOnly 
                  className="w-64 text-sm"
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            <Button onClick={handleContinueToFeedback}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Continue to Feedback
            </Button>
          </div>
        </div>
      </div>

      {/* Published confirmation - Hidden on print (QR only in printed document footer) */}
      {publishedUrl && (
        <div className="no-print max-w-[210mm] mx-auto p-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-green-900">Document Published</h3>
              <p className="text-sm text-green-700">
                The QR code on the printed document will allow patients to access their care document online.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Printable Document */}
      <PrintableDocument
        sections={sections}
        language={language}
        clinicianName={clinicianName}
        hospitalName={hospitalName}
        date={date}
        documentUrl={publishedUrl || undefined}
        showQrCode={!!publishedUrl}
      />
    </div>
  );
}
