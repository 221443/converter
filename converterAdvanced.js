// Enhanced converter with advanced features
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import JSZip from "https://esm.sh/jszip@3.10.1";

/**
 * Image processing options for advanced conversions
 */
export class ImageProcessor {
  constructor() {
    this.filters = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sepia: false,
      grayscale: false
    };
  }

  /**
   * Apply filters to canvas context
   */
  applyFilters(ctx, canvas) {
    const { brightness, contrast, saturation, blur, sepia, grayscale } = this.filters;
    
    let filterString = '';
    
    if (brightness !== 0) {
      filterString += `brightness(${100 + brightness}%) `;
    }
    
    if (contrast !== 0) {
      filterString += `contrast(${100 + contrast}%) `;
    }
    
    if (saturation !== 0) {
      filterString += `saturate(${100 + saturation}%) `;
    }
    
    if (blur > 0) {
      filterString += `blur(${blur}px) `;
    }
    
    if (sepia) {
      filterString += 'sepia(100%) ';
    }
    
    if (grayscale) {
      filterString += 'grayscale(100%) ';
    }
    
    ctx.filter = filterString.trim() || 'none';
  }

  /**
   * Resize image with different algorithms
   */
  resizeImage(canvas, ctx, targetWidth, targetHeight, algorithm = 'lanczos') {
    const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // For now, use built-in canvas scaling
    // In the future, implement custom scaling algorithms
    ctx.putImageData(originalImageData, 0, 0);
  }
}

/**
 * Batch processing with progress tracking
 */
export class BatchProcessor {
  constructor(onProgress) {
    this.onProgress = onProgress || (() => {});
    this.aborted = false;
  }

  async processFiles(files, processingFunction) {
    const results = [];
    const total = files.length;
    
    for (let i = 0; i < files.length; i++) {
      if (this.aborted) {
        throw new Error('Processing aborted');
      }
      
      try {
        const result = await processingFunction(files[i], i);
        results.push(result);
        
        this.onProgress({
          current: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          file: files[i]
        });
      } catch (error) {
        console.error(`Error processing file ${files[i].name}:`, error);
        results.push(null);
      }
    }
    
    return results.filter(Boolean);
  }

  abort() {
    this.aborted = true;
  }
}

/**
 * Enhanced PDF operations
 */
export class PDFProcessor {
  constructor() {
    this.pageSize = 'a4';
    this.orientation = 'portrait';
    this.margin = 20;
    this.compression = 0.9;
  }

  /**
   * Create PDF with advanced layout options
   */
  async createAdvancedPDF(imageFiles, options = {}) {
    const { pageSize = this.pageSize, orientation = this.orientation, margin = this.margin } = options;
    
    const doc = new jsPDF(orientation, 'pt', pageSize);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    let isFirstPage = true;
    
    for (const { file, canvas } of imageFiles) {
      if (!isFirstPage) {
        doc.addPage();
      }
      
      const aspectRatio = canvas.width / canvas.height;
      let imgWidth = contentWidth;
      let imgHeight = contentWidth / aspectRatio;
      
      if (imgHeight > contentHeight) {
        imgHeight = contentHeight;
        imgWidth = contentHeight * aspectRatio;
      }
      
      const x = margin + (contentWidth - imgWidth) / 2;
      const y = margin + (contentHeight - imgHeight) / 2;
      
      const imgData = canvas.toDataURL('image/jpeg', this.compression);
      doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      
      isFirstPage = false;
    }
    
    return doc;
  }
}

/**
 * Enhanced conversion functions with new features
 */
export async function convertToPdfAdvanced(imageFiles, appContext, options = {}) {
  const processor = new PDFProcessor();
  const batchProcessor = new BatchProcessor((progress) => {
    // Update UI with progress
    const progressText = `Converting... ${progress.percentage}% (${progress.current}/${progress.total})`;
    appContext.convertBtnText.textContent = progressText;
  });

  try {
    const doc = await processor.createAdvancedPDF(imageFiles, options);
    const pdfBlob = doc.output('blob');
    
    updateDownloadUI(pdfBlob, 'converted-images.pdf', appContext);
  } catch (error) {
    console.error('PDF conversion failed:', error);
    throw error;
  }
}

/**
 * Enhanced ZIP conversion with compression options
 */
export async function convertToZipAdvanced(imageFiles, appContext, options = {}) {
  const { compressionLevel = 6, format = 'jpeg', quality = 0.9 } = options;
  
  const zip = new JSZip();
  const imageProcessor = new ImageProcessor();
  const batchProcessor = new BatchProcessor((progress) => {
    const progressText = `Converting... ${progress.percentage}% (${progress.current}/${progress.total})`;
    appContext.convertBtnText.textContent = progressText;
  });

  await batchProcessor.processFiles(imageFiles, async ({ file, image }, index) => {
    const { canvas, ctx } = appContext;
    
    // Apply any filters
    imageProcessor.applyFilters(ctx, canvas);
    
    // Draw and convert
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          const fileName = `${file.name.split('.')[0]}_${index + 1}.${format}`;
          zip.file(fileName, blob);
          resolve();
        },
        `image/${format}`,
        quality
      );
    });
  });

  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: compressionLevel }
  });
  
  updateDownloadUI(zipBlob, 'converted-images.zip', appContext);
}

// Legacy functions for backward compatibility
export async function convertToPdf(imageFiles, appContext) {
  return convertToPdfAdvanced(imageFiles, appContext);
}

export async function convertToZip(imageFiles, appContext) {
  return convertToZipAdvanced(imageFiles, appContext);
}

/**
 * Update download UI
 */
function updateDownloadUI(blob, filename, appContext) {
  const { downloadLink, downloadBtnText, newSizeEl, outputSection, formatBytes } = appContext;

  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;
  const fileExt = filename.split('.').pop();
  downloadBtnText.textContent = `Download All (.${fileExt})`;
  newSizeEl.textContent = formatBytes(blob.size);

  outputSection.classList.remove("hidden-section");
  outputSection.classList.add("visible-section");
}