import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Apna exact Google Client ID
const GOOGLE_CLIENT_ID = "778388067322-fg07jf2sp2vc3dppou4edjjnhtaaol20.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HelmetProvider>    
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>   
    </GoogleOAuthProvider>
  </React.StrictMode>,
)