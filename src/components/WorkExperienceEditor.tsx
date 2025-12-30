import { useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import type { WorkExperience } from '../types';

interface WorkExperienceEditorProps {
  experience: WorkExperience;
  onUpdateDescription: (newDescription: string) => Promise<void>;
  onReset: () => Promise<void>;
  onUseAI: () => Promise<void>;
  isProcessing: boolean;
}

export function WorkExperienceEditor({
  experience,
  onUpdateDescription,
  onReset,
  onUseAI,
  isProcessing,
}: WorkExperienceEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(experience.description);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateDescription(description);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset description to original?')) {
      await onReset();
      setDescription(experience.original_description);
    }
  };

  const hasChanges = description !== experience.original_description;

  return (
    <div className="border rounded-lg p-4 bg-white space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-lg">{experience.title}</h4>
          <p className="text-slate-600">{experience.company}</p>
          <p className="text-sm text-slate-500">
            {experience.start_date} — {experience.end_date}
          </p>
        </div>
        {hasChanges && (
          <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-medium text-blue-700">
            Modified
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setDescription(experience.description);
                setIsEditing(false);
              }}
              className="px-3 py-2 border rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-slate-50 rounded p-3 text-sm whitespace-pre-wrap">
            {description || 'No description provided'}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 text-sm border rounded-md hover:bg-slate-50 transition-colors"
            >
              Edit
            </button>

            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm border rounded-md hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}

            <button
              onClick={onUseAI}
              disabled={isProcessing}
              className="px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 inline-flex items-center gap-1 text-blue-700"
            >
              <Sparkles className="w-3 h-3" />
              {isProcessing ? 'Customizing...' : 'Customize with AI'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
