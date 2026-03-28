import React, { useState } from 'react';
import { Play, StopCircle, Zap } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ARTIST_STYLES = [
  'Kendrick Lamar mixed with Ludacris',
  'Jay Z mixed with Rich Tha Factor',
  'E-40 mixed with Yo Gotti',
  'J. Cole mixed with Lil Wayne',
  'Drake mixed with Future',
  'Custom (describe below)'
];

const GENRES = [
  'Trap', 'Drill', 'Boom Bap', 'G-Funk', 'Neo-Soul', 
  'R&B', 'Melodic Rap', 'Bay Area', 'Southern Hip-Hop', 'East Coast'
];

const TONES = [
  'Aggressive', 'Introspective', 'Hype', 'Melancholic', 'Romantic',
  'Confident', 'Raw', 'Conscious', 'Party', 'Street'
];

const SECTIONS = [
  { value: 'verse', label: 'Verse' },
  { value: 'hook', label: 'Hook/Chorus' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'full song', label: 'Full Song' }
];

// Convert arrays to options format for Select component
const GENRE_OPTIONS = GENRES?.map(genre => ({ value: genre, label: genre }));
const TONE_OPTIONS = TONES?.map(tone => ({ value: tone, label: tone }));
const ARTIST_STYLE_OPTIONS = ARTIST_STYLES?.map(style => ({ value: style, label: style }));

export default function GenerationForm({ onGenerate, onStreamGenerate, isProcessing, onCancel }) {
  const [formData, setFormData] = useState({
    genre: '',
    subject: '',
    tone: '',
    artistStyles: '',
    customStyle: '',
    section: 'verse',
    bars: '16',
    streamMode: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle Select component changes (receives value directly, not event)
  const handleSelectChange = (name) => (value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    const artistStyle = formData?.artistStyles === 'Custom (describe below)' 
      ? formData?.customStyle 
      : formData?.artistStyles;

    const params = {
      genre: formData?.genre,
      subject: formData?.subject,
      tone: formData?.tone,
      artistStyles: artistStyle,
      section: formData?.section,
      bars: parseInt(formData?.bars)
    };

    if (formData?.streamMode) {
      onStreamGenerate(params);
    } else {
      onGenerate(params);
    }
  };

  const isFormValid = formData?.genre && formData?.subject && formData?.tone && 
    (formData?.artistStyles !== 'Custom (describe below)' || formData?.customStyle);

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Zap className="w-6 h-6 text-purple-400" />
        Generation Settings
      </h2>
      {/* Genre */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Genre
        </label>
        <Select
          name="genre"
          value={formData?.genre}
          onChange={handleSelectChange('genre')}
          options={GENRE_OPTIONS}
          placeholder="Select Genre"
          required
        />
      </div>
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Subject/Theme
        </label>
        <Input
          type="text"
          name="subject"
          value={formData?.subject}
          onChange={handleChange}
          placeholder="What's the song about? (e.g., overcoming struggle, street life, love)"
          required
        />
      </div>
      {/* Tone */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tone/Mood
        </label>
        <Select
          name="tone"
          value={formData?.tone}
          onChange={handleSelectChange('tone')}
          options={TONE_OPTIONS}
          placeholder="Select Tone"
          required
        />
      </div>
      {/* Artist Style */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Artist Style Mix
        </label>
        <Select
          name="artistStyles"
          value={formData?.artistStyles}
          onChange={handleSelectChange('artistStyles')}
          options={ARTIST_STYLE_OPTIONS}
          placeholder="Select Style Mix"
          required
        />
      </div>
      {/* Custom Style Input */}
      {formData?.artistStyles === 'Custom (describe below)' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Describe Custom Style
          </label>
          <Input
            type="text"
            name="customStyle"
            value={formData?.customStyle}
            onChange={handleChange}
            placeholder="e.g., Nas mixed with MF DOOM"
            required
          />
        </div>
      )}
      {/* Section & Bars */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Section
          </label>
          <Select
            name="section"
            value={formData?.section}
            onChange={handleSelectChange('section')}
            options={SECTIONS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bars
          </label>
          <Input
            type="number"
            name="bars"
            value={formData?.bars}
            onChange={handleChange}
            min="4"
            max="64"
          />
        </div>
      </div>
      {/* Stream Mode Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="streamMode"
          name="streamMode"
          checked={formData?.streamMode}
          onChange={handleChange}
          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
        />
        <label htmlFor="streamMode" className="text-sm text-gray-300">
          Enable streaming mode (see lyrics as they're generated)
        </label>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={!isFormValid || isProcessing}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5 mr-2" />
          {isProcessing ? 'Generating...' : 'Generate Lyrics'}
        </Button>

        {isProcessing && (
          <Button
            type="button"
            onClick={onCancel}
            className="bg-red-600 hover:bg-red-700"
          >
            <StopCircle className="w-5 h-5 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}