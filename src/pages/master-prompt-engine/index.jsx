import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import ToolContextBreadcrumb from '../../components/navigation/ToolContextBreadcrumb';
import WorkspaceFloatingButton from '../../components/navigation/WorkspaceFloatingButton';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PromptOutputCard from './components/PromptOutputCard';
import genAI from '../../services/geminiClient';
import openai from '../../services/openaiClient';

const MasterPromptEngine = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    genre: '',
    artistInfluence: '',
    mood: '',
    vocalStyle: '',
    songTheme: '',
    tempo: '',
    visualAesthetic: ''
  });

  const genreOptions = [
    { value: 'hip-hop', label: 'Hip-Hop/Rap' },
    { value: 'rnb', label: 'R&B/Soul' },
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock/Alternative' },
    { value: 'country', label: 'Country' },
    { value: 'electronic', label: 'Electronic/EDM' },
    { value: 'jazz', label: 'Jazz/Blues' },
    { value: 'folk', label: 'Folk/Acoustic' },
    { value: 'trap', label: 'Trap' },
    { value: 'drill', label: 'Drill' },
    { value: 'afrobeat', label: 'Afrobeat' },
    { value: 'reggae', label: 'Reggae/Dancehall' },
    { value: 'gospel', label: 'Gospel' },
    { value: 'indie', label: 'Indie' }
  ];

  const moodOptions = [
    { value: 'aggressive', label: 'Aggressive' },
    { value: 'melancholic', label: 'Melancholic' },
    { value: 'uplifting', label: 'Uplifting' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'mysterious', label: 'Mysterious' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'introspective', label: 'Introspective' },
    { value: 'triumphant', label: 'Triumphant' },
    { value: 'nostalgic', label: 'Nostalgic' },
    { value: 'dark', label: 'Dark' },
    { value: 'euphoric', label: 'Euphoric' },
    { value: 'yearning', label: 'Yearning' }
  ];

  const vocalStyleOptions = [
    { value: 'airy', label: 'Airy' },
    { value: 'breathy', label: 'Breathy' },
    { value: 'smooth', label: 'Smooth' },
    { value: 'gritty', label: 'Gritty' },
    { value: 'deep', label: 'Deep' },
    { value: 'crisp', label: 'Crisp' },
    { value: 'bright', label: 'Bright' },
    { value: 'warm', label: 'Warm' },
    { value: 'velvet-soft', label: 'Velvet-soft' },
    { value: 'polished', label: 'Polished' },
    { value: 'raspy', label: 'Raspy' },
    { value: 'soulful', label: 'Soulful' },
    { value: 'melodic', label: 'Melodic' },
    { value: 'powerful', label: 'Powerful' }
  ];

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleInputChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleTextInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const isFormValid = () => {
    return formData?.genre && formData?.artistInfluence && formData?.mood && 
           formData?.vocalStyle && formData?.songTheme;
  };

  const generateMasterPrompt = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields: Genre, Artist Influence, Mood, Vocal Style, and Song Theme');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const systemPrompt = `You are a Grammy-winning music producer with expertise in vocal design, soundscapes, artist identity, and production aesthetics. You specialize in creating professional Suno.ai prompts.

**USER INPUT:**
- Genre/Style/Influences: ${formData?.genre}
- Artist Influence: ${formData?.artistInfluence}
- Mood & Emotion: ${formData?.mood}
- Vocal Style & Desired Voice Type: ${formData?.vocalStyle}
- Song Theme/Story: ${formData?.songTheme}
${formData?.tempo ? `- Tempo/BPM: ${formData?.tempo}` : ''}
${formData?.visualAesthetic ? `- Visual/Aesthetic Mood: ${formData?.visualAesthetic}` : ''}

**GENERATE A COMPLETE SUNO.AI PRODUCTION PROMPT WITH:**

🎶 **SUNO.AI PRODUCTION PROMPT**
Create a fully produced track in the style of {genre + influences}, expressing a mood of {emotion}, built around the theme: "{song theme}."

🎤 **VOICE TAG SIGNATURE** - Design the lead vocal using ALL these categories:

**Vocal Tone Tags:**
Choose from: Airy, Breathy, Smooth, Gritty, Deep, Crisp, Bright, Warm, Velvet-soft, Polished, Raspy

**Vocal Texture Tags:**
Choose from: Layered, Whispered layers, Harmonic richness, Tight doubles, Saturated edges, Clean highs, Grainy lows

**Vocal Style Tags:**
Choose from: Soulful, Melismatic, Punchy pop phrasing, R&B glide, Trap melodic cadence, Rap flow, Falsetto lift, Spoken texture

**Vocal Effects Tags:**
Choose from: Plate reverb, Short slapback, Tape saturation, Stereo widener, Subtle chorus, Telephone EQ, Distorted grit, Parallel compression

