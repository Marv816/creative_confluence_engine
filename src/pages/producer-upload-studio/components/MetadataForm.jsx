import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useState } from 'react';
import { X } from 'lucide-react';

export default function MetadataForm({ soundData, onChange }) {
  const [tagInput, setTagInput] = useState('');
  const [instrumentInput, setInstrumentInput] = useState('');

  const soundTypes = [
    { value: 'beat', label: 'Beat' },
    { value: 'sample', label: 'Sample' },
    { value: 'loop', label: 'Loop' },
    { value: 'vocal', label: 'Vocal' },
    { value: 'sfx', label: 'Sound Effect' },
  ];

  const genres = [
    'Hip-Hop', 'Trap', 'R&B', 'Pop', 'Lo-Fi', 'Drill', 'Afrobeat', 
    'Electronic', 'House', 'Techno', 'Ambient', 'Jazz', 'Rock'
  ];

  const keys = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'
  ];

  const handleAddTag = (e) => {
    if (e?.key === 'Enter' && tagInput?.trim()) {
      e?.preventDefault();
      const newTags = [...(soundData?.mood_tags || []), tagInput?.trim()];
      onChange('mood_tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    const newTags = soundData?.mood_tags?.filter((_, i) => i !== index);
    onChange('mood_tags', newTags);
  };

  const handleAddInstrument = (e) => {
    if (e?.key === 'Enter' && instrumentInput?.trim()) {
      e?.preventDefault();
      const newInstruments = [...(soundData?.instrument_tags || []), instrumentInput?.trim()];
      onChange('instrument_tags', newInstruments);
      setInstrumentInput('');
    }
  };

  const handleRemoveInstrument = (index) => {
    const newInstruments = soundData?.instrument_tags?.filter((_, i) => i !== index);
    onChange('instrument_tags', newInstruments);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={soundData?.title}
          onChange={(e) => onChange('title', e?.target?.value)}
          placeholder="Enter sound title"
          className="w-full bg-white/5 border-white/10 text-white"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Description
        </label>
        <textarea
          value={soundData?.description}
          onChange={(e) => onChange('description', e?.target?.value)}
          placeholder="Describe your sound..."
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Sound Type & Genre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Sound Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={soundData?.sound_type}
            onChange={(e) => onChange('sound_type', e?.target?.value)}
            className="w-full bg-white/5 border-white/10 text-white"
          >
            {soundTypes?.map((type) => (
              <option key={type?.value} value={type?.value}>
                {type?.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Genre <span className="text-red-500">*</span>
          </label>
          <Select
            value={soundData?.genre}
            onChange={(e) => onChange('genre', e?.target?.value)}
            className="w-full bg-white/5 border-white/10 text-white"
          >
            <option value="">Select genre</option>
            {genres?.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* BPM & Key */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            BPM
          </label>
          <Input
            type="number"
            value={soundData?.bpm}
            onChange={(e) => onChange('bpm', e?.target?.value)}
            placeholder="120"
            min="40"
            max="300"
            className="w-full bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Key Signature
          </label>
          <Select
            value={soundData?.key_signature}
            onChange={(e) => onChange('key_signature', e?.target?.value)}
            className="w-full bg-white/5 border-white/10 text-white"
          >
            <option value="">Select key</option>
            {keys?.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Mood Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Mood Tags
        </label>
        <Input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e?.target?.value)}
          onKeyDown={handleAddTag}
          placeholder="Type a mood and press Enter (e.g., dark, chill, energetic)"
          className="w-full bg-white/5 border-white/10 text-white"
        />
        {soundData?.mood_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {soundData?.mood_tags?.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(index)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Instrument Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Instruments
        </label>
        <Input
          type="text"
          value={instrumentInput}
          onChange={(e) => setInstrumentInput(e?.target?.value)}
          onKeyDown={handleAddInstrument}
          placeholder="Type an instrument and press Enter (e.g., 808, piano, guitar)"
          className="w-full bg-white/5 border-white/10 text-white"
        />
        {soundData?.instrument_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {soundData?.instrument_tags?.map((instrument, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm flex items-center gap-2"
              >
                {instrument}
                <button
                  onClick={() => handleRemoveInstrument(index)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Publish Status
        </label>
        <Select
          value={soundData?.status}
          onChange={(e) => onChange('status', e?.target?.value)}
          className="w-full bg-white/5 border-white/10 text-white"
        >
          <option value="published">Published (Visible to everyone)</option>
          <option value="draft">Draft (Only visible to you)</option>
        </Select>
      </div>
    </div>
  );
}