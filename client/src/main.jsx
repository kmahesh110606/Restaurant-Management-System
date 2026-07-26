import { StrictMode } from 'react'; // Import React's StrictMode wrapper component for development checks
import { createRoot } from 'react-dom/client'; // Import createRoot to initialize the React DOM root rendering engine
import './index.css'; // Import global CSS styles and design system variables
import App from './App'; // Import the primary root App router component

createRoot(document.getElementById('root')).render( // Locate 'root' DOM container element and attach React root renderer
  <StrictMode> {/* Wrap app in StrictMode to highlight potential lifecycle side-effects and deprecated APIs */}
    <App /> {/* Mount main App application tree */}
  </StrictMode>, {/* Close StrictMode wrapper */}
); // Execute render cycle on root DOM node

