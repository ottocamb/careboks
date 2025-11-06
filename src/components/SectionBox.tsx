import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit2, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionBoxProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  gaps?: string[];
  onEdit: (newContent: string) => void;
  themeColor: string;
  className?: string;
}

export const SectionBox = ({
  icon,
  title,
  content,
  gaps = [],
  onEdit,
  themeColor,
  className,
}: SectionBoxProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const hasGaps = gaps.length > 0;
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
            {!isEmpty && !hasGaps && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
            {hasGaps && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Gaps
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
            
            {hasGaps && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
                <p className="text-sm font-medium text-amber-900">
                  Physician prompts to address:
                </p>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  {gaps.map((gap, idx) => (
                    <li key={idx}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

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

            {hasGaps && !isEditing && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-xs font-medium text-amber-900 mb-1">
                  ⚠️ {gaps.length} gap{gaps.length > 1 ? 's' : ''} identified
                </p>
                <p className="text-xs text-amber-700">
                  Click Edit to address missing information
                </p>
              </div>
            )}

            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Section
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
