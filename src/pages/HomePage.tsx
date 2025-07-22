
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TechnicalExplanation from "@/components/TechnicalExplanation";

const HomePage = () => {
  const [currency, setCurrency] = useState<"USD" | "ZAR">("USD");

  const exchangeRate = 19; // Fixed rate for ZAR conversion
  
  const pricingPlans = {
    free: {
      name: "Free",
      priceUSD: 0,
      priceZAR: 0,
      bestFor: "Try it out with limited features (max 3 scans/mo)",
      features: {
        screenshots: "3 per month",
        aiDetection: true,
        caregiverAlerts: false,
        dashboardAccess: false,
        multiDeviceSupport: false,
        prioritySupport: false,
        dataRetention: "7 days"
      }
    },
    monthly: {
      name: "Monthly",
      priceUSD: 9,
      priceZAR: 9 * exchangeRate,
      bestFor: currency === "USD" ? "Ongoing peace of mind for your parent" : "Affordable safety for South African families",
      features: {
        screenshots: "Unlimited",
        aiDetection: true,
        caregiverAlerts: true,
        dashboardAccess: true,
        multiDeviceSupport: true,
        prioritySupport: true,
        dataRetention: "12 months"
      }
    },
    yearly: {
      name: "Yearly",
      priceUSD: 50,
      priceZAR: 950, // Fixed price from spec
      bestFor: "Best value — save 45% annually",
      features: {
        screenshots: "Unlimited",
        aiDetection: true,
        caregiverAlerts: true,
        dashboardAccess: true,
        multiDeviceSupport: true,
        prioritySupport: true,
        dataRetention: "12 months"
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src="/scamguard-logo.png" alt="ScamGuard Logo" className="h-10" />
          <span className="font-bold text-2xl text-gray-800">ScamGuard</span>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="outline" className="font-medium">
              Log In
            </Button>
          </Link>
          <Link to="/login">
            <Button className="font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 px-3 py-1 bg-indigo-100 text-indigo-800 border-none">AI-Powered Protection</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            One button. One scan. One less thing to worry about.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            ScamGuard uses AI to detect online scams in real time — protecting your parents and only alerting you when it really matters.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="w-full md:w-auto font-medium">
                Try ScamGuard Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full md:w-auto font-medium">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How ScamGuard Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple for seniors, powerful for concerned children. Our AI-powered solution detects and alerts you to real threats.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold mb-4">1</div>
              <h3 className="font-bold text-xl mb-2">Press the Key</h3>
              <p className="text-gray-600">Elder presses the red key when they see something suspicious online.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold mb-4">2</div>
              <h3 className="font-bold text-xl mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI scans the screenshot using OCR and keyword detection.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold mb-4">3</div>
              <h3 className="font-bold text-xl mb-2">Risk Detection</h3>
              <p className="text-gray-600">A risk level is assigned: Safe, Suspicious, or Scam, with appropriate actions.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold mb-4">4</div>
               <h3 className="font-bold text-xl mb-2">Child Alert</h3>
               <p className="text-gray-600">Parents get instant feedback while concerned children receive alerts only when intervention is needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple 3-Step Setup</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started with ScamGuard is easy. Protect your loved ones in minutes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold mb-4">1</div>
            <h3 className="font-bold text-xl mb-2">Place the Dot</h3>
            <p className="text-gray-600">Place the ScamGuard dot on your loved one's keyboard for easy access.</p>
          </div>
          
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold mb-4">2</div>
            <h3 className="font-bold text-xl mb-2">Install Software</h3>
            <p className="text-gray-600">Install our simple software with one click. No tech expertise needed.</p>
          </div>
          
          <div className="border border-gray-200 p-6 rounded-lg">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold mb-4">3</div>
            <h3 className="font-bold text-xl mb-2">Monitor Remotely</h3>
            <p className="text-gray-600">Access the dashboard from anywhere to monitor and respond to alerts.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose the plan that gives your family peace of mind</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free, upgrade anytime. ScamGuard works silently in the background — but protects like a hawk.
            </p>
            
            {/* Currency Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mt-6">
              <button 
                onClick={() => setCurrency("USD")} 
                className={`px-4 py-2 rounded-full text-sm font-medium ${currency === "USD" ? "bg-white shadow-sm" : "text-gray-600"}`}
              >
                USD
              </button>
              <button 
                onClick={() => setCurrency("ZAR")} 
                className={`px-4 py-2 rounded-full text-sm font-medium ${currency === "ZAR" ? "bg-white shadow-sm" : "text-gray-600"}`}
              >
                ZAR
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.values(pricingPlans).map((plan) => (
              <div key={plan.name} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                <h3 className="font-bold text-2xl mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-1">
                  {currency === "USD" 
                    ? `$${plan.priceUSD}` 
                    : `R${plan.priceZAR}`}
                  <span className="text-base font-normal text-gray-500 ml-1">
                    {plan.name !== "Free" && (currency === "USD" ? "/month" : "/month")}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{plan.bestFor}</p>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Screenshots: {plan.features.screenshots}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>AI Scam Detection</span>
                  </li>
                  <li className="flex items-start">
                    {plan.features.caregiverAlerts 
                      ? <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      : <span className="h-5 w-5 text-gray-300 mr-2 mt-0.5">✗</span>}
                    <span className={!plan.features.caregiverAlerts ? "text-gray-400" : ""}>
                      Child Alerts & Parent Notifications
                    </span>
                  </li>
                  <li className="flex items-start">
                    {plan.features.dashboardAccess 
                      ? <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      : <span className="h-5 w-5 text-gray-300 mr-2 mt-0.5">✗</span>}
                    <span className={!plan.features.dashboardAccess ? "text-gray-400" : ""}>
                      Dashboard Access
                    </span>
                  </li>
                  <li className="flex items-start">
                    {plan.features.multiDeviceSupport 
                      ? <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      : <span className="h-5 w-5 text-gray-300 mr-2 mt-0.5">✗</span>}
                    <span className={!plan.features.multiDeviceSupport ? "text-gray-400" : ""}>
                      Multi-device Support
                    </span>
                  </li>
                  <li className="flex items-start">
                    {plan.features.prioritySupport 
                      ? <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      : <span className="h-5 w-5 text-gray-300 mr-2 mt-0.5">✗</span>}
                    <span className={!plan.features.prioritySupport ? "text-gray-400" : ""}>
                      Priority Support
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Data Retention: {plan.features.dataRetention}</span>
                  </li>
                </ul>
                
                <Link to="/login">
                  <Button className="w-full" variant={plan.name === "Free" ? "outline" : "default"}>
                    {plan.name === "Free" ? "Try Free" : "Get Started"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Explanation Section */}
      <TechnicalExplanation />

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ScamGuard is helping families protect their loved ones across the world.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold">JD</div>
              <div className="ml-4">
                <h4 className="font-bold">John D.</h4>
                <p className="text-gray-600 text-sm">Concerned Son</p>
              </div>
            </div>
            <p className="text-gray-600">"ScamGuard caught a tech support scam targeting my father before he could give away his credit card details. Worth every penny!"</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold">SM</div>
              <div className="ml-4">
                <h4 className="font-bold">Sarah M.</h4>
                <p className="text-gray-600 text-sm">Senior Care Facility Director</p>
              </div>
            </div>
            <p className="text-gray-600">"We've implemented ScamGuard across our facility. The AI filtering is impressive - we only get alerts when there's a genuine concern."</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold">LW</div>
              <div className="ml-4">
                <h4 className="font-bold">Lisa W.</h4>
                <p className="text-gray-600 text-sm">Daughter</p>
              </div>
            </div>
            <p className="text-gray-600">"My mom loves the simplicity - she just hits the button when she's unsure. I love that I don't have to constantly monitor her computer use."</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <Shield className="h-16 w-16 mx-auto mb-6 text-indigo-300" />
            <h2 className="text-3xl font-bold mb-4">Ready to protect your loved ones?</h2>
            <p className="text-xl mb-8 text-indigo-200">
              Get started with ScamGuard today and give your family the gift of online safety.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-900 w-full sm:w-auto">
                  Try Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-100 w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-4">
                <img src="/scamguard-logo.png" alt="ScamGuard Logo" className="h-8" />
                <span className="font-bold text-xl text-gray-800">ScamGuard</span>
              </div>
              <p className="text-gray-600 mt-2">Protecting seniors from online scams.</p>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <div>
                <h4 className="font-bold mb-2">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">Features</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">About</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">Support</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
                  <li><Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact Support</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} ScamGuard. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-gray-900">Terms</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
