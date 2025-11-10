import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, FileText, Brain, Languages, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCasePersistence } from "@/hooks/useCasePersistence";
import { parseStructuredDocument, structuredDocumentToText, Section } from "@/utils/structuredDocumentParser";

interface AIProcessingProps {
  caseId: string;
  onNext: (draft: string, analysis?: any, sections?: Section[]) => void;
  patientData: any;
  technicalNote: string;
  onBack: () => void;
}

type ProcessingStep = 'idle' | 'analyzing' | 'generating' | 'complete' | 'error';

const AIProcessing = ({ caseId, onNext, patientData, technicalNote, onBack }: AIProcessingProps) => {
  const { saveAIAnalysis, updateCase } = useCasePersistence();
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [sections, setSections] = useState<Section[]>([]);
  const [draft, setDraft] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const handleStartProcessing = async () => {
    if (step !== 'idle') return;
    
    setStep('generating');
    setError('');

    try {
      console.log("Starting V2 document generation...");
      
      const { data: documentData, error: documentError } = await supabase.functions.invoke(
        'generate-patient-document-v2',
        {
          body: { technicalNote, patientData }
        }
      );

      if (documentError) throw documentError;
      if (!documentData?.document) throw new Error("No document data received");

      console.log("Document generated successfully:", documentData);

      // Parse structured JSON into sections and store
      const parsedSections = parseStructuredDocument(documentData.document, patientData.language);
      setSections(parsedSections);
      
      // Generate text for database storage
      const draftText = structuredDocumentToText(parsedSections);
      setDraft(draftText);
      setStep('complete');

      // Save to database
      await saveAIAnalysis(
        caseId,
        { method: 'v2-single-stage', validation: documentData.validation },
        draftText,
        documentData.model || 'google/gemini-2.5-flash'
      );

      await updateCase(caseId, { status: 'processing' });

      if (documentData.validation?.warnings?.length > 0) {
        console.warn("Validation warnings:", documentData.validation.warnings);
      }

      toast({
        title: "Processing Complete",
        description: "Patient-friendly document has been generated and validated.",
      });


    } catch (err: any) {
      console.error("Error during AI processing:", err);
      setStep('error');
      
      let errorMessage = "An error occurred during processing";
      if (err.message?.includes("Rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (err.message?.includes("Payment required")) {
        errorMessage = "Payment required. Please add credits to your workspace.";
      } else if (err.message?.includes("AI generation incomplete")) {
        errorMessage = "AI validation failed. Please try regenerating.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleContinue = () => {
    if (step === 'complete' && draft) {
      onNext(draft, undefined, sections);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Processing Medical Note</CardTitle>
          <CardDescription>
            AI is analyzing the clinical note and generating a personalized patient communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Processing Status */}
          <div className="space-y-4">
            <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
              step === 'generating' ? 'bg-primary/5 border-primary/20' :
              step === 'complete' ? 'bg-muted/50 border-muted' :
              'border-muted opacity-50'
            }`}>
              <div className="mt-0.5">
                {step === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : step === 'generating' ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Generating Validated Patient Document</p>
                <p className="text-sm text-muted-foreground">
                  Single-stage AI generation with built-in quality validation
                </p>
                {step === 'complete' && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    ✓ Document generated and validated ({sections.length} sections, {draft.length} characters)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Profile Summary */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center space-x-2 mb-3">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Personalization Applied</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Language:</span>
                <span className="ml-2 font-medium capitalize">{patientData.language}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Health Literacy:</span>
                <span className="ml-2 font-medium capitalize">{patientData.healthLiteracy}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span>
                <span className="ml-2 font-medium">{patientData.age}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Journey Type:</span>
                <span className="ml-2 font-medium capitalize">{patientData.journeyType || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {step === 'error' && error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive font-medium">Error: {error}</p>
              <Button
                onClick={handleStartProcessing}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            {step === 'idle' && (
              <>
                <Button onClick={onBack} variant="outline" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Patient Profile
                </Button>
                <Button onClick={handleStartProcessing} size="lg" className="flex-1">
                  <Brain className="mr-2 h-4 w-4" />
                  Start AI Processing
                </Button>
              </>
            )}
            
            {['analyzing', 'generating'].includes(step) && (
              <div className="flex items-center space-x-2 w-full justify-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing, please wait...</span>
              </div>
            )}

            {step === 'complete' && (
              <Button onClick={handleContinue} size="lg" className="w-full">
                Review Generated Draft
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Profile Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">{patientData.age}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sex</p>
              <p className="font-medium capitalize">{patientData.sex}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Language</p>
              <p className="font-medium capitalize">{patientData.language}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Health Literacy</p>
              <p className="font-medium capitalize">{patientData.healthLiteracy}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Journey Type</p>
              <p className="font-medium capitalize">{patientData.journeyType || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Risk Appetite</p>
              <p className="font-medium capitalize">{patientData.riskAppetite || 'Not specified'}</p>
            </div>
          </div>
          {patientData.comorbidities && (
            <div>
              <p className="text-muted-foreground text-sm">Comorbidities</p>
              <p className="font-medium text-sm">{patientData.comorbidities}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIProcessing;
