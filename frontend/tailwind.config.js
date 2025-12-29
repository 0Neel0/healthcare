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
                // DocPulse Medical Theme Colors
                'medical-blue': {
                    50: '#E3F2FD',
                    100: '#BBDEFB',
                    200: '#90CAF9',
                    300: '#64B5F6',
                    400: '#42A5F5',
                    500: '#1976D2',  // Primary Medical Blue
                    600: '#1565C0',
                    700: '#0D47A1',
                    800: '#0A3D91',
                    900: '#073375',
                },
                'health-green': {
                    50: '#F0FDF4',
                    100: '#DCFCE7',
                    200: '#BBF7D0',
                    300: '#86EFAC',
                    400: '#4ADE80',
                    500: '#22C55E',  // Primary Health Green
                    600: '#16A34A',
                    700: '#15803D',
                    800: '#166534',
                    900: '#14532D',
                },
                'demo-orange': {
                    50: '#FFF7ED',
                    100: '#FFEDD5',
                    200: '#FED7AA',
                    300: '#FDBA74',
                    400: '#FB923C',
                    500: '#F97316',  // Primary Demo Orange
                    600: '#EA580C',
                    700: '#C2410C',
                    800: '#9A3412',
                    900: '#7C2D12',
                },
                // Legacy support
                brand: {
                    500: '#1976D2',
                    600: '#1565C0',
                },
                accent: {
                    500: '#22C55E',
                    600: '#16A34A',
                },
            },
            backgroundImage: {
                'gradient-medical': 'linear-gradient(135deg, #1976D2 0%, #22C55E 100%)',
                'gradient-subtle': 'linear-gradient(135deg, #E3F2FD 0%, #F0FDF4 100%)',
                'gradient-demo': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(25, 118, 210, 0.1), 0 2px 4px -1px rgba(25, 118, 210, 0.06)',
                'glow': '0 0 15px rgba(25, 118, 210, 0.3)',
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
