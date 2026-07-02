/* eslint-disable @typescript-eslint/no-explicit-any */
export let savedIdsPromise: Promise<number[]> | null = null;

export function getSavedToolsIds(): Promise<number[]> {
  if (typeof window === 'undefined') return Promise.resolve([]);
  if (!savedIdsPromise) {
    savedIdsPromise = fetch('/api/saved-tools')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (data && data.savedTools) {
          return data.savedTools.map((t: any) => t.agent_id);
        }
        return [];
      })
      .catch((err) => {
        console.error('Error fetching saved tools:', err);
        savedIdsPromise = null;
        return [];
      });
  }
  return savedIdsPromise;
}

export function clearSavedToolsCache() {
  savedIdsPromise = null;
}
