const WIKIPEDIA_API_BASE = 'https://it.wikipedia.org/w/api.php';

export async function fetchRandomPage(language) {
  const response = await fetch(`https://${language}.wikipedia.org/api/rest_v1/page/random/summary`);
  if (!response.ok) {
    throw new Error('Errore nel recupero della pagina casuale');
  }
  return response.json();
}

export async function fetchRelatedPages(language) {
  const relatedPages = [];
  for (let i = 0; i < 3; i++) {
    const response = await fetch(`https://${language}.wikipedia.org/api/rest_v1/page/random/summary`);
    if (!response.ok) {
      throw new Error('Errore nel recupero delle pagine correlate');
    }
    const data = await response.json();
    relatedPages.push({ title: data.title });
  }
  return relatedPages;
}