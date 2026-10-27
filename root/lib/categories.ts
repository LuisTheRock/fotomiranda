// Kept apart from lib/photos.ts so client components can import it.
// To add a category (e.g. "batizado"): add it here, to Category in Gallery.tsx and to the check in
// supabase/migrations, then give it a label and alt text under gallery in dictionaries.ts and a
// button in the Gallery filters.
export const CATEGORIES = ["casamento", "casal", "bebes"];

// Gallery order: category groups in the order above, then the admin's drag order inside each group.
// Array.sort is stable, so rows already sorted by position keep that order within a category.
export const byCategory = <T extends { category: string }>(rows: T[]) =>
  rows.sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category));

