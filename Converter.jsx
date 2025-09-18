import React, { useRef, useState } from "react";

const RASTER_SCALE_FACTOR = 10;

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const ImagePdfConverter = () => {
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [format, setFormat] = useState("jpeg");
  const [quality, setQuality] = useState(0.9);
  const [output, setOutput] = useState(null);
  const [outputSize, setOutputSize] = useState(0);
  const [outputType, setOutputType] = useState("zip");
  const [fileCount, setFileCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [previews, setPreviews] = useState([]);
  const canvasRef = useRef(null);
  const downloadLinkRef = useRef(null);

  // Load external scripts (pdf.js, jszip, jspdf) only once
  React.useEffect(() => {
    const scripts = [
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    ];
    scripts.forEach((src) => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        document.body.appendChild(script);
      }
    });
  }, []);

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    setError("");
    setOutput(null);
    setPreviews([]);
    let loadedFiles = [];
    let previewImgs = [];
    let total = 0;

    const handleImageFile = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new window.Image();
          img.onload = () => resolve({ file, image: img });
          img.onerror = reject;
          img.src = ev.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    const handlePdfFile = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
            const pdf = await window.pdfjsLib.getDocument({ data: ev.target.result }).promise;
            const numPages = pdf.numPages;
            const pagePromises = [];
            for (let i = 1; i <= numPages; i++) {
              pagePromises.push(
                (async (pageNum) => {
                  const page = await pdf.getPage(pageNum);
                  const viewport = page.getViewport({ scale: 1.5 });
                  const tempCanvas = document.createElement("canvas");
                  const tempCtx = tempCanvas.getContext("2d");
                  tempCanvas.height = viewport.height;
                  tempCanvas.width = viewport.width;
                  await page.render({ canvasContext: tempCtx, viewport }).promise;
                  const img = new window.Image();
                  const originalFilename = file.name.substring(0, file.name.lastIndexOf("."));
                  const pageFile = {
                    name: `${originalFilename}-page-${pageNum}`,
                    size: file.size / numPages,
                    type: "application/pdf-page",
                  };
                  return new Promise((res, rej) => {
                    img.onload = () => res({ file: pageFile, image: img });
                    img.onerror = rej;
                    img.src = tempCanvas.toDataURL("image/png");
                  });
                })(i)
              );
            }
            resolve(await Promise.all(pagePromises));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

    const filePromises = Array.from(files).map((file) => {
      if (file.type.startsWith("image/")) {
        return handleImageFile(file);
      } else if (file.type === "application/pdf") {
        return handlePdfFile(file);
      } else {
        return Promise.resolve(null);
      }
    });

    try {
      const results = await Promise.all(filePromises);
      loadedFiles = results.flat().filter(Boolean);
      if (loadedFiles.length === 0) {
        setError("No valid image or PDF files were selected.");
        setLoading(false);
        return;
      }
      loadedFiles.forEach(({ file, image }) => {
        total += file.size;
        previewImgs.push(image.src);
      });
      setImageFiles(loadedFiles);
      setFileCount(loadedFiles.length);
      setTotalSize(total);
      setPreviews(previewImgs);
    } catch (err) {
      setError("There was an error loading one or more files.");
    }
    setLoading(false);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handleQualityChange = (e) => {
    setQuality(Number(e.target.value));
  };

  const processFiles = async () => {
    if (imageFiles.length === 0) {
      setError("No files selected to convert.");
      return;
    }
    setLoading(true);
    setError("");
    if (format === "pdf") {
      await convertToPdf();
    } else {
      await convertToZip();
    }
    setLoading(false);
  };

  const convertToPdf = async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    for (let i = 0; i < imageFiles.length; i++) {
      const { image } = imageFiles[i];
      if (i > 0) doc.addPage();
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      canvas.width = width * RASTER_SCALE_FACTOR;
      canvas.height = height * RASTER_SCALE_FACTOR;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);
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
      doc.addImage(imageDataUrl, "JPEG", x, y, imgWidth, imgHeight);
    }
    const pdfBlob = doc.output("blob");
    setOutput(URL.createObjectURL(pdfBlob));
    setOutputSize(pdfBlob.size);
    setOutputType("pdf");
  };

  const convertToZip = async () => {
    const zip = new window.JSZip();
    const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const conversionPromises = imageFiles.map(({ file, image }) => {
      return new Promise((resolve) => {
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        canvas.width = width * RASTER_SCALE_FACTOR;
        canvas.height = height * RASTER_SCALE_FACTOR;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            const originalFilename = file.name;
            const lastDotIndex = originalFilename.lastIndexOf(".");
            const nameWithoutExtension =
              lastDotIndex > 0 ? originalFilename.substring(0, lastDotIndex) : originalFilename;
            const newFilename = `${nameWithoutExtension}.${format}`;
            zip.file(newFilename, blob);
            resolve();
          },
          mimeType,
          quality
        );
      });
    });
    await Promise.all(conversionPromises);
    const zipBlob = await zip.generateAsync({ type: "blob" });
    setOutput(URL.createObjectURL(zipBlob));
    setOutputSize(zipBlob.size);
    setOutputType("zip");
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
          Image & PDF Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Convert files right in your browser. Fast, private, and secure.
        </p>
      </div>
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
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 9v6m3-3H7"
            ></path>
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
      {error && (
        <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">
          {error}
        </div>
      )}
      {imageFiles.length > 0 && (
        <div className="space-y-6 visible-section">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            {previews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`preview-${idx}`}
                className="w-full h-full object-cover rounded-md shadow-sm"
              />
            ))}
          </div>
          <div className="text-sm space-y-2">
            <p>
              <strong>Files Selected:</strong> {fileCount}
            </p>
            <p>
              <strong>Total Size:</strong> {formatBytes(totalSize)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label
                htmlFor="format-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Convert to:
              </label>
              <select
                id="format-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={format}
                onChange={handleFormatChange}
              >
                <option value="jpeg">JPEG</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
                <option value="bmp">BMP</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            {(format === "jpeg" || format === "webp") && (
              <div>
                <label
                  htmlFor="quality-slider"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Quality: <span>{quality}</span>
                </label>
                <input
                  id="quality-slider"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={handleQualityChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
          <button
            onClick={processFiles}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"
              ></path>
            </svg>
            {loading ? "Converting..." : "Convert Files"}
          </button>
        </div>
      )}
      {output && (
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg visible-section">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Conversion Complete!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Final file size: <span className="font-bold">{formatBytes(outputSize)}</span>
          </p>
          <a
            ref={downloadLinkRef}
            href={output}
            download={outputType === "pdf" ? "converted-files.pdf" : "converted-files.zip"}
            className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors"
          >
            {outputType === "pdf" ? "Download All (.pdf)" : "Download All (.zip)"}
          </a>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImagePdfConverter;