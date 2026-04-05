interface PageMetadata {
  title: string;
  description: string;
}

const APP_NAME = 'FinanceIQ';
const DEFAULT_IMAGE = '/favicon.svg';

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let meta = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement('meta');
    document.head.appendChild(meta);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    meta?.setAttribute(key, value);
  });
}

export function setPageMetadata({ title, description }: PageMetadata) {
  document.title = `${title} - ${APP_NAME}`;

  upsertMeta('meta[name="description"]', {
    name: 'description',
    content: description,
  });

  upsertMeta('meta[property="og:title"]', {
    property: 'og:title',
    content: `${title} - ${APP_NAME}`,
  });

  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: description,
  });

  upsertMeta('meta[property="og:image"]', {
    property: 'og:image',
    content: DEFAULT_IMAGE,
  });

  upsertMeta('meta[name="twitter:title"]', {
    name: 'twitter:title',
    content: `${title} - ${APP_NAME}`,
  });

  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: description,
  });

  upsertMeta('meta[name="twitter:image"]', {
    name: 'twitter:image',
    content: DEFAULT_IMAGE,
  });
}
