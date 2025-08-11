import { useState, useRef } from 'react';
import { Button, Box, TextField, CircularProgress, Typography, Tooltip, IconButton } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import { useThemeContext } from '../theme/ThemeContext';

const EDITOR_HEIGHT = '70vh'

interface CodeEditorProps {
  sourceLang: string;
  targetLang: string;
}

export default function CodeEditor({ sourceLang, targetLang }: CodeEditorProps) {
  const [sourceCode, setSourceCode] = useState<string>('');
  const [targetCode, setTargetCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error' | 'warning'>('info');

  const { mode } = useThemeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslate = async () => {
    if (!sourceCode.trim()) {
      setStatusMessage('Please enter code to translate.');
      setMessageType('warning');
      return;
    }

    setIsLoading(true);
    setTargetCode('');
    setStatusMessage('Translating code...');
    setMessageType('info');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: sourceCode,
          source_lang: sourceLang,
          target_lang: targetLang
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      
      const data = await response.json();
      setTargetCode(data.translation);
      setStatusMessage('Translation successful!');
      setMessageType('success');

      if (data.warnings?.length > 0) {
        setStatusMessage(`Translation complete with warnings: ${data.warnings.join('; ')}`);
        setMessageType('warning');
      }
    } catch (error) {
      setTargetCode(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatusMessage(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSourceCode('');
    setTargetCode('');
    setStatusMessage('');
  };

  const handleCopy = () => {
    if (targetCode) {
      navigator.clipboard.writeText(targetCode);
      setStatusMessage('Copied to clipboard!');
      setMessageType('success');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceCode(e.target?.result as string);
        setStatusMessage(`File "${file.name}" loaded`);
        setMessageType('info');
      };
      reader.onerror = () => {
        setStatusMessage('Failed to read file');
        setMessageType('error');
      };
      reader.readAsText(file);
    }
  };

  const handleFileDownload = () => {
    if (targetCode) {
      const blob = new Blob([targetCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translation_${Date.now()}.${targetLang}`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Downloaded translation');
      setMessageType('success');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3, 
      height: '100%'
    }}>
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        flexDirection: { xs: 'column', md: 'row' },
        flexGrow: 1
      }}>
        {/* Source Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: EDITOR_HEIGHT }}>
          <Typography variant="subtitle1" gutterBottom>
            {sourceLang.toUpperCase()} Code
          </Typography>
          <TextField
            multiline
            fullWidth
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            sx={{
              fontFamily: 'monospace',
              flexGrow: 5,
              '& .MuiInputBase-root': { height: '100%' },
              '& .MuiInputBase-input': { height: '100% !important' }
            }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => fileInputRef.current?.click()}>
                  <UploadFileIcon />
                </IconButton>
              )
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".c,.cpp,.java,.js,.py,.txt"
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'row', md: 'column' }, 
          justifyContent: 'center',
          gap: 2
        }}>
          <Button
            variant="contained"
            onClick={handleTranslate}
            disabled={isLoading || !sourceCode.trim()}
            sx={{ minWidth: 150 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Translate →'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={!sourceCode && !targetCode}
            startIcon={<ClearAllIcon />}
          >
            Clear
          </Button>
        </Box>

        {/* Target Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: EDITOR_HEIGHT }}>
          <Typography variant="subtitle1" gutterBottom>
            {targetLang.toUpperCase()} Code
          </Typography>
          <Box sx={{ 
            flexGrow: 5,
            position: 'relative',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: mode === 'dark' ? '#282c34' : '#f8f8fa'
          }}>
            <SyntaxHighlighter
              language={targetLang}
              style={mode === 'dark' ? atomOneDark : atomOneLight}
              showLineNumbers
              customStyle={{ 
                height: '100%',
                margin: 0,
                padding: '16px !important',
                backgroundColor: 'transparent !important'
              }}
            >
              {targetCode || '// Translation will appear here'}
            </SyntaxHighlighter>
            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
              <Tooltip title="Copy">
                <IconButton onClick={handleCopy} size="small" disabled={!targetCode}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton onClick={handleFileDownload} size="small" disabled={!targetCode}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Status Message */}
      {statusMessage && (
        <Typography
          variant="body2"
          sx={{
            p: 1,
            borderRadius: 1,
            textAlign: 'center',
            bgcolor: `${messageType}.light`,
            color: `${messageType}.contrastText`
          }}
        >
          {statusMessage}
        </Typography>
      )}
    </Box>
  );
}