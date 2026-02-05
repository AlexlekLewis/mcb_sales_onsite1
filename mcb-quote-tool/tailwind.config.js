/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'sans-serif'],
                serif: ['Cinzel', 'serif'],
            },
            colors: {
                // Brand colors - Luxury Copper
                brand: {
                    DEFAULT: '#C17937', // Copper Main
                    light: '#E69E5E',   // Copper Light
                    dark: '#8B5322',    // Copper Dark
                    orange: '#C17937',  // Legacy mapping to Copper
                },
                // Background colors - Matte Charcoal
                background: {
                    DEFAULT: '#333333', // Charcoal Main
                    secondary: '#2C2C2C', // Darker Charcoal
                    card: '#404040',    // Lighter Charcoal for cards
                    input: '#262626',   // Dark input bg
                },
                // Text colors
                text: {
                    primary: '#F3F4F6', // Off-white
                    secondary: '#D1D5DB', // Light Gray
                    muted: '#9CA3AF',   // Muted Gray
                    copper: '#C17937',  // Copper Text
                },
            },
            borderColor: {
                subtle: 'rgba(255, 255, 255, 0.05)',
                muted: 'rgba(255, 255, 255, 0.10)',
                copper: 'rgba(193, 121, 55, 0.5)', // Copper border
            },
            boxShadow: {
                'copper-glow': '0 0 20px rgba(193, 121, 55, 0.3)',
                'glass': '0 4px 30px rgba(0, 0, 0, 0.2)',
                'neon': '0 0 10px rgba(193, 121, 55, 0.4), 0 0 20px rgba(193, 121, 55, 0.2)',
            },
            dropShadow: {
                'glow': '0 0 8px rgba(193, 121, 55, 0.5)',
            },
            backgroundImage: {
                'copper-gradient': 'linear-gradient(135deg, #C17937 0%, #E69E5E 100%)',
                'charcoal-gradient': 'linear-gradient(180deg, #333333 0%, #4A4A4A 100%)',
                'glass-gradient': 'linear-gradient(180deg, rgba(64, 64, 64, 0.7) 0%, rgba(64, 64, 64, 0.4) 100%)',
            },
        },
    },
    plugins: [],
}
