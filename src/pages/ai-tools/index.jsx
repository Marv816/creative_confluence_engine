import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Button from '../../components/ui/Button';
import { motion } from "framer-motion";
import { Sparkles, Mic2, ImagePlay, Piano, ArrowRight, ExternalLink, Wand2 } from "lucide-react";

const aiTools = [
  {
    id: "lyric-assistant",
    name: "Poetic Vernacular",
    description: "AI-powered lyric generation and wordplay companion. Craft compelling lyrics with rhyme schemes, slang, and creative inspiration for your next hit.",
    icon: Mic2,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    features: ["Rhyme suggestions", "Lyric generation", "Wordplay & slang", "Style blending"],
    link: "/creative-dashboard",
    status: "available"
  },
  {
    id: "album-cover-generator",
    name: "Vernacular District",
    description: "Master vocabulary, slang, and cultural language. Transform classic quotes into modern vernacular and explore linguistic creativity.",
    icon: ImagePlay,
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    features: ["Slang translator", "Quote remixer", "Cultural context", "Vocabulary builder"],
    link: "#",
    status: "available"
  },
  {
    id: "music-theory",
    name: "Soulful MasterVerse",
    description: "Master music theory and generate chord progressions that work. Perfect for producers and songwriters looking to elevate their compositions.",
    icon: Piano,
    color: "from-orange-500 to-yellow-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    features: ["Chord progression generator", "Scale finder", "Key detection", "Theory lessons"],
    link: "#",
    status: "available"
  }
];

export default function AIToolsPage() {
  return (
    <div className="min-h-screen bg-black" data-testid="ai-tools-page">
      <Header />
      <main className="pt-24 lg:pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-300 uppercase tracking-wider font-medium">Powered by AI</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6" data-testid="ai-tools-title">
              BlackTop <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">AI Districts</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Navigate the streets of creativity with BlackTop Entertainment's AI-powered districts. From beats to lyrics to theory—your creative boulevard awaits.
            </p>
          </motion.div>

          {/* Tools Grid */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-20" data-testid="tools-grid">
            {aiTools?.map((tool, idx) => (
              <motion.div
                key={tool?.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`relative group ${tool?.bgColor} border ${tool?.borderColor} rounded-sm p-6 lg:p-8 hover:border-white/20 transition-all duration-300`}
                data-testid={`tool-${tool?.id}`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-sm bg-gradient-to-br ${tool?.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">{tool?.name}</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{tool?.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {tool?.features?.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Wand2 className="h-3 w-3 text-purple-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to={tool?.link}>
                  <Button className={`w-full bg-gradient-to-r ${tool?.color} text-white hover:opacity-90 font-bold`} data-testid={`launch-${tool?.id}`}>
                    Launch Tool
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 text-xs uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">
                    {tool?.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-sm p-8 lg:p-12 text-center"
          >
            <Sparkles className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">808 Back Beat Boulevard Coming Soon</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              The drum and beat generation district is under construction. Get ready for AI-powered rhythm creation!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400">
                🥁 Drum Pattern Generator
              </span>
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400">
                🎹 808 Beat Maker
              </span>
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400">
                🎧 Rhythm Architect
              </span>
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400">
                📊 BPM Optimizer
              </span>
            </div>
          </motion.div>

          {/* Integration CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm mb-4">All tools integrate seamlessly with your BlackTop account</p>
            <Link to="/login">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Create Free Account <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}