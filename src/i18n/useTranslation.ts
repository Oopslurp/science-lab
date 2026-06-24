import { useLanguage } from './LanguageContext';
import { translations, type TranslationKey } from './translations';

/**
 * Hook d'accès aux textes traduits.
 * Retourne `t(clé)` pour la langue active, plus `lang`/`setLang` pour les composants
 * qui en ont besoin (toggle, ou logique dépendant de la langue dans une simulation).
 */
export function useTranslation() {
  const { lang, setLang } = useLanguage();
  const t = (key: TranslationKey): string => translations[lang][key];
  return { t, lang, setLang };
}
