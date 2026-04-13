import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

interface TailoredCVProps {
    pdfBase64: string;
}

export function TailoredCV({ pdfBase64 }: TailoredCVProps) {

    const handleDownloadPDF = () => {
        if (!pdfBase64) return;
        const linkSource = `data:application/pdf;base64,${pdfBase64}`;
        const downloadLink = document.createElement("a");
        const fileName = "Tailored_CV.pdf";

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    };

    if (!pdfBase64) {
        return (
            <Card className="h-full border-primary/20 shadow-sm flex flex-col">
                <CardContent className="flex-1 flex items-center justify-center text-muted-foreground p-12 text-center">
                    No CV content available.
                </CardContent>
            </Card>
        )
    }

    const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;

    return (
        <Card className="h-full border-primary/20 shadow-sm flex flex-col overflow-hidden bg-card">
            <CardHeader className="bg-primary/5 py-4 shrink-0 flex flex-row items-center justify-between border-b">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" /> Your Tailored CV
                    </CardTitle>
                    <CardDescription>Generated specifically for this role</CardDescription>
                </div>
                <Button
                    onClick={handleDownloadPDF}
                    className="gap-2 shadow-sm font-medium"
                >
                    <Download className="w-4 h-4" /> Download PDF
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative bg-muted/20">
                <object
                    data={pdfDataUri}
                    type="application/pdf"
                    className="w-full h-full"
                >
                    <div className="flex flex-col items-center justify-center text-center p-8 h-full space-y-4">
                        <p className="text-muted-foreground">Your browser does not support inline PDFs.</p>
                        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
                            <Download className="w-4 h-4" /> Download Instead
                        </Button>
                    </div>
                </object>
            </CardContent>
        </Card>
    );
}
