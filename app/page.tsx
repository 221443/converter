import FileConverter from '@/components/FileConverter';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">File Converter Pro</h1>
            </div>
            <div className="flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a
                href="#converter"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Convert Now
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Convert Files <span className="text-yellow-300">Instantly</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Privacy-first image and PDF conversion. No uploads, no servers, just results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#converter"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Converting
              </a>
              <a
                href="#features"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose File Converter Pro?
            </h2>
            <p className="text-xl text-gray-600">
              Professional-grade conversion with privacy at its core
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                🔒
              </div>
              <h3 className="text-xl font-semibold mb-3">100% Private</h3>
              <p className="text-gray-600">
                All processing happens in your browser. Your files never leave your device.
              </p>
            </div>

            <div className="feature-card bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Convert multiple files simultaneously with real-time progress tracking.
              </p>
            </div>

            <div className="feature-card bg-gray-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                🎨
              </div>
              <h3 className="text-xl font-semibold mb-3">Professional Quality</h3>
              <p className="text-gray-600">
                Advanced algorithms ensure optimal quality and file size balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Converter Section */}
      <section id="converter" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Convert?
            </h2>
            <p className="text-xl text-gray-600">Upload your files and experience the difference</p>
          </div>

          <FileConverter />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">100%</div>
              <div className="text-gray-600">Privacy Protected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">15+</div>
              <div className="text-gray-600">File Formats</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">0</div>
              <div className="text-gray-600">Data Uploaded</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">∞</div>
              <div className="text-gray-600">Files Converted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">File Converter Pro</h3>
              <p className="text-gray-400">Privacy-first file conversion for the modern web.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Image Conversion</li>
                <li>PDF Processing</li>
                <li>Batch Operations</li>
                <li>Quality Control</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    MIT License
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 File Converter Pro. Built with ❤️ for privacy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
