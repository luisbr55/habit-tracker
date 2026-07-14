// Paleta fija de categorías — ver sdd/design-system.md → "Paleta de categorías".
// Se usan como hex directos (inline style) en vez de clases Tailwind, porque el
// color se guarda en la base como string y viene dinámico desde ahí.
export const CATEGORY_COLORS = [
  { name: "Verde", hex: "#16A34A" },
  { name: "Azul", hex: "#2563EB" },
  { name: "Violeta", hex: "#7C3AED" },
  { name: "Rosa", hex: "#DB2777" },
  { name: "Naranja", hex: "#EA580C" },
  { name: "Amarillo", hex: "#CA8A04" },
  { name: "Celeste", hex: "#0891B2" },
  { name: "Gris", hex: "#57534E" },
] as const;
