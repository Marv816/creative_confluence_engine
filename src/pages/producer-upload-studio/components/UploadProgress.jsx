export default function UploadProgress({ progress }) {
  return (
    <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-medium">Uploading...</span>
        <span className="text-purple-500 font-bold">{progress}%</span>
      </div>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-gray-400 text-sm mt-2">
        {progress < 30 && 'Uploading audio file...'}
        {progress >= 30 && progress < 50 && 'Uploading cover image...'}
        {progress >= 50 && progress < 70 && 'Creating sound record...'}
        {progress >= 70 && progress < 90 && 'Setting up licenses...'}
        {progress >= 90 && 'Finalizing upload...'}
      </p>
    </div>
  );
}