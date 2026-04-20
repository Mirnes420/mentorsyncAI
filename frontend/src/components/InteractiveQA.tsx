import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Question {
    id: string;
    question: string;
    skill: string;
}

interface InteractiveQAProps {
    questions: Question[];
    onSubmit: (answers: Record<string, string>) => void;
    isLoading: boolean;
}

export function InteractiveQA({ questions, onSubmit, isLoading }: InteractiveQAProps) {
    // Store answers as: { "question_id": "Yes/No (Optional: detail)" }
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentIdx, setCurrentIdx] = useState(0);
    const [customDetail, setCustomDetail] = useState("");

    if (!questions || questions.length === 0) {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20 bg-card p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading questions...</p>
            </Card>
        );
    }

    const currentQ = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;

    const handleAnswer = (baseResponse: "Yes" | "No") => {
        let finalAnswer = baseResponse;
        if (baseResponse === "Yes" && customDetail.trim()) {
            finalAnswer = `Yes, ${customDetail.trim()}`;
        }

        setAnswers(prev => ({
            ...prev,
            [currentQ.id]: finalAnswer
        }));

        if (!isLast) {
            setCurrentIdx(prev => prev + 1);
            setCustomDetail(""); // Reset for next question
        } else {
            // Submit all
            onSubmit({ ...answers, [currentQ.id]: finalAnswer });
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20 bg-card">
            <CardHeader className="bg-primary/5 border-b">
                <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="bg-background">
                        Question {currentIdx + 1} of {questions.length}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Skill Gap Analysis</span>
                </div>
                <CardTitle className="text-xl leading-relaxed mt-2 text-foreground">
                    {currentQ.question}
                </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                <p className="text-sm text-muted-foreground">
                    This skill is highly requested in the job description but not clearly visible on your resume.
                    Do you have experience with <strong className="text-foreground">{currentQ.skill}</strong>?
                </p>

                <div className="space-y-3">
                    <Label htmlFor="detail" className="text-sm font-medium">Optional: Briefly describe your experience (e.g. "2 years using it at Company X")</Label>
                    <Input
                        id="detail"
                        placeholder="I used this to build..."
                        value={customDetail}
                        onChange={(e) => setCustomDetail(e.target.value)}
                        className="bg-transparent"
                    />
                </div>

            </CardContent>

            <CardFooter className="flex gap-4 justify-end border-t pt-6 bg-muted/10">
                <Button
                    variant="outline"
                    onClick={() => handleAnswer("No")}
                    disabled={isLoading}
                    className="w-32 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                    <X className="w-4 h-4 mr-2" /> No, I don't
                </Button>
                <Button
                    variant="default"
                    onClick={() => handleAnswer("Yes")}
                    disabled={isLoading}
                    className="w-40"
                >
                    {isLoading && isLast ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : isLast ? (
                        <>Finish & Tailor <ArrowRight className="w-4 h-4 ml-2" /></>
                    ) : (
                        <>Yes, Next <Check className="w-4 h-4 ml-2" /></>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
