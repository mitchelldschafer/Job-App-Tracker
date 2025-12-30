import { useState } from 'react';
import type { JobFormData } from '../types';
import { X } from 'lucide-react';

interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (job: JobFormData) => void;
}

export function AddJobModal({ isOpen, onClose, onAdd }: AddJobModalProps) {
    const [formData, setFormData] = useState<JobFormData>({
        role: '',
        company: '',
        status: 'Saved',
        dateApplied: new Date().toISOString().split('T')[0],
        salary: '',
        link: '',
        notes: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
        // Reset form
        setFormData({
            role: '',
            company: '',
            status: 'Saved',
            dateApplied: new Date().toISOString().split('T')[0],
            salary: '',
            link: '',
            notes: '',
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background w-full max-w-md rounded-lg shadow-lg border p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-xl font-semibold mb-4">Add New Job</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role *</label>
                            <input
                                required
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                placeholder="Software Engineer"
                                className="w-full p-2 rounded-md border bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company *</label>
                            <input
                                required
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Acme Corp"
                                className="w-full p-2 rounded-md border bg-background"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border bg-background"
                            >
                                <option value="Saved">Saved</option>
                                <option value="Applied">Applied</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <input
                                type="date"
                                name="dateApplied"
                                value={formData.dateApplied}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border bg-background"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Salary</label>
                            <input
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="$120k - $150k"
                                className="w-full p-2 rounded-md border bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Link</label>
                            <input
                                type="url"
                                name="link"
                                value={formData.link}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full p-2 rounded-md border bg-background"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Referral from John..."
                            className="w-full p-2 rounded-md border bg-background h-20 resize-none"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                        >
                            Add Job
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
