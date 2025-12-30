import type { JobApplication, JobStatus } from '../types';
import { ExternalLink, Trash2, Calendar, FileText } from 'lucide-react';
import { useJobStore } from '../hooks/useJobStore';

interface JobCardProps {
    job: JobApplication;
}

export function JobCard({ job }: JobCardProps) {
    const { deleteJob, updateJob } = useJobStore();

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateJob(job.id, { status: e.target.value as JobStatus });
    };

    return (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg leading-none tracking-tight">{job.role}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
                </div>
                <button
                    onClick={() => deleteJob(job.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Delete Job"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(job.dateApplied).toLocaleDateString()}
                </div>
                {job.salary && <span className="bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{job.salary}</span>}
            </div>

            {(job.link || job.notes) && (
                <div className="flex gap-2 pt-2 border-t mt-2">
                    {job.link && (
                        <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <ExternalLink className="w-3 h-3" /> Link
                        </a>
                    )}
                    {job.notes && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground" title={job.notes}>
                            <FileText className="w-3 h-3" /> Notes
                        </div>
                    )}
                </div>
            )}

            <div className="pt-2">
                <select
                    value={job.status}
                    onChange={handleStatusChange}
                    className="w-full text-xs p-1 rounded border bg-background"
                >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
        </div>
    );
}
