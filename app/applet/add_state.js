const fs = require('fs');

const filePath = 'src/pages/ToolsPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

content = content.replace(
  "import { GoogleGenAI } from \"@google/genai\";",
  `import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { MobileProject } from '../types';
import { Save } from 'lucide-react';`
);

// 2. Add state and fetch logic
const stateLogic = `  const [activeCategory, setActiveCategory] = useState('all');
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<MobileProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'projects'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MobileProject));
        setProjects(fetchedProjects);
        if (fetchedProjects.length > 0) {
          setSelectedProjectId(fetchedProjects[0].id);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [currentUser]);

  const saveToProject = async (assetKey: string, data: any) => {
    if (!selectedProjectId) return;
    setIsSaving(assetKey);
    try {
      const projectRef = doc(db, 'projects', selectedProjectId);
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project) return;
      
      const currentAssets = project.assets || {};
      const updatedAssets = { ...currentAssets };
      
      // Handle nested keys like 'aso.title'
      const keys = assetKey.split('.');
      if (keys.length === 1) {
        updatedAssets[keys[0]] = data;
      } else if (keys.length === 2) {
        updatedAssets[keys[0]] = { ...(updatedAssets[keys[0]] || {}), [keys[1]]: data };
      }

      await updateDoc(projectRef, { assets: updatedAssets });
      
      // Update local state
      setProjects(projects.map(p => p.id === selectedProjectId ? { ...p, assets: updatedAssets } : p));
      
      alert("Sauvegardé avec succès dans le projet !");
    } catch (error) {
      console.error("Error saving to project:", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(null);
    }
  };`;

content = content.replace(
  "  const [activeCategory, setActiveCategory] = useState('all');",
  stateLogic
);

// 3. Add Project Selector UI
const selectorUI = `        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Outils Gratuits pour Fondateurs 🛠️</h1>
          <p className="text-xl text-gray-400 mb-8">Des outils simples pour valider vos chiffres et vos idées.</p>
          
          {projects.length > 0 && (
            <div className="inline-flex items-center gap-3 bg-[#141418] border border-white/10 rounded-2xl p-2 pl-4 shadow-xl">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Projet Actif</span>
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-[#0A0A0C] border border-white/5 rounded-xl py-2 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>`;

content = content.replace(
  `        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Outils Gratuits pour Fondateurs 🛠️</h1>
          <p className="text-xl text-gray-400">Des outils simples pour valider vos chiffres et vos idées.</p>
        </div>`,
  selectorUI
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('State and Selector added!');
