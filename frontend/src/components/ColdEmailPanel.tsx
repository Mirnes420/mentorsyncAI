import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Mail, Copy, Check } from 'lucide-react';

interface ColdEmailProps {
    toEmail: string;
    body: string;
}

export function ColdEmailPanel({ toEmail, body }: ColdEmailProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(body);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDirectApply = () => {
        const subject = encodeURIComponent("Application via MentorSync");
        const bodyEncoded = encodeURIComponent(body);
        const mailtoLink = `mailto:${toEmail}?subject=${subject}&body=${bodyEncoded}`;

        // Character count check (mailto handles ~2000 chars safely across OS/Browsers)
        if (mailtoLink.length > 2000) {
            alert("The email is quite long. Some email clients might truncate it. If it doesn't open correctly, please use the 'Copy' button and paste it manually.");
        }

        window.location.assign(mailtoLink);
    };

    if (!body) return null;

    return (
        <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" /> Cold Outreach Email
                </CardTitle>
                <CardDescription>
                    Gemini has written an introductory email to the Hiring Manager / CEO.
                    {toEmail && toEmail !== "email@example.com" ? (
                        <span className="block mt-1 font-medium text-foreground">Found Contact: {toEmail}</span>
                    ) : (
                        <span className="block mt-1 italic text-muted-foreground">Replace [Recipient Name] and email address.</span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <pre className="whitespace-pre-wrap font-sans text-sm p-4 bg-background border rounded-md text-foreground">
                        {body}
                    </pre>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={handleCopy}
                        title="Copy to clipboard"
                    >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button onClick={handleDirectApply} className="gap-2">
                        <Send className="w-4 h-4" /> Open in Email Client
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
