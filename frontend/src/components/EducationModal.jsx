import { useState, useEffect } from 'react';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() + 5 - i));

export default function EducationModal({ isOpen, onClose, onSave, onDelete, editData }) {
  const [formData, setFormData] = useState({
    school: '', degree: '', fieldOfStudy: '',
    startMonth: 'January', startYearVal: String(new Date().getFullYear() - 4),
    endMonth: 'June', endYearVal: String(new Date().getFullYear())
  });

  useEffect(() => {
    if (editData) {
      const parseDate = (dateStr) => {
        if (!dateStr) return { month: 'January', year: String(new Date().getFullYear()) };
        const parts = dateStr.trim().split(' ');
        // Agar purani DB me sirf "2020" jaisa single year pada ho
        if (parts.length === 1) return { month: 'January', year: parts[0] };
        return { month: parts[0] || 'January', year: parts[1] || String(new Date().getFullYear()) };
      };

      // 🔴 BACKEND REQUIRES 'startYear' & 'endYear' FOR EDUCATION
      const start = parseDate(editData.startYear);
      const end = parseDate(editData.endYear);

      setFormData({
        ...editData,
        startMonth: start.month,
        startYearVal: start.year,
        endMonth: end.month,
        endYearVal: end.year
      });
    } else {
      setFormData({
        school: '', degree: '', fieldOfStudy: '',
        startMonth: 'January', startYearVal: String(new Date().getFullYear() - 4),
        endMonth: 'June', endYearVal: String(new Date().getFullYear())
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      // 🔴 MAP TO MONGODB SCHEMA EXACT FIELDS
      startYear: `${formData.startMonth} ${formData.startYearVal}`,
      endYear: `${formData.endMonth} ${formData.endYearVal}`
    };

    delete formattedData.startMonth;
    delete formattedData.startYearVal;
    delete formattedData.endMonth;
    delete formattedData.endYearVal;

    onSave(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-slate-900">{editData ? 'Edit Education' : 'Add Education'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">School / College / University *</label>
            <input type="text" name="school" value={formData.school} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="e.g. RTU / Rajasthan University" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Degree *</label>
            <input type="text" name="degree" value={formData.degree} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="e.g. B.Tech / Senior Secondary" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Field of Study</label>
            <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy || ''} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" placeholder="e.g. Computer Science" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <div className="flex gap-2">
                <select name="startMonth" value={formData.startMonth} onChange={handleChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="startYearVal" value={formData.startYearVal} onChange={handleChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date (Expected)</label>
              <div className="flex gap-2">
                <select name="endMonth" value={formData.endMonth} onChange={handleChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="endYearVal" value={formData.endYearVal} onChange={handleChange} className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-100">
            {editData ? (
              <button type="button" onClick={() => onDelete(editData._id)} className="text-red-600 font-bold text-sm hover:underline">
                Delete education
              </button>
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