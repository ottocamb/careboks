import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Use local worker to ensure version compatibility
GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextDirectly(file: File, maxPages = 5): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const textPages: string[] = [];
    const pageLimit = Math.min(pdf.numPages, maxPages);
    
    for (let i = 1; i <= pageLimit; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item: any) => 'str' in item)
        .map((item: any) => item.str)
        .join(' ');
      
      if (pageText.trim()) {
        textPages.push(pageText);
      }
    }
    
    return textPages.join('\n\n');
  } catch (error) {
    console.error('Direct text extraction failed:', error);
    return '';
  }
}
