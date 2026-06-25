import type { Lang } from '../i18n/types';
import { useTranslation } from '../i18n/useTranslation';

const OPTIONS: Lang[] = ['fr', 'en'];

/** Contrôle segmenté FR | EN, branché directement sur le LanguageContext. */
export default function LanguageToggle() {
  const { lang, setLang, t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('a11y.language')}
      className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-sm font-medium shadow-sm"
    >
      {OPTIONS.map((option) => {
        const active = option === lang;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(option)}
            className={
              'rounded-md px-2.5 py-1 uppercase tracking-wide transition-colors ' +
              (active
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900')
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
