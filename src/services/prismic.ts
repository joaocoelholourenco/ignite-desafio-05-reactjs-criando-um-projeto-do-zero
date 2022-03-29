import * as prismic from '@prismicio/client';
import { Client } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';

export function getPrismicClient(req?: unknown): Client {
  const client = prismic.createClient(process.env.PRISMIC_API_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  enableAutoPreviews({
    client,
    req,
  });

  return client;
}
