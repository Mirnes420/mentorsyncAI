import { PdfUploader } from './PdfUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Link2 } from 'lucide-react';

interface InputPanelProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  jobUrl: string;
  onJobUrlChange: (url: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export function InputPanel({
  file,
  onFileChange,
  jobUrl,
  onJobUrlChange,
  onGenerate,
  isLoading,
}: InputPanelProps) {
  const isDisabled = !file || !jobUrl.trim() || isLoading;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Input</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your resume and paste the job listing URL
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-auto">
        {/* PDF Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Resume (PDF)</Label>
          <PdfUploader file={file} onFileChange={onFileChange} />
        </div>

        {/* Job URL Input */}
        <div className="space-y-2">
          <Label htmlFor="job-url" className="text-sm font-medium">
            Job URL
          </Label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="job-url"
              type="url"
              placeholder="https://company.com/jobs/..."
              value={jobUrl}
              onChange={(e) => onJobUrlChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-6 mt-auto">
        <Button
          onClick={onGenerate}
          disabled={isDisabled}
          className="w-full h-12 text-base font-semibold gap-2"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          {isLoading ? 'Generating...' : 'Generate Bait'}
        </Button>
        {!file && !jobUrl && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            Both resume and job URL are required
          </p>
        )}
      </div>
    </div>
  );
}
