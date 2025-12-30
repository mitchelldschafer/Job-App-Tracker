import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Resume, WorkExperience } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useResumeBuilder() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    if (currentResume) {
      fetchWorkExperiences(currentResume.id);
    }
  }, [currentResume]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (err) throw err;
      setResumes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkExperiences = async (resumeId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('resume_work_experience')
        .select('*')
        .eq('resume_id', resumeId)
        .order('order', { ascending: true });

      if (err) throw err;
      setWorkExperiences(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch work experience');
    }
  };

  const createResume = async (title: string, content: string) => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('resumes')
        .insert([{ title, content }])
        .select()
        .single();

      if (err) throw err;
      setCurrentResume(data);
      setResumes([data, ...resumes]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resume');
    } finally {
      setLoading(false);
    }
  };

  const parseResumeForExperience = (content: string) => {
    const experiences: Omit<WorkExperience, 'id' | 'resume_id' | 'created_at' | 'updated_at'>[] = [];

    const lines = content.split('\n');
    let currentExp: any = null;
    let order = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}/.test(line) || line.includes('-')) {
        if (currentExp) {
          experiences.push(currentExp);
        }

        const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4})\s*[-–]\s*(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}|Present)/i);
        const titleMatch = lines[i - 1]?.trim();
        const companyMatch = lines[i - 2]?.trim();

        currentExp = {
          title: titleMatch || 'Position Title',
          company: companyMatch || 'Company Name',
          start_date: dateMatch ? dateMatch[1] : '',
          end_date: dateMatch ? dateMatch[2] : '',
          description: '',
          original_description: '',
          order: order++,
        };
      } else if (currentExp && line && !line.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
        currentExp.description += (currentExp.description ? '\n' : '') + line;
        currentExp.original_description = currentExp.description;
      }
    }

    if (currentExp) {
      experiences.push(currentExp);
    }

    return experiences;
  };

  const addWorkExperience = async (
    resumeId: string,
    title: string,
    company: string,
    startDate: string,
    endDate: string,
    description: string
  ) => {
    try {
      const { data, error: err } = await supabase
        .from('resume_work_experience')
        .insert([
          {
            resume_id: resumeId,
            title,
            company,
            start_date: startDate,
            end_date: endDate,
            description,
            original_description: description,
            order: workExperiences.length,
          },
        ])
        .select()
        .single();

      if (err) throw err;
      setWorkExperiences([...workExperiences, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add work experience');
    }
  };

  const updateWorkExperienceDescription = async (
    experienceId: string,
    newDescription: string
  ) => {
    try {
      const { data, error: err } = await supabase
        .from('resume_work_experience')
        .update({ description: newDescription })
        .eq('id', experienceId)
        .select()
        .single();

      if (err) throw err;
      setWorkExperiences(
        workExperiences.map(exp => (exp.id === experienceId ? data : exp))
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update description');
    }
  };

  const resetWorkExperienceDescription = async (experienceId: string) => {
    try {
      const exp = workExperiences.find(e => e.id === experienceId);
      if (!exp) return;

      const { data, error: err } = await supabase
        .from('resume_work_experience')
        .update({ description: exp.original_description })
        .eq('id', experienceId)
        .select()
        .single();

      if (err) throw err;
      setWorkExperiences(
        workExperiences.map(e => (e.id === experienceId ? data : e))
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset description');
    }
  };

  const deleteResume = async (resumeId: string) => {
    try {
      const { error: err } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (err) throw err;
      setResumes(resumes.filter(r => r.id !== resumeId));
      if (currentResume?.id === resumeId) {
        setCurrentResume(null);
        setWorkExperiences([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume');
    }
  };

  return {
    resumes,
    currentResume,
    setCurrentResume,
    workExperiences,
    loading,
    error,
    fetchResumes,
    createResume,
    parseResumeForExperience,
    addWorkExperience,
    updateWorkExperienceDescription,
    resetWorkExperienceDescription,
    deleteResume,
  };
}
