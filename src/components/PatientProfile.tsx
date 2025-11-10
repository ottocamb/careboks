import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Brain, Globe, Users } from "lucide-react";
import { useCasePersistence } from "@/hooks/useCasePersistence";
import { useToast } from "@/hooks/use-toast";

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

interface PatientProfileProps {
  caseId: string;
  onNext: (data: PatientData) => void;
  onBack: () => void;
  initialData?: PatientData;
}

const PatientProfile = ({ caseId, onNext, onBack, initialData }: PatientProfileProps) => {
  const { savePatientProfile, updateCase } = useCasePersistence();
  const { toast } = useToast();
  const [data, setData] = useState<PatientData>(initialData || {
    age: "",
    sex: "",
    language: "",
    healthLiteracy: "",
    journeyType: "",
    riskAppetite: "",
    hasAccessibilityNeeds: false,
    includeRelatives: false,
    comorbidities: []
  });

  const handleComorbidityChange = (comorbidity: string, checked: boolean) => {
    setData(prev => ({
      ...prev,
      comorbidities: checked 
        ? [...prev.comorbidities, comorbidity]
        : prev.comorbidities.filter(c => c !== comorbidity)
    }));
  };

  const handleNext = async () => {
    if (isValid) {
      const { error: profileError } = await savePatientProfile(caseId, data);
      if (profileError) {
        toast({
          title: "Error",
          description: "Failed to save patient profile",
          variant: "destructive"
        });
        return;
      }

      const { error: updateError } = await updateCase(caseId, { status: 'processing' });
      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to update case status",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Patient profile saved"
      });
      onNext(data);
    }
  };

  const isValid = data.age && data.sex && data.language && data.healthLiteracy && data.journeyType;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Patient Profile</CardTitle>
          </div>
          <CardDescription>
            Configure patient attributes to personalize the communication output.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Select value={data.age} onValueChange={(value) => setData(prev => ({ ...prev, age: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age bracket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20-30">20-30 years old</SelectItem>
                  <SelectItem value="30-45">30-45 years old</SelectItem>
                  <SelectItem value="45-60">45-60 years old</SelectItem>
                  <SelectItem value="60+">60+ years old</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={data.sex} onValueChange={(value) => setData(prev => ({ ...prev, sex: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={data.language} onValueChange={(value) => setData(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estonian">Estonian</SelectItem>
                  <SelectItem value="russian">Russian</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="literacy">Health Literacy Level</Label>
              <Select value={data.healthLiteracy} onValueChange={(value) => setData(prev => ({ ...prev, healthLiteracy: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select literacy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Simple terms, large text)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced approach)</SelectItem>
                  <SelectItem value="high">High (Detailed explanations)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="journey">Patient Journey Type</Label>
              <Select value={data.journeyType} onValueChange={(value) => setData(prev => ({ ...prev, journeyType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select journey type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elective">Elective Care</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="chronic">Chronic Management</SelectItem>
                  <SelectItem value="first-time">First-time Diagnosis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk">Risk Communication Preference</Label>
              <Select value={data.riskAppetite} onValueChange={(value) => setData(prev => ({ ...prev, riskAppetite: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal details</SelectItem>
                  <SelectItem value="balanced">Balanced information</SelectItem>
                  <SelectItem value="detailed">Detailed explanation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Comorbidities</Label>
            <div className="grid grid-cols-2 gap-4">
              {['Diabetes', 'Hypertension', 'COPD', 'Kidney Disease', 'Depression'].map(condition => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition}
                    checked={data.comorbidities.includes(condition)}
                    onCheckedChange={(checked) => handleComorbidityChange(condition, !!checked)}
                  />
                  <Label htmlFor={condition}>{condition}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accessibility"
                checked={data.hasAccessibilityNeeds}
                onCheckedChange={(checked) => setData(prev => ({ ...prev, hasAccessibilityNeeds: !!checked }))}
              />
              <Label htmlFor="accessibility">Patient has vision/hearing accessibility needs</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="relatives"
                checked={data.includeRelatives}
                onCheckedChange={(checked) => setData(prev => ({ ...prev, includeRelatives: !!checked }))}
              />
              <Label htmlFor="relatives">Include information for relatives/caregivers</Label>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-border">
            <Button variant="outline" onClick={onBack}>
              Back to Clinical Note
            </Button>
            <Button onClick={handleNext} disabled={!isValid}>
              Generate AI Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-medical-light-blue border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Personalization</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Content is tailored to age and literacy level
            </p>
          </CardContent>
        </Card>

        <Card className="bg-medical-light-green border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="h-4 w-4 text-accent" />
              <h3 className="font-semibold">Multi-language</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Support for Estonian, Russian, and English
            </p>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-warning" />
              <h3 className="font-semibold">Family-centered</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Optional content for relatives and caregivers
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientProfile;