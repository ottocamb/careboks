import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCasePersistence } from "@/hooks/useCasePersistence";
import { Printer, ChevronLeft, CheckCircle2, Heart, Activity, Calendar, Sparkles, Pill, Phone, AlertTriangle } from "lucide-react";
import { SectionBox } from "@/components/SectionBox";
import { parseDraftIntoSections, reconstructDraft, ParsedSection } from "@/utils/draftParser";

interface ClinicianApprovalProps {
  caseId: string;
  draft: string;
  analysis?: any;
  onApprove: (finalText: string, clinicianName: string) => void;
  onBack: () => void;
}

export const ClinicianApproval = ({
  caseId,
  draft,
  analysis,
  onApprove,
  onBack,
}: ClinicianApprovalProps) => {
  const [sections, setSections] = useState<ParsedSection[]>([]);
  const [clinicianName, setClinicianName] = useState("");
  const { toast } = useToast();
  const { saveApproval, updateCase } = useCasePersistence();

  // Parse draft into sections on mount
  useEffect(() => {
    const parsed = parseDraftIntoSections(draft);
    setSections(parsed);
  }, [draft]);

  const handleSectionEdit = (index: number, newContent: string) => {
    const updated = [...sections];
    updated[index].content = newContent;
    setSections(updated);
  };

  const handleApprove = async () => {
    if (!clinicianName.trim()) {
      toast({
        title: "Clinician name required",
        description: "Please enter your name before approving",
        variant: "destructive",
      });
      return;
    }

    try {
      // Reconstruct full text from sections
      const finalText = reconstructDraft(sections);

      // Save approval
      await saveApproval(caseId, finalText, clinicianName);
      await updateCase(caseId, { status: "approved" });

      toast({
        title: "Document approved",
        description: "Patient communication has been finalized",
      });

      onApprove(finalText, clinicianName);
    } catch (error) {
      console.error("Error approving document:", error);
      toast({
        title: "Approval failed",
        description: "Could not save approval. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrintPreview = () => {
    const finalText = reconstructDraft(sections);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Patient Communication</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { color: #1a365d; border-bottom: 3px solid #3182ce; padding-bottom: 10px; }
              h2 { color: #2d3748; margin-top: 30px; }
              p { line-height: 1.6; color: #4a5568; }
              .separator { border-top: 2px dashed #cbd5e0; margin: 20px 0; }
            </style>
          </head>
          <body>
            ${finalText.replace(/\n/g, "<br>")}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Define section configurations with hardcoded titles
  const sectionConfigs = [
    { title: "What do I have", icon: <Heart />, themeColor: "text-blue-600" },
    { title: "How should I live next", icon: <Activity />, themeColor: "text-green-600" },
    { title: "How the next 6 months of my life will look like", icon: <Calendar />, themeColor: "text-purple-600" },
    { title: "What does it mean for my life", icon: <Sparkles />, themeColor: "text-yellow-600" },
    { title: "My medications", icon: <Pill />, themeColor: "text-orange-600" },
    { title: "Warning signs", icon: <AlertTriangle />, themeColor: "text-red-600" },
    { title: "My contacts", icon: <Phone />, themeColor: "text-teal-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Review & Edit Patient Communication
          </CardTitle>
          <CardDescription>
            Review each section below, make any necessary edits, and approve the final document
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Seven Section Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionConfigs.slice(0, 6).map((config, index) => (
          <SectionBox
            key={index}
            icon={config.icon}
            title={config.title}
            content={sections[index]?.content || ""}
            onEdit={(newContent) => handleSectionEdit(index, newContent)}
            themeColor={config.themeColor}
          />
        ))}
      </div>

      {/* My Contacts - Full Width */}
      <SectionBox
        icon={sectionConfigs[6].icon}
        title={sectionConfigs[6].title}
        content={sections[6]?.content || ""}
        onEdit={(newContent) => handleSectionEdit(6, newContent)}
        themeColor={sectionConfigs[6].themeColor}
      />

      {/* Clinical Safety Reminders */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg text-amber-900">Clinical Safety Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Verify all medication names, doses, and instructions are accurate</li>
            <li>Ensure emergency contact information is complete and correct</li>
            <li>Confirm warning signs are clear and specific to the patient's condition</li>
            <li>Check that lifestyle advice is appropriate for the patient's specific situation</li>
            <li>Ensure language is appropriate for the patient's health literacy level</li>
          </ul>
        </CardContent>
      </Card>

      {/* Approval Controls */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinician-name">Approving Clinician Name *</Label>
            <Input
              id="clinician-name"
              value={clinicianName}
              onChange={(e) => setClinicianName(e.target.value)}
              placeholder="Dr. Jane Smith"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={onBack} variant="outline" className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button onClick={handlePrintPreview} variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-1" />
              Print Preview
            </Button>
            <Button onClick={handleApprove} className="flex-1">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Approve & Finalize
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};