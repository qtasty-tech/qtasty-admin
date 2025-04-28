module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Add your custom green shades
          'emerald': {
            50: '#ecfdf5',
            100: '#d1fae5',
            // ... add other shades up to 900
          },
          'green': {
            50: '#f0fdf4',
            100: '#dcfce7',
            // ... add other shades up to 900
          }
        },
      },
    },
    plugins: [],
  }