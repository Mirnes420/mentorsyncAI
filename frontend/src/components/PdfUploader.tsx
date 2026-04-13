import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function PdfUploader({ file, onFileChange }: PdfUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      onFileChange(droppedFile);
    }
  }, [onFileChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      onFileChange(selectedFile);
    }
  }, [onFileChange]);

  const removeFile = useCallback(() => {
    onFileChange(null);
    setNumPages(null);
  }, [onFileChange]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (file) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
                {numPages && ` • ${numPages} page${numPages > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* PDF Preview */}
        <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
          <div className="p-2 border-b border-border bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground">Preview</p>
          </div>
          <div className="p-4 flex justify-center max-h-[300px] overflow-auto">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="w-full h-40 skeleton-pulse" />
              }
              error={
                <div className="text-sm text-muted-foreground p-4 text-center">
                  Unable to load preview
                </div>
              }
            >
              <Page
                pageNumber={1}
                width={240}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label
      className={`upload-zone p-8 min-h-[180px] ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="sr-only"
      />
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Drop your resume here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse • PDF only
          </p>
        </div>
      </div>
    </label>
  );
}
