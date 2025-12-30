import { useState } from 'react'
import { Plus, Download, Upload, FileText } from 'lucide-react'
import { Layout } from './components/Layout'
import { KanbanColumn } from './components/KanbanColumn'
import { AddJobModal } from './components/AddJobModal'
import { ResumeBuilder } from './components/ResumeBuilder'
import { useJobStore } from './hooks/useJobStore'
import type { JobStatus, JobApplication } from './types'

const COLUMNS: { title: string; status: JobStatus }[] = [
  { title: 'Saved', status: 'Saved' },
  { title: 'Applied', status: 'Applied' },
  { title: 'Interviewing', status: 'Interviewing' },
  { title: 'Offer', status: 'Offer' },
  { title: 'Rejected', status: 'Rejected' },
]

function App() {
  const { jobs, addJob, importJobs } = useJobStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'crm' | 'resume'>('crm')

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "job-crm-data.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (e.target?.result) {
          try {
            const parsed = JSON.parse(e.target.result as string) as JobApplication[];
            if (Array.isArray(parsed)) {
              importJobs(parsed);
            }
          } catch (err) {
            console.error("Failed to parse JSON", err);
            alert("Invalid JSON file");
          }
        }
      };
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Job CRM
          </h1>
          <p className="text-muted-foreground mt-1">Manage your job applications and resumes.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('crm')}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'crm'
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-secondary'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Job CRM</span>
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'resume'
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-secondary'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Resume Builder</span>
          </button>
        </div>
      </div>

      {activeTab === 'crm' ? (
        <>
          <div className="flex items-center gap-2 mb-6">
            <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-secondary transition-colors" title="Import JSON">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-secondary transition-colors"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Job
            </button>
          </div>

          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max h-full">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.status}
                  title={col.title}
                  status={col.status}
                  jobs={jobs.filter(j => j.status === col.status)}
                />
              ))}
            </div>
          </div>

          <AddJobModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={addJob}
          />
        </>
      ) : (
        <div className="flex-1 overflow-y-auto pb-4">
          <ResumeBuilder />
        </div>
      )}
    </Layout>
  )
}

export default App
