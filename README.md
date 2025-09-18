# Client-Side Image & PDF Converter

This is a powerful, browser-based utility for converting multiple image and PDF files without uploading them to a server. All processing is done directly on the client's machine, ensuring user data remains private and secure.

## Features

* **Batch Conversion:** Convert multiple files at once.
* **Wide Format Support:**
    * **Input:** PNG, JPEG, WEBP, BMP, SVG, and PDF.
    * **Output:** JPEG, PNG, WEBP, BMP, and PDF.
* **PDF Handling:**
    * Convert images (including multi-page selections) into a single PDF document.
    * Extract all pages from a PDF file and convert them into individual images.
* **High-Quality SVG Conversion:** SVGs are rasterized at a higher resolution to ensure crisp output, with proper handling for transparent backgrounds.
* **Adjustable Quality:** Control the compression quality for JPEG and WEBP formats to balance file size and visual fidelity.
* **Zip Downloads:** When converting to an image format, all files are bundled into a single `.zip` file for easy downloading.
* **100% Client-Side:** No server is needed. Your files are never uploaded, providing maximum privacy.

## How to Use

1.  **Open the File:** Simply open the `image-converter.html` file in any modern web browser (like Chrome, Firefox, or Edge).
2.  **Upload Files:** Click the upload area to select files from your computer, or drag and drop them directly onto the page. You can select multiple files of different supported types.
3.  **Choose Conversion Options:**
    * Select your desired output format from the "Convert to" dropdown menu.
    * If converting to JPEG or WEBP, adjust the quality slider as needed.
4.  **Convert:** Click the "Convert Files" button to begin the process.
5.  **Download:** Once the conversion is complete, a download link will appear. Click it to save your converted files as a `.zip` archive or a single `.pdf` file.

## Technologies Used

* **HTML, CSS, & JavaScript:** The core of the web application.
* **Tailwind CSS:** For modern and responsive styling.
* **JSZip.js:** For creating `.zip` files in the browser.
* **pdf.js:** For parsing and rendering PDF files.
* **jsPDF.js:** For creating new PDF documents from images.