**Pitch & Range Manipulation Tags:**
Choose from: Mid-range focus, High-register lift, Controlled vibrato, Half-step modulation, Dynamic climbs, Descending release lines

**Vocal Timing & Rhythm Tags:**
Choose from: Behind-the-beat, On-grid precision, Triplet flow, Swing phrasing, Laid-back cadence, Aggressive syncopation

**Dynamics & Volume Tags:**
Describe progression: Soft intimate verse → swelling pre-chorus → zenith intensity chorus → yielding resolution outro

🎹 **INSTRUMENTATION & PRODUCTION**

**Drums:**
Describe drum pattern, swing, groove, era, processing

**Bass:**
Specify 808/sub/synth/live + movement

**Chord Progression:**
Choose movement + color: major lift, minor tension, modal mixture, circle of fifths, jazz extensions

**Instrumentation Layers:**
List: keys, synths, guitars, strings, brass, pads, plucks, effects

**Soundscape:**
Describe: reverb style, ambience, noise textures, cinematic motion

🏗️ **SONG STRUCTURE & TAGS**
Incorporate structure tags such as:
- [Ascending progression]
- [Atmospheric shift]
- [Build-up dynamics]
- [Climactic theme]
- [Key shift cue]
- [Rhythmic build-up]
- [Ominous uplift]
- [Zenith intensity]
- [Yielding resolution]
- [Guided imagery]
- [Progressive storytelling]
- [Lyrical foreshadowing]
- [Varied repetition]
- [Yearning climax]

📝 **LYRICS (Generate Fully)**
Write full original lyrics in the style of {genre + influence}.
Use emotional authenticity matched to vocal tone and production.
Lyrics must fit the rhythm and phrasing described in vocal tags.

🎨 **VISUAL ATMOSPHERE**
Describe visuals in terms of:
- Lighting (violet, blue, cyan, film-grain, warm tungsten, cold moonlight)
- Color palette (violet haze, amber glow, deep blue)
- Camera feel (close-up intimacy, wide cinematic horizon)

