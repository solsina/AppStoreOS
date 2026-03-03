import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

interface Transcription {
  id: number;
  title: string;
  content: string;
}

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}

const SearchPage: React.FC = () => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [fuse, setFuse] = useState<Fuse<Transcription> | null>(null);

  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        const response = await fetch('/starter-story-transcriptions.txt');
        const text = await response.text();
        const transcriptionBlocks = text.split('\n\n---\n\n');
        
        const parsedTranscriptions: Transcription[] = transcriptionBlocks.map((block, index) => {
          const lines = block.split('\n');
          const firstLine = lines.find(line => line.trim() !== '' && !line.match(/^\d{2}:\d{2}/));
          const title = firstLine ? firstLine.substring(0, 100).replace(/^\d{2}:\d{2}\s/, '') : `Transcription ${index + 1}`;
          
          return {
            id: index,
            title: title,
            content: block,
          };
        });
        setTranscriptions(parsedTranscriptions);
        setFuse(new Fuse(parsedTranscriptions, {
          keys: ['title', 'content'],
          includeScore: true,
          minMatchCharLength: 3,
          threshold: 0.4,
        }));
      } catch (error) {
        console.error("Failed to load transcriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptions();
  }, []);

  const searchResults = useMemo(() => {
    if (searchTerm.trim() === '') {
      return [];
    }
    if (!fuse || searchTerm.trim().length < 3) {
      return [];
    }
    return fuse.search(searchTerm).map(result => result.item);
  }, [searchTerm, transcriptions]);

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 text-black px-1 rounded">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const getSnippet = (text: string, highlight: string): string => {
    const lowerText = text.toLowerCase();
    const lowerHighlight = highlight.toLowerCase();
    const index = lowerText.indexOf(lowerHighlight);

    if (index === -1) {
      return text.substring(0, 300) + '...';
    }

    const start = Math.max(0, index - 100);
    const end = Math.min(text.length, index + highlight.length + 100);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const debouncedSearch = useMemo(() => debounce(handleSearchChange, 300), []);

  return (
    <div className="min-h-screen bg-[#111827] text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">Starter Story Search</h1>
          <p className="text-lg text-gray-400">Explore the wisdom from 80+ founder interviews.</p>
        </header>
        
        <div className="sticky top-0 z-10 py-4 bg-[#111827]">
          <input
            type="search"
            className="w-full p-4 text-lg bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500 text-white"
            placeholder="Search for keywords (e.g., 'SaaS', 'marketing', 'MRR')..."
            onChange={debouncedSearch}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-lg">Loading transcriptions...</p>
          </div>
        ) : (
          <main className="mt-8">
            {searchTerm && <p className="mb-6 text-gray-400">Found {searchResults.length} results for "{searchTerm}"</p>}
            <div className="space-y-6">
              {searchResults.map(result => (
                <article key={result.id} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 transition-colors duration-200">
                  <h2 className="text-xl font-semibold mb-3 text-indigo-400">{result.title}</h2>
                  <p className="text-gray-300 leading-relaxed">
                    {getHighlightedText(getSnippet(result.content, searchTerm), searchTerm)}
                  </p>
                </article>
              ))}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
