import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';


const GENERATORS = [
  {
    id: 'lyric-generator',
    title: 'Poetic Vernacular',
    description: 'AI lyric generation with style mixing & wordplay',
    icon: '🎤',
    color: 'purple',
    route: '/lyric-generator'
  },
  {
    id: 'beat-blueprint',
    title: 'Soulful MasterVerse',
    description: 'Chord progressions & music theory tools',
    icon: '🎵',
    color: 'indigo',
    route: '/lyric-generator'
  },
  {
    id: 'word-web',
    title: 'Concept Explorer',
    description: 'Interactive word associations & semantic mapping',
    icon: '🕸️',
    color: 'blue',
    path: '/concept-explorer'
  },
  {
    id: 'master-prompt',
    title: 'MASTER PROMPT Engine',
    description: 'Professional Suno.ai prompt generator with Grammy-level production',
    icon: '✨',
    color: 'cyan',
    route: '/master-prompt-engine'
  },
  {
    id: 'drum-generator',
    title: '808 Back Beat Boulevard',
    description: 'Create professional drum patterns & rhythms',
    icon: '🥁',
    color: 'orange',
    path: '/drum-generator'
  }
];

const GeneratorCard = () => {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">AI Generators</h2>
      </div>
      <div className="space-y-3">
        {GENERATORS?.map((generator) => (
          <button
            key={generator?.id}
            onClick={() => navigate(generator?.route)}
            className={`w-full text-left p-4 rounded-lg bg-gradient-to-br from-${generator?.color}-500/10 to-${generator?.color}-600/5 border border-${generator?.color}-500/20 hover:border-${generator?.color}-500/40 transition-all duration-300 group lift-hover`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{generator?.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {generator?.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {generator?.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GeneratorCard;