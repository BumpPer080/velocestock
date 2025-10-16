module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        velocestock: {
          primary: '#f97316',
          'primary-content': '#0b0b0b',
          secondary: '#111827',
          'secondary-content': '#f8fafc',
          accent: '#fb923c',
          neutral: '#1f2937',
          'neutral-content': '#f3f4f6',
          'base-100': '#ffffff',
          'base-200': '#f4f4f5',
          'base-300': '#e4e4e7',
          'base-content': '#111827',
          'accent-content': '#111827',
          info: '#0ea5e9',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
  },
};
