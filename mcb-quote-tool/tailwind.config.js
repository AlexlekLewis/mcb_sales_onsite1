/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand colors
                brand: {
                    orange: '#D97706',
                    'orange-light': '#F59E0B',
                    'orange-dark': '#B45309',
                    blue: '#38BDF8',
                    'blue-light': '#7DD3FC',
                    'blue-dark': '#0EA5E9',
                },
                // Background colors - Navy
                background: {
                    DEFAULT: '#0F172A',
                    card: '#1E293B',
                    input: '#0C1425',
                },
                // Surface overlays
                surface: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    hover: 'rgba(255, 255, 255, 0.10)',
                },
                // Text colors
                text: {
                    primary: '#FFFFFF',
                    secondary: '#CBD5E1',
                    muted: '#94A3B8',
                },
            },
            borderColor: {
                subtle: 'rgba(255, 255, 255, 0.05)',
                muted: 'rgba(255, 255, 255, 0.10)',
            },
            boxShadow: {
                'orange-glow': '0 0 20px rgba(217, 119, 6, 0.3)',
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
                'neon': '0 0 10px rgba(217, 119, 6, 0.5), 0 0 20px rgba(217, 119, 6, 0.3)',
            },
            dropShadow: {
                'glow': '0 0 8px rgba(217, 119, 6, 0.5)',
            },
            backgroundImage: {
                'orange-gradient': 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            },
        },
    },
    plugins: [],
}
