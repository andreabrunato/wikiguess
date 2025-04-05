const WIKIPEDIA_API_BASE = 'https://it.wikipedia.org/w/api.php';

export async function fetchRandomPage(language: string) {
  const response = await fetch(`https://${language}.wikipedia.org/api/rest_v1/page/random/summary`);
  if (!response.ok) {
    throw new Error('Errore nel recupero della pagina casuale');
  }
  return response.json();
}

export async function fetchRelatedPages(language: string) {
  const requests = Array.from({ length: 3 }, () => 
    fetch(`https://${language}.wikipedia.org/api/rest_v1/page/random/summary`).then(response => {
      if (!response.ok) {
        throw new Error('Errore nel recupero delle pagine correlate');
      }
      return response.json();
    })
  );

  const results = await Promise.all(requests);
  return results.map(({ title }) => ({ title }));
}