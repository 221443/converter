# 🚀 Client-Side Image & PDF Converter

[![CI/CD Pipeline](https://github.com/221443/converter/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/221443/converter/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A powerful, privacy-first browser-based utility for converting multiple image and PDF files without uploading them to a server. All processing happens directly on your device, ensuring complete data privacy and security.

## ✨ Features

### Core Functionality
* 🔄 **Batch Conversion:** Convert multiple files simultaneously
* 📁 **Wide Format Support:**
    * **Input:** PNG, JPEG, WEBP, BMP, SVG, and PDF
    * **Output:** JPEG, PNG, WEBP, BMP, and PDF
* 📄 **Advanced PDF Handling:**
    * Convert images into multi-page PDF documents
    * Extract individual pages from PDF files as images
    * Customizable page layouts and sizes
* 🎨 **High-Quality SVG Processing:** Advanced rasterization with transparency support
* ⚙️ **Quality Control:** Adjustable compression for optimal file size vs. quality balance
* 📦 **Smart Downloads:** Automatic ZIP bundling for batch conversions
* 🔒 **100% Client-Side:** Zero server uploads - complete privacy guaranteed

### Advanced Features
* 🎛️ **Image Filters:** Brightness, contrast, saturation, blur, sepia, grayscale
* 📏 **Smart Resizing:** Multiple scaling algorithms
* 📊 **Progress Tracking:** Real-time conversion progress
* 📈 **Performance Monitoring:** Built-in analytics and optimization
* 🌙 **Dark Mode:** Responsive design with theme support

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Visit the live demo: [https://221443.github.io/converter](https://221443.github.io/converter)

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/221443/converter.git
cd converter

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 How to Use

1. **📂 Upload Files:** Click the upload area or drag & drop your files
2. **⚙️ Choose Options:** Select output format and adjust quality settings
3. **🔄 Convert:** Click "Convert Files" and watch the progress
4. **📥 Download:** Get your converted files as a ZIP or PDF

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- Modern web browser

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run test:ui      # Run tests with UI
npm run lint         # Lint code
npm run format       # Format code
npm run deploy       # Deploy to GitHub Pages
```

### Project Structure
```
converter/
├── src/
│   ├── app.js              # Main application logic
│   ├── converter.js        # Core conversion functions
│   ├── fileHandler.js      # File processing utilities
│   ├── utils.js           # Helper functions
│   └── analytics.js       # Performance monitoring
├── tests/                 # Test suite
├── dist/                  # Built files
└── docs/                  # Documentation
```

## Technologies Used

* **HTML, CSS, & JavaScript:** The core of the web application.
* **Tailwind CSS:** For modern and responsive styling.
* **JSZip.js:** For creating `.zip` files in the browser.
* **pdf.js:** For parsing and rendering PDF files.
* **jsPDF.js:** For creating new PDF documents from images.