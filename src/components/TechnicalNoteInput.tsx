import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Shield, File, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { pdfToImageDataUrls } from "@/utils/pdfToImages";
import { extractTextDirectly } from "@/utils/pdfTextExtraction";
import { useCasePersistence } from "@/hooks/useCasePersistence";
interface TechnicalNoteInputProps {
  onNext: (note: string, caseId: string) => void;
  initialNote?: string;
}
const TechnicalNoteInput = ({
  onNext,
  initialNote
}: TechnicalNoteInputProps) => {
  const [note, setNote] = useState(initialNote || "");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFileNames, setExtractedFileNames] = useState<Set<string>>(new Set());
  const {
    toast
  } = useToast();
  const {
    createCase
  } = useCasePersistence();
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (uploadedFiles.length + files.length > 10) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 10 documents.",
        variant: "destructive"
      });
      return;
    }
    const validFiles = files.filter(file => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        toast({
          title: "Unsupported file type",
          description: `${file.name}: This file type cannot be processed. Please upload a PDF or image.`,
          variant: "destructive"
        });
      }
      return isValid;
    });
    if (validFiles.length === 0) return;
    setUploadedFiles(prev => [...prev, ...validFiles]);
    toast({
      title: "Files uploaded",
      description: `${validFiles.length} file(s) added. Click "Get Text from Documents" to extract text.`
    });
  };
  const handleExtractText = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload documents first.",
        variant: "destructive"
      });
      return;
    }

    // Filter out files that have already been extracted
    const filesToProcess = uploadedFiles.filter(file => !extractedFileNames.has(file.name));
    if (filesToProcess.length === 0) {
      toast({
        title: "All files already extracted",
        description: "All uploaded files have already been processed."
      });
      return;
    }
    setIsExtracting(true);
    const newExtractedFiles = new Set(extractedFileNames);
    try {
      let combinedText = note;
      console.log('Starting text extraction. Initial note length:', combinedText.length);
      console.log(`Processing ${filesToProcess.length} new file(s), skipping ${extractedFileNames.size} already extracted`);
      for (const file of filesToProcess) {
        console.log(`Processing file: ${file.name}`);
        if (file.type === 'application/pdf') {
          // Try direct text extraction first
          const directText = await extractTextDirectly(file, 5);
          if (directText.trim().length > 100) {
            // Success! We got text directly from the PDF
            console.log(`Direct extraction successful for ${file.name}, extracted ${directText.length} characters`);
            combinedText += (combinedText ? '\n\n' : '') + `--- Extracted from ${file.name} ---\n${directText}`;
            newExtractedFiles.add(file.name);
            continue; // Move to next file
          }

          // Fallback to OCR for scanned PDFs
          console.log(`Falling back to OCR for ${file.name} (scanned document detected)`);
          let pageIndex = 0;
          let fileExtracted = false;
          try {
            const images = await pdfToImageDataUrls(file, {
              maxPages: 5,
              scale: 1.0
            });
            for (const imgUrl of images) {
              pageIndex++;
              const {
                data,
                error
              } = await supabase.functions.invoke('extract-text-from-document', {
                body: {
                  fileData: imgUrl,
                  fileType: 'image/png'
                }
              });
              if (error) {
                toast({
                  title: "Extraction failed",
                  description: `Could not extract text from ${file.name} (page ${pageIndex}). Please review and make corrections.`,
                  variant: "destructive"
                });
                continue;
              }
              if (data?.extractedText) {
                console.log(`OCR extracted ${data.extractedText.length} characters from ${file.name} page ${pageIndex}`);
                combinedText += (combinedText ? '\n\n' : '') + `--- Extracted from ${file.name} (page ${pageIndex}) ---\n${data.extractedText}`;
                fileExtracted = true;
              }
            }
            if (fileExtracted) {
              newExtractedFiles.add(file.name);
            }
          } catch (e) {
            console.error('PDF processing error:', e);
            toast({
              title: "PDF processing error",
              description: `We could not process ${file.name}. Please review and make corrections.`,
              variant: "destructive"
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
          const {
            data,
            error
          } = await supabase.functions.invoke('extract-text-from-document', {
            body: {
              fileData,
              fileType: file.type
            }
          });
          if (error) {
            toast({
              title: "Extraction failed",
              description: `Could not extract text from ${file.name}. Please review and make corrections manually.`,
              variant: "destructive"
            });
            continue;
          }
          if (data?.extractedText) {
            console.log(`Image OCR extracted ${data.extractedText.length} characters from ${file.name}`);
            combinedText += (combinedText ? '\n\n' : '') + `--- Extracted from ${file.name} ---\n${data.extractedText}`;
            newExtractedFiles.add(file.name);
          }
        }
      }
      console.log('Extraction complete. Final text length:', combinedText.length);
      console.log('Setting note with extracted text...');
      setNote(combinedText);
      setExtractedFileNames(newExtractedFiles);
      const extractedCount = filesToProcess.length;
      const totalExtracted = newExtractedFiles.size;
      toast({
        title: "Text extracted",
        description: `Extracted text from ${extractedCount} new file(s). Total: ${totalExtracted}/${uploadedFiles.length} files extracted. ${combinedText.length} characters total.`
      });
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing error",
        description: "We could not extract all text. Please review and make corrections.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };
  const removeFile = (index: number) => {
    const fileName = uploadedFiles[index].name;
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setExtractedFileNames(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileName);
      return newSet;
    });
  };
  const handleNext = async () => {
    if (note.trim()) {
      setIsProcessing(true);
      const fileNames = uploadedFiles.map(f => f.name);
      const {
        data,
        error
      } = await createCase(note, fileNames);
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to save case",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      if (data) {
        toast({
          title: "Success",
          description: "Case saved successfully"
        });
        onNext(note, data.id);
      }
      setIsProcessing(false);
    }
  };
  return <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Technical Clinical Documents</CardTitle>
          </div>
          <CardDescription>Enter the technical clinical documents that will be transformed into patient-friendly communication.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="technical-note">Clinical Notes</Label>
            <RichTextEditor value={note} onChange={setNote} placeholder="Enter technical clinical note here or upload documents below..." disabled={isProcessing} />
          </div>

          {uploadedFiles.length > 0 && <div className="space-y-2">
              <Label>Uploaded Documents ({uploadedFiles.length}/10) - {extractedFileNames.size} extracted</Label>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => {
              const isExtracted = extractedFileNames.has(file.name);
              return <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${isExtracted ? 'bg-green-100 dark:bg-green-950' : 'bg-medical-light-blue'}`}>
                      {isExtracted ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /> : <File className="h-4 w-4 text-primary" />}
                      <span className="max-w-[200px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-foreground" disabled={isProcessing || isExtracting}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>;
            })}
              </div>
            </div>}
          
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload PDF or Images (Max 10)</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" disabled={isProcessing || isExtracting || uploadedFiles.length >= 10} onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="h-4 w-4" />
                <span>Upload Documents</span>
              </Button>
              
              <Button type="button" variant="default" className="flex-1" disabled={isProcessing || isExtracting || uploadedFiles.length === 0} onClick={handleExtractText}>
                {isExtracting ? <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extracting text...</span>
                  </> : <>
                    <FileText className="h-4 w-4" />
                    <span>Get Text from Documents</span>
                  </>}
              </Button>
              
              <input id="file-upload" type="file" accept="application/pdf,image/*" multiple onChange={handleFileUpload} className="hidden" />
            </div>
            <p className="text-xs text-muted-foreground">
              {uploadedFiles.length === 0 ? "Upload documents first, then click 'Get Text from Documents' to extract text." : "Click 'Get Text from Documents' to extract text from uploaded files."}
            </p>
          </div>
          
          <div className="flex items-center justify-end pt-4 border-t border-border">
            <Button onClick={handleNext} disabled={!note.trim() || isProcessing || isExtracting} className="flex items-center space-x-2">
              <span>Continue to Patient Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      
    </div>;
};
export default TechnicalNoteInput;