import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Loader2, CheckCircle, Upload, FileText, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

export function ProfilePage() {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState({
        display_name: '',
        title: '',
        bio: '',
        linkedin: '',
        github: '',
        location: '',
        cv_path: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [isUploadingCv, setIsUploadingCv] = useState(false);
    const [cvUploaded, setCvUploaded] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
            if (!currentSession) return;

            const { data: remoteProfile } = await supabase
                .from('Profiles')
                .select('*')
                .eq('user_id', currentSession.user.id)
                .single();

            const savedLocalData = localStorage.getItem(`ms_profile_draft_${currentSession.user.id}`);
            const localDraft = savedLocalData ? JSON.parse(savedLocalData) : null;

            if (remoteProfile) {
                setProfile({
                    display_name: localDraft?.display_name ?? remoteProfile.display_name ?? '',
                    title: localDraft?.title ?? remoteProfile.title ?? '',
                    bio: localDraft?.bio ?? remoteProfile.bio ?? '',
                    linkedin: localDraft?.linkedin ?? remoteProfile.linkedin ?? '',
                    github: localDraft?.github ?? remoteProfile.github ?? '',
                    location: localDraft?.location ?? remoteProfile.location ?? '',
                    cv_path: remoteProfile.cv_path || '',
                });
                if (remoteProfile.cv_path) setCvUploaded(true);
            } else if (localDraft) {
                setProfile(prev => ({ ...prev, ...localDraft }));
            }
            setIsLoading(false);
        };
        init();
    }, []);

    // Sync to local storage on every change
    useEffect(() => {
        if (!session || isLoading) return;
        localStorage.setItem(`ms_profile_draft_${session.user.id}`, JSON.stringify(profile));
    }, [profile, session, isLoading]);

    const handleCvUpload = async () => {
        if (!cvFile || !session) return;
        setIsUploadingCv(true);
        try {
            const filePath = `${session.user.id}/resume.pdf`;
            const { error: uploadError } = await supabase.storage
                .from('cvs')
                .upload(filePath, cvFile, { upsert: true, contentType: 'application/pdf' });
            if (uploadError) throw uploadError;

            // Save path to profile
            const { error: dbError } = await supabase
                .from('Profiles')
                .upsert({ user_id: session.user.id, cv_path: filePath, email: session.user.email }, { onConflict: 'user_id' });
            if (dbError) throw dbError;

            setProfile(p => ({ ...p, cv_path: filePath }));
            setCvUploaded(true);
            setCvFile(null);
        } catch (err: any) {
            console.error('CV upload error:', err);
            alert('Failed to upload CV: ' + err.message);
        } finally {
            setIsUploadingCv(false);
        }
    };

    const handleSave = async () => {
        if (!session) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('Profiles')
                .upsert({
                    user_id: session.user.id,
                    email: session.user.email,
                    display_name: profile.display_name,
                    title: profile.title,
                    bio: profile.bio,
                    linkedin: profile.linkedin,
                    github: profile.github,
                    location: profile.location,
                    cv_path: profile.cv_path, // explicitly preserve the path
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });

            if (error) throw error;
            setSaved(true);
            localStorage.removeItem(`ms_profile_draft_${session.user.id}`);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save profile:', err);
            alert('Failed to save profile. Make sure the Profiles table exists in your Supabase DB.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading profile...</div>;
    }

    const initials = profile.display_name
        ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : session?.user?.email?.[0]?.toUpperCase() || '?';

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-bold">Your Profile</h2>
                <p className="text-muted-foreground">Personal info and saved CV used to personalize your experience.</p>
            </div>

            {/* Avatar + Email */}
            <Card>
                <CardContent className="pt-6 flex items-center gap-4">
                    <Avatar className="h-16 w-16 text-2xl">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold text-lg">{profile.display_name || 'Set your name below'}</div>
                        <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
                    </div>
                </CardContent>
            </Card>

            {/* CV Upload */}
            <Card className={cvUploaded ? 'border-green-500/40 bg-green-50/20' : ''}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="w-4 h-4" /> Saved Resume
                        {cvUploaded && <Badge className="ml-2 bg-green-500 text-white text-xs">CV Saved ✓</Badge>}
                    </CardTitle>
                    <CardDescription>
                        Upload your CV here once — it will be used automatically on the Find Jobs screen without needing to re-upload.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {cvUploaded && !cvFile && (
                        <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> A CV is already saved to your profile.
                        </p>
                    )}

                    <div className="flex items-center gap-3">
                        <Input
                            type="file"
                            accept=".pdf"
                            className="text-sm"
                            onChange={e => setCvFile(e.target.files?.[0] || null)}
                        />
                        {cvFile && (
                            <Button size="sm" onClick={handleCvUpload} disabled={isUploadingCv} className="gap-2 shrink-0">
                                {isUploadingCv ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                {isUploadingCv ? 'Uploading...' : 'Upload'}
                            </Button>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">PDF only. Max 10MB.</p>
                </CardContent>
            </Card>

            {/* Edit Fields */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" /> Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Display Name</Label>
                            <Input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Job Title / Role</Label>
                            <Input value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} placeholder="Senior Software Engineer" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Location</Label>
                        <Input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="Berlin, Germany" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Short Bio</Label>
                        <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="A few words about yourself..." rows={3} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Social Links</CardTitle>
                    <CardDescription>Used to personalize CV & cold email generation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>LinkedIn URL</Label>
                        <Input value={profile.linkedin} onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/yourname" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>GitHub URL</Label>
                        <Input value={profile.github} onChange={e => setProfile(p => ({ ...p, github: e.target.value }))} placeholder="https://github.com/yourname" />
                    </div>
                </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2" size="lg">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-green-400" /> : null}
                {saved ? 'Saved!' : 'Save Profile'}
            </Button>
        </div>
    );
}

