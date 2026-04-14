import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Zap, Sparkles, Target, BarChart, Send, CheckCircle, Shield, ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const Landing = () => {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
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
                        <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
                        <Link to="/app">
                            <Button className="h-9 px-5 bg-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-semibold">
                                Launch App
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                        The Future of Job Applications is Here
                    </Badge>
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Land your dream job with <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600">AI-Powered Precision.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        MentorSync doesn't just build resumes. We analyze, optimize, and tailor your professional story for every single job application, helping you pass the ATS and get hired.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <Link to="/app">
                            <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary shadow-xl shadow-primary/25 hover:translate-y-[-2px] active:translate-y-[0px] transition-all">
                                Tailor My Resume Now
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold hover:bg-muted transition-all">
                                    <PlayCircle className="w-5 h-5 mr-2" />
                                    Watch Demo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-black/90 backdrop-blur-3xl shadow-2xl">
                                <video
                                    src="/ms_cropped.mp4"
                                    className="w-full h-full aspect-video"
                                    controls
                                    autoPlay
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Trusted By / Stats Section */}
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="flex items-center justify-center space-x-2 font-bold text-2xl tracking-tighter">Google</div>
                        <div className="flex items-center justify-center space-x-2 font-bold text-2xl tracking-tighter">Amazon</div>
                        <div className="flex items-center justify-center space-x-2 font-bold text-2xl tracking-tighter">Stripe</div>
                        <div className="flex items-center justify-center space-x-2 font-bold text-2xl tracking-tighter">Airbnb</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-muted/30 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Engineered for your success</h2>
                        <p className="text-muted-foreground">Every feature is designed to give you an edge in today's competitive job market.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Target className="w-6 h-6" />}
                            title="ATS Gap Analysis"
                            description="Identify exactly what skills and keywords are missing from your resume that recruiters are looking for."
                        />
                        <FeatureCard
                            icon={<Send className="w-6 h-6" />}
                            title="Cold Outreach Engine"
                            description="Instantly generate creative, personalized cold emails to the right hiring managers."
                        />
                        <FeatureCard
                            icon={<BarChart className="w-6 h-6" />}
                            title="Match Scoring"
                            description="See exactly how well your profile matches a job before you even apply."
                        />
                    </div>
                </div>
            </section>

            {/* Interactive Flow Preview */}
            <section id="how-it-works" className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-4xl font-bold leading-tight">Forget about generic applications.</h2>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                MentorSync uses an advanced conversational AI flow to extract the hidden achievements from your career that you forgot to mention.
                            </p>
                            <ul className="space-y-4 pt-4">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">Upload any PDF Resume</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">Get matched with top global jobs</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">AI-Guided interview prep questions</span>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full max-w-xl">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                                <div className="relative bg-card border rounded-2xl p-4 shadow-2xl">
                                    <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
                                        <div className="text-center p-8 space-y-4">
                                            <Sparkles className="w-12 h-12 text-primary mx-auto opacity-50" />
                                            <div className="h-4 w-48 bg-muted-foreground/20 rounded-full mx-auto" />
                                            <div className="h-4 w-32 bg-muted-foreground/10 rounded-full mx-auto" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-indigo-700 p-12 text-center text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap className="w-64 h-64" />
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Ready to transform your career?</h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">Join thousands of professionals who have used MentorSync to land interviews at top tech companies worldwide.</p>
                    <Link to="/app">
                        <Button size="lg" className="h-14 px-10 bg-white text-primary hover:bg-white/90 text-lg font-bold transition-all shadow-xl">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t text-center text-sm text-muted-foreground">
                <div className="max-w-7xl mx-auto px-4">
                    <p>&copy; 2026 MentorSync AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="border-border/40 bg-card hover:translate-y-[-8px] transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5 group">
        <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                {icon}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
    </Card>
);

export default Landing;
