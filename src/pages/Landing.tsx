
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
  Clock
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
          Protect Your Loved Ones from Online Scams
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-fade-in">
          ScamGuard monitors device activity to identify potential scams and fraud attempts, 
          allowing caregivers to intervene before harm occurs.
        </p>
        <div className="flex justify-center gap-4 animate-fade-in">
          <Link to="/login">
            <Button size="lg" className="group">
              Get Started
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
              <Clock className="h-10 w-10 text-scamguard-medium mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">24/7</h3>
              <p className="text-gray-600">Continuous monitoring and protection</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm animate-scale-in">
              <ShieldCheck className="h-10 w-10 text-scamguard-low mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">95%</h3>
              <p className="text-gray-600">Success rate in identifying scam attempts</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">Simple Setup, Powerful Protection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="bg-scamguard-subtle p-6 rounded-full mb-6">
              <Smartphone className="h-10 w-10 text-scamguard-high" />
            </div>
            <h3 className="text-xl font-bold mb-4">1. Install The Software</h3>
            <p className="text-gray-600">
              Simply download and install our lightweight monitoring software on your loved one's device.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-scamguard-subtle p-6 rounded-full mb-6">
              <UserCheck className="h-10 w-10 text-scamguard-medium" />
            </div>
            <h3 className="text-xl font-bold mb-4">2. Place the Security Dot</h3>
            <p className="text-gray-600">
              Add the unobtrusive security dot to the device's keyboard for enhanced monitoring capabilities.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-scamguard-subtle p-6 rounded-full mb-6">
              <MonitorSmartphone className="h-10 w-10 text-scamguard-low" />
            </div>
            <h3 className="text-xl font-bold mb-4">3. Monitor Remotely</h3>
            <p className="text-gray-600">
              Access the caregiver dashboard from anywhere to review activity and receive alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Comprehensive Protection Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-start gap-4">
              <div className="bg-scamguard-subtle p-3 rounded-full shrink-0">
                <AlertTriangle className="h-6 w-6 text-scamguard-high" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Scam Detection</h3>
                <p className="text-gray-600">
                  Advanced algorithms identify potential scam attempts based on content and patterns.
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-start gap-4">
              <div className="bg-scamguard-subtle p-3 rounded-full shrink-0">
                <Clock className="h-6 w-6 text-scamguard-medium" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Real-Time Alerts</h3>
                <p className="text-gray-600">
                  Receive immediate notifications when suspicious activity is detected.
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-start gap-4">
              <div className="bg-scamguard-subtle p-3 rounded-full shrink-0">
                <MonitorSmartphone className="h-6 w-6 text-scamguard-low" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Screen Monitoring</h3>
                <p className="text-gray-600">
                  Capture screenshots of suspicious content for review and intervention.
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm flex items-start gap-4">
              <div className="bg-scamguard-subtle p-3 rounded-full shrink-0">
                <UserCheck className="h-6 w-6 text-scamguard-medium" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Caregiver Instructions</h3>
                <p className="text-gray-600">
                  Send instructions directly to the user's device to help them avoid potential scams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6">See ScamGuard In Action</h2>
              <p className="text-gray-600 mb-8">
                Our intuitive dashboard gives caregivers complete visibility into potential threats and allows for 
                immediate intervention when needed.
              </p>
              <div 
                className="relative" 
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
          <h2 className="text-3xl font-bold text-center mb-16">What Caregivers Are Saying</h2>
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
                "ScamGuard has given me peace of mind knowing I can intervene before my father falls victim to online scams. 
                Last month it caught a phishing attempt that looked legitimate even to me."
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
                "The setup was incredibly simple, and my mother doesn't even notice it's there. But it's caught several 
                suspicious sites and pop-ups that could have led to financial fraud."
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
                "As someone who cares for multiple seniors, ScamGuard has been a game-changer. I can monitor everyone's 
                activity from one dashboard and quickly address any concerns."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Protect Your Loved Ones?</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Get started with ScamGuard today and provide the digital safety net your family deserves.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Create Account
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
