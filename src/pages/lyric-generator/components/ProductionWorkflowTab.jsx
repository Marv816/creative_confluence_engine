import React from 'react';
import { Rocket, Music, Palette, CheckCircle } from 'lucide-react';

export default function ProductionWorkflowTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          🚀 The 4-Step Production Workflow
        </h2>

        {/* Step 1 */}
        <div className="mb-6 pl-4 border-l-4 border-purple-500 bg-gray-900/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">1️⃣</span>
            <h3 className="text-2xl font-bold text-purple-300">CONNECT (Discovery)</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Understand your sound, audience, and goals in a comprehensive discovery session.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>Define your sonic identity</li>
            <li>Target audience research</li>
            <li>Project goals & timeline</li>
            <li>Inspiration & reference tracks</li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="mb-6 pl-4 border-l-4 border-pink-500 bg-gray-900/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">2️⃣</span>
            <h3 className="text-2xl font-bold text-pink-300">CREATE (Hybrid Production)</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Co-produce your AI track using top-tier AI tools and human expertise.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>AI generation (Suno, Udio, Tunee)</li>
            <li>Prompt engineering & refinement</li>
            <li>Human arrangement & oversight</li>
            <li>Hybrid DAW layering</li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="mb-6 pl-4 border-l-4 border-orange-500 bg-gray-900/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">3️⃣</span>
            <h3 className="text-2xl font-bold text-orange-300">CRAFT (Mix & Master)</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Integrate live instruments, finalize mixing, and achieve world-class mastering.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>Live instrument integration</li>
            <li>Hybrid mixing (analog + AI precision)</li>
            <li>World-class mastering</li>
            <li>Vocal alignment & tuning</li>
          </ul>
        </div>

        {/* Step 4 */}
        <div className="mb-6 pl-4 border-l-4 border-cyan-500 bg-gray-900/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">4️⃣</span>
            <h3 className="text-2xl font-bold text-cyan-300">COMPLETE (Release & Distribution)</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Final polish, guidance on registration, and distribution readiness.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>Copyright registration (BMI, ASCAP, SOCAN)</li>
            <li>Publishing setup</li>
            <li>Distribution platform uploads</li>
            <li>Release strategy & promotion</li>
          </ul>
        </div>
      </div>

      {/* Core Services */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-2xl font-semibold mb-6 text-indigo-300">Core Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-5 h-5 text-purple-400" />
              <h4 className="text-lg font-bold text-purple-300">AI-Enhanced Production</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Full track creation using Suno, Udio, Tunee, and hybrid DAW layering for warmth and realism.
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-pink-400" />
              <h4 className="text-lg font-bold text-pink-300">Mixing & Mastering Excellence</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Hybrid mastering combining analog warmth with AI precision. World-class vocal alignment & compression.
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-5 h-5 text-orange-400" />
              <h4 className="text-lg font-bold text-orange-300">Creative Direction & Prompting</h4>
            </div>
            <p className="text-gray-300 text-sm">
              One-on-one sessions to develop concepts, structure, sonic identity, and prompt engineering for AI generation.
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              <h4 className="text-lg font-bold text-cyan-300">Song Enhancement & Publishing</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Rewriting, vocal integration, live instrumentation, and guidance on copyright registration & publishing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
