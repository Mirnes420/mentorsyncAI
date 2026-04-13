import { useState, useMemo } from 'react';
import { Sparkles, Copy, Check, FileOutput, Lightbulb, Mail, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';

// 1. DATA TYPE DEFINITIONS
// Defining interfaces ensures type safety across the component and improves IDE intellisense.
interface GapAnalysis {
  missing_skill: string;
  why_it_matters_for_this_role: string;
  how_to_fix_it: string;
}

interface ResultsPanelProps {
  isLoading: boolean;
  result: string | null; // Raw string input from the API (potentially contains Markdown backticks)
}

export function ResultsPanel({ isLoading, result }: ResultsPanelProps) {
  // 2. MULTI-ACTION STATE MANAGEMENT
  // Using an object for copy states allows independent visual feedback for multiple buttons
  // without creating redundant 'isCopied' booleans.
  const [copyStatus, setCopyStatus] = useState({ json: false, email: false });

  // 3. PERFORMANCE OPTIMIZED DATA PARSING
  // useMemo ensures we only parse the JSON string when the 'result' prop actually changes.
  // This prevents expensive Regex and JSON.parse operations on every re-render.
  const data = useMemo(() => {
    if (!result) return null;
    try {
      // AI SANITIZATION: Removes potential Markdown code blocks (```json ... ```) 
      // often returned by LLMs before parsing the raw string into an object.
      const cleanJson = result.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse result JSON", e);
      return null;
    }
  }, [result]);

  // 4. REUSABLE CLIPBOARD LOGIC (DRY Principle)
  // One function handles both structured objects (JSON) and plain strings (Email).
  const handleCopy = async (text: any, key: 'json' | 'email') => {
    if (!text) return;

    try {
      // Logic check: Convert objects to formatted strings, keep strings as-is.
      const content = typeof text === 'object' ? JSON.stringify(text, null, 2) : text;
      await navigator.clipboard.writeText(content);

      // UI Feedback: Trigger 'Copied' state for the specific button
      setCopyStatus((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // 5. CONDITIONAL STYLING (UX Design)
  // Dynamically determines the color palette based on technical match percentage.
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue < 40) return 'text-red-500 border-red-500';
    if (scoreValue < 75) return 'text-amber-500 border-amber-500';
    return 'text-emerald-500 border-emerald-500';
  };

  // 6. LOADING STATE (UX)
  // Using an 'Animate-Pulse' skeleton screen to reduce perceived wait time during AI inference.
  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-6 space-y-6">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-5 h-5 rounded-full bg-primary" />
          <span className="text-sm font-medium">Processing mentorship data...</span>
        </div>
        <div className="space-y-4">
          <div className="h-32 w-full bg-muted animate-pulse rounded-xl" />
          <div className="h-64 w-full bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  // 7. MAIN DATA DISPLAY
  if (data) {
    const score = data.match_score_percent || 0;

    return (
      <div className="h-full flex flex-col p-4 bg-background overflow-hidden">
        {/* HEADER AREA */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Mentorship Feedback</span>
          </div>
          {/* JSON Copy Button: Allows developers to inspect the raw AI output */}
          <Button variant="outline" size="sm" onClick={() => handleCopy(data, 'json')} className="gap-2 text-xs">
            {copyStatus.json ? <Check className="text-green-500 w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copyStatus.json ? "Copied JSON!" : "Copy JSON"}</span>
          </Button>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-auto space-y-6 pr-2 custom-scrollbar">
          
          {/* 1. MATCH SCORE VISUALIZATION */}
          <div className="flex items-center gap-6 bg-muted/20 p-4 rounded-2xl border border-border">
            <div className={`w-20 h-20 shrink-0 rounded-full border-4 flex items-center justify-center bg-background ${getScoreColor(score)}`}>
              <span className="text-2xl font-black">{score}%</span>
            </div>
            <div>
              <h4 className="font-bold text-foreground">Match Analysis</h4>
              <p className="text-sm text-muted-foreground italic">
                {data.is_good_fit ? "This candidate is a strong technical match." : "Experience mismatch detected."}
              </p>
            </div>
          </div>

          {/* 2. GAP ANALYSIS (The "Growth Roadmap") */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 px-1">
              <GraduationCap className="w-5 h-5" />
              <h4 className="font-bold uppercase tracking-tight text-sm">Growth Roadmap</h4>
            </div>
            {data.top_3_gap_analysis?.map((gap: GapAnalysis, i: number) => (
              <div key={i} className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                <h5 className="font-bold text-sm text-primary mb-1">{gap.missing_skill}</h5>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{gap.why_it_matters_for_this_role}</p>
                {/* ACTIONABLE ADVICE SECTION */}
                <div className="flex gap-2 items-start bg-primary/5 p-2 rounded-lg border border-primary/10">
                  <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-foreground/90">
                    <span className="text-primary">Action:</span> {gap.how_to_fix_it}
                  </p>
                </div>
              </div>
            ))}
            {/* EMPATHETIC ELEMENT: Highlight positive reinforcement */}
            {data.silver_lining && (
              <p className="text-xs font-medium text-foreground/90 px-1 italic">
                <span className="text-primary not-italic font-bold">Silver Lining:</span> {data.silver_lining}
              </p>
            )}
          </section>

          {/* 3. GENERATED EMAIL SECTION */}
          <section className="bg-muted/30 p-5 rounded-2xl border border-dashed border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <h4 className="font-bold">Email for the Candidate</h4>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCopy(data.mentorship_email, 'email')} 
                className="gap-2 text-xs"
              >
                {copyStatus.email ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span>{copyStatus.email ? "Copied Email!" : "Copy Email"}</span>
              </Button>
            </div>

            {/* MONOSPACED CONTENT: Enhances readability for templates and raw text */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-mono text-foreground/80 bg-background/40 p-4 rounded-lg border border-border/50">
              {data.mentorship_email}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 8. EMPTY STATE (Default View)
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <FileOutput className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Awaiting Documents</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Upload a CV and Job Description to generate an empathetic growth analysis.
      </p>
    </div>
  );
}