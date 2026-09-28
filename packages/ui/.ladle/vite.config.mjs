// Ladle runs its own Vite (and React plugin); it only needs Tailwind for our tokens and utilities.
import tailwindcss from '@tailwindcss/vite';

export default { plugins: [tailwindcss()] };
