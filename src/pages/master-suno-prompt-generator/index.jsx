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



const MasterSunoPromptGenerator = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    genre: '',
    artistInfluence: '',
    mood: '',
    vocalCharacteristics: '',
    songConcept: '',
    tempo: '',
    songLength: ''
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
    { value: 'reggae', label: 'Reggae/Dancehall' }
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
    { value: 'dark', label: 'Dark' }
  ];

  const vocalOptions = [
    { value: 'smooth-silky', label: 'Smooth & Silky' },
    { value: 'gritty-raspy', label: 'Gritty & Raspy' },
    { value: 'airy-breathy', label: 'Airy & Breathy' },
    { value: 'powerful-belting', label: 'Powerful & Belting' },
    { value: 'melodic-autotune', label: 'Melodic with Autotune' },
    { value: 'spoken-rhythmic', label: 'Spoken/Rhythmic' },
    { value: 'falsetto-high', label: 'Falsetto/High Register' },
    { value: 'deep-bass', label: 'Deep Bass Voice' }
  ];

  const songLengthOptions = [
    { value: 'short', label: 'Short (2-2.5 min)' },
    { value: 'standard', label: 'Standard (3-3.5 min)' },
    { value: 'extended', label: 'Extended (4-5 min)' }
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
           formData?.vocalCharacteristics && formData?.songConcept;
  };

  const generateSunoPrompt = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields (Genre, Artist Influence, Mood, Vocal Characteristics, and Song Concept)');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const systemPrompt = `You are a Grammy-level music producer and Suno.ai prompt engineering expert. Generate a comprehensive, production-ready Suno.ai prompt based on the following user inputs:

**USER INPUTS:**
- Genre/Style: ${formData?.genre}
- Artist Influence: ${formData?.artistInfluence}
- Mood/Emotion: ${formData?.mood}
- Vocal Characteristics: ${formData?.vocalCharacteristics}
- Song Concept/Theme: ${formData?.songConcept}
${formData?.tempo ? `- Tempo: ${formData?.tempo} BPM` : ''}
${formData?.songLength ? `- Song Length: ${formData?.songLength}` : ''}

**GENERATE A COMPLETE SUNO.AI PROMPT WITH:**

1. **VOICE TAG SIGNATURE** (Comprehensive vocal design):
   - Vocal Tone: (Airy, Smooth, Gritty, Breathy, Deep, Crisp, Bright, Warm, Polished, Dry, Velvet-soft, Silky, Raspy)
   - Vocal Texture: (Layered, Harmonically rich, Whispered layers, Tight doubles, Saturated edges, Clean upper register, Grainy lows)
   - Vocal Style: (Soulful, Melismatic, Punchy pop phrasing, R&B glide, Hip-hop rhythmic flow, Spoken-word texture, Falsetto lift, Head-voice bloom)
   - Vocal Effects: (Plate reverb, Short slapback, Tape saturation, Stereo widener, Telephone EQ, Distorted grit, Subtle chorus, Parallel compression)
   - Pitch & Range: (Mid-range focus, Elevated chorus register, Controlled vibrato, Dynamic pitch rise, Half-step emotional lift, Descending relief lines)
   - Vocal Timing & Rhythm: (Behind-the-beat phrasing, Tight syncopation, Swinged cadence, Triplet flow, Laid-back verse timing, Aggressive on-grid rap)
   - Dynamics: (Soft intimate verse → lifted pre-chorus → zenith intensity chorus → yielding resolution outro)

2. **PRODUCTION NOTES**:
   - Drums: (style, rhythm pattern, swing, processing)
   - Bass: (type - 808/synth/live, pattern, sub frequencies)
   - Chord Progression: (specific chords with color and movement)
   - Instrumentation: (detailed list of instruments and their roles)
   - Soundscape: (pads, ambience, atmospheric elements, cinematic motion)

