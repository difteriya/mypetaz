export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export const APP_URL = process.env.APP_URL ?? 'https://mypet.az';
