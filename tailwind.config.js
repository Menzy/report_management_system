/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 1.5s infinite",
        "glass-fade-in": "glassFadeIn 0.6s ease-out",
        "glass-slide-up": "glassSlideUp 0.4s ease-out",
        "glass-scale-in": "glassScaleIn 0.3s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "glassFadeIn": {
          from: {
            opacity: "0",
            transform: "translateY(20px) scale(0.95)",
            backdropFilter: "blur(0px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)",
            backdropFilter: "blur(12px)",
          },
        },
        "glassSlideUp": {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "glassScaleIn": {
          from: {
            opacity: "0",
            transform: "scale(0.9)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-tertiary': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-success': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-warning': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient-dark': 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass-subtle': '8px',
        'glass-medium': '12px',
        'glass-strong': '16px',
        'glass-heavy': '24px',
      },
      colors: {
        glass: {
          white: 'rgba(255, 255, 255, 0.15)',
          'white-strong': 'rgba(255, 255, 255, 0.25)',
          'white-subtle': 'rgba(255, 255, 255, 0.08)',
          blue: 'rgba(59, 130, 246, 0.15)',
          'blue-strong': 'rgba(59, 130, 246, 0.25)',
          green: 'rgba(34, 197, 94, 0.15)',
          'green-strong': 'rgba(34, 197, 94, 0.25)',
          red: 'rgba(239, 68, 68, 0.15)',
          'red-strong': 'rgba(239, 68, 68, 0.25)',
          purple: 'rgba(147, 51, 234, 0.15)',
          amber: 'rgba(245, 158, 11, 0.15)',
        },
        'text-glass': {
          primary: 'rgba(255, 255, 255, 0.95)',
          secondary: 'rgba(255, 255, 255, 0.75)',
          muted: 'rgba(255, 255, 255, 0.6)',
          dark: 'rgba(0, 0, 0, 0.8)',
          'dark-secondary': 'rgba(0, 0, 0, 0.6)',
        },
      },
      borderColor: {
        glass: 'rgba(255, 255, 255, 0.2)',
        'glass-strong': 'rgba(255, 255, 255, 0.3)',
        'glass-blue': 'rgba(59, 130, 246, 0.3)',
        'glass-green': 'rgba(34, 197, 94, 0.3)',
        'glass-red': 'rgba(239, 68, 68, 0.3)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-strong': '0 12px 40px rgba(0, 0, 0, 0.15)',
        'glass-subtle': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate")
  ],
};