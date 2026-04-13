import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Lightbulb, BookOpen, AlertCircle } from 'lucide-react';

export interface FeedbackData {
    match_score_percent: number;
    improvement_feedback: string;
    project_recommendations: string[];
    research_areas: string[];
}

interface FeedbackPanelProps {
    data: FeedbackData;
}

export function FeedbackPanel({ data }: FeedbackPanelProps) {
    const { match_score_percent, improvement_feedback, project_recommendations, research_areas } = data;

    // Determine color based on score
    const scoreColorClass =
        match_score_percent >= 80 ? "text-green-500" :
            match_score_percent >= 60 ? "text-yellow-500" :
                "text-red-500";

    return (
        <div className="space-y-6">
            {/* Score Section */}
            <Card>
                <CardHeader className="pb-2">
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 uppercase tracking-wider">
                        <Target className="w-4 h-4" /> Match Score
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <span className={`text-4xl font-bold ${scoreColorClass}`}>
                            {match_score_percent}%
                        </span>
                        <div className="flex-1 pb-2">
                            <Progress value={match_score_percent} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Improvement Feedback */}
            <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" /> Gap Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {improvement_feedback}
                    </p>
                </CardContent>
            </Card>

            {/* Project Recommendations */}
            {project_recommendations && project_recommendations.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-primary" /> Actionable Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {project_recommendations.map((proj, idx) => (
                                <li key={idx} className="bg-muted/30 p-3 rounded-md text-sm">
                                    {proj}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Research Areas */}
            {research_areas && research_areas.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-500" /> Areas to Research
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 flex-wrap">
                            {research_areas.map((area, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                                    {area}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
