export default function SkeletonNetworkCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center animate-pulse">
      <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
      <div className="h-5 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded-full w-24 mb-6"></div>
      <div className="h-3 bg-blue-100 rounded w-1/3 mb-6"></div>
      <div className="h-10 bg-blue-200 rounded w-full"></div>
    </div>
  );
}