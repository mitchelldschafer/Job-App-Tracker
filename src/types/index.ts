export type JobStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface JobApplication {
    id: string;
    company: string;
    role: string;
    status: JobStatus;
    dateApplied: string;
    salary?: string;
    link?: string;
    notes?: string;
    updatedAt: string;
}

export type JobFormData = Omit<JobApplication, 'id' | 'updatedAt'>;
