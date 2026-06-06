export default function RightSidebar() {
  const trendingTopics = [
    { title: 'UPSC CSE 2026 notification', posts: '12k' },
    { title: 'Union Budget 2026 highlights', posts: '8.2k' },
    { title: 'E-governance summit', posts: '3.1k' },
    { title: 'State PCS calendar', posts: '1.9k' },
  ];

  return (
    <div className="sticky top-20 space-y-4">
      {/* Trending Box */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Trending in Gov</h3>
        <div className="space-y-4">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="cursor-pointer group">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition leading-tight">
                {topic.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{topic.posts} posts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Officials Box */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm">Verified officials nearby</h3>
        <p className="text-xs text-gray-500 mt-1">Follow to receive their public updates.</p>
      </div>
    </div>
  );
}