export default function SkeletonPageCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
      {/* Title */}
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div> 
      
      {/* Category Badge */}
      <div className="h-5 bg-purple-100 rounded-full w-32 mb-4"></div> 
      
      {/* Description lines */}
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
      
      {/* Footer (Followers & Admin Link) */}
      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-24"></div> {/* Followers count */}
        <div className="h-4 bg-blue-100 rounded w-28"></div> {/* Open Admin View text */}
      </div>
    </div>
  );
}