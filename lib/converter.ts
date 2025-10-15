import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { ImageFile } from './fileHandler';

const RASTER_SCALE_FACTOR = 10;

/**
 * Rasterize image onto canvas
 */
function rasterizeImage(
  file: File,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void {
  const isSvg = file.type === 'image/svg+xml';
  const scaleFactor = isSvg ? RASTER_SCALE_FACTOR : 1;

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  canvas.width = width * scaleFactor;
  canvas.height = height * scaleFactor;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

/**
 * Convert images to PDF
 */
export async function convertToPdf(
  imageFiles: ImageFile[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<Blob> {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let isFirstPage = true;
  for (const { file, image } of imageFiles) {
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    rasterizeImage(file, image, canvas, ctx);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    const imgProps = doc.getImageProperties(imageDataUrl);
    const pageRatio = pageWidth / pageHeight;
    const imageRatio = imgProps.width / imgProps.height;

    let imgWidth, imgHeight;
    if (imageRatio > pageRatio) {
      imgWidth = pageWidth - 20;
      imgHeight = imgWidth / imageRatio;
    } else {
      imgHeight = pageHeight - 20;
      imgWidth = imgHeight * imageRatio;
    }
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    doc.addImage(imageDataUrl, 'JPEG', x, y, imgWidth, imgHeight);
  }

  return doc.output('blob');
}

/**
 * Convert images to ZIP
 */
export async function convertToZip(
  imageFiles: ImageFile[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  format: string,
  quality: number
): Promise<Blob> {
  const zip = new JSZip();
  const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;

  const conversionPromises = imageFiles.map(({ file, image }) => {
    return new Promise<void>((resolve, reject) => {
      try {
        rasterizeImage(file, image, canvas, ctx);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            const originalFilename = file.name;
            const lastDotIndex = originalFilename.lastIndexOf('.');
            const nameWithoutExtension =
              lastDotIndex > 0 ? originalFilename.substring(0, lastDotIndex) : originalFilename;
            const newFilename = `${nameWithoutExtension}.${format}`;
            zip.file(newFilename, blob);
            resolve();
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    });
  });

  await Promise.all(conversionPromises);
  return await zip.generateAsync({ type: 'blob' });
}
