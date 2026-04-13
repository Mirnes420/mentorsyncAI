import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Save, Sparkles, User, Briefcase, GraduationCap, Code, Globe, Award } from 'lucide-react';

interface CvEditorProps {
    data: any;
    onSave: (data: any) => void;
    onChange?: (data: any) => void;
    isLoading?: boolean;
}

export const CvEditor: React.FC<CvEditorProps> = ({ data: initialData, onSave, onChange, isLoading }) => {
    const [data, setData] = useState(initialData);
    const [basicsLocal, setBasicsLocal] = useState({
        name: initialData.basics?.name || '',
        title: initialData.basics?.title || '',
        contact_info: initialData.basics?.contact_info || ''
    });
    const [summaryString, setSummaryString] = useState(initialData.summary || '');
    const [skillsString, setSkillsString] = useState(initialData.skills?.join(', ') || '');
    const [experienceDescriptions, setExperienceDescriptions] = useState<Record<number, string>>(
        initialData.experience?.reduce((acc: any, exp: any, idx: number) => {
            acc[idx] = exp.description?.join('\n') || '';
            return acc;
        }, {}) || {}
    );
    const [projectStacks, setProjectStacks] = useState<Record<number, string>>(
        initialData.projects?.reduce((acc: any, proj: any, idx: number) => {
            acc[idx] = proj.stack?.join(', ') || '';
            return acc;
        }, {}) || {}
    );

    // Sync local edits back to parent to avoid data loss on tab switch
    React.useEffect(() => {
        if (!onChange) return;

        const currentData = {
            ...data,
            basics: {
                ...data.basics,
                ...basicsLocal
            },
            summary: summaryString,
            skills: skillsString.split(',').map(s => s.trim()).filter(s => s),
            experience: (data.experience || []).map((exp: any, idx: number) => ({
                ...exp,
                description: experienceDescriptions[idx]?.split('\n').map(l => l.trim()).filter(l => l) || []
            })),
            projects: (data.projects || []).map((proj: any, idx: number) => ({
                ...proj,
                stack: projectStacks[idx]?.split(',').map(s => s.trim()).filter(s => s) || []
            }))
        };

        // Deep compare check can be added if performance becomes an issue, 
        // but for a CV editor, standard sync is usually fine.
        onChange(currentData);
    }, [basicsLocal, summaryString, skillsString, experienceDescriptions, projectStacks, data]);

    const handleFinalSave = () => {
        // Coordinated sync of all local string buffers into the main data object
        const finalData = {
            ...data,
            basics: {
                ...data.basics,
                ...basicsLocal
            },
            summary: summaryString,
            skills: skillsString.split(',').map(s => s.trim()).filter(s => s),
            experience: (data.experience || []).map((exp: any, idx: number) => ({
                ...exp,
                description: experienceDescriptions[idx]?.split('\n').map(l => l.trim()).filter(l => l) || []
            })),
            projects: (data.projects || []).map((proj: any, idx: number) => ({
                ...proj,
                stack: projectStacks[idx]?.split(',').map(s => s.trim()).filter(s => s) || []
            }))
        };
        onSave(finalData);
    };

    const handleBasicsChange = (field: string, value: string) => {
        setBasicsLocal(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (section: string, index: number, field: string, value: any) => {
        const updatedSection = [...data[section]];
        updatedSection[index] = { ...updatedSection[index], [field]: value };
        setData({ ...data, [section]: updatedSection });
    };

    const addArrayItem = (section: string, template: any) => {
        const newData = { ...data, [section]: [...(data[section] || []), template] };
        setData(newData);
        if (section === 'projects') {
            const nextIdx = (data.projects || []).length;
            setProjectStacks({ ...projectStacks, [nextIdx]: template.stack?.join(', ') || '' });
        }
        if (section === 'experience') {
            const nextIdx = (data.experience || []).length;
            setExperienceDescriptions({ ...experienceDescriptions, [nextIdx]: template.description?.join('\n') || '' });
        }
    };

    const removeArrayItem = (section: string, index: number) => {
        const updatedSection = data[section].filter((_: any, i: number) => i !== index);
        const newData = { ...data, [section]: updatedSection };
        setData(newData);
        if (section === 'projects') {
            const newStacks: Record<number, string> = {};
            updatedSection.forEach((proj: any, idx: number) => {
                newStacks[idx] = proj.stack?.join(', ') || '';
            });
            setProjectStacks(newStacks);
        }
        if (section === 'experience') {
            const newDescs: Record<number, string> = {};
            updatedSection.forEach((exp: any, idx: number) => {
                newDescs[idx] = exp.description?.join('\n') || '';
            });
            setExperienceDescriptions(newDescs);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Review & Refine</h2>
                    <p className="text-muted-foreground">Perfect your AI-tailored CV before it becomes a PDF.</p>
                </div>
                <Button
                    onClick={handleFinalSave}
                    disabled={isLoading}
                    className="gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all px-8"
                >
                    {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Finalize PDF
                </Button>
            </div>

            <Accordion type="multiple" defaultValue={['basics', 'summary']} className="w-full space-y-4">
                {/* Personal Details */}
                <AccordionItem value="basics" className="border rounded-xl px-4 bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-semibold">Personal Details</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={basicsLocal.name} onChange={(e) => handleBasicsChange('name', e.target.value)} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Professional Title</Label>
                                <Input value={basicsLocal.title} onChange={(e) => handleBasicsChange('title', e.target.value)} placeholder="Full Stack Developer" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Contact Info (One line)</Label>
                                <Input value={basicsLocal.contact_info} onChange={(e) => handleBasicsChange('contact_info', e.target.value)} placeholder="email@example.com | 555-0199 | github.com/johndoe" />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Professional Summary */}
                <AccordionItem value="summary" className="border rounded-xl px-4 bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-semibold">Professional Summary</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t">
                        <div className="space-y-2 pt-4">
                            <Label>Executive Overview</Label>
                            <Textarea
                                value={summaryString}
                                onChange={(e) => setSummaryString(e.target.value)}
                                className="min-h-[120px] resize-none leading-relaxed"
                                placeholder="Briefly describe your career and value proposition..."
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Experience */}
                <AccordionItem value="experience" className="border rounded-xl px-4 bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-semibold">Experience</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t space-y-6">
                        <div className="space-y-6 pt-4">
                            {data.experience?.map((exp: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-lg bg-muted/50 border space-y-4 relative group">
                                    <Button
                                        variant="ghost" size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                        onClick={() => removeArrayItem('experience', idx)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Company</Label>
                                            <Input value={exp.company} onChange={(e) => handleArrayChange('experience', idx, 'company', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input value={exp.title} onChange={(e) => handleArrayChange('experience', idx, 'title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date Range</Label>
                                            <Input value={exp.dates} onChange={(e) => handleArrayChange('experience', idx, 'dates', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Location</Label>
                                            <Input value={exp.location} onChange={(e) => handleArrayChange('experience', idx, 'location', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Achievements (One per line)</Label>
                                        <Textarea
                                            value={experienceDescriptions[idx] || ''}
                                            onChange={(e) => setExperienceDescriptions({ ...experienceDescriptions, [idx]: e.target.value })}
                                            className="min-h-[100px] font-sans"
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={() => addArrayItem('experience', { company: '', title: '', dates: '', location: '', description: [] })}>
                                <Plus className="w-4 h-4 mr-2" /> Add Experience
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Education */}
                <AccordionItem value="education" className="border rounded-xl px-4 bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-semibold">Education</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t space-y-4">
                        <div className="space-y-4 pt-4">
                            {data.education?.map((edu: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-lg bg-muted/50 border space-y-4 relative group">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => removeArrayItem('education', idx)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Institution</Label>
                                            <Input value={edu.institution} onChange={(e) => handleArrayChange('education', idx, 'institution', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Degree</Label>
                                            <Input value={edu.degree} onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={() => addArrayItem('education', { institution: '', degree: '', dates: '', details: '' })}>
                                <Plus className="w-4 h-4 mr-2" /> Add Education
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Skills */}
                <AccordionItem value="skills" className="border rounded-xl px-4 bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                <Code className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-semibold">Skills</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t">
                        <div className="space-y-2 pt-4">
                            <Label>Core Competencies (Comma separated)</Label>
                            <Textarea
                                value={skillsString}
                                onChange={(e) => setSkillsString(e.target.value)}
                                placeholder="React, Typography, Product Strategy..."
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Projects */}
                <AccordionItem value="projects" className="border rounded-xl px-4 bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                <Globe className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-semibold">Projects</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t space-y-6">
                        <div className="space-y-6 pt-4">
                            {data.projects?.map((proj: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-lg bg-muted/50 border space-y-4 relative group">
                                    <Button
                                        variant="ghost" size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                        onClick={() => removeArrayItem('projects', idx)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Project Name</Label>
                                            <Input value={proj.name} onChange={(e) => handleArrayChange('projects', idx, 'name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Project URL</Label>
                                            <Input value={proj.url} onChange={(e) => handleArrayChange('projects', idx, 'url', e.target.value)} />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Tech Stack (Comma separated)</Label>
                                            <Input
                                                value={projectStacks[idx] || ''}
                                                onChange={(e) => setProjectStacks({ ...projectStacks, [idx]: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={proj.description}
                                            onChange={(e) => handleArrayChange('projects', idx, 'description', e.target.value)}
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={() => addArrayItem('projects', { name: '', description: '', stack: [], url: '' })}>
                                <Plus className="w-4 h-4 mr-2" /> Add Project
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Certifications */}
                <AccordionItem value="certifications" className="border rounded-xl px-4 bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                                <Award className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-semibold">Certifications</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t space-y-4">
                        <div className="space-y-4 pt-4">
                            {data.certifications?.map((cert: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-lg bg-muted/50 border space-y-4 relative group">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => removeArrayItem('certifications', idx)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Certification Name</Label>
                                            <Input value={cert.name} onChange={(e) => handleArrayChange('certifications', idx, 'name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Issuer</Label>
                                            <Input value={cert.issuer} onChange={(e) => handleArrayChange('certifications', idx, 'issuer', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Input value={cert.date} onChange={(e) => handleArrayChange('certifications', idx, 'date', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '' })}>
                                <Plus className="w-4 h-4 mr-2" /> Add Certification
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Languages */}
                <AccordionItem value="languages" className="border rounded-xl px-4 bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                                <Globe className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-semibold">Languages</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t space-y-4">
                        <div className="space-y-4 pt-4">
                            {data.languages?.map((lang: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-lg bg-muted/50 border space-y-4 relative group">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => removeArrayItem('languages', idx)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Language</Label>
                                            <Input value={lang.language} onChange={(e) => handleArrayChange('languages', idx, 'language', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Level (e.g. Native, B2, Fluent)</Label>
                                            <Input value={lang.level} onChange={(e) => handleArrayChange('languages', idx, 'level', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={() => addArrayItem('languages', { language: '', level: '' })}>
                                <Plus className="w-4 h-4 mr-2" /> Add Language
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50 flex justify-center">
                <Button
                    onClick={handleFinalSave}
                    disabled={isLoading}
                    className="gap-2 shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all px-12 h-12 text-lg font-semibold"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Finalize and Download PDF
                </Button>
            </div>
        </div>
    );
};

const Loader2 = ({ className }: { className?: string }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);
