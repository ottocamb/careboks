export interface ParsedSection {
  title: string;
  content: string;
}

const SECTION_SEPARATOR = "═══════════════════════════════════════════════════";

/**
 * Parses a draft string into 7 distinct sections
 * Expected format: Section title on one line, separator, content, separator, next section...
 */
export const parseDraftIntoSections = (draft: string): ParsedSection[] => {
  if (!draft || typeof draft !== 'string') {
    return [];
  }

  const sections: ParsedSection[] = [];
  
  // Split by separator and filter empty strings
  const parts = draft.split(SECTION_SEPARATOR).filter(part => part.trim());
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    // First line is the title, rest is content
    const lines = trimmed.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    
    if (title) {
      sections.push({ title, content });
    }
  }
  
  return sections;
};

/**
 * Reconstructs the full draft text from parsed sections
 * Maintains the original format with separators
 */
export const reconstructDraft = (sections: ParsedSection[]): string => {
  return sections
    .map(section => {
      return `${SECTION_SEPARATOR}\n${section.title}\n${SECTION_SEPARATOR}\n${section.content}`;
    })
    .join('\n\n');
};
