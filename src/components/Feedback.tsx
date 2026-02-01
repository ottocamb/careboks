import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronLeft, RotateCcw, Send, ArrowRight } from "lucide-react";

interface FeedbackProps {
  onBack: () => void;
  onRestart: () => void;
}

const FEEDBACK_OPTIONS = [
  "What do I have",
  "How should I live next",
  "How the next 6 months of my life look like",
  "What does it mean for my life",
  "My medications",
  "Warning signs",
  "General Notes",
];

export const Feedback = ({ onBack, onRestart }: FeedbackProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions((prev) => [...prev, option]);
    } else {
      setSelectedOptions((prev) => prev.filter((o) => o !== option));
    }
  };

  const handleRewrite = () => {
    setSelectedOptions([]);
  };

  const handleSubmit = () => {
    // Placeholder - does nothing for now
    console.log("Feedback submitted:", selectedOptions);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <CardDescription>
            Based on your experience, which feature do you consider most useful for patients?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {FEEDBACK_OPTIONS.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={option}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(option, checked as boolean)
                  }
                />
                <Label
                  htmlFor={option}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline" className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Review Document
            </Button>
            <Button onClick={handleRewrite} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-1" />
              Rewrite
            </Button>
            <Button onClick={handleSubmit} variant="outline" className="flex-1">
              <Send className="w-4 h-4 mr-1" />
              Submit
            </Button>
            <Button onClick={onRestart} className="flex-1">
              <ArrowRight className="w-4 h-4 mr-1" />
              Next Careboks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
