export interface ImageFile {
  file: File;
  image: HTMLImageElement;
  previewUrl: string;
}

/**
 * Handle image file processing
 */
export async function handleImageFile(file: File): Promise<ImageFile> {
  const previewUrl = URL.createObjectURL(file);
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      resolve({ file, image, previewUrl });
    };
    image.onerror = () => {
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    image.src = previewUrl;
  });
}

/**
 * Handle PDF file processing
 */
export async function handlePdfFile(file: File): Promise<ImageFile[]> {
  // @ts-ignore - pdfjsLib is loaded via CDN
  if (typeof window === 'undefined' || !window.pdfjsLib) {
    throw new Error('PDF.js library not loaded');
  }

  const pdfjsLib = (window as any).pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const results: ImageFile[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });

    const imageFile = new File([blob], `${file.name}_page_${pageNum}.png`, { type: 'image/png' });
    const previewUrl = URL.createObjectURL(blob);
    const image = new Image();

    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.src = previewUrl;
    });

    results.push({ file: imageFile, image, previewUrl });
  }

  return results;
}
