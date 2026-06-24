import { useTranslation } from '../i18n/useTranslation';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
        {t('hero.eyebrow')}
      </p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        {t('hero.title')}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600 sm:text-xl">
        {t('hero.subtitle')}
      </p>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-500">
        {t('hero.intro')}
      </p>
    </section>
  );
}
