/**
 * Converts a raw string into a URL-safe slug.
 * e.g. "Wedding Venues" → "wedding-venues"
 */
export function slugify(text?: string | null): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric (except spaces & hyphens)
    .replace(/\s+/g, '-')            // replace whitespace with hyphens
    .replace(/-+/g, '-')             // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');        // strip leading/trailing hyphens
}

/**
 * Builds a canonical SEO slug combining category + location.
 * e.g. ("wedding-venues", "ahmedabad") → "wedding-venues-in-ahmedabad"
 * e.g. ("wedding-venues", "ahmedabad", "navrangpura") → "wedding-venues-in-navrangpura"
 */
export function buildSEOSlug(
  categorySlug: string,
  citySlug: string,
  areaSlug?: string,
  isVendor?: boolean
): string {
  const cSlug = slugify(categorySlug);
  const lSlug = slugify(citySlug);
  const aSlug = areaSlug ? slugify(areaSlug) : '';

  if (isVendor) {
    return aSlug ? `${lSlug}/${aSlug}/vendors/${cSlug}` : `${lSlug}/vendors/${cSlug}`;
  }
  return aSlug ? `${lSlug}/${aSlug}/${cSlug}` : `${lSlug}/${cSlug}`;
}

/**
 * Converts a slug back to a human-readable label.
 * e.g. "wedding-venues" → "Wedding Venues"
 */
export function unslugify(slug?: string | null): string {
  if (!slug) return '';
  return slug
    .toString()
    .split('-')
    .map((word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');
}

/**
 * Ensures a listing slug includes the area if one is provided.
 * e.g. ("rajat-hotel", "navrangpura") → "rajat-hotel-in-navrangpura"
 */
export function buildListingSlug(slug?: string | null, areaOrLocation?: string | null): string {
    const s = (slug || '').toString();
    if (!s || !areaOrLocation || s.includes('-in-')) return s;
    
    // Ensure the area isn't an entire long address
    if (areaOrLocation.length > 30) return s;
    
    // Extract the primary area name
    const cleanArea = areaOrLocation.split(',')[0].trim();
    const areaSlug = slugify(cleanArea);
    if (!areaSlug) return s;
    return `${s}-in-${areaSlug}`;
}
