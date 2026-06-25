import { useEffect, useState } from 'react';

export type Route = { name: 'gallery' } | { name: 'sim'; id: string };

export const galleryHref = '#/';
export const simHref = (id: string): string => `#/sim/${id}`;

function parse(hash: string): Route {
  const parts = hash.replace(/^#/, '').split('/').filter(Boolean);
  if (parts[0] === 'sim' && parts[1]) {
    return { name: 'sim', id: decodeURIComponent(parts[1]) };
  }
  return { name: 'gallery' };
}

/** Mini-routeur basé sur l'URL (#/ = galerie, #/sim/<id> = vue détail). */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
