import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CustomThemeProvider } from './theme/ThemeContext'; // Import the new provider
import { CssBaseline } from '@mui/material'; // Import CssBaseline for consistent styling

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomThemeProvider> {/* Wrap your App with the custom theme provider */}
      <CssBaseline /> {/* Apply global CSS resets and consistent baseline */}
      <App />
    </CustomThemeProvider>
  </React.StrictMode>,
);