**FORMAT YOUR RESPONSE AS JSON:**
{
  "title": "Suggested song title",
  "productionPrompt": "Complete production description",
  "voiceTagSignature": {
    "vocalTone": "...",
    "vocalTexture": "...",
    "vocalStyle": "...",
    "vocalEffects": "...",
    "pitchRange": "...",
    "timingRhythm": "...",
    "dynamics": "..."
  },
  "instrumentation": {
    "drums": "...",
    "bass": "...",
    "chordProgression": "...",
    "instrumentationLayers": "...",
    "soundscape": "..."
  },
  "songStructure": "Complete structure with tags like [Intro] [Verse] [Chorus] etc.",
  "lyrics": "Full original lyrics with verse, chorus, bridge sections",
  "visualAtmosphere": "Complete visual description",
  "completeSunoPrompt": "The final, copy-paste ready Suno.ai prompt combining ALL elements above in a single cohesive block with no explanation — fully formatted for immediate copy/paste into Suno.ai"
}`;

      let result;
      let provider = 'gemini';

      // Try Gemini first
      try {
        if (!genAI) {
          throw new Error('Gemini not configured');
        }

        const model = genAI?.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const geminiResult = await model?.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: systemPrompt }]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.9,
            maxOutputTokens: 8000
          }
        });

        const response = await geminiResult?.response;
        const text = response?.text();
        result = JSON.parse(text);
      } catch (geminiError) {
        console.warn('Gemini failed, falling back to OpenAI:', geminiError);
        
        // Fallback to OpenAI
        if (!openai) {
          throw new Error('Both AI services are unavailable. Please check your API keys.');
        }

        provider = 'openai';
        const openaiResult = await openai?.chat?.completions?.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a Grammy-winning music producer and Suno.ai prompt engineering expert.' },
            { role: 'user', content: systemPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.9,
          max_tokens: 8000
        });

        result = JSON.parse(openaiResult?.choices?.[0]?.message?.content);
      }

      setGeneratedPrompt({
        ...result,
        metadata: {
          genre: formData?.genre,
          artistInfluence: formData?.artistInfluence,
          mood: formData?.mood,
          vocalStyle: formData?.vocalStyle,
          songTheme: formData?.songTheme,
          tempo: formData?.tempo,
          visualAesthetic: formData?.visualAesthetic,
          timestamp: new Date()?.toISOString(),
          provider
        }
      });

    } catch (error) {
      console.error('MASTER PROMPT generation error:', error);
      setError(error?.message || 'Failed to generate Suno prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add these handler functions
  const handleAuthClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation 
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
      />
      <ToolContextBreadcrumb
        items={[
          { label: 'Creative Dashboard', path: '/creative-dashboard' },
          { label: 'MASTER PROMPT Engine', path: '/master-prompt-engine' }
        ]}
      />
      <WorkspaceFloatingButton />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon name="Sparkles" size={40} className="text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MASTER PROMPT Engine
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Professional Suno.ai prompt generator with Grammy-level production design.
            Transform your creative inputs into complete, production-ready Suno prompts.
          </p>
        </div>

        {/* Workflow Guide */}
        <div className="glass-card p-6 mb-8 border-2 border-cyan-500/30">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Workflow" size={24} className="text-cyan-400" />
            Complete Production Workflow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <span className="text-3xl mb-2">🥁</span>
              <p className="text-sm font-semibold text-foreground">1. 808 Back Beat Boulevard</p>
              <p className="text-xs text-muted-foreground mt-1">Create drum patterns</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <span className="text-3xl mb-2">🎵</span>
              <p className="text-sm font-semibold text-foreground">2. Soulful MasterVerse</p>
              <p className="text-xs text-muted-foreground mt-1">Generate chord progressions</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <span className="text-3xl mb-2">🎤</span>
              <p className="text-sm font-semibold text-foreground">3. Poetic Vernacular</p>
              <p className="text-xs text-muted-foreground mt-1">Write lyrics</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-3xl mb-2">✨</span>
              <p className="text-sm font-semibold text-foreground">4. MASTER PROMPT Engine</p>
              <p className="text-xs text-muted-foreground mt-1">Final Suno prompt</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <span className="text-3xl mb-2">🎧</span>
              <p className="text-sm font-semibold text-foreground">5. Suno.ai</p>
              <p className="text-xs text-muted-foreground mt-1">Generate final song</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Icon name="Settings" size={24} className="text-primary" />
                User Input
              </h2>

              {/* Genre/Style/Influences */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  1. Genre / Style / Influences <span className="text-red-500">*</span>
                </label>
                <Select
                  options={genreOptions}
                  value={formData?.genre}
                  onChange={handleInputChange('genre')}
                  placeholder="Select genre..."
                />
              </div>

              {/* Artist Influence */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  2. Artist Influence <span className="text-red-500">*</span>
                </label>
                <Input
                  name="artistInfluence"
                  value={formData?.artistInfluence}
                  onChange={handleTextInputChange}
                  placeholder="e.g., Drake, The Weeknd, Travis Scott"
                />
              </div>

              {/* Mood & Emotion */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  3. Mood & Emotion <span className="text-red-500">*</span>
                </label>
                <Select
                  options={moodOptions}
                  value={formData?.mood}
                  onChange={handleInputChange('mood')}
                  placeholder="Select mood..."
                />
              </div>

              {/* Vocal Style */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  4. Vocal Style & Desired Voice Type <span className="text-red-500">*</span>
                </label>
                <Select
                  options={vocalStyleOptions}
                  value={formData?.vocalStyle}
                  onChange={handleInputChange('vocalStyle')}
                  placeholder="Select vocal style..."
                />
              </div>

              {/* Song Theme/Story */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  5. Song Theme / Story <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="songTheme"
                  value={formData?.songTheme}
                  onChange={handleTextInputChange}
                  placeholder="Describe the theme, story, or message of your song..."
                  rows={4}
                  className="w-full px-4 py-3 bg-muted/30 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Tempo (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  6. Tempo or BPM (optional)
                </label>
                <Input
                  name="tempo"
                  value={formData?.tempo}
                  onChange={handleTextInputChange}
                  placeholder="e.g., 120 BPM, Slow, Medium, Fast"
                />
              </div>

              {/* Visual/Aesthetic Mood (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  7. Visual / Aesthetic Mood (optional)
                </label>
                <Input
                  name="visualAesthetic"
                  value={formData?.visualAesthetic}
                  onChange={handleTextInputChange}
                  placeholder="e.g., Neon city lights, Vintage film grain, Dark moody atmosphere"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <Icon name="AlertCircle" size={16} />
                    {error}
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={generateMasterPrompt}
                disabled={isGenerating || !isFormValid()}
                className="w-full"
                iconName={isGenerating ? 'Loader' : 'Sparkles'}
                iconPosition="left"
              >
                {isGenerating ? 'Generating Master Prompt...' : 'Generate Suno.ai Prompt'}
              </Button>
            </div>
          </div>

          {/* Output Display */}
          <div>
            {generatedPrompt ? (
              <PromptOutputCard prompt={generatedPrompt} />
            ) : (
              <div className="glass-card p-12 text-center">
                <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  No Prompt Generated Yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fill in the form and click "Generate Suno.ai Prompt" to create your professional music production prompt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterPromptEngine;