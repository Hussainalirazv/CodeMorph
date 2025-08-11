import { useState, useEffect } from 'react';
import { Box, MenuItem, Select, Typography, CircularProgress, IconButton } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// Define the shape of a language pair object
interface LanguagePair {
  source: string;
  target: string;
}

interface LanguageSelectorProps {
  onPairChange: (source: string, target: string) => void;
}

export default function LanguageSelector({ onPairChange }: LanguageSelectorProps) {
  // Correct the type of 'pairs' to be an array of LanguagePair objects
  const [pairs, setPairs] = useState<LanguagePair[]>([]);
  const [sourceLang, setSourceLang] = useState<string>('');
  const [targetLang, setTargetLang] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(''); // For swap message

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/supported_pairs`);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();

        // Ensure data.pairs exists and has valid format
        if (!data?.pairs || !Array.isArray(data.pairs)) {
          throw new Error('Invalid API response format');
        }

        // Cast the incoming data to the correct type for `setPairs`
        setPairs(data.pairs as LanguagePair[]);

        if (data.pairs.length > 0) {
          // Find a default pair that is commonly available, e.g., C# to C or Python to C++
          // Removed C++ and PHP from defaults as per previous discussion
          const defaultSource = 'c#';
          const defaultTarget = 'c';

          // Correctly access properties: p.source and p.target
          const defaultPairExists = data.pairs.some((p: LanguagePair) => p.source === defaultSource && p.target === defaultTarget);

          if (defaultPairExists) {
            setSourceLang(defaultSource);
            setTargetLang(defaultTarget);
          } else {
            // Fallback to the first pair if preferred default isn't found
            // Correctly access properties for fallback
            setSourceLang(data.pairs[0].source);
            setTargetLang(data.pairs[0].target);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPairs();
  }, []);

  useEffect(() => {
    // Only call onPairChange if both languages are selected and not loading
    if (!loading && sourceLang && targetLang) {
      onPairChange(sourceLang, targetLang);
    }
  }, [sourceLang, targetLang, onPairChange, loading]); // Added loading to dependency array

  // Handle swapping languages
  const handleSwap = () => {
    if (sourceLang && targetLang) {
      // Check if the swapped pair is supported
      const isSwapSupported = pairs.some(p => p.source === targetLang && p.target === sourceLang);
      if (isSwapSupported) {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setStatusMessage(''); // Clear any previous swap message
      } else {
        // If the exact swap isn't supported, try to find a valid target for the new source
        const newSource = targetLang;
        const newAvailableTargets = pairs.filter(p => p.source === newSource).map(p => p.target);

        setStatusMessage(`Note: Direct swap between ${sourceLang.toUpperCase()} and ${targetLang.toUpperCase()} is not a supported pair. Selecting first available target.`);

        setSourceLang(newSource);
        if (newAvailableTargets.length > 0) {
          setTargetLang(newAvailableTargets[0]); // Set to the first available target for the new source
        } else {
          setTargetLang(''); // No valid target for the new source
        }
      }
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  if (error) return <Typography color="error" variant="body1" sx={{ textAlign: 'center', my: 2 }}>Error loading languages: {error}</Typography>;
  // This condition now checks if `pairs` is empty after loading.
  if (pairs.length === 0) return <Typography variant="body1" sx={{ textAlign: 'center', my: 2 }}>No language pairs available from API. Please ensure backend is running and models are present.</Typography>;

  // Filter available sources and targets correctly using .source and .target
  const availableSources = [...new Set(pairs.map(p => p.source))];
  const availableTargets = pairs
    .filter(p => p.source === sourceLang)
    .map(p => p.target);

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      mb: 4,
      justifyContent: 'center', // Center align selectors
      flexWrap: 'wrap', // Allow wrapping on small screens
    }}>
      <Select
        value={sourceLang}
        onChange={(e) => setSourceLang(e.target.value)}
        sx={{ minWidth: 160 }}
        disabled={loading}
        displayEmpty
        inputProps={{ 'aria-label': 'Source Language' }}
      >
        <MenuItem value="" disabled>
          <Typography color="text.secondary">Source Language</Typography>
        </MenuItem>
        {/* Map over availableSources which are now correctly extracted */}
        {availableSources.map((lang) => (
          <MenuItem key={`src-${lang}`} value={lang}>
            {lang?.toUpperCase()}
          </MenuItem>
        ))}
      </Select>

      {/* Swap Button */}
      <IconButton
        onClick={handleSwap}
        color="primary"
        aria-label="Swap languages"
        disabled={!sourceLang || !targetLang}
        sx={{
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
                transform: 'rotate(180deg)',
            },
        }}
      >
        <SwapHorizIcon sx={{ fontSize: 32 }} />
      </IconButton>

      <Select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        sx={{ minWidth: 160 }}
        disabled={loading || !sourceLang}
        displayEmpty
        inputProps={{ 'aria-label': 'Target Language' }}
      >
        <MenuItem value="" disabled>
          <Typography color="text.secondary">Target Language</Typography>
        </MenuItem>
        {/* Map over availableTargets which are now correctly extracted */}
        {availableTargets.map((lang) => (
          <MenuItem key={`tgt-${lang}`} value={lang}>
            {lang?.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
      {statusMessage && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, width: '100%', textAlign: 'center' }}>
          {statusMessage}
        </Typography>
      )}
    </Box>
  );
}