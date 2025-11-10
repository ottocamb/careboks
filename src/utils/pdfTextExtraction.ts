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

interface TextStyle {
  fontFamily: string;
  ascent: number;
  descent: number;
  vertical: boolean;
}

function isBoldFont(fontName: string): boolean {
  if (!fontName) return false;
  const lowerFont = fontName.toLowerCase();
  return lowerFont.includes('bold') || 
         lowerFont.includes('heavy') || 
         lowerFont.includes('black') ||
         lowerFont.includes('semibold') ||
         lowerFont.includes('extrabold');
}

function isItalicFont(fontName: string): boolean {
  if (!fontName) return false;
  const lowerFont = fontName.toLowerCase();
  return lowerFont.includes('italic') || 
         lowerFont.includes('oblique') ||
         lowerFont.includes('cursive');
}

function applyFormatting(text: string, fontName?: string): string {
  if (!fontName || !text) return text;
  
  const isBold = isBoldFont(fontName);
  const isItalic = isItalicFont(fontName);
  
  if (isBold && isItalic) {
    return `<strong><em>${text}</em></strong>`;
  } else if (isBold) {
    return `<strong>${text}</strong>`;
  } else if (isItalic) {
    return `<em>${text}</em>`;
  }
  
  return text;
}

function extractFormattedText(textContent: any): string {
  const items = textContent.items.filter((item: any) => 'str' in item) as TextItem[];
  const styles = textContent.styles || {};
  
  if (items.length === 0) return '';

  // Enhance items with font information from styles
  const enhancedItems = items.map(item => ({
    ...item,
    fontName: item.fontName || (styles[item.fontName as any]?.fontFamily)
  }));

  // Sort items by Y position (top to bottom), then X position (left to right)
  const sortedItems = enhancedItems.sort((a, b) => {
    const yDiff = b.transform[5] - a.transform[5]; // Y coordinate (inverted in PDF)
    if (Math.abs(yDiff) > 2) return yDiff; // Different lines
    return a.transform[4] - b.transform[4]; // Same line, sort by X
  });

  const lines: string[] = [];
  let currentLine: string[] = [];
  let lastY: number | null = null;
  let lastX: number | null = null;
  let lastHeight: number | null = null;
  let currentFontName: string | undefined = undefined;
  let currentFormatBuffer: string[] = [];

  const flushFormatBuffer = () => {
    if (currentFormatBuffer.length > 0) {
      const text = currentFormatBuffer.join(' ');
      const formatted = applyFormatting(text, currentFontName);
      currentLine.push(formatted);
      currentFormatBuffer = [];
    }
  };

  sortedItems.forEach((item, index) => {
    const y = item.transform[5];
    const x = item.transform[4];
    const height = item.height || 12;
    const text = item.str.trim();
    const fontName = item.fontName;

    if (!text) return;

    // Detect new line (Y position changed significantly)
    if (lastY !== null && Math.abs(y - lastY) > 2) {
      // Flush any buffered formatted text
      flushFormatBuffer();
      
      // Check for paragraph break (extra vertical spacing)
      const verticalGap = Math.abs(lastY - y);
      const isParagraphBreak = lastHeight && verticalGap > lastHeight * 1.5;
      
      if (currentLine.length > 0) {
        lines.push(currentLine.join(''));
        currentLine = [];
      }
      
      // Add extra line break for paragraph spacing
      if (isParagraphBreak) {
        lines.push('');
      }
      
      currentFontName = undefined;
    }

    // Check if font changed (need to flush buffer and start new formatting)
    if (fontName !== currentFontName) {
      flushFormatBuffer();
      currentFontName = fontName;
    }

    // Add spacing between words on the same line
    if (lastX !== null && lastY !== null && Math.abs(y - lastY) <= 2) {
      const horizontalGap = x - lastX;
      // Add space if there's a gap
      if (horizontalGap > height * 0.3 && currentFormatBuffer.length > 0) {
        currentFormatBuffer.push(' ');
      }
    }

    currentFormatBuffer.push(text);
    lastY = y;
    lastX = x + (item.width || 0);
    lastHeight = height;
  });

  // Flush any remaining formatted text
  flushFormatBuffer();
  
  // Add the last line
  if (currentLine.length > 0) {
    lines.push(currentLine.join(''));
  }

  // Join lines and wrap in paragraph tags for proper HTML structure
  const formattedText = lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p>${line}</p>`)
    .join('');

  return formattedText;
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
    
    // Combine all pages with page break markers
    const combinedHtml = textPages
      .map((page, index) => {
        if (index === 0) return page;
        return `<hr><p><strong>--- Page ${index + 1} ---</strong></p>${page}`;
      })
      .join('');
    
    return combinedHtml;
  } catch (error) {
    console.error('Direct text extraction failed:', error);
    return '';
  }
}
