import { Check, FileText, Download, Music } from 'lucide-react';

export default function LicenseSelector({ sound, licenses, selectedLicense, onSelectLicense }) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Select License Type</h3>
        <p className="text-gray-400">Choose the license that fits your needs</p>
      </div>

      {/* Sound Preview */}
      {sound && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded flex items-center justify-center flex-shrink-0">
            <Music className="h-10 w-10 text-white/60" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg">{sound?.title}</h4>
            <p className="text-gray-400">{sound?.producer?.producerName}</p>
            <div className="flex gap-3 mt-1 text-sm text-gray-500">
              {sound?.genre && <span>{sound?.genre}</span>}
              {sound?.bpm && <span>• {sound?.bpm} BPM</span>}
              {sound?.keySignature && <span>• {sound?.keySignature}</span>}
            </div>
          </div>
        </div>
      )}

      {/* License Options */}
      <div className="space-y-4">
        {licenses?.map((license) => {
          const isSelected = selectedLicense?.id === license?.id;

          return (
            <button
              key={license?.id}
              onClick={() => onSelectLicense?.(license)}
              className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10' :'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-600'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4 text-black" />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg capitalize">{license?.licenseType}</h4>
                    {license?.usageTerms && (
                      <p className="text-gray-400 text-sm mt-1">{license?.usageTerms}</p>
                    )}
                  </div>
                </div>
                <span className="text-cyan-500 font-bold text-2xl">${license?.price?.toFixed(2)}</span>
              </div>

              {/* License Features */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {license?.distributionLimit && (
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      {license?.distributionLimit?.toLocaleString()} distributions
                    </span>
                  </div>
                )}
                {license?.streamingLimit && (
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      {license?.streamingLimit?.toLocaleString()} streams
                    </span>
                  </div>
                )}
                {license?.allowsRadio && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-gray-300 text-sm">Radio broadcasting</span>
                  </div>
                )}
                {license?.allowsMusicVideo && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-gray-300 text-sm">Music videos</span>
                  </div>
                )}
                {license?.allowsProfitPerformances && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-gray-300 text-sm">Profit performances</span>
                  </div>
                )}
                {license?.contractDurationDays && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{license?.contractDurationDays} days</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {licenses?.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No licenses available for this sound</p>
        </div>
      )}
    </div>
  );
}