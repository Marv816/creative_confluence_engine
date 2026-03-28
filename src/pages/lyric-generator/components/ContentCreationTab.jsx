import React, { useState } from 'react';
import { Sparkles, Palette, Lightbulb, Dumbbell } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { generateRemixes, generateMoodKit, generateLyricalPrompts, generateTrainingChallenge } from '../../../services/musicTheoryService';

const TRAINER_SKILLS = [
  { value: 'metaphor', label: 'Practice Metaphors' },
  { value: 'simile', label: 'Practice Similes' },
  { value: 'rhyming_couplet', label: 'Practice Rhyming Couplets' }
];

export default function ContentCreationTab({ onCopyToNotepad, onShowFeedback }) {
  const [remixInput, setRemixInput] = useState('');
  const [moodInput, setMoodInput] = useState('');
  const [promptTheme, setPromptTheme] = useState('');
  const [trainerSkill, setTrainerSkill] = useState('metaphor');
  const [trainerSubject, setTrainerSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [currentTool, setCurrentTool] = useState(null);

  const handleRemix = async () => {
    if (!remixInput?.trim()) {
      onShowFeedback?.('Please enter a quote to remix', 'error');
      return;
    }

    setIsLoading(true);
    setCurrentTool('remix');
    try {
      const data = await generateRemixes(remixInput);
      setResults(data);
      onShowFeedback?.('Remixes generated!', 'success');
    } catch (error) {
      onShowFeedback?.(error?.message || 'Failed to generate remixes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodKit = async () => {
    if (!moodInput?.trim()) {
      onShowFeedback?.('Please describe a mood or theme', 'error');
      return;
    }

    setIsLoading(true);
    setCurrentTool('mood');
    try {
      const data = await generateMoodKit(moodInput);
      setResults(data);
      onShowFeedback?.('Mood kit generated!', 'success');
    } catch (error) {
      onShowFeedback?.(error?.message || 'Failed to generate mood kit', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrompts = async () => {
    if (!promptTheme?.trim()) {
      onShowFeedback?.('Please enter a theme', 'error');
      return;
    }

    setIsLoading(true);
    setCurrentTool('prompts');
    try {
      const data = await generateLyricalPrompts(promptTheme);
      setResults(data);
      onShowFeedback?.('Prompts generated!', 'success');
    } catch (error) {
      onShowFeedback?.(error?.message || 'Failed to generate prompts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraining = async () => {
    if (!trainerSubject?.trim()) {
      onShowFeedback?.('Please enter a subject', 'error');
      return;
    }

    setIsLoading(true);
    setCurrentTool('training');
    try {
      const challenge = await generateTrainingChallenge(trainerSkill, trainerSubject);
      setResults({ challenge, skill: trainerSkill, subject: trainerSubject });
      onShowFeedback?.('Challenge generated!', 'success');
    } catch (error) {
      onShowFeedback?.(error?.message || 'Failed to generate challenge', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    if (currentTool === 'remix') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results?.remixes?.map((remix, idx) => (
            <div key={idx} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-sm font-semibold text-purple-300 mb-2">{remix?.style}</h4>
              <p className="text-gray-200 text-sm mb-3">{remix?.interpretation}</p>
              <Button
                size="xs"
                onClick={() => onCopyToNotepad?.(remix?.interpretation)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Copy to Notepad
              </Button>
            </div>
          ))}
        </div>
      );
    }

    if (currentTool === 'mood') {
      return (
        <div className="space-y-4">
          {results?.stage_names?.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-sm font-semibold text-purple-300 mb-3">Stage Names</h4>
              <div className="flex flex-wrap gap-2">
                {results?.stage_names?.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => onCopyToNotepad?.(name)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm px-3 py-1 rounded-full transition"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {results?.song_titles?.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-sm font-semibold text-purple-300 mb-3">Song Titles</h4>
              <div className="flex flex-wrap gap-2">
                {results?.song_titles?.map((title, idx) => (
                  <button
                    key={idx}
                    onClick={() => onCopyToNotepad?.(title)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm px-3 py-1 rounded-full transition"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}
          {results?.color_palette?.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-sm font-semibold text-purple-300 mb-3">Color Palette</h4>
              <div className="flex flex-wrap gap-3">
                {results?.color_palette?.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-600"
                      style={{ backgroundColor: color?.hex }}
                    />
                    <span className="text-sm text-gray-300">{color?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (currentTool === 'prompts') {
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <h4 className="text-sm font-semibold text-purple-300 mb-3">Lyrical Prompts</h4>
          <div className="space-y-2">
            {results?.prompts?.map((prompt, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-purple-400 font-semibold">{idx + 1}.</span>
                <p className="text-gray-200 text-sm flex-1">{prompt}</p>
                <Button
                  size="xs"
                  onClick={() => onCopyToNotepad?.(prompt)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentTool === 'training') {
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <h4 className="text-sm font-semibold text-cyan-300 mb-3">Wordplay Challenge</h4>
          <div className="prose prose-invert max-w-none mb-4">
            <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {results?.challenge}
            </pre>
          </div>
          <Button
            onClick={() => onCopyToNotepad?.(results?.challenge)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            Copy Challenge to Notepad
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Lingo Remixer */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Lingo Remixer</h3>
        </div>
        <p className="text-sm text-gray-400 mb-3">Flip a quote into different styles.</p>
        <div className="flex gap-3">
          <Input
            type="text"
            value={remixInput}
            onChange={(e) => setRemixInput(e?.target?.value)}
            placeholder="e.g., 'Time heals all wounds.'"
            className="flex-1"
          />
          <Button
            onClick={handleRemix}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading && currentTool === 'remix' ? 'Remixing...' : 'Remix'}
          </Button>
        </div>
      </div>

      {/* Mood & Vibe Generator */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-teal-400" />
          <h3 className="text-xl font-bold text-white">Mood & Vibe Generator</h3>
        </div>
        <p className="text-sm text-gray-400 mb-3">Generate names, colors, and imagery.</p>
        <div className="flex gap-3">
          <Input
            type="text"
            value={moodInput}
            onChange={(e) => setMoodInput(e?.target?.value)}
            placeholder="e.g., 'late-night drive in neon city'"
            className="flex-1"
          />
          <Button
            onClick={handleMoodKit}
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isLoading && currentTool === 'mood' ? 'Generating...' : 'Inspire'}
          </Button>
        </div>
      </div>

      {/* Lyrical Prompt Machine */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-rose-400" />
          <h3 className="text-xl font-bold text-white">Lyrical Prompt Machine</h3>
        </div>
        <p className="text-sm text-gray-400 mb-3">Get writing prompts based on a theme.</p>
        <div className="flex gap-3">
          <Input
            type="text"
            value={promptTheme}
            onChange={(e) => setPromptTheme(e?.target?.value)}
            placeholder="e.g., 'resilience', 'city life'"
            className="flex-1"
          />
          <Button
            onClick={handlePrompts}
            disabled={isLoading}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {isLoading && currentTool === 'prompts' ? 'Generating...' : 'Get Prompts'}
          </Button>
        </div>
      </div>

      {/* Wordplay Trainer */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Wordplay Trainer</h3>
        </div>
        <p className="text-sm text-gray-400 mb-3">Interactive writing challenges.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Select
            value={trainerSkill}
            onChange={setTrainerSkill}
            options={TRAINER_SKILLS}
          />
          <Input
            type="text"
            value={trainerSubject}
            onChange={(e) => setTrainerSubject(e?.target?.value)}
            placeholder="e.g., 'city rain'"
          />
        </div>
        <Button
          onClick={handleTraining}
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700"
        >
          {isLoading && currentTool === 'training' ? 'Generating...' : 'Start Training'}
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gray-900/50 rounded-xl p-6">
          {renderResults()}
        </div>
      )}
    </div>
  );
}
