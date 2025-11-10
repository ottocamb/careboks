import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Use CDN for worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function pdfToImageDataUrls(
  file: File,
  options: { maxPages?: number; scale?: number } = {}
): Promise<string[]> {
  const { maxPages = 5, scale = 1.5 } = options;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageCount = Math.min(pdf.numPages, maxPages);
  const images: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    images.push(canvas.toDataURL('image/png'));

    // Cleanup
    canvas.width = 0;
    canvas.height = 0;
  }

  return images;
}
