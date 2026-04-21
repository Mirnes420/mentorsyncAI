import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Briefcase, ExternalLink, ChevronDown, ChevronUp, BookmarkPlus, Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mentorsyncai.onrender.com';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  job_url: string;
  job_type?: string;
  site?: string;
}

interface JobListProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onSaveJob?: (job: Job) => void;
  isLoading?: boolean;
}

function JobCard({ job, onSelectJob, onSaveJob }: { job: Job; onSelectJob: (j: Job) => void; onSaveJob?: (j: Job) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [fullDesc, setFullDesc] = useState(job.description);
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  const [isError, setIsError] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && (fullDesc === job.description || fullDesc.length < 500)) {
      setIsLoadingFull(true);
      setIsError(false);
      try {
        const resp = await fetch(`${API_BASE_URL}/api/analyze-job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_url: job.job_url }),
        });
        const data = await resp.json();
        if (data.full_text && !data.full_text.startsWith("Error")) {
          setFullDesc(data.full_text);
        } else {
          // If scraping failed but we have a snippet, keep the snippet but flag it
          if (data.full_text?.startsWith("Error")) setIsError(true);
        }
      } catch (e) {
        setIsError(true);
      } finally {
        setIsLoadingFull(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <Card className="transition-all hover:border-primary/50 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl line-clamp-1">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2 text-sm">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Building className="w-3.5 h-3.5" />
                {job.company}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location || 'Remote'}
              </span>
            </CardDescription>
          </div>
          {job.job_type && (
            <Badge variant="secondary">{job.job_type}</Badge>
          )}
          {job.site && (
            <Badge variant="outline" className="capitalize bg-primary/5 text-primary border-primary/20">
              {job.site}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!expanded &&

          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description || "No description provided."}
          </p>
        }


        {/* Full description (expandable) */}
        {(job.description && job.description.length > 180) || expanded ? (
          <>
            {expanded && (
              <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap border-t pt-3 max-h-72 overflow-y-auto custom-scrollbar relative">
                {isLoadingFull ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3 animate-pulse">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-xs font-medium">Scraping full description...</p>
                  </div>
                ) : (
                  <>
                    {fullDesc}
                    {isError && (
                      <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>
                          We couldn't automatically grab the full text. 
                          If you want to tailor your CV, you might need to copy the full description from the 
                          <a href={job.job_url} target="_blank" rel="noreferrer" className="underline mx-1">original site</a> 
                          and paste it during the next step.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent gap-1 px-0"
              onClick={toggleExpand}
              disabled={isLoadingFull}
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Hide Description</> : <><ChevronDown className="w-3 h-3" /> View Full Description</>}
              {isLoadingFull && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
            </Button>
          </>
        ) : null}
      </CardContent>

      <CardFooter className="flex justify-between items-center bg-muted/10 pt-4">
        <div className="flex gap-4 items-center">
          <a
            href={job.job_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary flex items-center gap-1 hover:underline underline-offset-4"
          >
            View Posting <ExternalLink className="w-3 h-3" />
          </a>
          {onSaveJob && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => onSaveJob(job)}
            >
              <BookmarkPlus className="w-3.5 h-3.5" /> Save
            </Button>
          )}
        </div>
        <Button onClick={() => onSelectJob(job)} size="sm" className="shadow-sm">
          Tailor CV for this Job
        </Button>
      </CardFooter>
    </Card>
  );
}

export function JobList({ jobs, onSelectJob, onSaveJob, isLoading }: JobListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted/50 rounded-t-xl" />
            <CardContent className="h-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center p-8 border rounded-xl bg-muted/20">
        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No jobs found</h3>
        <p className="text-muted-foreground">Upload your CV to find matching opportunities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {jobs.map((job, idx) => (
        <JobCard key={job.id || idx} job={job} onSelectJob={onSelectJob} onSaveJob={onSaveJob} />
      ))}
    </div>
  );
}
