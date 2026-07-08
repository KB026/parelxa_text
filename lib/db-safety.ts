const PROTECTED_URL_PATTERN = /supabase\.co\/storage\/v1\/object\/public/;

export function assertSafeToClear(urls: string[], context: string): void {
  const protectedUrls = urls.filter(u => PROTECTED_URL_PATTERN.test(u));
  if (protectedUrls.length > 0) {
    throw new Error(
      `SAFETY BLOCK [${context}]: Attempted to clear ${protectedUrls.length} real Supabase Storage URL(s). ` +
      `This operation is blocked. Filter these out before proceeding. URLs: ${protectedUrls.join(', ')}`
    );
  }
}

export function filterOutBadUrls(urls: string[], badPatterns: string[]): string[] {
  return urls.filter(url => {
    const isBad = badPatterns.some(pattern => url.includes(pattern));
    const isProtected = PROTECTED_URL_PATTERN.test(url);
    if (isBad && isProtected) {
      console.error(`WARNING: URL matched bad pattern but is a protected Supabase Storage URL, keeping it: ${url}`);
      return true;
    }
    return !isBad;
  });
}
