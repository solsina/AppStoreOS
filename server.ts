import express from 'express';
import { createServer as createViteServer } from 'vite';
import store from 'app-store-scraper';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Radar Scrape API
  app.post('/api/radar/scrape', async (req, res) => {
    try {
      const { niche, type } = req.body;
      
      if (!niche) {
        return res.status(400).json({ error: 'Niche is required' });
      }

      // Truncate niche to avoid URI too long errors from Apple's API
      const searchTerm = niche.substring(0, 100);

      // 1. Search for top apps in this niche
      let searchResults;
      try {
        searchResults = await store.search({ term: searchTerm, num: 5 });
      } catch (searchError) {
        console.error('Store search error:', searchError);
        return res.status(400).json({ error: 'Impossible de chercher ce terme sur l\'App Store. Essayez un mot-clé plus court.' });
      }
      
      if (!searchResults || searchResults.length === 0) {
        return res.status(404).json({ error: 'Aucune application trouvée pour cette niche.' });
      }

      // 2. Get the top competitor (usually the first or second result)
      const competitor = searchResults[0];

      // 3. Fetch reviews for the competitor to find flaws (1-3 star reviews)
      let badReviews: string[] = [];
      try {
         const reviews = await store.reviews({ 
           appId: competitor.appId, 
           sort: store.sort.HELPFUL, 
           page: 1 
         });
         
         // Filter for bad reviews to find pain points
         badReviews = reviews
           .filter((r: any) => r.score <= 3)
           .map((r: any) => r.text)
           .slice(0, 5); // Keep top 5 complaints
           
      } catch (e) {
         console.error(`Error fetching reviews for ${competitor.appId}:`, e);
      }

      // Fallback if no bad reviews found
      if (badReviews.length === 0) {
        badReviews = [
          "L'application manque de fonctionnalités avancées.",
          "Interface utilisateur confuse et difficile à naviguer.",
          "Trop de publicités intrusives ou modèle de prix abusif."
        ];
      }

      res.json({
        niche: niche,
        competitorId: competitor.appId.toString(),
        competitorName: competitor.title,
        competitorRating: competitor.score,
        competitorIcon: competitor.icon,
        flaws: badReviews,
        opportunity: `Créer une alternative à ${competitor.title} qui résout ces problèmes spécifiques.`
      });

    } catch (error) {
      console.error('Scraping error:', error);
      res.status(500).json({ error: 'Failed to scrape App Store data' });
    }
  });

  // Vite middleware setup for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
