import { getRandomQuote } from "@/lib/quotes";

export async function GET() {
  const quote = await getRandomQuote();
  return Response.json(quote);
}
