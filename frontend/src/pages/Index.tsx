import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

// UI Components
import { Header } from '@/components/Header';
import { PdfUploader } from '@/components/PdfUploader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Icons
import {
  Search, ChevronLeft, Loader2, Save, Sparkles, LayoutDashboard,
  User, CheckCircle, Globe, Briefcase, Trophy, X
} from 'lucide-react';

// Feature Components
import { JobList, Job } from '@/components/JobList';
import { FeedbackPanel, FeedbackData } from '@/components/FeedbackPanel';
import { TailoredCV } from '@/components/TailoredCV';
import { InteractiveQA } from '@/components/InteractiveQA';
import { AppliedJobs } from '@/components/AppliedJobs';
import { ProfilePage } from '@/components/ProfilePage';
import { AuthComponent } from '@/components/AuthComponent';
import { ColdEmailPanel } from '@/components/ColdEmailPanel';
import { CvEditor } from '@/components/CvEditor';

type Step = 'UPLOAD' | 'JOBS' | 'QA' | 'EDIT_CV' | 'RESULTS';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mentorsyncai.onrender.com';

const Index = () => {
  // --- Navigation & App State ---
  const [step, setStep] = useState<Step>(() => (localStorage.getItem('ms_step') as Step) || 'JOBS');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ms_activeTab') || 'search');
  const [session, setSession] = useState<Session | null>(null);

  // --- CV & File State ---
  const [file, setFile] = useState<File | null>(null);
  const [hasSavedCV, setHasSavedCV] = useState(false);
  const [structuredCvData, setStructuredCvData] = useState<any>(() => {
    const saved = localStorage.getItem('ms_cvData');
    return saved ? JSON.parse(saved) : null;
  });
  const [tailoredCVBase64, setTailoredCVBase64] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('Remote');

  // --- Job Data State ---
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);
  const [manualJobUrl, setManualJobUrl] = useState('');

  // --- Analysis & Results State ---
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  const [isScrapingBlocked, setIsScrapingBlocked] = useState(false);
  const [manualJobText, setManualJobText] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [isRenderingPdf, setIsRenderingPdf] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [coldEmailBody, setColdEmailBody] = useState<string>('');
  const [coldEmailTo, setColdEmailTo] = useState<string>('');

  // --- Persistence State ---
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // --- Filter States ---
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedRemoteOnly, setAppliedRemoteOnly] = useState(false);
  const [appliedJobType, setAppliedJobType] = useState('all');
  const [appliedSeniority, setAppliedSeniority] = useState('all');
  const [appliedSkills, setAppliedSkills] = useState('');

  // --- Effects & Auth ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadSavedCV(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadSavedCV(session.user.id);
      } else {
        // Clear all app-related persistence
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('ms_')) localStorage.removeItem(key);
        });
        setStructuredCvData(null);
        setStep('JOBS');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Persistence Sync ---
  useEffect(() => {
    localStorage.setItem('ms_step', step);
    localStorage.setItem('ms_activeTab', activeTab);
    if (structuredCvData) {
      localStorage.setItem('ms_cvData', JSON.stringify(structuredCvData));
    } else {
      localStorage.removeItem('ms_cvData');
    }
  }, [step, activeTab, structuredCvData]);

  const handleCvDataChange = (newData: any) => {
    setStructuredCvData(newData);
  };

  useEffect(() => {
    if (session && jobs.length === 0 && !isFetchingJobs) {
      handleFindJobs(false);
    }
  }, [session, jobs.length, isFetchingJobs]);

  const loadSavedCV = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('Profiles')
        .select('cv_path, location')
        .eq('user_id', userId)
        .single();

      if (profile?.location) setUserLocation(profile.location);
      if (!profile?.cv_path) return;

      const { data: blob, error } = await supabase.storage
        .from('cvs')
        .download(profile.cv_path);

      if (error || !blob) return;

      const savedFile = new File([blob], 'saved_resume.pdf', { type: 'application/pdf' });
      setFile(savedFile);
      setHasSavedCV(true);
    } catch (e) {
      console.error("Error loading saved CV", e);
    }
  };

  // --- Logic Handlers ---
  const handleFindJobs = async (isPremium = false) => {
    setIsFetchingJobs(true);
    try {
      const formData = new FormData();
      formData.append('is_premium', isPremium.toString());
      if (file) formData.append('resume_pdf', file);

      const searchTerm = appliedSearchQuery || searchDraft;
      if (searchTerm) formData.append('search_term', searchTerm);
      formData.append('location', userLocation);

      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      if (data.status === "success" && data.jobs) {
        setJobs(data.jobs);
        setStep('JOBS');
      } else {
        alert("Error: " + (data.message || "Unknown error finding jobs"));
      }
    } catch (error: any) {
      console.error('Finding jobs failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsFetchingJobs(false);
    }
  };

  const handleSelectJob = async (job: Job) => {
    if (!file) return;
    setSelectedJob(job);
    setIsAnalyzingGap(true);
    setIsScrapingBlocked(false);
    setManualJobText('');
    setStep('QA');

    try {
      const formData = new FormData();
      formData.append('resume_pdf', file);
      formData.append('job_url', job.job_url);

      const response = await fetch(`${API_BASE_URL}/api/analyze-gap`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Gap analysis failed');

      const data = await response.json();
      if (data.status === "blocked") {
        setIsScrapingBlocked(true);
        return;
      }

      if (data.status === "success" && data.data?.questions && data.data.questions.length > 0) {
        setQuestions(data.data.questions);
      } else {
        // No questions or success without questions - jump to tailoring
        handleTailorWithAnswers({}, job);
      }
    } catch (error: any) {
      console.error('Analysis failed:', error);
      handleTailorWithAnswers({}, job);
    } finally {
      setIsAnalyzingGap(false);
    }
  };

  const handleManualJobSubmit = () => {
    if (!manualJobText || !selectedJob || !file) return;
    
    const runAnalysisWithText = async () => {
      setIsAnalyzingGap(true);
      try {
        const formData = new FormData();
        formData.append('resume_pdf', file);
        formData.append('job_url', selectedJob.job_url);
        formData.append('job_text', manualJobText); // Sending the manual text

        const response = await fetch(`${API_BASE_URL}/api/analyze-gap`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.status === "success" && data.data?.questions && data.data.questions.length > 0) {
          setQuestions(data.data.questions);
          setIsScrapingBlocked(false);
        } else {
          // If no questions found in the manual text, tailor immediately
          handleTailorWithAnswers({}, selectedJob, manualJobText);
        }
      } catch (error) {
        console.error('Manual submission failed:', error);
        handleTailorWithAnswers({}, selectedJob, manualJobText);
      } finally {
        setIsAnalyzingGap(false);
      }
    };

    runAnalysisWithText();
  };

  const handleTailorWithAnswers = async (userAnswers: Record<string, string>, jobOverride?: Job, textOverride?: string) => {
    const targetJob = jobOverride || selectedJob;
    const targetText = textOverride || manualJobText;
    
    if (!file || !targetJob) {
      console.error("Missing file or job for tailoring", { file: !!file, job: !!targetJob });
      return;
    }
    
    setIsTailoring(true);

    try {
      const formData = new FormData();
      formData.append('resume_pdf', file);
      formData.append('job_url', targetJob.job_url);
      if (targetText) formData.append('job_text', targetText);

      if (Object.keys(userAnswers).length > 0) {
        formData.append('user_answers', JSON.stringify(userAnswers));
      }

      const response = await fetch(`${API_BASE_URL}/api/generate-cv-data`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Generation failed');
      const apiResp = await response.json();

      if (apiResp.status === "success" && apiResp.data) {
        const resultData = apiResp.data;
        setFeedback({
          match_score_percent: resultData.match_score_percent,
          improvement_feedback: resultData.improvement_feedback,
          project_recommendations: resultData.project_recommendations,
          research_areas: resultData.research_areas
        });
        setStructuredCvData(resultData.structured_cv);
        setColdEmailBody(resultData.cold_email_body || "");
        setColdEmailTo(resultData.cold_email_to || "");
        setIsSaved(false);
        setStep('EDIT_CV');
      } else {
        alert("Error: " + (apiResp.message || "Unknown error"));
        setStep('JOBS');
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert(`Error: ${error.message}`);
      setStep('JOBS');
    } finally {
      setIsTailoring(false);
    }
  };

  const handleFinalizePdf = async (editedData: any) => {
    setIsRenderingPdf(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/render-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error('PDF Rendering failed');
      const data = await response.json();

      if (data.status === "success" && data.pdf_base64) {
        setTailoredCVBase64(data.pdf_base64);
        setStep('RESULTS');
      } else {
        alert("Error: " + (data.message || "Unknown error rendering PDF"));
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsRenderingPdf(false);
    }
  };

  const handleSaveJob = async () => {
    if (!session || !selectedJob || isSaved) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('AppliedJobs')
        .insert({
          user_id: session.user.id,
          job_title: selectedJob.title,
          company: selectedJob.company,
          url: selectedJob.job_url,
          status: 'Applied',
        });
      if (error) throw error;
      setIsSaved(true);
    } catch (err) {
      alert('Failed to mark as applied.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSaveJob = async (job: Job) => {
    if (!session) return;
    try {
      const { error } = await supabase
        .from('AppliedJobs')
        .insert({
          user_id: session.user.id,
          job_title: job.title,
          company: job.company,
          url: job.job_url,
          status: 'Saved',
        });
      if (error) throw error;
      alert("Job saved to your tracker!");
    } catch (err) {
      console.error('Quick save failed:', err);
    }
  };

  const handleManualJobLink = () => {
    if (!manualJobUrl) return;
    const manualJob: Job = {
      id: 'manual',
      title: 'Direct Application',
      company: 'Manual URL',
      location: 'Remote/Specified',
      description: 'Custom manual job link.',
      job_url: manualJobUrl
    };
    handleSelectJob(manualJob);
  };

  // --- Filtering Logic ---
  const filteredJobs = jobs.filter(job => {
    const query = appliedSearchQuery.toLowerCase();
    const skills = appliedSkills.toLowerCase().split(',').map(s => s.trim()).filter(s => s);

    const matchesQuery = !query ||
      job.title?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    if (skills.length > 0) {
      const jobFullText = `${job.title} ${job.description}`.toLowerCase();
      if (!skills.every(skill => jobFullText.includes(skill))) return false;
    }

    if (appliedRemoteOnly) {
      const loc = job.location?.toLowerCase() || '';
      const tit = job.title?.toLowerCase() || '';
      if (!loc.includes('remote') && !tit.includes('remote')) return false;
    }

    if (appliedJobType !== 'all' && !(job.job_type?.toLowerCase().includes(appliedJobType.toLowerCase()))) return false;

    // 5. Seniority Filter (Keyword based detection with word boundaries)
    if (appliedSeniority !== 'all') {
      const title = (job.title || '').toLowerCase();
      const desc = (job.description || '').toLowerCase();

      const levels: Record<string, string[]> = {
        'entry': ['entry', 'junior', 'associate', 'intern', 'trainee', 'grad'],
        'mid': ['mid', 'intermediate', 'middle', 'staff'],
        'senior': ['senior', 'sr', 'advanced', 'expert'],
        'lead': ['lead', 'principal', 'head', 'architect', 'manager', 'director']
      };

      const keywords = levels[appliedSeniority] || [];
      // Use regex with word boundaries to avoid partial matches
      const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'i');

      // Prioritize title for seniority detection
      const matchesSeniority = regex.test(title) || regex.test(desc);
      if (!matchesSeniority) return false;

      // Cross-check: If filtering for Junior, avoid matches that also explicitly mention Senior in the title
      if ((appliedSeniority === 'entry' || appliedSeniority === 'mid') && /\b(senior|sr|lead|principal)\b/i.test(title)) {
        return false;
      }
    }

    return true;
  });

  const handleApplyFilters = () => {
    setAppliedSearchQuery(searchDraft);
  };

  const handleClearFilters = () => {
    setSearchDraft('');
    setAppliedSearchQuery('');
    setAppliedSkills('');
    setAppliedRemoteOnly(false);
    setAppliedJobType('all');
    setAppliedSeniority('all');
  };

  // --- Navigation Helpers ---
  const goBackToUpload = () => { setStep('UPLOAD'); setJobs([]); };
  const goBackToJobs = () => {
    setStep('JOBS');
    setFeedback(null);
    setTailoredCVBase64('');
    setSelectedJob(null);
    setColdEmailBody('');
    setColdEmailTo('');
  };

  // --- Sub-render Helpers ---
  const renderContent = () => {
    if (!session) return <AuthComponent />;
    if (activeTab === 'applied') return <AppliedJobs />;
    if (activeTab === 'profile') return <ProfilePage />;

    return (
      <div className="w-full">
        {step === 'UPLOAD' && (
          <div className="max-w-xl mx-auto panel p-6 md:p-8 mt-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Let's find your next role</h2>
              <p className="text-muted-foreground mt-2">Upload your CV to discover matching opportunities.</p>
            </div>
            {hasSavedCV && file && (
              <div className="mb-4 flex items-center gap-3 text-sm px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Using your saved CV from Profile.
              </div>
            )}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Resume Document</Label>
                <PdfUploader file={file} onFileChange={setFile} />
              </div>
              <Button
                onClick={() => handleFindJobs(true)}
                disabled={!file || isFetchingJobs}
                className="w-full h-12 text-base font-semibold gap-2"
              >
                {isFetchingJobs ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {isFetchingJobs ? 'Analyzing & Searching...' : 'Find Matching Jobs'}
              </Button>
            </div>
          </div>
        )}

        {step === 'JOBS' && (
          <div className="flex flex-col h-[100dvh]">
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={goBackToUpload} className="gap-2 -ml-3">
                  <ChevronLeft className="w-4 h-4" /> Back to Upload
                </Button>
                <div className="flex items-center gap-2">
                  <Dialog open={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary">
                        <Sparkles className="w-4 h-4" /> Premium CV Match
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[95vh] flex flex-col p-0 overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <DialogHeader className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-primary" />
                          </div>
                          <DialogTitle className="text-2xl">Smart CV Matching</DialogTitle>
                          <DialogDescription className="text-base mt-2">
                            Upload or use your saved resume to find matching roles where your skills are a perfect match.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="py-6">
                          <PdfUploader file={file} onFileChange={(f) => { setFile(f); if (f) { handleFindJobs(true); setIsPremiumModalOpen(false); } }} />
                        </div>
                      </div>

                      {file && (
                        <DialogFooter className="p-6 border-t bg-muted/30 sm:flex-col">
                          <Button 
                            onClick={() => { handleFindJobs(true); setIsPremiumModalOpen(false); }} 
                            disabled={isFetchingJobs} 
                            className="w-full h-12 font-bold gap-2 text-base shadow-lg shadow-primary/20"
                          >
                            {isFetchingJobs ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            Find Matches with this CV
                          </Button>
                        </DialogFooter>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => handleFindJobs(true)} disabled={isFetchingJobs} className="gap-2">
                    <Search className={`w-3.5 h-3.5 ${isFetchingJobs ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                  <Badge variant="outline" className="bg-primary/5 text-primary">
                    {filteredJobs.length} Jobs
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border">
                <div className="lg:col-span-2 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9" value={searchDraft} onChange={e => setSearchDraft(e.target.value)} />
                  </div>
                  <Button onClick={handleApplyFilters}>Search</Button>
                </div>

                <div className="lg:col-span-2 flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Paste Job URL..." className="pl-9 bg-primary/5" value={manualJobUrl} onChange={e => setManualJobUrl(e.target.value)} />
                  </div>
                  <Button variant="secondary" onClick={handleManualJobLink}>Tailor Directly</Button>
                </div>

                <div className="flex items-center justify-between px-3 h-10 bg-background rounded-md border">
                  <span className="text-sm font-medium">Remote Only</span>
                  <Switch checked={appliedRemoteOnly} onCheckedChange={setAppliedRemoteOnly} />
                </div>

                <Select value={appliedJobType} onValueChange={setAppliedJobType}>
                  <SelectTrigger><Briefcase className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={appliedSeniority} onValueChange={setAppliedSeniority}>
                  <SelectTrigger><Trophy className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="entry">Entry/Junior</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Skills (React, Go...)"
                  value={appliedSkills}
                  onChange={e => setAppliedSkills(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                />
                <Button variant="ghost" onClick={handleClearFilters}>Clear</Button>
              </div>

              <div className="flex-1 overflow-hidden mt-6">
                <JobList jobs={filteredJobs} onSelectJob={handleSelectJob} onSaveJob={handleQuickSaveJob} isLoading={isFetchingJobs} />
              </div>
            </div>
          </div>
        )}

        {step === 'QA' && (
          <div className="flex flex-col h-[85dvh] items-center justify-center px-4">
            {isAnalyzingGap ? (
              <div className="text-center space-y-4">
                <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
                <h3 className="text-xl font-medium animate-pulse">Analyzing Skills Gap...</h3>
              </div>
            ) : isTailoring ? (
              <div className="text-center space-y-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                <h3 className="text-2xl font-bold">Tailoring Your Expertise...</h3>
              </div>
            ) : isScrapingBlocked ? (
              <div className="w-full max-w-2xl space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Scraping Blocked</h3>
                  <p className="text-muted-foreground text-lg">
                    Indeed blocked our automated scan. Please paste the job text below for an instant analysis.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Paste the job description here..."
                    className="min-h-[300px] text-base p-4 resize-none focus-visible:ring-primary"
                    value={manualJobText}
                    onChange={(e) => setManualJobText(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('JOBS')} className="flex-1 h-12">Cancel</Button>
                    <Button 
                      disabled={!manualJobText.trim()} 
                      onClick={handleManualJobSubmit}
                      className="flex-[2] h-12 font-bold text-lg shadow-lg shadow-primary/20"
                    >
                      Start Instant Analysis
                    </Button>
                  </div>
                </div>
              </div>
            ) : questions.length > 0 ? (
              <div className="w-full max-w-4xl">
                <Button variant="ghost" onClick={() => setStep('JOBS')} className="mb-6"><ChevronLeft className="mr-2" /> Cancel</Button>
                <InteractiveQA questions={questions as any} onSubmit={handleTailorWithAnswers} isLoading={isTailoring} />
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground animate-pulse">Preparing your experience analysis...</p>
              </div>
            )}
          </div>
        )}

        {step === 'EDIT_CV' && structuredCvData && (
          <CvEditor
            data={structuredCvData}
            onSave={handleFinalizePdf}
            onChange={handleCvDataChange}
            isLoading={isRenderingPdf}
          />
        )}

        {step === 'RESULTS' && (
          <div className="h-[88dvh] flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
              <Button variant="ghost" onClick={goBackToJobs} className="gap-2"><ChevronLeft /> Back to Jobs</Button>
              <Button onClick={handleSaveJob} disabled={isSaved || isSaving} variant={isSaved ? "secondary" : "default"}>
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                {isSaved ? "Saved" : "Mark as Applied"}
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
              <div className="lg:col-span-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {feedback && <FeedbackPanel data={feedback} />}
                {coldEmailBody && <ColdEmailPanel toEmail={coldEmailTo} body={coldEmailBody} />}
              </div>
              <div className="lg:col-span-7 overflow-hidden relative">
                <TailoredCV pdfBase64={tailoredCVBase64} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-6 lg:py-8 max-w-7xl mx-auto w-full">
        {session && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-sm mb-6 self-start">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search" className="gap-1.5"><Search className="w-3.5" /> Find Jobs</TabsTrigger>
              <TabsTrigger value="applied" className="gap-1.5"><LayoutDashboard className="w-3.5" /> Apps</TabsTrigger>
              <TabsTrigger value="profile" className="gap-1.5"><User className="w-3.5" /> Profile</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;