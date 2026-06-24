import { useState, useEffect } from 'react';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i));
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Government / PSU", "Freelance"];

export default function ExperienceModal({ isOpen, onClose, onSave, onDelete, editData }) {
  const [formData, setFormData] = useState({
    title: '', company: '', employmentType: 'Full-time', location: '',
    startMonth: 'January', startYear: String(new Date().getFullYear()),
    endMonth: 'January', endYear: String(new Date().getFullYear()), current: false
  });

  useEffect(() => {
    if (editData) {
      const parseDate = (dateStr) => {
        if (!dateStr || dateStr === 'Present') return { month: 'January', year: String(new Date().getFullYear()) };
        const parts = dateStr.split(' ');
        return { month: parts[0] || 'January', year: parts[1] || String(new Date().getFullYear()) };
      };

      const start = parseDate(editData.startDate);
      const end = parseDate(editData.endDate);

      setFormData({
        ...editData,
        employmentType: editData.employmentType || 'Full-time',
        startMonth: start.month, startYear: start.year,
        endMonth: end.month, endYear: end.year,
        current: editData.current || false
      });
    } else {
      setFormData({
        title: '', company: '', employmentType: 'Full-time', location: '',
        startMonth: 'January', startYear: String(new Date().getFullYear()),
        endMonth: 'January', endYear: String(new Date().getFullYear()), current: false
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      startDate: `${formData.startMonth} ${formData.startYear}`,
      endDate: formData.current ? 'Present' : `${formData.endMonth} ${formData.endYear}`
    };

    delete formattedData.startMonth;
    delete formattedData.startYear;
    delete formattedData.endMonth;
    delete formattedData.endYear;

    onSave(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-slate-900">{editData ? 'Edit Experience' : 'Add Experience'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title / Designation *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="Designation" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employment Type</label>
            <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none">
              {EMPLOYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company / Organization *</label>
            <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="Organization" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="Location" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date *</label>
            <div className="flex gap-2">
              <select name="startMonth" value={formData.startMonth} onChange={handleChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select name="startYear" value={formData.startYear} onChange={handleChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 pt-1">
            <input type="checkbox" name="current" checked={formData.current} onChange={handleChange} className="w-4 h-4 rounded text-slate-900 focus:ring-0" /> I currently work here
          </label>
          {!formData.current && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date *</label>
              <div className="flex gap-2">
                <select name="endMonth" value={formData.endMonth} onChange={handleChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="endYear" value={formData.endYear} onChange={handleChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-100">
            {editData ? (
              <button type="button" onClick={() => onDelete(editData._id)} className="text-red-600 font-bold text-sm hover:underline">Delete experience</button>
            ) : <div />}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl text-sm">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-sm text-sm">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}