import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, RotateCcw, Send, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ParsedSection } from "@/utils/draftParser";

interface FeedbackProps {
  caseId: string;
  sections?: ParsedSection[];
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
  "General Notes"
];

export const Feedback = ({
  caseId,
  sections,
  onBack,
  onRestart
}: FeedbackProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [additionalComments, setAdditionalComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipWarningShown, setSkipWarningShown] = useState(false);
  const { toast } = useToast();

  // Reset skip warning when user adds content
  useEffect(() => {
    if (selectedOptions.length > 0 || additionalComments.trim()) {
      setSkipWarningShown(false);
    }
  }, [selectedOptions, additionalComments]);

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions(prev => [...prev, option]);
    } else {
      setSelectedOptions(prev => prev.filter(o => o !== option));
    }
  };

  const handleRewrite = () => {
    setSelectedOptions([]);
    setAdditionalComments("");
    setSkipWarningShown(false);
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0 && !additionalComments.trim()) {
      toast({
        title: "Feedback required",
        description: "Please select at least one option or add comments",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('case_feedback').insert({
        case_id: caseId,
        submitted_by: user.id,
        selected_options: selectedOptions,
        additional_comments: additionalComments.trim() || null
      });

      if (error) throw error;

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!"
      });

      // Clear form after successful submission
      setSelectedOptions([]);
      setAdditionalComments("");
      setSkipWarningShown(false);
    } catch (err) {
      console.error("Feedback submission error:", err);
      toast({
        title: "Submission failed",
        description: "Could not save feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles New Patient click with skip warning for empty feedback
   */
  const handleNewPatient = () => {
    const formIsEmpty = selectedOptions.length === 0 && !additionalComments.trim();
    
    // If form is empty and warning not yet shown, show warning first
    if (formIsEmpty && !skipWarningShown) {
      toast({
        title: "Skip feedback?",
        description: "Are you sure you want to start a new patient without submitting feedback? Click again to confirm.",
      });
      setSkipWarningShown(true);
      return;
    }
    
    // Second click with empty form OR form has content - proceed with restart
    onRestart();
  };

  /**
   * Handles Back navigation - passes sections to preserve edits
   */
  const handleBack = () => {
    // onBack will be called, and parent will handle navigation
    // sections are passed via location.state in parent
    onBack();
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
        <CardContent className="space-y-6">
          {/* Checkbox Options */}
          <div className="space-y-3">
            {FEEDBACK_OPTIONS.map(option => (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={option}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={checked => handleCheckboxChange(option, checked as boolean)}
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

          {/* Free Text Field */}
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments/Suggestions</Label>
            <Textarea
              id="comments"
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Share any additional feedback about the generated document..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button onClick={handleBack} variant="outline" className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button onClick={handleRewrite} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-1" />
              Rewrite
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="outline" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              Submit
            </Button>
            <Button onClick={handleNewPatient} className="flex-1">
              <UserPlus className="w-4 h-4 mr-1" />
              New Patient
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
