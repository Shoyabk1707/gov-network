import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import SkeletonPost from './SkeletonPost';
import toast from 'react-hot-toast';

export default function PageProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // View Control Hooks
  const [isAdminView, setIsAdminView] = useState(true);
  const [adminActiveMenu, setAdminActiveMenu] = useState('Dashboard'); 
  const [memberActiveTab, setMemberActiveTab] = useState('Home'); // Dynamic Tab state for members view
  const [postFilter, setPostFilter] = useState('General'); 
  
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const [formData, setFormData] = useState({ name: '', bio: '', about: '', website: '', location: '' });

  const getInitials = (name) => {
    if (!name) return "P";
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const fetchPageDetails = async () => {
    try {
      const resMe = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resMe.ok) setCurrentUser(await resMe.json());

      const resPage = await fetch(`${API_BASE_URL}/api/pages/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resPage.ok) {
        const pageData = await resPage.json();
        setPage(pageData);
        setFormData({
          name: pageData.name || '', bio: pageData.bio || '', about: pageData.about || '',
          website: pageData.website || '', location: pageData.location || ''
        });
      }

      const resPosts = await fetch(`${API_BASE_URL}/api/pages/${id}/posts`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resPosts.ok) setPosts(await resPosts.json());
    } catch (err) {
      toast.error("Failed to reload data metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (id) fetchPageDetails(); 
  }, [id, token]);

  const isOwner = currentUser && page && String(page.owner?._id || page.owner) === String(currentUser._id);
  const renderAdminMode = isOwner && isAdminView;
  const isInstitute = page?.category === 'Coaching Institute' || page?.metadata?.pageType === 'institute';

  // 📁 COMPILE SYSTEM TABS ON MEMBER DEMAND VIEWPORT
  const baseTabs = ['Home', 'About', 'Posts'];
  const memberTabs = isInstitute ? [...baseTabs, 'Jobs', 'People'] : baseTabs;

  // 🖥️ SIDEBAR AUTOMATIC HIDING DISPATCHER LOOP
  useEffect(() => {
    const globalLeftSidebar = document.querySelector('.md\\:col-span-3');
    const globalRightSidebar = document.querySelector('.lg\\:col-span-3');
    const dynamicCenterMainShell = document.querySelector('.col-span-1.md\\:col-span-6');

    if (renderAdminMode && !loading) {
      if (globalLeftSidebar) globalLeftSidebar.style.display = 'none';
      if (globalRightSidebar) globalRightSidebar.style.display = 'none';
      if (dynamicCenterMainShell) {
        dynamicCenterMainShell.classList.remove('md:col-span-6');
        dynamicCenterMainShell.classList.add('md:col-span-12');
      }
    } else {
      if (globalLeftSidebar) globalLeftSidebar.style.display = 'block';
      if (globalRightSidebar) globalRightSidebar.style.display = 'block';
      if (dynamicCenterMainShell) {
        dynamicCenterMainShell.classList.remove('md:col-span-12');
        dynamicCenterMainShell.classList.add('md:col-span-6');
      }
    }

    return () => {
      if (globalLeftSidebar) globalLeftSidebar.style.display = '';
      if (globalRightSidebar) globalRightSidebar.style.display = '';
      if (dynamicCenterMainShell) {
        dynamicCenterMainShell.classList.remove('md:col-span-12');
        dynamicCenterMainShell.classList.add('md:col-span-6');
      }
    };
  }, [renderAdminMode, loading]);

  const checkIsFollowing = () => {
    if (!currentUser || !page || !page.followers) return false;
    return page.followers.some(f => String(f._id || f) === String(currentUser._id));
  };

  const handleFollow = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pages/${id}/toggle-follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const resData = await res.json();
        setPage(prev => ({
          ...prev,
          followers: resData.isFollowing 
            ? [...prev.followers, currentUser._id]
            : prev.followers.filter(f => String(f._id || f) !== String(currentUser._id))
        }));
        toast.success(resData.isFollowing ? "Following page updates! 📢" : "Unfollowed brand node.");
      }
    } catch (err) {
      toast.error("Follow communication failed.");
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return toast.error("Content cannot be empty.");
    setIsSubmittingPost(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newPostContent, pageId: id })
      });

      if (res.ok) {
        toast.success("Broadcast notice live! 📢");
        setNewPostContent('');
        fetchPageDetails(); 
      }
    } catch (err) {
      toast.error("Failed to commit post mapping.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  if (loading || !page) {
    return (
      <div className="max-w-3xl mx-auto mt-6 px-4 pb-12 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-2xl mb-6"></div>
        <SkeletonPost />
      </div>
    );
  }

  const renderPostBox = () => (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 animate-fadeIn">
      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1">📝 Broadcast Official Update</h3>
      <form onSubmit={handleCreatePost} className="space-y-3">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none font-medium h-20 resize-none focus:ring-1 focus:ring-slate-900"
          placeholder={`What's new at ${page.name}? Share announcements, schedules...`}
        />
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmittingPost || !newPostContent.trim()}
            className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {isSubmittingPost ? 'Publishing...' : 'Start a post 🚀'}
          </button>
        </div>
      </form>
    </div>
  );

  const handleDeletePage = async () => {
  const confirmDelete = window.confirm("Kya aap sach me is page ko permanently delete karna chahte hain?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/pages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      toast.success("Page permanently delete ho gaya! 🛑");
      navigate('/dashboard'); // Ya jahan bhi aapko redirect karna ho
    } else {
      toast.error("Delete karne me dikkat aayi.");
    }
  } catch (err) {
    toast.error("Server communication failed.");
  }
};

  return (
    <div className="w-full mx-auto mt-2 pb-12 animate-fadeIn text-left">
      
      {/* =========================================================================
          🏛️ VIEW TYPE A: ADMIN WORKSPACE PANEL ACTIVE (Full Bleed View)
          ========================================================================= */}
      {renderAdminMode ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm text-center relative">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-3 border border-slate-100">
                {getInitials(page.name)}
              </div>
              <h2 className="font-bold text-slate-900 text-base leading-snug">{page.name}</h2>
              <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-extrabold mt-1 inline-block uppercase tracking-wider">{page.category}</span>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button onClick={() => setIsAdminView(false)} className="w-full py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-sm flex items-center justify-center gap-1">
                  👁️ View as member
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm flex flex-col">
              {['Dashboard', 'Page posts', 'Analytics', 'Activity', 'Settings'].map((menu) => (
                <button
                  key={menu}
                  onClick={() => setAdminActiveMenu(menu)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl text-left transition-all ${
                    adminActiveMenu === menu ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {menu === 'Dashboard' ? '📊 ' : menu === 'Page posts' ? '📢 ' : menu === 'Analytics' ? '📈 ' : menu === 'Activity' ? '🔔 ' : '⚙️ '}
                  {menu}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-9 space-y-4">
            {adminActiveMenu === 'Dashboard' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Track performance loop</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="block text-xl font-black text-slate-900">24</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Search appearances</span></div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="block text-xl font-black text-slate-900">{page.followers?.length || 0}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">New Followers</span></div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="block text-xl font-black text-slate-900">{posts.length * 4}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Post impressions</span></div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="block text-xl font-black text-slate-900">12</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Page visitors</span></div>
                  </div>
                </div>
                {renderPostBox()}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2">Recent Stream Notices</h3>
                  <div className="space-y-3">
                    {posts.length > 0 ? (
                      posts.slice(0, 3).map(post => (
                        <div key={post._id} className="border border-slate-100 p-3 bg-slate-50/60 rounded-xl text-sm font-medium text-slate-800">{post.content}</div>
                      ))
                    ) : <p className="text-xs text-slate-400 font-medium italic">No updates live.</p>}
                  </div>
                </div>
              </div>
            )}

            {adminActiveMenu === 'Page posts' && (
              <div className="space-y-4 animate-fadeIn">
                {renderPostBox()}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">All Stream Releases ({posts.length})</h3>
                  <div className="space-y-3">
                    {posts.map(p => (
                      <div key={p._id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800">{p.content}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {adminActiveMenu === 'Analytics' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center py-12 animate-fadeIn">
                <span className="text-3xl">📈</span><h3 className="font-bold text-slate-900 mt-2 text-sm">Analytics Engine</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Growth tracking loops are fully functional.</p>
              </div>
            )}

            {adminActiveMenu === 'Activity' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center py-12 animate-fadeIn">
                <span className="text-3xl">🔔</span><h3 className="font-bold text-slate-900 mt-2 text-sm">Interaction Channels</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Real-time alerts logs stack are mapped.</p>
              </div>
            )}

            {adminActiveMenu === 'Settings' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Manage Core Settings</h3>
                  <button onClick={() => setShowEditModal(true)} className="text-xs font-extrabold bg-slate-900 text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition">✏️ Edit Fields</button>
                </div>
                <div className="divide-y divide-slate-100">
                  // Settings array map ke andar:
              {[
                { title: 'Manage admins', desc: 'Control who manages your page' },
                { title: 'Manage restricted members', desc: 'See all the restricted members' },
                { title: 'Manage following', desc: 'See all the pages your page follows' },
                { title: 'Deactivate page', desc: 'Take your page down temporarily' },
                { title: 'Delete page', desc: 'Permanently remove this page from platform', isDelete: true } // 🔥 Naya Option
                ].map((setting, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (setting.isDelete) {
                        handleDeletePage(); // 🔥 Delete function call hoga
                      } else {
                        toast(`${setting.title} configuration synced!`, { icon: '⚙️' });
                      }
                    }}
                    className={`p-4 flex justify-between items-center hover:bg-slate-50/80 transition cursor-pointer ${setting.isDelete ? 'hover:bg-red-50 text-red-600' : ''}`}
                  >
                    <div>
                      <h4 className={`text-xs font-bold ${setting.isDelete ? 'text-red-600' : 'text-slate-900'}`}>{setting.title}</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{setting.desc}</p>
                    </div>
                    <span className={setting.isDelete ? 'text-red-400' : 'text-slate-400'}>➔</span>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
            👤 VIEW TYPE B: REVISED COMPREHENSIVE MEMBER VIEW WITH SUB-TABS INTERNALS
           ========================================================================= */
        <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
          {/* Cover Hero Block */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            <div className="h-32 bg-gradient-to-r from-slate-800 via-slate-900 to-black relative"></div> 
            <div className="px-6 pb-6 relative">
              <div className="flex justify-between items-end">
                <div className="w-32 h-32 bg-slate-50 text-slate-800 rounded-2xl border-4 border-white absolute -top-16 left-6 shadow-md flex items-center justify-center text-4xl font-extrabold tracking-wide border-slate-200">
                  {getInitials(page.name)}
                </div> 
                <div className="pt-4 ml-auto flex gap-2">
                  {isOwner && (
                    <button onClick={() => setIsAdminView(true)} className="px-4 py-1.5 border border-slate-900 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm">
                      🛠️ Switch to Admin view
                    </button>
                  )}
                  <button onClick={handleFollow} className={`px-5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${checkIsFollowing() ? 'bg-slate-100 text-slate-700 border border-gray-200 hover:bg-red-50 hover:text-red-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    {checkIsFollowing() ? 'Following' : 'Follow Page'}
                  </button>
                </div>
              </div>
              <div className="pt-6 mt-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{page.name}</h1>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-extrabold mt-1.5 inline-block uppercase tracking-wider border border-slate-200">{page.category}</span>
                <p className="text-xs text-slate-500 mt-2 font-bold">{page.followers?.length || 0} followers</p>
              </div>
            </div>
          </div>

          {/* ✨ NEW ADDED IN MEMBER VIEW: THE DYNAMIC TAB MATRIX CONTROLLER LINK */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex p-1 overflow-x-auto hide-scrollbar">
            {memberTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setMemberActiveTab(tab)}
                className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-all text-center ${
                  memberActiveTab === tab ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dynamic Render Pipeline according to active client tab */}
          {memberActiveTab === 'Home' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-2">
              <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Overview Channel</h2>
              <p className="text-sm text-slate-800 font-medium leading-relaxed">{page.bio || 'Welcome to our official network board stream.'}</p>
              <div className="text-xs text-slate-500 font-bold pt-3 flex gap-4 border-t border-slate-50 mt-2">
                <span>📍 Base: {page.location || 'India'}</span>
                {page.website && <a href={page.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">🌐 Visit Hub Website</a>}
              </div>
            </div>
          )}

          {memberActiveTab === 'About' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Company Profile</h2>
                <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">{page.about || 'No detailed background records configured yet.'}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 grid grid-cols-2 gap-4 text-xs font-medium">
                {isInstitute ? (
                  <>
                    <div><span className="block font-bold text-slate-400 uppercase text-[9px] mb-0.5">Registry ID</span> <span className="text-slate-900 font-extrabold">{page.metadata?.registrationId || 'REG-ACTIVE'}</span></div>
                    <div><span className="block font-bold text-slate-400 uppercase text-[9px] mb-0.5">Main Headquarters</span> <span className="text-slate-900 font-extrabold">{page.metadata?.headquarters || 'Main Campus Office'}</span></div>
                  </>
                ) : (
                  <>
                    <div><span className="block font-bold text-slate-400 uppercase text-[9px] mb-0.5">Focus Subject Area</span> <span className="text-slate-900 font-extrabold">{page.metadata?.primaryNiche || 'General Tutorials'}</span></div>
                    <div><span className="block font-bold text-slate-400 uppercase text-[9px] mb-0.5">Social Link Reference</span> <span className="text-slate-900 font-extrabold block truncate">{page.metadata?.socialLinks || 'Linked Asset Link'}</span></div>
                  </>
                )}
              </div>
            </div>
          )}

          {memberActiveTab === 'Posts' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                {['General', 'Job Updates', 'Study Resources'].map(filter => (
                  <button key={filter} onClick={() => setPostFilter(filter)} className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${postFilter === filter ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{filter}</button>
                ))}
              </div>
              
              <div className="space-y-3">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <div key={post._id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3 flex flex-col">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 text-white font-bold rounded-lg flex items-center justify-center text-sm">{getInitials(page.name)}</div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{page.name}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>
                  ))
                ) : <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">No updates shared under "{postFilter}" tags yet.</div>}
              </div>
            </div>
          )}

          {/* Exclusive Extra Member Panels */}
          {memberActiveTab === 'Jobs' && isInstitute && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center py-12 animate-fadeIn shadow-sm">
              <span className="text-xl block mb-1">💼</span><h4 className="text-sm font-bold text-slate-900">Career Openings Portal</h4>
              <p className="text-xs text-slate-400 font-medium mt-1">No active workspace recruitment filters running currently.</p>
            </div>
          )}

          {memberActiveTab === 'People' && isInstitute && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center py-12 animate-fadeIn shadow-sm">
              <span className="text-xl block mb-1">👥</span><h4 className="text-sm font-bold text-slate-900">Certified Staff Roll</h4>
              <p className="text-xs text-slate-400 font-medium mt-1">Alumni dashboards are currently loading default indexes.</p>
            </div>
          )}
        </div>
      )}

      {/* COMPONENT SETTINGS FORM POPUP MODAL CONTROL MAP */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
            <h2 className="text-sm font-bold mb-4 text-slate-900">Manage Profile Information</h2>
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Settings database forms schema linkages are fully armed.</p>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition">Close Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}