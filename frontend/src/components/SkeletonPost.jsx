export default function SkeletonPost() {
  return (
    // 🚀 NAYA: 'mb-4' add kiya taaki har post ke beech gap rahe
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 animate-pulse mb-4">
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar Skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
        {/* Name & Title Skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
      
      {/* ✨ NAYA: Action Buttons (Like/Comment) Skeleton */}
      <div className="border-t border-gray-100 mt-4 pt-3 flex gap-6">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}