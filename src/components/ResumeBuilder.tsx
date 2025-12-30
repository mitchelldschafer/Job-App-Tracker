import { useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { useResumeBuilder } from '../hooks/useResumeBuilder';
import { WorkExperienceEditor } from './WorkExperienceEditor';

export function ResumeBuilder() {
  const {
    resumes,
    currentResume,
    setCurrentResume,
    workExperiences,
    loading,
    error,
    createResume,
    parseResumeForExperience,
    addWorkExperience,
    updateWorkExperienceDescription,
    resetWorkExperienceDescription,
    deleteResume,
  } = useResumeBuilder();

  const [resumeContent, setResumeContent] = useState('');
  const [resumeTitle, setResumeTitle] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  const handleUploadResume = async () => {
    if (!resumeTitle.trim() || !resumeContent.trim()) {
      alert('Please provide a resume title and content');
      return;
    }

    const resume = await createResume(resumeTitle, resumeContent);
    if (resume) {
      const experiences = parseResumeForExperience(resumeContent);
      for (const exp of experiences) {
        await addWorkExperience(
          resume.id,
          exp.title,
          exp.company,
          exp.start_date,
          exp.end_date,
          exp.description
        );
      }
      setResumeContent('');
      setResumeTitle('');
      setShowUploadForm(false);
    }
  };

  const handleUseAI = async (experienceId: string) => {
    if (!apiKey.trim()) {
      alert('Please enter your OpenAI API key to use AI customization');
      return;
    }

    if (!jobDescription.trim()) {
      alert('Please provide a job description');
      return;
    }

    const experience = workExperiences.find(e => e.id === experienceId);
    if (!experience) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customize-resume`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            openaiKey: apiKey,
            originalDescription: experience.original_description,
            jobDescription,
            jobTitle: experience.title,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to customize resume');
      }

      const data = await response.json();
      await updateWorkExperienceDescription(experienceId, data.customizedDescription);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to customize resume with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading resumes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resume Builder</h2>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Resume
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {showUploadForm && (
        <div className="border rounded-lg p-6 bg-slate-50">
          <h3 className="text-lg font-semibold mb-4">Upload Your Resume</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Resume Title</label>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder="e.g., My Base Resume"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Resume Content</label>
              <textarea
                value={resumeContent}
                onChange={(e) => setResumeContent(e.target.value)}
                placeholder="Paste your resume content here. Include job titles, companies, dates, and descriptions."
                rows={8}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUploadResume}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Resume
              </button>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setResumeContent('');
                  setResumeTitle('');
                }}
                className="px-4 py-2 border rounded-md hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {resumes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Resumes</h3>
          <div className="grid gap-2">
            {resumes.map((resume) => (
              <button
                key={resume.id}
                onClick={() => setCurrentResume(resume)}
                className={`p-4 text-left border rounded-lg transition-colors ${
                  currentResume?.id === resume.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{resume.title}</h4>
                    <p className="text-sm text-slate-600">
                      Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this resume?')) {
                        deleteResume(resume.id);
                      }
                    }}
                    className="p-2 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentResume && (
        <div className="space-y-6">
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <span className="text-sm text-slate-600">
                {workExperiences.length} positions
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Job Description (for customization)</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description you want to tailor your resume to..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                />
              </div>

              {apiKey && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                  OpenAI API key configured
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">OpenAI API Key (Optional)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-slate-600 mt-1">
                  Your API key is only used locally and never stored
                </p>
              </div>
            </div>

            {workExperiences.length > 0 ? (
              <div className="space-y-4">
                {workExperiences.map((exp) => (
                  <WorkExperienceEditor
                    key={exp.id}
                    experience={exp}
                    onUpdateDescription={(newDesc) =>
                      updateWorkExperienceDescription(exp.id, newDesc)
                    }
                    onReset={() => resetWorkExperienceDescription(exp.id)}
                    onUseAI={() => handleUseAI(exp.id)}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-slate-600">
                No work experience found. Upload a resume to get started.
              </p>
            )}
          </div>
        </div>
      )}

      {resumes.length === 0 && !showUploadForm && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="font-semibold mb-1">No resumes yet</h3>
          <p className="text-slate-600 text-sm mb-4">
            Upload your base resume to get started with AI-powered customization
          </p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Your First Resume
          </button>
        </div>
      )}
    </div>
  );
}
