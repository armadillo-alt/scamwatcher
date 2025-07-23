
import React from "react";
import { Shield, Users, Bell, ArrowRight, Star, CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { TechnicalExplanation } from "@/components/TechnicalExplanation";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-scamguard-background to-scamguard-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-scamguard-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-scamguard-medium" />
              <span className="text-2xl font-bold text-scamguard-text">ScamGuard</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-scamguard-text hover:text-scamguard-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-scamguard-text hover:text-scamguard-medium transition-colors">How It Works</a>
              <a href="#pricing" className="text-scamguard-text hover:text-scamguard-medium transition-colors">Pricing</a>
              <a href="#contact" className="text-scamguard-text hover:text-scamguard-medium transition-colors">Contact</a>
            </nav>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-scamguard-medium hover:bg-scamguard-low text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 text-scamguard-text">
            Protect Your Loved Ones from Online Scams
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            ScamGuard is an intelligent monitoring system that helps families protect elderly relatives 
            from online scams by providing real-time alerts and expert analysis of suspicious content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-scamguard-medium hover:bg-scamguard-low text-white px-8 py-3"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-scamguard-medium text-scamguard-medium hover:bg-scamguard-subtle px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-scamguard-text">Why Choose ScamGuard?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-scamguard-border">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-scamguard-medium mb-4" />
                <h3 className="text-xl font-bold mb-3 text-scamguard-text">Real-Time Protection</h3>
                <p className="text-gray-600">
                  Advanced AI monitors web browsing in real-time, instantly identifying potential scams 
                  and phishing attempts before they can cause harm.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-scamguard-border">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-scamguard-low mb-4" />
                <h3 className="text-xl font-bold mb-3 text-scamguard-text">Family Dashboard</h3>
                <p className="text-gray-600">
                  Loved ones can monitor activity, review alerts, and receive notifications 
                  about potential threats targeting their elderly family members.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-scamguard-border">
              <CardContent className="p-6">
                <Bell className="h-12 w-12 text-scamguard-high mb-4" />
                <h3 className="text-xl font-bold mb-3 text-scamguard-text">Instant Alerts</h3>
                <p className="text-gray-600">
                  Get immediate notifications when suspicious activity is detected, 
                  allowing for quick intervention and protection.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Explanation */}
      <TechnicalExplanation />

      {/* Stats Section */}
      <section className="py-16 bg-scamguard-subtle">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-scamguard-text">Trusted by Families Worldwide</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-1 text-scamguard-medium">5,000+</div>
              <div className="text-gray-600">Families Protected</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1 text-scamguard-medium">50,000+</div>
              <div className="text-gray-600">Scams Blocked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1 text-scamguard-medium">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1 text-scamguard-medium">24/7</div>
              <div className="text-gray-600">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-scamguard-text">How ScamGuard Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-scamguard-subtle rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-scamguard-medium">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-scamguard-text">Easy Installation</h3>
              <p className="text-gray-600">
                Install our lightweight browser extension and desktop app on your loved one's computer. 
                Setup takes just minutes with our guided process.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-scamguard-subtle rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-scamguard-medium">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-scamguard-text">Intelligent Monitoring</h3>
              <p className="text-gray-600">
                Our AI continuously analyzes web content, emails, and social media for scam indicators 
                without interfering with normal browsing.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-scamguard-subtle rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-scamguard-medium">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-scamguard-text">Family Alerts</h3>
              <p className="text-gray-600">
                When threats are detected, both the user and their family members receive 
                immediate alerts with recommended actions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-scamguard-subtle">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-scamguard-text">What Families Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-scamguard-border">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "ScamGuard gave me peace of mind knowing my mother is protected online. 
                  It caught several phishing attempts that could have been devastating."
                </p>
                <div className="font-medium text-scamguard-text">Sarah Johnson</div>
                <div className="text-sm text-gray-500">Daughter of ScamGuard user</div>
              </CardContent>
            </Card>

            <Card className="border border-scamguard-border">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The family dashboard is incredible. I can see what my dad encounters online 
                  and help him stay safe without being intrusive."
                </p>
                <div className="font-medium text-scamguard-text">Michael Chen</div>
                <div className="text-sm text-gray-500">Son of ScamGuard user</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-scamguard-text">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border border-scamguard-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-scamguard-text">Basic</h3>
                <div className="text-3xl font-bold mb-4 text-scamguard-medium">$9.99<span className="text-sm font-normal">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>Real-time scam detection</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>Email alerts</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>Basic dashboard</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-scamguard-medium">
              <CardContent className="p-6">
                <div className="bg-scamguard-medium text-white text-sm px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
                <h3 className="text-xl font-bold mb-2 text-scamguard-text">Family</h3>
                <div className="text-3xl font-bold mb-4 text-scamguard-medium">$19.99<span className="text-sm font-normal">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>Family dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>SMS alerts</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full bg-scamguard-medium hover:bg-scamguard-low">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border border-scamguard-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-scamguard-text">Premium</h3>
                <div className="text-3xl font-bold mb-4 text-scamguard-medium">$39.99<span className="text-sm font-normal">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>Everything in Family</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>Advanced AI protection</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>24/7 phone support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-scamguard-low mr-2" />
                    <span>Custom alerts</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Get Started</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-scamguard-subtle">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-scamguard-text">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-bold mb-4 text-scamguard-text">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-scamguard-medium mr-3" />
                  <span>support@scamguard.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-scamguard-medium mr-3" />
                  <span>1-800-SCAM-GUARD</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-scamguard-medium mr-3" />
                  <span>123 Security Blvd, San Francisco, CA 94105</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-scamguard-text">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6">
                Protect your loved ones today with our 30-day free trial. No credit card required.
              </p>
              <Button 
                size="lg" 
                className="bg-scamguard-medium hover:bg-scamguard-low text-white"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-scamguard-text text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Shield className="h-6 w-6" />
              <span className="text-xl font-bold">ScamGuard</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-scamguard-low transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-scamguard-low transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-scamguard-low transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-400">
            © 2024 ScamGuard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
