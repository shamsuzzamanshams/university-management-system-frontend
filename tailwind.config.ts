import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#10243E", brand: "#1E5EFF", mint: "#E6F8F1" } } },
  plugins: [],
} satisfies Config;
