'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { handleImageFile, handlePdfFile, ImageFile } from '@/lib/fileHandler';
import { convertToPdf, convertToZip } from '@/lib/converter';
import { formatBytes, showError, hideError } from '@/lib/utils';

export default function FileConverter() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [format, setFormat] = useState('jpeg');
  const [quality, setQuality] = useState(0.9);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [downloadFilename, setDownloadFilename] = useState('');
  const [convertedSize, setConvertedSize] = useState<string>('');
  const [showOutput, setShowOutput] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setImageFiles([]);
    setError('');
    setShowOutput(false);
    hideError(errorRef.current);

    const filePromises = Array.from(files).map((file) => {
      if (file.type.startsWith('image/')) {
        return handleImageFile(file);
      } else if (file.type === 'application/pdf') {
        return handlePdfFile(file);
      } else {
        console.warn(`Skipping unsupported file type: ${file.name}`);
        return Promise.resolve(null);
      }
    });

    try {
      const results = await Promise.all(filePromises);
      const validFiles = results.flat().filter((file): file is ImageFile => file !== null);

      if (validFiles.length === 0) {
        setError('No valid image or PDF files were selected.');
        showError('No valid image or PDF files were selected.', errorRef.current);
      } else {
        setImageFiles(validFiles);
      }
    } catch (err) {
      console.error('Error loading files:', err);
      setError('There was an error loading one or more files.');
      showError('There was an error loading one or more files.', errorRef.current);
    } finally {
      setIsLoading(false);
    }
  };

  const processFiles = async () => {
    if (imageFiles.length === 0) {
      setError('No files selected to convert.');
      showError('No files selected to convert.', errorRef.current);
      return;
    }

    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    setIsLoading(true);

    try {
      let blob: Blob;
      let filename: string;

      if (format === 'pdf') {
        blob = await convertToPdf(imageFiles, canvasRef.current, ctx);
        filename = 'converted-files.pdf';
      } else {
        blob = await convertToZip(imageFiles, canvasRef.current, ctx, format, quality);
        filename = 'converted-files.zip';
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFilename(filename);
      setConvertedSize(formatBytes(blob.size));
      setShowOutput(true);
    } catch (err) {
      console.error('Conversion failed:', err);
      setError('An unexpected error occurred during conversion.');
      showError('An unexpected error occurred during conversion.', errorRef.current);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSize = imageFiles.reduce((sum, { file }) => sum + file.size, 0);
  const showQuality = format === 'jpeg' || format === 'jpg' || format === 'webp';

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
          Image & PDF Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Convert files right in your browser. Fast, private, and secure.
        </p>
      </div>

      {/* File Upload */}
      <div>
        <label
          htmlFor="image-input"
          className="file-label cursor-pointer w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6M15 9H9"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Images (PNG, JPG, SVG, etc.) and PDF files
          </p>
        </label>
        <input
          type="file"
          id="image-input"
          accept="image/*,application/pdf,image/svg+xml"
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />
      </div>

      {/* Error Message */}
      <div
        ref={errorRef}
        className="hidden text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg"
      >
        {error}
      </div>

      {/* Image Details & Options */}
      {imageFiles.length > 0 && (
        <div className="visible-section space-y-6">
          {/* Preview Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            {imageFiles.map(({ file, previewUrl }, index) => (
              <img
                key={index}
                src={previewUrl}
                alt={file.name}
                title={`${file.name} (${formatBytes(file.size)})`}
                className="w-full h-full object-cover rounded-md shadow-sm"
              />
            ))}
          </div>

          {/* File Info */}
          <div className="text-sm space-y-2">
            <p>
              <strong>Files Selected:</strong> {imageFiles.length}
            </p>
            <p>
              <strong>Total Size:</strong> {formatBytes(totalSize)}
            </p>
          </div>

          {/* Conversion Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            {/* Format Selection */}
            <div>
              <label
                htmlFor="format-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Convert to:
              </label>
              <select
                id="format-select"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="jpeg">JPEG</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
                <option value="bmp">BMP</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            {/* Quality Slider */}
            {showQuality && (
              <div>
                <label
                  htmlFor="quality-slider"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Quality: {quality.toFixed(2)}
                </label>
                <input
                  id="quality-slider"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Convert Button */}
          <button
            onClick={processFiles}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.39 2.503a6.473 6.473 0 0 0-3.383-.984a6.48 6.48 0 0 0-4.515 1.77l.005-.559a.75.75 0 1 0-1.5-.013l-.022 2.5a.75.75 0 0 0 .743.756l2.497.022a.75.75 0 1 0 .013-1.5l-.817-.007a4.983 4.983 0 0 1 3.583-1.469a4.973 4.973 0 0 1 2.602.756a.75.75 0 0 0 .795-1.272Zm-9.097 8.716a6.473 6.473 0 0 1-.84-3.422a.75.75 0 1 1 1.5.053a4.955 4.955 0 0 0 .646 2.63a4.983 4.983 0 0 0 3.064 2.37l-.403-.712a.75.75 0 0 1 1.306-.738l1.229 2.173a.75.75 0 0 1-.283 1.022l-2.176 1.23a.75.75 0 1 1-.739-1.305l.487-.275a6.48 6.48 0 0 1-3.79-3.026Zm11.258.099a6.473 6.473 0 0 1-2.544 2.438a.75.75 0 0 1-.704-1.325a4.974 4.974 0 0 0 1.955-1.875a4.983 4.983 0 0 0 .52-3.838l-.415.705a.75.75 0 1 1-1.292-.762l1.267-2.15a.75.75 0 0 1 1.027-.266l2.154 1.268a.75.75 0 1 1-.761 1.293l-.483-.284a6.48 6.48 0 0 1-.724 4.796" />
            </svg>
            <span>{isLoading ? 'Converting...' : 'Convert Files'}</span>
          </button>
        </div>
      )}

      {/* Output Section */}
      {showOutput && (
        <div className="visible-section text-center p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Conversion Complete!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Final file size: <span className="font-bold">{convertedSize}</span>
          </p>
          <a
            href={downloadUrl}
            download={downloadFilename}
            className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Download {downloadFilename.endsWith('.pdf') ? 'PDF' : 'ZIP'}
          </a>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
