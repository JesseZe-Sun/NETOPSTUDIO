import { supabase } from './supabase';

let apiKeysCache: Record<string, string> = {};
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function getApiKey(serviceName: string): Promise<string | null> {
  const now = Date.now();

  if (now - lastFetchTime > CACHE_DURATION) {
    await refreshApiKeys();
  }

  return apiKeysCache[serviceName] || null;
}

export async function refreshApiKeys(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('service_name, api_key');

    if (error) {
      console.error('Error fetching API keys:', error);
      return;
    }

    if (data) {
      apiKeysCache = {};
      data.forEach((item) => {
        apiKeysCache[item.service_name] = item.api_key;
      });
      lastFetchTime = Date.now();
    }
  } catch (error) {
    console.error('Error refreshing API keys:', error);
  }
}

export function clearApiKeysCache(): void {
  apiKeysCache = {};
  lastFetchTime = 0;
}
