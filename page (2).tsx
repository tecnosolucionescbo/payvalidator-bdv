@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply antialiased;
  }
}

@layer utilities {
  .bdv-gradient {
    background: linear-gradient(135deg, #cc0000 0%, #990000 40%, #660000 100%);
  }

  .bdv-gradient-subtle {
    background: linear-gradient(135deg, #1a0000 0%, #2d0000 50%, #1a0000 100%);
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-card-dark {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .input-dark {
    @apply bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30
           focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-all duration-200;
  }

  .btn-primary {
    @apply bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg
           transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-ghost {
    @apply bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3 rounded-lg
           border border-white/10 transition-all duration-200 active:scale-95;
  }
}
