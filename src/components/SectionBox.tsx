import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit2, Check, X, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionBoxProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  onEdit: (newContent: string) => void;
  themeColor: string;
  className?: string;
  onRegenerate?: () => Promise<void>;
  isRegenerating?: boolean;
}

export const SectionBox = ({
  icon,
  title,
  content,
  onEdit,
  themeColor,
  className,
  onRegenerate,
  isRegenerating = false,
}: SectionBoxProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const isEmpty = !content || content.trim().length === 0;

  const handleSave = () => {
    onEdit(editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className={cn("text-2xl", themeColor)}>{icon}</div>
            <CardTitle className="text-lg leading-tight">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {!isEmpty && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
            {isEmpty && (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Empty
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px] font-sans"
              placeholder="Enter content for this section..."
            />

            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex-1">
                <Check className="w-4 h-4 mr-1" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {isEmpty ? (
              <p className="text-muted-foreground italic text-sm py-4">
                No content generated for this section. Click Edit to add information.
              </p>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-foreground">{content}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit Section
              </Button>
              
              {onRegenerate && (
                <Button
                  onClick={onRegenerate}
                  size="sm"
                  variant="outline"
                  disabled={isRegenerating}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {isRegenerating ? "Regenerating..." : "Regenerate with AI"}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
