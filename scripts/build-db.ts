import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement (pour la clé API Gemini)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../src/data/starter-story-db.json');

// Initialiser Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Fonction principale pour scraper et analyser une vidéo
async function processVideo(videoUrl: string) {
  try {
    console.log(`\n[1/3] 📥 Récupération des sous-titres pour : ${videoUrl}`);
    
    // 1. Scraper les sous-titres (gratuitement, sans clé API YouTube)
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
    
    // Concaténer tout le texte (on limite à 30 000 caractères pour ne pas surcharger le prompt)
    const fullText = transcript.map(t => t.text).join(' ').substring(0, 30000);
    
    console.log(`[2/3] 🧠 Analyse de l'interview par Gemini...`);
    
    // 2. Envoyer à Gemini pour extraire les données structurées
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Tu es un analyste de business. Voici la transcription d'une interview YouTube de la chaîne Starter Story.
        Extrais les informations clés du business et renvoie-les au format JSON strict.
        
        TRANSCRIPTION :
        ${fullText}
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Un ID unique, ex: ss-009" },
            name: { type: Type.STRING, description: "Le nom du produit ou de l'entreprise" },
            founder: { type: Type.STRING, description: "Le nom du ou des fondateurs" },
            revenue: { type: Type.STRING, description: "Le revenu mensuel ou annuel (ex: $10k MRR)" },
            category: { type: Type.STRING, description: "La catégorie (ex: SaaS, E-commerce, Tool)" },
            description: { type: Type.STRING, description: "Une description claire de ce que fait le produit (en français)" },
            whyItWorks: { type: Type.STRING, description: "Pourquoi ce business fonctionne, quel est son avantage stratégique (en français)" },
            techStack: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Les technologies utilisées (ex: React, Node.js, Stripe, No-Code)"
            },
            source: { type: Type.STRING, description: "L'URL de la vidéo YouTube" }
          },
          required: ["id", "name", "founder", "revenue", "category", "description", "whyItWorks", "techStack", "source"]
        }
      }
    });

    const newData = JSON.parse(response.text || '{}');
    newData.source = videoUrl; // Forcer l'URL exacte

    console.log(`[3/3] 💾 Sauvegarde de "${newData.name}" dans la base de données...`);

    // 3. Lire la base de données existante
    let db = [];
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, 'utf-8');
      db = JSON.parse(fileContent);
    }

    // 4. Ajouter la nouvelle donnée et sauvegarder
    db.push(newData);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    console.log(`✅ Succès ! Le business ${newData.name} a été ajouté à starter-story-db.json`);

  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${videoUrl}:`, error);
  }
}

// ============================================================================
// 🚀 INSTRUCTIONS D'UTILISATION
// ============================================================================
// Ajoute les URLs des vidéos Starter Story que tu veux scraper ici :
const videosToScrape = [
  // Exemple : "https://www.youtube.com/watch?v=XXXXXXXXXXX"
];

async function main() {
  if (videosToScrape.length === 0) {
    console.log("⚠️ Aucune vidéo à scraper. Ajoute des URLs dans le tableau 'videosToScrape'.");
    return;
  }

  for (const url of videosToScrape) {
    await processVideo(url);
    // Pause de 5 secondes entre chaque vidéo pour éviter de se faire bloquer par YouTube
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

main();
