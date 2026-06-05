export default function SkeletonPost() {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar Skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        {/* Name & Title Skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      {/* Content Skeleton */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}