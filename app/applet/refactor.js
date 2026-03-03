const fs = require('fs');

const filePath = 'src/pages/ToolsPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add LayoutGrid to imports
content = content.replace(
  "import { Calculator, Target, Zap, Search, Star, ExternalLink, MessageSquareWarning, Download, DollarSign, Type, CreditCard, Image as ImageIcon, Globe, Video, Eye, Upload, Megaphone, Languages, Key, LineChart, Users, MonitorSmartphone, FileText, MessageCircle } from 'lucide-react';",
  "import { Calculator, Target, Zap, Search, Star, ExternalLink, MessageSquareWarning, Download, DollarSign, Type, CreditCard, Image as ImageIcon, Globe, Video, Eye, Upload, Megaphone, Languages, Key, LineChart, Users, MonitorSmartphone, FileText, MessageCircle, LayoutGrid } from 'lucide-react';"
);

// 2. Add activeCategory state
content = content.replace(
  "  const [downloads, setDownloads] = useState(5000);",
  "  const [activeCategory, setActiveCategory] = useState('all');\n  const [downloads, setDownloads] = useState(5000);"
);

// 3. Add the Tabs UI before the grid
const tabsUI = `
        {/* Categories Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {[
            { id: 'all', label: 'Tous les outils', icon: <LayoutGrid size={16} /> },
            { id: 'aso', label: 'ASO & Mots-clés', icon: <Search size={16} /> },
            { id: 'design', label: 'Design & UI', icon: <ImageIcon size={16} /> },
            { id: 'monetization', label: 'Monétisation', icon: <DollarSign size={16} /> },
            { id: 'marketing', label: 'Marketing & Lancement', icon: <Megaphone size={16} /> },
            { id: 'intelligence', label: 'Veille Concurrentielle', icon: <Eye size={16} /> },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={\`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all \${
                activeCategory === cat.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }\`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">`;

content = content.replace(
  '        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">',
  tabsUI
);

// 4. Wrap each tool
const tools = [
  { comment: '{/* App Revenue Calculator */}', category: 'monetization' },
  { comment: '{/* Niche Validator Tool */}', category: 'intelligence' },
  { comment: '{/* ASO Studio Tool */}', category: 'aso' },
  { comment: '{/* Paywall Architect Tool */}', category: 'monetization' },
  { comment: '{/* Icon Studio Tool */}', category: 'design' },
  { comment: '{/* Viral Hook Generator */}', category: 'marketing' },
  { comment: '{/* UI/UX Vision Spy */}', category: 'design' },
  { comment: '{/* Launch Strategist */}', category: 'marketing' },
  { comment: '{/* String Localizer */}', category: 'aso' },
  { comment: '{/* ASO Keyword Extractor */}', category: 'aso' },
  { comment: '{/* Global Pricing Optimizer */}', category: 'monetization' },
  { comment: '{/* Audience Locator */}', category: 'marketing' },
  { comment: '{/* Screenshot Storyboarder */}', category: 'design' },
  { comment: '{/* SEO Blog Post Generator */}', category: 'marketing' },
  { comment: '{/* App Store Review Summarizer */}', category: 'intelligence' }
];

tools.forEach(tool => {
  const startTag = `          ${tool.comment}\n          <motion.div`;
  const replacementStart = `          {['all', '${tool.category}'].includes(activeCategory) && (\n          ${tool.comment}\n          <motion.div`;
  content = content.replace(startTag, replacementStart);
});

// 5. Close the wrapper for each tool
content = content.replace(/<\/motion\.div>/g, '</motion.div>\n          )}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactoring complete!');
