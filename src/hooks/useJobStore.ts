import { useState, useEffect } from 'react';
import type { JobApplication, JobStatus, JobFormData } from '../types';

const STORAGE_KEY = 'job-crm-data';

export function useJobStore() {
    const [jobs, setJobs] = useState<JobApplication[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    }, [jobs]);

    const addJob = (data: JobFormData) => {
        const newJob: JobApplication = {
            ...data,
            id: crypto.randomUUID(),
            updatedAt: new Date().toISOString(),
        };
        setJobs((prev) => [newJob, ...prev]);
    };

    const updateJob = (id: string, updates: Partial<JobApplication>) => {
        setJobs((prev) =>
            prev.map((job) =>
                job.id === id ? { ...job, ...updates, updatedAt: new Date().toISOString() } : job
            )
        );
    };

    const deleteJob = (id: string) => {
        setJobs((prev) => prev.filter((job) => job.id !== id));
    };

    const moveJob = (id: string, status: JobStatus) => {
        updateJob(id, { status });
    };

    const importJobs = (data: JobApplication[]) => {
        // Basic validation could go here
        setJobs(data);
    };

    return {
        jobs,
        addJob,
        updateJob,
        deleteJob,
        moveJob,
        importJobs,
    };
}
