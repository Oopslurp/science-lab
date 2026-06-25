import type { ReactNode } from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface SimulationSectionProps {
  id: string;
  eyebrow: string; // libellé de catégorie (ex. « Physique »)
  title: string;
  description?: string;
  theory: ReactNode;
  controls: ReactNode;
  visualization: ReactNode;
  observe: ReactNode;
  curriculum: ReactNode;
}

interface BlockProps {
  label: string;
  children: ReactNode;
  accent?: boolean;
  className?: string;
}

function Block({ label, children, accent = false, className = '' }: BlockProps) {
  return (
    <div
      className={
        'rounded-xl border p-5 ' +
        (accent ? 'border-accent/30 bg-accent/5' : 'border-slate-200 bg-white') +
        ' ' +
        className
      }
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </h3>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}

/**
 * Gabarit commun à toutes les simulations : garantit une structure visuelle
 * identique (théorie / contrôles / visualisation / quoi observer / curriculum).
 */
export default function SimulationSection({
  id,
  eyebrow,
  title,
  description,
  theory,
  controls,
  visualization,
  observe,
  curriculum,
}: SimulationSectionProps) {
  const { t } = useTranslation();
  return (
    <section id={id} className="scroll-mt-20 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
          ) : null}
        </header>

        <Block label={t('section.theory')}>{theory}</Block>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Block label={t('section.controls')}>{controls}</Block>
          </div>
          <div className="lg:col-span-3">
            <Block label={t('section.visualization')}>{visualization}</Block>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Block label={t('section.observe')}>{observe}</Block>
          <Block label={t('section.curriculum')} accent>
            {curriculum}
          </Block>
        </div>
      </div>
    </section>
  );
}
