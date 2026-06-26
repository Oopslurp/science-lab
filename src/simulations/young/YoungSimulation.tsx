import { useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import { interfringe, intensityProfile, wavelengthToRgb } from './youngMath';
import YoungChart from './YoungChart';
import FringePattern from './FringePattern';

const content = {
  fr: {
    theory: [
      'Deux fentes fines séparées de a, éclairées par une lumière monochromatique de longueur d’onde λ, se comportent comme deux sources qui interfèrent. Sur un écran à distance D, on observe des franges alternativement brillantes et sombres.',
      'L’interfrange i (distance entre deux franges brillantes consécutives) est donnée par la formule du programme : i = λ·D / a. L’intensité le long de l’écran suit I(y) = I₀·cos²(π·a·y / (λ·D)).',
      'La fenêtre observée sur l’écran est fixe : quand i change, c’est le nombre de franges visibles qui change.',
    ],
    observe: [
      'Augmente l’écart a entre les fentes → i diminue, les franges se resserrent.',
      'Augmente λ → i augmente (franges plus espacées) et la couleur affichée change.',
      'Augmente la distance D à l’écran → i augmente, les franges s’espacent.',
      'Au centre (y = 0) l’intensité est maximale ; les franges sombres correspondent à I(y) = 0.',
    ],
    curriculum:
      'Spécialité physique-chimie : interférences de deux ondes lumineuses, et expression (donnée par le programme) de l’interfrange i = λ·D / a.',
    labels: { lambda: 'Longueur d’onde λ', a: 'Écart des fentes a', d: 'Distance à l’écran D' },
    stats: { i: 'Interfrange i', lambda: 'Longueur d’onde' },
    chart: { y: 'Position y (mm)', intensity: 'Intensité' },
    ariaChart: 'Courbe d’intensité lumineuse le long de l’écran.',
    ariaBand: 'Motif de franges d’interférence, coloré selon la longueur d’onde.',
  },
  en: {
    theory: [
      'Two thin slits separated by a, lit by monochromatic light of wavelength λ, act as two interfering sources. On a screen at distance D, alternating bright and dark fringes appear.',
      'The fringe spacing i (distance between two consecutive bright fringes) is given by the syllabus formula: i = λ·D / a. The intensity along the screen follows I(y) = I₀·cos²(π·a·y / (λ·D)).',
      'The observed window on the screen is fixed: when i changes, it is the number of visible fringes that changes.',
    ],
    observe: [
      'Increase the slit spacing a → i decreases, the fringes get closer together.',
      'Increase λ → i increases (wider fringes) and the displayed colour changes.',
      'Increase the screen distance D → i increases, the fringes spread out.',
      'At the centre (y = 0) the intensity is maximal; dark fringes correspond to I(y) = 0.',
    ],
    curriculum:
      'Specialty physics-chemistry: interference of two light waves, and the (given) expression of the fringe spacing i = λ·D / a.',
    labels: { lambda: 'Wavelength λ', a: 'Slit spacing a', d: 'Screen distance D' },
    stats: { i: 'Fringe spacing i', lambda: 'Wavelength' },
    chart: { y: 'Position y (mm)', intensity: 'Intensity' },
    ariaChart: 'Light-intensity curve along the screen.',
    ariaBand: 'Interference fringe pattern, coloured according to wavelength.',
  },
} as const;

export default function YoungSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [lambda, setLambda] = useState(550); // nm
  const [a, setA] = useState(0.5); // mm
  const [d, setD] = useState(2); // m

  const profile = intensityProfile(lambda, d, a);
  const rgb = wavelengthToRgb(lambda);
  const cssColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const iMm = interfringe(lambda, d, a) * 1000;

  return (
    <SimulationSection
      id={meta.id}
      eyebrow={eyebrow}
      title={pick(meta.title, lang)}
      description={pick(meta.description, lang)}
      theory={
        <div className="space-y-3">
          {c.theory.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      }
      controls={
        <div className="space-y-5">
          <Slider
            label={c.labels.lambda}
            value={lambda}
            min={400}
            max={700}
            step={5}
            onChange={setLambda}
            unit="nm"
          />
          <Slider
            label={c.labels.a}
            value={a}
            min={0.1}
            max={1}
            step={0.05}
            onChange={setA}
            format={(v) => v.toFixed(2)}
            unit="mm"
          />
          <Slider
            label={c.labels.d}
            value={d}
            min={1}
            max={5}
            step={0.5}
            onChange={setD}
            format={(v) => v.toFixed(1)}
            unit="m"
          />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <FringePattern profile={profile} rgb={rgb} ariaLabel={c.ariaBand} />
          <YoungChart data={profile} color={cssColor} labels={c.chart} ariaLabel={c.ariaChart} />
          <StatList
            columns={2}
            items={[
              { label: c.stats.i, value: `${iMm.toFixed(2)} mm`, emphasize: true },
              { label: c.stats.lambda, value: `${lambda} nm` },
            ]}
          />
        </div>
      }
      observe={
        <ul className="list-disc space-y-2 pl-5 marker:text-accent">
          {c.observe.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      }
      curriculum={<p>{c.curriculum}</p>}
    />
  );
}
