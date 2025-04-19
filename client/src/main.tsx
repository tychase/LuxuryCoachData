import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom styles for Playfair and Montserrat fonts
document.documentElement.style.setProperty('--font-playfair', '"Playfair Display", serif');
document.documentElement.style.setProperty('--font-montserrat', 'Montserrat, sans-serif');

// Add custom colors to match the design
document.documentElement.classList.add("light");

// Set custom colors
const customColors = {
  // Navy colors
  '--navy-900': '#0A1933',
  '--navy-800': '#0F2447',
  '--navy-700': '#1A355F',
  
  // Gold colors
  '--gold-300': '#D9C7A9',
  '--gold-500': '#C4A77D',
  '--gold-700': '#A68B5B',
  
  // Burgundy colors
  '--burgundy-500': '#722F37',
  '--burgundy-700': '#5A252C',
  
  // Neutral colors
  '--neutral-100': '#F5F5F5',
  '--neutral-200': '#E5E5E5',
  '--neutral-300': '#D4D4D4',
  '--neutral-500': '#707070',
  '--neutral-800': '#333333',
  
  // Status colors
  '--status-success': '#2C614F',
  '--status-error': '#8B2E29',
  '--status-warning': '#B88746',
  
  // Apply to shadcn variables as well
  '--background': '0 0% 100%',
  '--foreground': '222.2 47.4% 11.2%',
  '--muted': '210 40% 96.1%',
  '--muted-foreground': '215.4 16.3% 46.9%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '222.2 47.4% 11.2%',
  '--border': '214.3 31.8% 91.4%',
  '--input': '214.3 31.8% 91.4%',
  '--card': '0 0% 100%',
  '--card-foreground': '222.2 47.4% 11.2%',
  '--primary': '222.2 47.4% 11.2%',
  '--primary-foreground': '210 40% 98%',
  '--secondary': '210 40% 96.1%',
  '--secondary-foreground': '222.2 47.4% 11.2%',
  '--accent': '210 40% 96.1%',
  '--accent-foreground': '222.2 47.4% 11.2%',
  '--destructive': '0 100% 50%',
  '--destructive-foreground': '210 40% 98%',
  '--ring': '222.2 47.4% 11.2%',
  '--radius': '0.5rem',
}

// Apply custom colors
Object.entries(customColors).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});

createRoot(document.getElementById("root")!).render(<App />);
