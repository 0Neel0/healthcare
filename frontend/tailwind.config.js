import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    plugins: [
        daisyui,
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Semantic Medical Colors
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',  // Primary Blue
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                accent: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6', // Medical Teal
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                },
                surface: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                }
            },
            backgroundImage: {
                'gradient-medical': 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)', // Blue to Teal
                'gradient-subtle': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                'gradient-warm': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', // Warning/Action
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -1px rgba(14, 165, 233, 0.06)',
                'glow': '0 0 15px rgba(14, 165, 233, 0.3)',
            }
        },
    },

    daisyui: {
        themes: [
            {
                medical: {
                    "primary": "#0ea5e9",   // Sky 500
                    "secondary": "#14b8a6", // Teal 500
                    "accent": "#0f766e",    // Teal 700
                    "neutral": "#334155",   // Slate 700
                    "base-100": "#ffffff",
                    "info": "#3b82f6",
                    "success": "#22c55e",
                    "warning": "#f59e0b",
                    "error": "#ef4444",
                },
            },
            "light",
        ],
    },
}
