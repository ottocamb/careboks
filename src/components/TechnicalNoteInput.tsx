import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Shield, File, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { pdfToImageDataUrls } from "@/utils/pdfToImages";
import { extractTextDirectly } from "@/utils/pdfTextExtraction";

interface TechnicalNoteInputProps {
  onNext: (note: string) => void;
}

const TechnicalNoteInput = ({ onNext }: TechnicalNoteInputProps) => {
  const [note, setNote] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const sampleNote = `Patient: 67-year-old male with acute decompensated heart failure, NYHA Class III
EF: 35% on echocardiogram
BNP: 2,450 pg/mL (significantly elevated)
Current medications: Furosemide 40mg BID, Metoprolol 25mg BID, Lisinopril 10mg daily
Physical exam: JVD present, bilateral lower extremity edema +2, rales in bilateral lung bases
Recent admission for volume overload, responding to IV diuretics
Discharge plan: Continue oral diuretics, cardiology follow-up in 2 weeks, daily weights
Patient education: fluid restriction 2L daily, low sodium diet <2g daily, medication compliance critical`;

  const handleSampleLoad = () => {
    setNote(sampleNote);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (uploadedFiles.length + files.length > 10) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 10 documents.",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        toast({
          title: "Unsupported file type",
          description: `${file.name}: This file type cannot be processed. Please upload a PDF or image.`,
          variant: "destructive",
        });
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setIsProcessing(true);

    try {
      let combinedText = note;

      for (const file of validFiles) {
        if (file.type === 'application/pdf') {
          // Try direct text extraction first
          const directText = await extractTextDirectly(file, 5);
          
          if (directText.trim().length > 100) {
            // Success! We got text directly from the PDF
            console.log(`Direct extraction successful for ${file.name}`);
            combinedText += (combinedText ? '\n\n' : '') + 
              `--- Extracted from ${file.name} ---\n${directText}`;
            continue; // Move to next file
          }
          
          // Fallback to OCR for scanned PDFs
          console.log(`Falling back to OCR for ${file.name} (scanned document detected)`);
          let pageIndex = 0;
          try {
            const images = await pdfToImageDataUrls(file, { maxPages: 5, scale: 1.0 });
            for (const imgUrl of images) {
              pageIndex++;
              const { data, error } = await supabase.functions.invoke('extract-text-from-document', {
                body: { fileData: imgUrl, fileType: 'image/png' }
              });

              if (error) {
                toast({
                  title: "Extraction failed",
                  description: `Could not extract text from ${file.name} (page ${pageIndex}). Please review and make corrections.`,
                  variant: "destructive",
                });
                continue;
              }

              if (data?.extractedText) {
                combinedText += (combinedText ? '\n\n' : '') + `--- Extracted from ${file.name} (page ${pageIndex}) ---\n${data.extractedText}`;
              }
            }
          } catch (e) {
            console.error('PDF processing error:', e);
            toast({
              title: "PDF processing error",
              description: `We could not process ${file.name}. Please review and make corrections.`,
              variant: "destructive",
            });
          }
        } else {
          // Image: send directly for OCR
          const reader = new FileReader();
          const fileData = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const { data, error } = await supabase.functions.invoke('extract-text-from-document', {
            body: { fileData, fileType: file.type }
          });

          if (error) {
            toast({
              title: "Extraction failed",
              description: `Could not extract text from ${file.name}. Please review and make corrections manually.`,
              variant: "destructive",
            });
            continue;
          }

          if (data?.extractedText) {
            combinedText += (combinedText ? '\n\n' : '') + `--- Extracted from ${file.name} ---\n${data.extractedText}`;
          }
        }
      }

      setNote(combinedText);
      toast({
        title: "Text extracted",
        description: "Please review and edit the extracted text before continuing.",
      });

    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing error",
        description: "We could not extract all text. Please review and make corrections.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (note.trim()) {
      onNext(note);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Technical Clinical Note</CardTitle>
          </div>
          <CardDescription>
            Enter the technical clinical note that will be transformed into patient-friendly communication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="technical-note">Clinical Note Content</Label>
            <Textarea
              id="technical-note"
              placeholder="Enter technical clinical note here or upload documents below..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              disabled={isProcessing}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Documents ({uploadedFiles.length}/10)</Label>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-medical-light-blue px-3 py-2 rounded-md text-sm">
                    <File className="h-4 w-4 text-primary" />
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-muted-foreground hover:text-foreground"
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload PDF or Images (Max 10)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isProcessing || uploadedFiles.length >= 10}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extracting text...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload Documents</span>
                  </>
                )}
              </Button>
              <input
                id="file-upload"
                type="file"
                accept="application/pdf,image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, JPG, PNG. Text will be extracted and shown above for your review.
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={handleSampleLoad}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Load Sample Note</span>
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={!note.trim() || isProcessing}
              className="flex items-center space-x-2"
            >
              <span>Continue to Patient Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-medical-light-blue border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Clinical Note Guidelines</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Include diagnosis, current symptoms, and treatment plan</li>
                <li>• Mention relevant test results and medications</li>
                <li>• Note any lifestyle recommendations or restrictions</li>
                <li>• All content will be reviewed and approved by clinician before patient delivery</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalNoteInput;