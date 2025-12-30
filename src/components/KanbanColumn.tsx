import type { JobApplication, JobStatus } from '../types';
import { JobCard } from './JobCard';

interface KanbanColumnProps {
    title: string;
    status: JobStatus;
    jobs: JobApplication[];
}

export function KanbanColumn({ title, jobs }: KanbanColumnProps) {
    return (
        <div className="flex flex-col w-80 shrink-0">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="font-semibold text-lg text-foreground">{title}</h2>
                <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {jobs.length}
                </span>
            </div>

            <div className="flex-1 bg-muted/50 rounded-xl p-3 space-y-3 min-h-[500px]">
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
                {jobs.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-muted rounded-lg">
                        No jobs
                    </div>
                )}
            </div>
        </div>
    );
}
