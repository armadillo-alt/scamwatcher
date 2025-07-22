
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Smartphone, 
  MonitorSmartphone, 
  UserCheck, 
  ArrowRight, 
  Check,
  AlertTriangle,
  Clock,
  BrainCircuit,
  MessagesSquare,
  KeyRound
} from "lucide-react";

const Landing = () => {
  const [isHoveringDemo, setIsHoveringDemo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-8 w-8 text-scamguard-high" />
          <span className="text-2xl font-bold">ScamGuard</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            to="/login" 
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Login
          </Link>
          <Link to="/login">
            <Button>
              Dashboard Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-900 animate-fade-in">
          One Button. One Scan. One Less Thing to Worry About.
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-fade-in">
          ScamGuard uses AI to detect online scams in real time — protecting your loved ones 
          and only alerting you when it really matters.
        </p>
        <div className="flex justify-center gap-4 animate-fade-in">
          <Link to="/login">
            <Button size="lg" className="group">
              Try ScamGuard Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="#how-it-works">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-scamguard-subtle py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-lg shadow-sm animate-scale-in">
              <AlertTriangle className="h-10 w-10 text-scamguard-high mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">5.5 Million</h3>
              <p className="text-gray-600">Scam attempts targeting seniors annually</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm animate-scale-in">
              <BrainCircuit className="h-10 w-10 text-scamguard-medium mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">AI-Powered</h3>
              <p className="text-gray-600">Smart detection means no false alarms</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm animate-scale-in">
              <ShieldCheck className="h-10 w-10 text-scamguard-low mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Peace of Mind</h3>
              <p className="text-gray-600">For both concerned children and their elderly loved ones</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works - Simple by Design</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-scamguard-subtle p-6 rounded-full mb-6">
              <KeyRound className="h-10 w-10 text-scamguard-high" />
            </div>
            <h3 className="text-xl font-bold mb-4">1. Press the Red Key</h3>
            <p className="text-gray-600">
              When in doubt, your loved one presses one labeled key to check if something is a scam.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-scamguard-subtle p-6 rounded-full mb-6">
              <BrainCircuit className="h-10 w-10 text-scamguard-medium" />
            </div>
            <h3 className="text-xl font-bold mb-4">2. AI Analyzes the Screen</h3>
            <p className="text-gray-600">
              Our AI scans the screenshot for suspicious content, fake URLs, and scam indicators.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-scamguard-subtle p-6 rounded-full mb-6">
              <AlertTriangle className="h-10 w-10 text-scamguard-medium" />
            </div>
            <h3 className="text-xl font-bold mb-4">3. Risk Assessment</h3>
            <p className="text-gray-600">
              Content is analyzed and assigned a risk level: Safe, Suspicious, or Scam.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-scamguard-subtle p-6 rounded-full mb-6">
              <MessagesSquare className="h-10 w-10 text-scamguard-low" />
            </div>
              <h3 className="text-xl font-bold mb-4">4. Smart Alerts</h3>
              <p className="text-gray-600">
                Concerned children are only notified when real risks are detected. Parents receive immediate red/green notifications showing if the content is safe or risky.
              </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Smart Protection, Not Spam</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-start gap-4">
              <div className="bg-scamguard-subtle p-3 rounded-full shrink-0">
                <BrainCircuit className="h-6 w-6 text-scamguard-high" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">AI-Driven Scam Detection</h3>
                <p className="text-gray-600">
                  Advanced algorithms identify scams based on content, suspicious URLs, and known patterns.
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-start gap-4">
              <div className="bg-scamguard-subtle p-3 rounded-full shrink-0">
                <KeyRound className="h-6 w-6 text-scamguard-medium" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">One-Key Simplicity</h3>
                <p className="text-gray-600">
                  Even users with zero tech ability can get instant help with a single keystroke.
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-start gap-4">
              <div className="bg-scamguard-subtle p-3 rounded-full shrink-0">
                <MonitorSmartphone className="h-6 w-6 text-scamguard-low" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Real-Time Monitoring</h3>
                <p className="text-gray-600">
                  View screenshots only when intervention is needed, with clear risk assessments.
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-start gap-4">
              <div className="bg-scamguard-subtle p-3 rounded-full shrink-0">
                <MessagesSquare className="h-6 w-6 text-scamguard-medium" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Direct Communication</h3>
                <p className="text-gray-600">
                  Send instructions directly to help your loved one avoid potential scams in the moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Simplicity Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6">Simple 3-Step Setup</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <div className="bg-scamguard-low/20 h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold text-scamguard-low mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Place the ScamGuard dot on the keyboard</p>
                    <p className="text-gray-600 text-sm">Our dot marks the key that activates the scam check</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-scamguard-medium/20 h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold text-scamguard-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Install our lightweight software</p>
                    <p className="text-gray-600 text-sm">Simple download and installation with no technical skills required</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-scamguard-high/20 h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold text-scamguard-high mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Monitor from anywhere</p>
                    <p className="text-gray-600 text-sm">Access the caregiver dashboard from any device, anytime</p>
                  </div>
                </li>
              </ul>
              <div 
                className="relative mt-8" 
                onMouseEnter={() => setIsHoveringDemo(true)}
                onMouseLeave={() => setIsHoveringDemo(false)}
              >
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Try Demo Dashboard
                    <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${isHoveringDemo ? 'translate-x-1' : ''}`} />
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 mt-2">Username: admin / Password: admin</p>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-100 p-10">
              <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                <img 
                  src="https://placehold.co/800x600/E6FFEF/2D5/png?text=ScamGuard+Dashboard" 
                  alt="ScamGuard Dashboard Demo" 
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-scamguard-subtle py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Stories from Concerned Children</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-scamguard-low/20 h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold text-scamguard-low">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Jennifer M.</h4>
                  <p className="text-gray-600 text-sm">Caring for father, 78</p>
                </div>
              </div>
              <p className="text-gray-600">
                "ScamGuard caught a sophisticated phishing attempt targeting my dad's banking info. 
                The best part? I didn't have to check in with him constantly - the system only alerted me when 
                it really mattered."
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-scamguard-medium/20 h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold text-scamguard-medium">
                  R
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Robert K.</h4>
                  <p className="text-gray-600 text-sm">Caring for mother, 82</p>
                </div>
              </div>
              <p className="text-gray-600">
                "My mother just presses the red key whenever she's unsure. It's so simple, she mastered it 
                immediately. The AI has flagged several suspicious pop-ups that could have led to 
                financial fraud."
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-scamguard-high/20 h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold text-scamguard-high">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Sophia T.</h4>
                  <p className="text-gray-600 text-sm">Professional caregiver</p>
                </div>
              </div>
              <p className="text-gray-600">
                "As someone who cares for multiple seniors, ScamGuard has eliminated the constant worry. 
                I only get alerts when there's actual risk, not false alarms or routine browsing."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Peace of Mind Starts With a Single Key</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Get started with ScamGuard today and provide the digital safety net your family deserves.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Try ScamGuard Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Contact Support
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShieldCheck className="h-6 w-6 text-white" />
                <span className="text-xl font-bold">ScamGuard</span>
              </div>
              <p className="text-gray-400">
                Protecting vulnerable individuals from digital threats and scams.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} ScamGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
