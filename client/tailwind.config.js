/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        neutral: "#f5f1ea",
        indigoBrand: "#4f46e5",
        skyBrand: "#2563eb"
      }
    }
  },
  plugins: []
};
