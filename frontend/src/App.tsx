import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import hero_ui_mockup from '@/assets/hero_ui_mockup.png';
import feature_ats_analysis from '@/assets/feature_ats_analysis.png';
import feature_outreach_engine from '@/assets/feature_outreach_engine.png';
import feature_match_scoring from '@/assets/feature_match_scoring.png';
import ms_cropped from '@/assets/ms_cropped.mp4';

import {
  Zap,
  Sparkles,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Globe,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Toaster } from 'sonner';

// Asset Imports (Virtual, using paths)
const HERO_IMAGE = hero_ui_mockup;
const ATS_ICON = feature_ats_analysis;
const OUTREACH_ICON = feature_outreach_engine;
const MATCH_ICON = feature_match_scoring;
const MS_CROPPED = ms_cropped;

const featureCards = [
  {
    image: ATS_ICON,
    title: "ATS Gap Analysis",
    description: "Identify exactly what skills and keywords are missing from your resume that recruiters are looking for.",
    details: ["Skill matching", "Keyword optimization", "Format verification"]
  },
  {
    image: OUTREACH_ICON,
    title: "Cold Outreach Engine",
    description: "Instantly generate creative, personalized cold emails to the right hiring managers.",
    details: ["AI Personalized emails", "Tips to stand out", "Often a direct contact to HR or CEO"]
  },
  {
    image: MATCH_ICON,
    title: "Match Scoring",
    description: "See exactly how well your profile matches a job before you even apply.",
    details: ["Probability of interview", "Gap analysis", "Small weekend projects"]
  }
];


const faqs = [
  {
    question: "How does the AI analyze my resume?",
    answer: "We use advanced LLM models to compare your resume against specific job descriptions in real-time."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption and never share your personal information or resume content with third parties without your consent."
  },
  {
    question: "Does this work for all industries?",
    answer: "Yes! While we excel in tech, our AI is versatile across marketing, finance, healthcare, and more."
  }
];

const FeatureCard = ({ image, title, description, details }: { image: string, title: string, description: string, details: string[] }) => (
  <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:translate-y-[-8px] transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/10 group overflow-hidden">
    <div className="h-48 overflow-hidden bg-muted/20">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
    </div>
    <CardContent className="pt-6 pb-8 space-y-4">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {details.map((detail, i) => (
          <li key={i} className="flex items-center text-sm text-foreground/80">
            <CheckCircle className="w-3.5 h-3.5 mr-2 text-primary" />
            {detail}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const App = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 font-sans">
      <Toaster position="top-center" richColors />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">MentorSync</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Button
              onClick={() => setWaitlistOpen(true)}
              className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-semibold"
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[10%] left-[-5%] w-[45%] h-[45%] bg-primary/20 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] bg-purple-600/15 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left space-y-8">
              <Badge variant="outline" className="py-1.5 px-4 rounded-full border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Revolutionizing the Job Hunt
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
                Stop Applying. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600">Start Getting Hired.</span>
              </h1>
              <p className="max-w-xl mx-auto lg:mx-0 text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
                The average job posting gets 250+ applications. MentorSync uses AI to put yours in the top 1%, automating the boring parts of your search while you focus on the interview.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Button
                  size="lg"
                  onClick={() => setWaitlistOpen(true)}
                  className="h-14 px-8 text-lg font-bold bg-primary shadow-xl shadow-primary/25 hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                >
                  Join the waitlist
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold hover:bg-muted hover:text-primary transition-all">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      See how it works
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-black/90 backdrop-blur-3xl shadow-2xl">
                    <video src={MS_CROPPED} className="w-full h-full aspect-video" controls autoPlay />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Remote Ready</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Secure Data</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Save 20h/Week</span>
              </div>
            </div>
            <div className="flex-1 w-full max-w-2xl animate-in fade-in slide-in-from-right-10 duration-1000">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-3xl blur-2xl -z-10" />
                <img
                  src={HERO_IMAGE}
                  alt="MentorSync Dashboard"
                  className="rounded-2xl shadow-2xl border border-white/10 w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-background/90 backdrop-blur p-4 rounded-xl border shadow-xl animate-bounce-soft hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">ATS Score</p>
                      <p className="text-xl font-black text-green-500">98% Match</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Everything you need to land your next role.</h2>
            <p className="text-lg text-muted-foreground">We've automated the entire application funnel, from discovery to the first interview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featureCards.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* 
      <section id="testimonials" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Loved by candidates at</h2>
            <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale pointer-events-none mt-8">
              <span className="text-2xl font-bold tracking-tighter">APPLE</span>
              <span className="text-2xl font-bold tracking-tighter">GOOGLE</span>
              <span className="text-2xl font-bold tracking-tighter">NOTION</span>
              <span className="text-2xl font-bold tracking-tighter">STRIPE</span>
              <span className="text-2xl font-bold tracking-tighter">Vercel</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="bg-card/30 border-none shadow-none">
                <CardContent className="pt-8 space-y-4 italic text-lg leading-relaxed text-muted-foreground">
                  <div className="flex gap-1 text-yellow-500/50 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  "{t.content}"
                  <div className="flex items-center gap-3 pt-4 not-italic">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
Testimonials Section */}
      {/* Pricing / Join Waitlist Section */}
      <section id="pricing" className="py-24 relative">
        <div className="max-w-5xl mx-auto px-4">
          <Card className="bg-gradient-to-br from-background to-muted border-primary/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-64 h-64" />
            </div>
            <CardContent className="p-12 text-center space-y-8">
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 tracking-wider uppercase">
                Early Access Offer
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Limited Beta Spots Available</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join the waitlist today to get 50% off for life on MentorSync Premium. We're onboarding users in weekly waves.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left py-8 max-w-3xl mx-auto">
                <div className="space-y-3">
                  <p className="font-bold">Waitlist Perks</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Lifetime 50% Discount</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Early Feature Access</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="font-bold">Launch Features</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited Applications</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> AI Interview Tips, and research topics</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="font-bold">Standing Out</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 2 Custom Projects</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Stand out globally</li>
                  </ul>
                </div>
              </div>
              <Button
                size="lg"
                className="h-16 px-12 text-xl font-bold bg-primary shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
                onClick={() => setWaitlistOpen(true)}
              >
                Be an early bird
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-border/40 rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="p-5 flex items-center justify-between font-bold text-lg">
                {faq.question}
                {openFaq === idx ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-muted-foreground text-lg leading-relaxed animate-in slide-in-from-top-2 duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 opacity-50">
            <Zap className="w-6 h-6" />
            <span className="font-black text-xl tracking-tighter">MentorSync</span>
          </div>
          <p className="text-muted-foreground">Build with ❤️ for job seekers everywhere.</p>
          <div className="flex justify-center gap-8 text-sm font-medium text-muted-foreground pt-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact Support</a>
          </div>
          <p className="text-xs text-muted-foreground/50 pt-8">&copy; 2026 MentorSync AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
