import { useState } from 'react';
import { Container, Typography, Box, IconButton, AppBar, Toolbar, Paper } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LanguageSelector from '../components/LanguageSelector';
import CodeEditor from '../components/CodeEditor';
import { useThemeContext } from '../theme/ThemeContext';

interface LanguageState {
  source: string;
  target: string;
}

export default function Home() {
  const [languagePair, setLanguagePair] = useState<LanguageState>({
    source: 'c',
    target: 'java'
  });
  const { mode, toggleColorMode } = useThemeContext();

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default',
      color: 'text.primary',
    }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            CodeMorph
          </Typography>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Code Translator
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Convert code between programming languages
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <LanguageSelector
            onPairChange={(src, tgt) => setLanguagePair({ source: src, target: tgt })}
          />
          <Box sx={{ mt: 3 }}>
            <CodeEditor
              sourceLang={languagePair.source}
              targetLang={languagePair.target}
            />
          </Box>
        </Paper>
      </Container>

      <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} CodeMorph
        </Typography>
      </Box>
    </Box>
  );
}