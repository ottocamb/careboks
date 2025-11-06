import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { UserCheck, Edit, CheckCircle, AlertTriangle, Printer, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCasePersistence } from "@/hooks/useCasePersistence";

interface ClinicianApprovalProps {
  caseId: string;
  draft: string;
  analysis?: any;
  onApprove: (finalText: string) => void;
  onBack: () => void;
}

const ClinicianApproval = ({ caseId, draft, analysis, onApprove, onBack }: ClinicianApprovalProps) => {
  const { saveApproval, updateCase } = useCasePersistence();
  const [editedDraft, setEditedDraft] = useState(draft);
  const [isEditing, setIsEditing] = useState(false);
  const [clinicianName, setClinicianName] = useState("");
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!clinicianName.trim()) {
      toast({
        title: "Clinician approval required",
        description: "Please enter your name to approve this content.",
        variant: "destructive"
      });
      return;
    }

    const finalText = editedDraft + `\n\n---\nApproved by: ${clinicianName}\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}`;
    
    const { error: approvalError } = await saveApproval(caseId, finalText, `Approved by ${clinicianName}`);
    if (approvalError) {
      toast({
        title: "Save failed",
        description: "Failed to save approval",
        variant: "destructive"
      });
      return;
    }

    const { error: updateError } = await updateCase(caseId, { status: 'approved' });
    if (updateError) {
      toast({
        title: "Update failed",
        description: "Failed to update case status",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Approval saved successfully"
    });
    onApprove(finalText);
  };

  const wordCount = editedDraft.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <CardTitle>Clinician Review & Approval</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                {wordCount} words • {readingTime} min read
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>{isEditing ? 'Preview' : 'Edit'}</span>
              </Button>
            </div>
          </div>
          <CardDescription>
            Review the AI-generated patient communication and make any necessary edits before approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="draft-edit">Edit Patient Communication</Label>
              <Textarea
                id="draft-edit"
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                className="min-h-[400px] font-serif text-base leading-relaxed"
                placeholder="Edit the patient communication..."
              />
            </div>
          ) : (
            <div className="prose max-w-none">
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground">
                  {editedDraft}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-success/5 border-success/20">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="font-medium text-success">Content Validated</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Medical terminology checked against approved glossary
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Personalized</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adapted to patient profile and literacy level
                </p>
              </CardContent>
            </Card>

            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Safety Check</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Red flags and emergency instructions included
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="border-t border-border pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinician-name">Approving Clinician</Label>
                <input
                  id="clinician-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={clinicianName}
                  onChange={(e) => setClinicianName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={onBack}>
                  Back to Patient Profile
                </Button>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => window.print()}
                    className="flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Preview</span>
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    className="flex items-center space-x-2"
                    disabled={!clinicianName.trim()}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve & Finalize</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>AI-Extracted Information & Physician Prompts</span>
            </CardTitle>
            <CardDescription>
              Review extracted information and address any gaps identified by the AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysis.categories?.map((category: any, idx: number) => (
              <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg text-foreground">{category.name}</h3>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">📋 Extracted Information:</h4>
                  {category.extractedInfo?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {category.extractedInfo.map((info: string, i: number) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No information found.</p>
                  )}
                </div>

                <div className="bg-warning/5 border border-warning/20 rounded-md p-3">
                  <h4 className="font-medium text-sm text-warning mb-2 flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span>⚠️ Gaps & Physician Prompts:</span>
                  </h4>
                  {category.gaps?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {category.gaps.map((gap: string, i: number) => (
                        <li key={i} className="text-foreground">{gap}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">All information complete.</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-medical-light-green border-accent/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            <span>Clinical Safety Reminders</span>
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ensure all medical information is accurate and up-to-date</li>
            <li>• Verify medication names, dosages, and instructions</li>
            <li>• Confirm emergency contact information is included</li>
            <li>• Check that lifestyle recommendations are appropriate for this patient</li>
            <li>• Ensure content aligns with current treatment plan</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicianApproval;