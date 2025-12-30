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

export interface WorkExperience {
  id: string;
  resume_id: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
  original_description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface WorkExperienceFormData {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
}
