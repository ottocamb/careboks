import { useState } from "react";
import MedicalHeader from "@/components/MedicalHeader";
import TechnicalNoteInput from "@/components/TechnicalNoteInput";
import PatientProfile from "@/components/PatientProfile";
import AIProcessing from "@/components/AIProcessing";
import ClinicianApproval from "@/components/ClinicianApproval";
import FinalOutput from "@/components/FinalOutput";

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
  mentalState: string;
  comorbidities: string[];
}

interface IndexProps {
  onLogout: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [technicalNote, setTechnicalNote] = useState("");
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [aiDraft, setAiDraft] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [finalText, setFinalText] = useState("");

  const steps: Step[] = ['input', 'profile', 'processing', 'approval', 'output'];
  const currentStepIndex = steps.indexOf(currentStep);
  const totalSteps = steps.length;

  const handleTechnicalNoteSubmit = (note: string) => {
    setTechnicalNote(note);
    setCurrentStep('profile');
  };

  const handlePatientProfileSubmit = (data: PatientData) => {
    setPatientData(data);
    setCurrentStep('processing');
  };

  const handleAIProcessingComplete = (draft: string, analysisData?: any) => {
    setAiDraft(draft);
    setAnalysis(analysisData);
    setCurrentStep('approval');
  };

  const handleClinicianApproval = (approvedText: string) => {
    setFinalText(approvedText);
    setCurrentStep('output');
  };

  const handleRestart = () => {
    setCurrentStep('input');
    setTechnicalNote("");
    setPatientData(null);
    setAiDraft("");
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
        
        {currentStep === 'profile' && (
          <PatientProfile 
            onNext={handlePatientProfileSubmit} 
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'processing' && patientData && (
          <AIProcessing 
            onNext={handleAIProcessingComplete}
            patientData={patientData}
            technicalNote={technicalNote}
          />
        )}
        
        {currentStep === 'approval' && (
          <ClinicianApproval 
            draft={aiDraft}
            analysis={analysis}
            onApprove={handleClinicianApproval}
            onBack={handleBackToProfile}
          />
        )}
        
        {currentStep === 'output' && (
          <FinalOutput 
            finalText={finalText}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