3. **SONG STRUCTURE TAGS** (Use these exact tags):
   - [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro]
   - [Ascending progression], [Atmospheric shift], [Build-up dynamics]
   - [Climactic theme], [Key shift cue], [Ominous uplift]
   - [Zenith intensity], [Yielding resolution]
   - [Guided imagery], [Lyrical foreshadowing], [Progressive storytelling]
   - [Yearning climax], [Varied repetition]

4. **LYRIC INTEGRATION** (Brief lyrical direction):
   - Lyrical theme and storytelling arc
   - Emotional progression through sections
   - Key phrases or hook concepts

5. **VISUAL/AESTHETIC DESCRIPTORS**:
   - Lighting mood (neon glow, film-grain softness, analogue warmth)
   - Camera perspective (close-up intimacy, stage-wide panorama)
   - Emotional color palette (cool blues, amber warmth, electric violet)

**FORMAT YOUR RESPONSE AS JSON:**
{
  "title": "Suggested song title",
  "voiceTagSignature": {
    "tone": "...",
    "texture": "...",
    "style": "...",
    "effects": "...",
    "pitchRange": "...",
    "timingRhythm": "...",
    "dynamics": "..."
  },
  "productionNotes": {
    "drums": "...",
    "bass": "...",
    "chordProgression": "...",
    "instrumentation": "...",
    "soundscape": "..."
  },
  "songStructure": "[Intro] ... [Verse] ... [Chorus] ...",
  "lyricDirection": "...",
  "visualAesthetic": "...",
  "completeSunoPrompt": "The final, copy-paste ready Suno.ai prompt combining all elements above in a natural, flowing format"
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
            temperature: 0.9
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
            { role: 'system', content: 'You are a Grammy-level music producer and Suno.ai prompt engineering expert.' },
            { role: 'user', content: systemPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.9,
          max_tokens: 3000
        });

        result = JSON.parse(openaiResult?.choices?.[0]?.message?.content);
      }

      setGeneratedPrompt({
        ...result,
        metadata: {
          genre: formData?.genre,
          artistInfluence: formData?.artistInfluence,
          mood: formData?.mood,
          vocalCharacteristics: formData?.vocalCharacteristics,
          songConcept: formData?.songConcept,
          tempo: formData?.tempo,
          songLength: formData?.songLength,
          timestamp: new Date()?.toISOString(),
          provider
        }
      });

    } catch (error) {
      console.error('Suno prompt generation error:', error);
      setError(error?.message || 'Failed to generate Suno prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      genre: '',
      artistInfluence: '',
      mood: '',
      vocalCharacteristics: '',
      songConcept: '',
      tempo: '',
      songLength: ''
    });
    setGeneratedPrompt(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation
        isAuthenticated={isAuthenticated}
        onAuthClick={() => navigate('/login')}
        onLogout={() => {
          localStorage.removeItem('isAuthenticated');
          setIsAuthenticated(false);
          navigate('/login');
        }}
      />
      <ToolContextBreadcrumb />
      <WorkspaceFloatingButton />
      
      <main className="main-content">
        <div className="content-container">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Icon name="Sparkles" size={32} className="text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  MASTER PROMPT Engine
                </h1>
                <p className="text-muted-foreground mt-1">
                  Professional Suno.ai Prompt Generator
                </p>
              </div>
            </div>
            <p className="text-foreground/80 max-w-3xl">
              Transform your creative vision into production-ready Suno.ai prompts. Combine your beats from <span className="text-orange-400 font-semibold">808 Back Beat Boulevard</span>, chord progressions from <span className="text-indigo-400 font-semibold">Soulful MasterVerse</span>, and lyrics from <span className="text-purple-400 font-semibold">Poetic Vernacular</span> into the final song structure.
            </p>
          </div>

          {/* Input Form */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Icon name="Settings" size={24} className="text-primary" />
              Input Parameters
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Genre / Style *"
                description="Choose the primary musical genre"
                options={genreOptions}
                value={formData?.genre}
                onChange={handleInputChange('genre')}
                placeholder="Select genre"
                searchable
                required
              />

              <Input
                label="Artist Influence *"
                description="e.g., 'Kendrick Lamar mixed with J. Cole'"
                name="artistInfluence"
                value={formData?.artistInfluence}
                onChange={handleTextInputChange}
                placeholder="Enter artist influences"
                required
              />

              <Select
                label="Mood / Emotion *"
                description="Primary emotional tone of the track"
                options={moodOptions}
                value={formData?.mood}
                onChange={handleInputChange('mood')}
                placeholder="Select mood"
                searchable
                required
              />

              <Select
                label="Vocal Characteristics *"
                description="Desired vocal style and texture"
                options={vocalOptions}
                value={formData?.vocalCharacteristics}
                onChange={handleInputChange('vocalCharacteristics')}
                placeholder="Select vocal style"
                searchable
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Song Concept / Theme *"
                  description="What's the song about? Main message or story"
                  name="songConcept"
                  value={formData?.songConcept}
                  onChange={handleTextInputChange}
                  placeholder="e.g., 'Overcoming struggle and finding inner strength'"
                  required
                />
              </div>

              <Input
                label="Tempo (BPM)"
                description="Optional: Desired beats per minute"
                name="tempo"
                type="number"
                value={formData?.tempo}
                onChange={handleTextInputChange}
                placeholder="e.g., 120"
                min="60"
                max="200"
              />

              <Select
                label="Song Length"
                description="Optional: Target song duration"
                options={songLengthOptions}
                value={formData?.songLength}
                onChange={handleInputChange('songLength')}
                placeholder="Select length"
              />
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-error/10 border border-error/30">
                <p className="text-error text-sm flex items-center gap-2">
                  <Icon name="AlertCircle" size={16} />
                  {error}
                </p>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button
                onClick={generateSunoPrompt}
                disabled={!isFormValid() || isGenerating}
                loading={isGenerating}
                iconName="Sparkles"
                iconPosition="left"
                size="lg"
                className="flex-1"
              >
                {isGenerating ? 'Generating Suno Prompt...' : 'Generate MASTER Prompt'}
              </Button>
              
              <Button
                onClick={handleClearForm}
                variant="outline"
                iconName="RotateCcw"
                iconPosition="left"
                size="lg"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Output Display */}
          {generatedPrompt && (
            <PromptOutputCard 
              prompt={generatedPrompt}
              onCopyToWorkspace={() => {
                localStorage.setItem('workspaceContent', generatedPrompt?.completeSunoPrompt);
                navigate('/writing-workspace');
              }}
            />
          )}

          {/* Workflow Guide */}
          <div className="glass-card p-6 mt-6">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Workflow" size={20} className="text-primary" />
              Complete Production Workflow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="text-2xl mb-2">🥁</div>
                <h4 className="font-semibold text-foreground mb-1">Step 1</h4>
                <p className="text-sm text-muted-foreground">Create beats in 808 Back Beat Boulevard</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                <div className="text-2xl mb-2">🎵</div>
                <h4 className="font-semibold text-foreground mb-1">Step 2</h4>
                <p className="text-sm text-muted-foreground">Generate chords in Soulful MasterVerse</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="text-2xl mb-2">🎤</div>
                <h4 className="font-semibold text-foreground mb-1">Step 3</h4>
                <p className="text-sm text-muted-foreground">Write lyrics in Poetic Vernacular</p>
              </div>
              <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <div className="text-2xl mb-2">✨</div>
                <h4 className="font-semibold text-foreground mb-1">Step 4</h4>
                <p className="text-sm text-muted-foreground">Generate MASTER Prompt here</p>
              </div>
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <div className="text-2xl mb-2">🎧</div>
                <h4 className="font-semibold text-foreground mb-1">Step 5</h4>
                <p className="text-sm text-muted-foreground">Export to Suno.ai for final song</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MasterSunoPromptGenerator;