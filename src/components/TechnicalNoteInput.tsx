import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Shield } from "lucide-react";

interface TechnicalNoteInputProps {
  onNext: (note: string) => void;
}

const TechnicalNoteInput = ({ onNext }: TechnicalNoteInputProps) => {
  const [note, setNote] = useState("");
  
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
              placeholder="Enter technical clinical note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
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
              disabled={!note.trim()}
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