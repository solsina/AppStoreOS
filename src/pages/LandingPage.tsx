import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Radar, Zap, Rocket, ShieldCheck, TrendingUp, Smartphone, Code, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [topApps, setTopApps] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);

  useEffect(() => {
    const fetchTopApps = async () => {
      try {
        const res = await fetch('https://itunes.apple.com/us/rss/topfreeapplications/limit=6/json');
        const data = await res.json();
        const entries = data.feed.entry || [];
        
        const parsedApps = entries.map((e: any) => ({
          id: e.id.attributes['im:id'],
          name: e['im:name'].label,
          icon: e['im:image'][2].label,
          category: e.category.attributes.label,
          summary: e.summary ? e.summary.label : ''
        }));
        
        setTopApps(parsedApps);
      } catch (error) {
        console.error("Erreur RSS:", error);
      } finally {
        setIsLoadingApps(false);
      }
    };

    fetchTopApps();
  }, []);

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      {/* Header Minimaliste */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl tracking-tight leading-none text-white">AppStoreOS</span>
          </div>
          <button 
            onClick={handleCTA}
            className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all flex items-center gap-2"
          >
            {user ? 'Mon Dashboard' : 'Connexion'} <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8"
          >
            <Sparkles size={16} />
            <span>La première Supply Chain pour Indie Hackers</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8"
          >
            Trouvez. Codez.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
              Monétisez.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            AppStoreOS est le système d'exploitation ultime pour les développeurs mobiles. De la recherche de niche à la génération de code, tout est propulsé par l'IA.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={handleCTA}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              Démarrer gratuitement <ArrowRight size={20} />
            </button>
            <p className="text-sm text-gray-500 font-medium">50 crédits offerts à l'inscription</p>
          </motion.div>
        </div>
      </section>

      {/* Live App Store Trends (API Integration) */}
      <section className="py-20 px-6 bg-[#0A0A0C] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="text-emerald-400" /> Top Apps en direct (US)
              </h2>
              <p className="text-gray-400">Analysez ce qui marche en ce moment sur l'App Store via l'API Apple.</p>
            </div>
            <button onClick={() => navigate('/radar')} className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 text-sm">
              Ouvrir le Radar complet <ArrowRight size={16} />
            </button>
          </div>

          {isLoadingApps ? (
            <div className="flex justify-center py-12">
              <span className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topApps.map((app, idx) => (
                <div key={app.id} className="bg-[#141418] border border-white/5 rounded-2xl p-6 flex gap-4 hover:border-white/10 transition-colors group">
                  <span className="text-2xl font-black text-white/10 group-hover:text-white/20 transition-colors">#{idx + 1}</span>
                  <img src={app.icon} alt={app.name} className="w-16 h-16 rounded-xl shadow-md" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="font-bold text-white line-clamp-1">{app.name}</h3>
                    <p className="text-xs text-indigo-400 font-medium mb-2">{app.category}</p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Une usine de production dans votre navigateur</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Ne perdez plus de temps sur des tâches répétitives. AppStoreOS automatise tout ce qui entoure le code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Radar size={24} />}
              color="text-rose-400"
              bg="bg-rose-500/10"
              border="border-rose-500/20"
              title="Radar & Signaux Faibles"
              desc="Scannez l'App Store, Reddit et Twitter pour trouver des problèmes monétisables avant vos concurrents."
            />
            <FeatureCard 
              icon={<Rocket size={24} />}
              color="text-indigo-400"
              bg="bg-indigo-500/10"
              border="border-indigo-500/20"
              title="War Room IA"
              desc="Validez votre idée avec un co-fondateur virtuel propulsé par Gemini Pro. Obtenez un plan d'action clair."
            />
            <FeatureCard 
              icon={<Code size={24} />}
              color="text-emerald-400"
              bg="bg-emerald-500/10"
              border="border-emerald-500/20"
              title="Boilerplate Builder"
              desc="Générez le code de base (React Native/Expo) de votre application en un clic, prêt à être compilé."
            />
            <FeatureCard 
              icon={<Zap size={24} />}
              color="text-amber-400"
              bg="bg-amber-500/10"
              border="border-amber-500/20"
              title="ASO & Paywall Studio"
              desc="Générez vos mots-clés, traduisez-les pour le monde entier, et créez des paywalls qui convertissent."
            />
            <FeatureCard 
              icon={<Smartphone size={24} />}
              color="text-fuchsia-400"
              bg="bg-fuchsia-500/10"
              border="border-fuchsia-500/20"
              title="Viral Hook Generator"
              desc="Obtenez des scripts TikTok et Reels viraux pour acquérir des utilisateurs gratuitement."
            />
            <FeatureCard 
              icon={<ShieldCheck size={24} />}
              color="text-cyan-400"
              bg="bg-cyan-500/10"
              border="border-cyan-500/20"
              title="Review Defender"
              desc="Récupérez vos avis négatifs via l'API Apple et générez des réponses parfaites pour sauver votre note."
            />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-6 border-t border-white/5 bg-gradient-to-b from-[#050505] to-indigo-950/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">Prêt à lancer votre prochain hit ?</h2>
          <button 
            onClick={handleCTA}
            className="px-10 py-5 bg-white text-black hover:bg-gray-200 rounded-2xl font-black text-xl transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-3 mx-auto"
          >
            <Sparkles size={24} />
            Créer mon compte gratuit
          </button>
          <p className="mt-6 text-gray-400">Rejoignez les Indie Hackers qui construisent plus vite.</p>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, color, bg, border, title, desc }: any) {
  return (
    <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
      <div className={`w-14 h-14 rounded-2xl ${bg} ${border} border flex items-center justify-center ${color} mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
