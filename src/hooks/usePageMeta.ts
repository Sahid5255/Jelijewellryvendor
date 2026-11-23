import { useEffect } from 'react';

const SUFFIX = 'Jeli Jewellery Vendor';

/** Sets the document title and meta description for the current page (SEO). */
export function usePageMeta(title: string | null, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${SUFFIX}` : `${SUFFIX} — Elegance in Every Detail`;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, [title, description]);
}
