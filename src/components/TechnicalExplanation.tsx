import React from "react";
import { Laptop, ShieldCheck, Database, BellRing, Code, Cpu, CheckCircle } from "lucide-react";

export function TechnicalExplanation() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">Technical Overview</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 text-center">
          Here's how our technology works to protect your loved ones from online scams
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <Laptop className="h-10 w-10 text-scamguard-medium mb-4" />
            <h3 className="font-bold text-xl mb-3">Browser Extension</h3>
            <p className="text-gray-600">
              A lightweight extension installs in your parent's web browser, working in the background to monitor for suspicious activity while they browse.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <ShieldCheck className="h-10 w-10 text-scamguard-low mb-4" />
            <h3 className="font-bold text-xl mb-3">Screenshot Capture</h3>
            <p className="text-gray-600">
              When your parent sees something suspicious and presses the red key, the extension securely captures the screen and sends the image for analysis.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <Cpu className="h-10 w-10 text-scamguard-high mb-4" />
            <h3 className="font-bold text-xl mb-3">OCR Processing</h3>
            <p className="text-gray-600">
              Our system uses optical character recognition (OCR) to extract text from screenshots, identifying email addresses, URLs, and suspicious phrases.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <Code className="h-10 w-10 text-scamguard-medium mb-4" />
            <h3 className="font-bold text-xl mb-3">Pattern Matching</h3>
            <p className="text-gray-600">
              Advanced algorithms analyze the extracted text against known scam patterns, email domains, and suspicious phrases to calculate a risk score.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <BellRing className="h-10 w-10 text-scamguard-low mb-4" />
            <h3 className="font-bold text-xl mb-3">Immediate Feedback</h3>
            <p className="text-gray-600">
              Your parent receives instant feedback via a taskbar notification showing whether the content is safe (green) or potentially dangerous (red).
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <Database className="h-10 w-10 text-scamguard-high mb-4" />
            <h3 className="font-bold text-xl mb-3">Secure Cloud Storage</h3>
            <p className="text-gray-600">
              Screenshots and analysis results are securely stored in the cloud, allowing concerned children to review and manage potential threats remotely.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-scamguard-subtle p-8 rounded-lg max-w-3xl mx-auto">
          <h3 className="font-bold text-xl mb-4">Installation Requirements</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-scamguard-low mr-2 mt-0.5" />
              <span className="text-gray-700">Compatible with Chrome, Firefox, Edge, and Safari browsers</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-scamguard-low mr-2 mt-0.5" />
              <span className="text-gray-700">Works on Windows 10/11, macOS 10.15+, and most Linux distributions</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-scamguard-low mr-2 mt-0.5" />
              <span className="text-gray-700">Minimal system requirements: 4GB RAM, 100MB free disk space</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-scamguard-low mr-2 mt-0.5" />
              <span className="text-gray-700">Requires internet connection for cloud analysis and notifications</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default TechnicalExplanation;