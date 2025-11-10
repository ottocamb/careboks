import { useState } from "react";
import MedicalHeader from "@/components/MedicalHeader";
import TechnicalNoteInput from "@/components/TechnicalNoteInput";
import PatientProfile from "@/components/PatientProfile";
import AIProcessing from "@/components/AIProcessing";
import { ClinicianApproval } from "@/components/ClinicianApproval";
import FinalOutput from "@/components/FinalOutput";
import { Section } from "@/utils/structuredDocumentParser";

type Step = 'input' | 'profile' | 'processing' | 'approval' | 'output';

interface PatientData {
  age: string;
  sex: string;
  language: string;
  healthLiteracy: string;
  journeyType: string;
  riskAppetite: string;
  hasAccessibilityNeeds: boolean;
  includeRelatives: boolean;
  comorbidities: string[];
}

interface IndexProps {
  onLogout: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [technicalNote, setTechnicalNote] = useState("");
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [aiDraft, setAiDraft] = useState("");
  const [aiSections, setAiSections] = useState<Section[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [finalText, setFinalText] = useState("");

  const steps: Step[] = ['input', 'profile', 'processing', 'approval', 'output'];
  const currentStepIndex = steps.indexOf(currentStep);
  const totalSteps = steps.length;

  const handleTechnicalNoteSubmit = (note: string, caseId: string) => {
    setTechnicalNote(note);
    setCurrentCaseId(caseId);
    setCurrentStep('profile');
  };

  const handlePatientProfileSubmit = (data: PatientData) => {
    setPatientData(data);
    setCurrentStep('processing');
  };

  const handleAIProcessingComplete = (draft: string, analysisData?: any, sectionsData?: Section[]) => {
    setAiDraft(draft);
    setAnalysis(analysisData);
    setAiSections(sectionsData || []);
    setCurrentStep('approval');
  };

  const handleClinicianApproval = (approvedText: string, clinicianName: string) => {
    setFinalText(approvedText);
    setCurrentStep('output');
  };

  const handleRestart = () => {
    setCurrentStep('input');
    setCurrentCaseId(null);
    setTechnicalNote("");
    setPatientData(null);
    setAiDraft("");
    setAiSections([]);
    setAnalysis(null);
    setFinalText("");
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleBackToProfile = () => {
    setCurrentStep('profile');
  };

  return (
    <div className="min-h-screen bg-background">
      <MedicalHeader currentStep={currentStepIndex + 1} totalSteps={totalSteps} onLogout={onLogout} />
      
      <main className="container mx-auto px-6 py-8">
        {currentStep === 'input' && (
          <TechnicalNoteInput onNext={handleTechnicalNoteSubmit} />
        )}
        
        {currentStep === 'profile' && currentCaseId && (
          <PatientProfile 
            caseId={currentCaseId}
            onNext={handlePatientProfileSubmit} 
            onBack={handleBack}
            initialData={patientData || undefined}
          />
        )}
        
        {currentStep === 'processing' && patientData && currentCaseId && (
          <AIProcessing 
            caseId={currentCaseId}
            onNext={handleAIProcessingComplete}
            patientData={patientData}
            technicalNote={technicalNote}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'approval' && currentCaseId && patientData && (
          <ClinicianApproval 
            caseId={currentCaseId}
            draft={aiDraft}
            sections={aiSections}
            analysis={analysis}
            patientData={patientData}
            technicalNote={technicalNote}
            onApprove={handleClinicianApproval}
            onBack={handleBackToProfile}
          />
        )}
        
        {currentStep === 'output' && currentCaseId && (
          <FinalOutput 
            caseId={currentCaseId}
            finalText={finalText}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
