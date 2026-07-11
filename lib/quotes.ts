import { quotesLokal } from "./quotes-local";

export interface Quote {
  content: string;
  author: string;
}

function getRandomLocalQuote(): Quote {
  const idx = Math.floor(Math.random() * quotesLokal.length);
  return quotesLokal[idx];
}

export async function getRandomQuote(): Promise<Quote> {
  // Try API eksternal (Quotable.io — mendukung bahasa Indonesia)
  try {
    const res = await fetch(
      "https://api.quotable.io/quotes/random?limit=1&language=id",
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { content: data[0].content, author: data[0].author };
      }
    }
  } catch {
    // API down atau timeout
  }

  // Fallback: quotes lokal bahasa Indonesia
  return getRandomLocalQuote();
}
