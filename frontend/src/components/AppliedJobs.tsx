import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, ExternalLink, Calendar, TrendingUp, Trophy, XCircle, Clock, BarChart3, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AppliedJob {
    id: number;
    job_title: string;
    company: string;
    url: string;
    status: string;
    created_at: string;
    user_id: string;
}

const STATUS_OPTIONS = ['Saved', 'Applied', 'Interviewing', 'Offer Received', 'Accepted', 'Rejected', 'Ghosted'];

const STATUS_COLORS: Record<string, string> = {
    'Saved': 'bg-gray-100 text-gray-600 border-gray-200',
    'Applied': 'bg-blue-100 text-blue-800 border-blue-200',
    'Interviewing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Offer Received': 'bg-purple-100 text-purple-800 border-purple-200',
    'Accepted': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Ghosted': 'bg-gray-100 text-gray-600 border-gray-200',
};

function StatsBar({ jobs }: { jobs: AppliedJob[] }) {
    const counts = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = jobs.filter(j => j.status === s).length;
        return acc;
    }, {} as Record<string, number>);

    const totalApplied = jobs.filter(j => j.status !== 'Saved').length;
    const responseRate = totalApplied > 0
        ? Math.round(((counts['Interviewing'] + counts['Offer Received'] + counts['Accepted']) / totalApplied) * 100)
        : 0;

    const cards = [
        { label: 'Saved Jobs', value: counts['Saved'], icon: Clock, color: 'text-gray-400' },
        { label: 'Applied', value: totalApplied, icon: BarChart3, color: 'text-blue-400' },
        { label: 'Interviewing', value: counts['Interviewing'], icon: Clock, color: 'text-yellow-400' },
        { label: 'Response Rate', value: `${responseRate}%`, icon: TrendingUp, color: 'text-purple-400' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {cards.map(c => (
                <Card key={c.label} className="text-center py-4">
                    <CardContent className="pt-0 flex flex-col items-center gap-1">
                        <c.icon className={`w-6 h-6 ${c.color}`} />
                        <div className="text-3xl font-bold tracking-tight">{c.value}</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{c.label}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function AppliedJobs() {
    const [jobs, setJobs] = useState<AppliedJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data, error } = await supabase
                    .from('AppliedJobs')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setJobs(data || []);
            } catch (err) {
                console.error("Error fetching applied jobs:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleStatusChange = async (jobId: number, newStatus: string) => {
        setUpdatingId(jobId);
        try {
            const { error } = await supabase
                .from('AppliedJobs')
                .update({ status: newStatus })
                .eq('id', jobId);

            if (error) throw error;
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteJob = async (jobId: number) => {
        if (!confirm("Are you sure you want to remove this job from your tracker?")) return;

        setUpdatingId(jobId);
        try {
            const { error } = await supabase
                .from('AppliedJobs')
                .delete()
                .eq('id', jobId);

            if (error) throw error;
            setJobs(prev => prev.filter(j => j.id !== jobId));
        } catch (err) {
            console.error("Failed to delete job:", err);
            alert("Errors deleting job. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading your applications...</div>;
    }

    if (jobs.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">No tracked applications yet</h3>
                <p className="text-muted-foreground mt-1">Tailor a CV for a job and click "Mark as Applied" to start tracking.</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div>
                <h2 className="text-2xl font-bold">My Career Dashboard</h2>
                <p className="text-muted-foreground">Manage your saved jobs and track your application progress.</p>
            </div>

            <StatsBar jobs={jobs} />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map((job) => {
                    const statusClass = STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600';
                    return (
                        <Card key={job.id} className="hover:shadow-md transition-shadow group">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-base leading-snug line-clamp-2">{job.job_title}</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 hover:bg-transparent transition-opacity"
                                        onClick={() => handleDeleteJob(job.id)}
                                        disabled={updatingId === job.id}
                                    >
                                        {updatingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <Building className="w-3.5 h-3.5" /> {job.company}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" /> Applied {format(new Date(job.created_at), 'MMM d, yyyy')}
                                </div>

                                {/* Status Dropdown */}
                                <Select
                                    value={job.status}
                                    onValueChange={(val) => handleStatusChange(job.id, val)}
                                    disabled={updatingId === job.id}
                                >
                                    <SelectTrigger className={`h-8 text-xs font-medium border ${statusClass}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map(s => (
                                            <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
                                >
                                    View Job Posting <ExternalLink className="w-3 h-3" />
                                </a>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
