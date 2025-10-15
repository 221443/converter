/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
// @vitest-environment jsdom
import { handleImageFile, handlePdfFile } from '../fileHandler.js';

describe('FileHandler Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock createImageBitmap
    global.createImageBitmap = vi.fn(async (file) => {
      return { width: 100, height: 100, file };
    });

    // Mock Canvas and Context
    global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: '',
    }));

    global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback(new Blob(['mock'], { type: 'image/png' }));
    });

    // Mock Image
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload?.();
        }, 0);
      }
      set src(value) {
        this._src = value;
      }
      get src() {
        return this._src;
      }
      get naturalWidth() {
        return 100;
      }
      get naturalHeight() {
        return 100;
      }
    };

    // Mock URL
    global.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    };

    // Mock pdfjsLib as a global variable
    global.pdfjsLib = {
      GlobalWorkerOptions: { workerSrc: '' },
      getDocument: vi.fn(() => ({
        promise: Promise.resolve({
          numPages: 2,
          getPage: vi.fn((pageNum) =>
            Promise.resolve({
              getViewport: vi.fn(() => ({ width: 100, height: 100 })),
              render: vi.fn(() => ({
                promise: Promise.resolve(),
              })),
            })
          ),
        }),
      })),
    };
  });

  describe('handleImageFile', () => {
    it('should process image file correctly', async () => {
      const mockFile = new File(['mock'], 'test.jpg', { type: 'image/jpeg' });

      const result = await handleImageFile(mockFile);

      expect(result).toHaveProperty('file', mockFile);
      expect(result).toHaveProperty('image');
      expect(result).toHaveProperty('previewUrl');
    });

    it('should handle SVG files correctly', async () => {
      const mockFile = new File(['<svg></svg>'], 'test.svg', { type: 'image/svg+xml' });

      const result = await handleImageFile(mockFile);

      expect(result).toHaveProperty('file', mockFile);
      expect(result).toHaveProperty('image');
      expect(result).toHaveProperty('previewUrl');
    });
  });

  describe('handlePdfFile', () => {
    it('should process PDF file and extract pages', async () => {
      const mockFile = new File(['mock pdf'], 'test.pdf', { type: 'application/pdf' });

      const results = await handlePdfFile(mockFile);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
