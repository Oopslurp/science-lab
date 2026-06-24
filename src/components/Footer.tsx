import { useTranslation } from '../i18n/useTranslation';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-slate-500">{t('footer.tagline')}</p>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {t('footer.level')}
        </p>
      </div>
    </footer>
  );
}
