import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import SkeletonPageCard from './SkeletonPageCard';
import toast from 'react-hot-toast';

export default function ManagePages({ onBack }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [pageType, setPageType] = useState(''); // 'creator' or 'institute'
  
  // State Form fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [about, setAbout] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  // Conditional fields
  const [primaryNiche, setPrimaryNiche] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [headquarters, setHeadquarters] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const getInitials = (pageName) => {
    if (!pageName) return "P";
    const parts = pageName.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchMyPages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/pages/my-pages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setPages(await res.json());
      } catch (err) {
        console.error("Error fetching pages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPages();
  }, [token]);

  const handleSelectCard = (type) => {
    setPageType(type);
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    try {
      const finalCategory = pageType === 'creator' ? 'Content Creator' : 'Coaching Institute';
      
      const payload = {
        name,
        bio,
        about,
        category: finalCategory,
        website,
        location,
        metadata: {
          pageType,
          primaryNiche,
          socialLinks,
          registrationId,
          headquarters
        }
      };

      const res = await fetch(`${API_BASE_URL}/api/pages/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newPage = await res.json();
        setPages([...pages, newPage]); 
        // Reset states
        setName(''); setBio(''); setAbout(''); setWebsite(''); setLocation('');
        setPrimaryNiche(''); setSocialLinks(''); setRegistrationId(''); setHeadquarters('');
        setShowWizard(false); setPageType('');
        toast.success("Page created successfully! 🏢");
      } else {
        toast.error("Failed to build page parameters.");
      }
    } catch (err) {
      toast.error("Network communication fault.");
    }
  };

  const closeWizardFlow = () => {
    setShowWizard(false);
    setPageType('');
  };

  return (
    <div className="max-w-3xl mx-auto mt-4 p-4 md:p-0 animate-fadeIn space-y-4 text-left">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-900 transition mb-2 text-sm font-bold flex items-center gap-1">
        ← Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Brand Pages</h1>
        <button 
          onClick={() => { if(showWizard) closeWizardFlow(); else setShowWizard(true); }}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-sm"
        >
          {showWizard ? 'Cancel' : '+ Create a Page'}
        </button>
      </div>

      {/* 🚀 TWO-CARD SELECTION SCREEN WIZARD FLOW */}
      {showWizard && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6 animate-fadeIn">
          {pageType === '' ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Select Page Classification</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Choose the type of node architecture that matches your brand layout.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card A: Creator */}
                <div 
                  onClick={() => handleSelectCard('creator')}
                  className="p-5 border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-900 hover:shadow-md transition group space-y-3"
                >
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg border border-slate-100 group-hover:bg-slate-950 group-hover:text-white transition">🎨</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Creator / Showcase Page</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">For individual educators, content creators, influencers, or mentors.</p>
                  </div>
                </div>

                {/* Card B: Institute */}
                <div 
                  onClick={() => handleSelectCard('institute')}
                  className="p-5 border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-900 hover:shadow-md transition group space-y-3"
                >
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg border border-slate-100 group-hover:bg-slate-950 group-hover:text-white transition">🏛️</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Educational Institute</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">For physical academies, coaching centers, colleges, or institutes.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* CONDITIONAL CREATION FORM WITH SHARED STYLE */
            <form onSubmit={handleCreatePage} className="space-y-4 flex flex-col gap-1">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 capitalize">{pageType} Setup Form</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Fill in setup criteria to register your live space node.</p>
                </div>
                <button type="button" onClick={() => setPageType('')} className="text-xs font-bold text-slate-500 hover:text-slate-950 transition underline">← Go Back</button>
              </div>

              {/* Universal Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Title *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-slate-900 font-medium" placeholder={pageType === 'creator' ? 'e.g., Khan Physics Network' : 'e.g., Kota Career Academy'} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tagline / Short Bio *</label>
                <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-slate-900 font-medium" placeholder="A single sentence describing your main core focus..." />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website URL</label>
                  <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none font-medium" placeholder="https://..." />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location / City</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none font-medium" placeholder="e.g., Kota, Rajasthan" />
                </div>
              </div>

              {/* ✨ CONDITIONAL INJECTION PORTS */}
              {pageType === 'creator' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Subject Niche *</label>
                    <input type="text" value={primaryNiche} onChange={(e) => setPrimaryNiche(e.target.value)} required={pageType === 'creator'} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none font-medium" placeholder="e.g., Competitive Maths, CSE Tutorials" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Social Channel Link</label>
                    <input type="text" value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none font-medium" placeholder="e.g., YouTube URL / Twitter Link" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registration / Affiliation ID</label>
                    <input type="text" value={registrationId} onChange={(e) => setRegistrationId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none font-medium" placeholder="Optional testing code (e.g., REG-1092)" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HQ Campus Address</label>
                    <input type="text" value={headquarters} onChange={(e) => setHeadquarters(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none font-medium" placeholder="Optional physical address grid location" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Detailed About Summary</label>
                <textarea value={about} onChange={(e) => setAbout(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none h-20 font-medium" placeholder="Write a deeper background summary about structural setups, results, or schedules..."></textarea>
              </div>

              <button type="submit" className="bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-sm mt-1">
                Build Live Space Node →
              </button>
            </form>
          )}
        </div>
      )}

      {/* Pages List View Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><SkeletonPageCard /><SkeletonPageCard /></div>
      ) : pages.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center text-sm font-medium text-slate-400">
          You don't manage any brand nodes yet. Build one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map(page => (
            <div 
              key={page._id} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/page/${page._id}`)}
            >
              <div>
                <div className="flex gap-3 items-start">
                  <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0 border border-slate-200">
                    {getInitials(page.name)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight tracking-tight hover:text-blue-600 transition">{page.name}</h3>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-extrabold mt-1 inline-block uppercase tracking-wider border border-slate-200">
                      {page.category}
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 text-xs mt-3 line-clamp-2 leading-relaxed font-medium">{page.bio || 'No active details provided.'}</p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-slate-500 font-bold">
                <span>{page.followers?.length || 0} Followers</span>
                <span className="text-slate-900 hover:underline">View Page →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}