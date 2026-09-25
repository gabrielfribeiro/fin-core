import type { B3Asset } from '../types/finance';
import { updateB3Asset } from './firebase';

const BRAPI_TOKEN = import.meta.env.VITE_BRAPI_TOKEN || '';

export interface MarketQuoteResult {
  ticker: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  logoUrl?: string;
  name?: string;
  updatedAt: string;
}

/**
 * Fetch live quote for a single B3 ticker via Brapi API
 */
export async function fetchSingleB3Quote(ticker: string): Promise<MarketQuoteResult | null> {
  const cleanTicker = ticker.trim().toUpperCase();
  if (!cleanTicker) return null;

  const url = `https://brapi.dev/api/quote/${cleanTicker}?token=${BRAPI_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Brapi] Erro ao buscar ${cleanTicker}: HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data.error || !data.results || data.results.length === 0) {
      console.warn(`[Brapi] Resposta sem resultados para ${cleanTicker}:`, data.message);
      return null;
    }

    const item = data.results[0];
    return {
      ticker: cleanTicker,
      currentPrice: typeof item.regularMarketPrice === 'number' ? item.regularMarketPrice : 0,
      change: typeof item.regularMarketChange === 'number' ? item.regularMarketChange : 0,
      changePercent: typeof item.regularMarketChangePercent === 'number' ? item.regularMarketChangePercent : 0,
      logoUrl: item.logourl || undefined,
      name: item.longName || item.shortName || undefined,
      updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  } catch (err) {
    console.warn(`[Brapi] Falha na requisição de ${cleanTicker}:`, err);
    return null;
  }
}

/**
 * Fetch live quotes for multiple tickers sequentially with spacing to respect free tier rate limit
 */
export async function fetchMultipleB3Quotes(
  tickers: string[],
  onProgress?: (current: number, total: number, lastTicker: string) => void
): Promise<Record<string, MarketQuoteResult>> {
  const results: Record<string, MarketQuoteResult> = {};
  const total = tickers.length;

  for (let i = 0; i < total; i++) {
    const ticker = tickers[i];
    if (onProgress) {
      onProgress(i + 1, total, ticker);
    }

    const quote = await fetchSingleB3Quote(ticker);
    if (quote && quote.currentPrice > 0) {
      results[ticker] = quote;
    }

    // Small delay between requests to ensure clean rate limit on free plan
    if (i < total - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * Update all portfolio assets with live market data and sync each to Cloud Firestore
 */
export async function updatePortfolioWithLiveQuotes(
  assets: B3Asset[],
  onProgress?: (current: number, total: number, lastTicker: string) => void
): Promise<{ updatedAssets: B3Asset[]; updatedCount: number }> {
  const tickers = assets.map(a => a.ticker);
  const quotes = await fetchMultipleB3Quotes(tickers, onProgress);

  let updatedCount = 0;
  const updatedAssets = await Promise.all(
    assets.map(async (asset) => {
      const live = quotes[asset.ticker];
      if (live && live.currentPrice > 0) {
        updatedCount++;
        const updated: B3Asset = {
          ...asset,
          currentPrice: live.currentPrice,
          change: live.change,
          changePercent: live.changePercent,
          logoUrl: live.logoUrl || asset.logoUrl,
          updatedAt: live.updatedAt
        };

        // Persist to Cloud Firestore
        try {
          await updateB3Asset(updated);
        } catch (e) {
          console.warn(`[Firestore] Erro ao sincronizar ativo ${asset.ticker}:`, e);
        }

        return updated;
      }
      return asset;
    })
  );

  return { updatedAssets, updatedCount };
}
