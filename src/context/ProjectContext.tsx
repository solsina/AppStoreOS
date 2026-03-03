import React, { createContext, useContext, useState, useEffect } from 'react';
import { MobileProject, ProjectPhase } from '../types';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

interface ProjectContextType {
  projects: MobileProject[];
  activeProject: MobileProject | null;
  setActiveProject: (id: string | null) => void;
  createFromSignal: (signal: MobileProject['signal']) => Promise<string>;
  updateConcept: (concept: MobileProject['concept']) => Promise<void>;
  updateProduction: (production: Partial<MobileProject['production']>) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<MobileProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const refreshProjects = async () => {
    if (!user) {
      // Load from local storage for guests
      const local = JSON.parse(localStorage.getItem('guest_projects') || '[]');
      setProjects(local);
      return;
    }

    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MobileProject));
      setProjects(fetched);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [user]);

  const saveProjectState = async (projectData: Partial<MobileProject>, id?: string) => {
    // Remove undefined values to prevent Firebase errors
    const sanitizedData = JSON.parse(JSON.stringify(projectData));

    if (!user) {
      const local = JSON.parse(localStorage.getItem('guest_projects') || '[]');
      if (id) {
        const index = local.findIndex((p: any) => p.id === id);
        if (index > -1) {
          local[index] = { ...local[index], ...sanitizedData };
        }
      } else {
        const newProject = { ...sanitizedData, id: 'guest_' + Date.now() };
        local.unshift(newProject);
        id = newProject.id;
      }
      localStorage.setItem('guest_projects', JSON.stringify(local));
      await refreshProjects();
      return id!;
    }

    if (id) {
      const ref = doc(db, 'projects', id);
      await updateDoc(ref, sanitizedData);
      await refreshProjects();
      return id;
    } else {
      const ref = await addDoc(collection(db, 'projects'), {
        ...sanitizedData,
        userId: user.uid,
      });
      await refreshProjects();
      return ref.id;
    }
  };

  const createFromSignal = async (signal: MobileProject['signal']) => {
    if (!signal) throw new Error("Signal is required");
    
    const newProject: Partial<MobileProject> = {
      name: 'Projet sans nom',
      niche: signal.niche,
      phase: 'signal',
      readinessScore: 10,
      createdAt: new Date().toISOString(),
      signal: signal
    };

    const id = await saveProjectState(newProject);
    setActiveProjectId(id);
    return id;
  };

  const updateConcept = async (concept: MobileProject['concept']) => {
    if (!activeProject || !concept) return;
    
    await saveProjectState({
      name: concept.name,
      phase: 'concept',
      readinessScore: 30,
      concept: concept
    }, activeProject.id);
  };

  const updateProduction = async (productionUpdate: Partial<MobileProject['production']>) => {
    if (!activeProject) return;
    
    const currentProd = activeProject.production || {};
    const newProd = { ...currentProd, ...productionUpdate };
    
    // Calculate readiness score based on assets
    let score = 30; // Base score from concept
    if (newProd.aso?.title) score += 10;
    if (newProd.icon) score += 20;
    if (newProd.screenshots?.length) score += 20;
    if (newProd.code) score += 20;

    const phase = score >= 100 ? 'ready' : 'production';

    await saveProjectState({
      phase,
      readinessScore: score,
      production: newProd
    }, activeProject.id);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      setActiveProject: setActiveProjectId,
      createFromSignal,
      updateConcept,
      updateProduction,
      refreshProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
