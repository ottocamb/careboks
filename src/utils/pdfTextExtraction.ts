import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Use local worker to ensure version compatibility
GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName?: string;
}

function extractFormattedText(textContent: any): string {
  const items = textContent.items.filter((item: any) => 'str' in item) as TextItem[];
  
  if (items.length === 0) return '';

  // Sort items by Y position (top to bottom), then X position (left to right)
  const sortedItems = items.sort((a, b) => {
    const yDiff = b.transform[5] - a.transform[5]; // Y coordinate (inverted in PDF)
    if (Math.abs(yDiff) > 2) return yDiff; // Different lines
    return a.transform[4] - b.transform[4]; // Same line, sort by X
  });

  const lines: string[] = [];
  let currentLine: string[] = [];
  let lastY: number | null = null;
  let lastX: number | null = null;
  let lastHeight: number | null = null;

  sortedItems.forEach((item, index) => {
    const y = item.transform[5];
    const x = item.transform[4];
    const height = item.height || 12;
    const text = item.str.trim();

    if (!text) return;

    // Detect new line (Y position changed significantly)
    if (lastY !== null && Math.abs(y - lastY) > 2) {
      // Check for paragraph break (extra vertical spacing)
      const verticalGap = Math.abs(lastY - y);
      const isParagraphBreak = lastHeight && verticalGap > lastHeight * 1.5;
      
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
        currentLine = [];
      }
      
      // Add extra line break for paragraph spacing
      if (isParagraphBreak) {
        lines.push('');
      }
    }

    // Add spacing between words on the same line
    if (lastX !== null && lastY !== null && Math.abs(y - lastY) <= 2) {
      const horizontalGap = x - lastX;
      // Add space if there's a gap (but not if text already ends/starts with space)
      if (horizontalGap > height * 0.3 && currentLine.length > 0) {
        if (!currentLine[currentLine.length - 1].endsWith(' ') && !text.startsWith(' ')) {
          currentLine[currentLine.length - 1] += ' ';
        }
      }
    }

    currentLine.push(text);
    lastY = y;
    lastX = x + (item.width || 0);
    lastHeight = height;
  });

  // Add the last line
  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }

  // Clean up: remove excessive spaces and normalize line breaks
  return lines
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 0)
    .join('\n');
}

export async function extractTextDirectly(file: File, maxPages = 5): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const textPages: string[] = [];
    const pageLimit = Math.min(pdf.numPages, maxPages);
    
    for (let i = 1; i <= pageLimit; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = extractFormattedText(textContent);
      
      if (pageText.trim()) {
        textPages.push(pageText);
      }
    }
    
    return textPages.join('\n\n--- Page Break ---\n\n');
  } catch (error) {
    console.error('Direct text extraction failed:', error);
    return '';
  }
}
