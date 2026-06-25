import { useEffect, useMemo, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import PlaybackControls from '../../components/ui/PlaybackControls';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  equivalenceVolume,
  pHAt,
  regionAt,
  titrationCurve,
  type Region,
  type TitrationParams,
} from './titrationMath';
import TitrationChart from './TitrationChart';
import SolutionBeaker from './SolutionBeaker';

const content = {
  fr: {
    theory: [
      "Un titrage acide fort–base forte (ici HCl titré par NaOH) repose sur la réaction H⁺ + OH⁻ → H₂O. On verse progressivement la base et on suit le pH du mélange.",
      'Le calcul change de nature selon la zone (solution aqueuse à 25 °C, Kw = 10⁻¹⁴) : avant l’équivalence on a un excès d’acide, à l’équivalence Ca·Va = Cb·Vb (le sel NaCl est neutre, pH = 7), après l’équivalence un excès de base.',
      'Le volume de base à verser pour atteindre l’équivalence vaut Ve = Ca·Va / Cb. Le saut de pH brutal autour de Ve permet de repérer précisément l’équivalence.',
    ],
    observe: [
      'Le pH part bas (acide), monte lentement, puis fait un saut brutal autour de l’équivalence où il vaut exactement 7 (point vert).',
      'Le point d’équivalence se déplace si tu changes Ca, Va ou Cb : Ve = Ca·Va / Cb.',
      'Plus les solutions sont concentrées, plus le saut de pH à l’équivalence est marqué.',
      'La couleur du bécher (indicateur universel) passe du rouge (acide) au vert (neutre) puis au violet (basique).',
    ],
    curriculum:
      'Terminale spécialité physique-chimie : titrage acide fort–base forte, suivi pH-métrique, repérage du point d’équivalence et relation à l’équivalence Ca·Va = Cb·Vb (Ve = Ca·Va / Cb).',
    chartAria: 'Courbe du pH en fonction du volume de titrant versé.',
    beakerAria: 'Bécher, solution à pH',
    labels: {
      ca: "Concentration de l'acide Ca",
      cb: 'Concentration de la base Cb',
      va: "Volume initial d'acide Va",
      vb: 'Volume de titrant versé V',
    },
    buttons: { play: '▶ Verser', pause: '❚❚ Pause', reset: '↺ Réinitialiser' },
    stats: {
      ve: 'Volume équivalent Ve',
      vb: 'Volume versé V',
      ph: 'pH actuel',
      region: 'Zone',
    },
    regions: {
      before: 'avant équivalence',
      at: 'à l’équivalence',
      after: 'après équivalence',
    } as Record<Region, string>,
    chart: { volume: 'V (mL)', ph: 'pH', equivalence: 'Équivalence' },
  },
  en: {
    theory: [
      'A strong acid–strong base titration (here HCl titrated by NaOH) relies on the reaction H⁺ + OH⁻ → H₂O. Base is added gradually while the pH of the mixture is tracked.',
      'The calculation changes by region (aqueous solution at 25 °C, Kw = 10⁻¹⁴): before equivalence there is excess acid, at equivalence Ca·Va = Cb·Vb (the salt NaCl is neutral, pH = 7), after equivalence there is excess base.',
      'The base volume needed to reach equivalence is Ve = Ca·Va / Cb. The sharp pH jump around Ve pinpoints the equivalence.',
    ],
    observe: [
      'pH starts low (acidic), rises slowly, then jumps sharply around equivalence where it is exactly 7 (green point).',
      'The equivalence point shifts if you change Ca, Va or Cb: Ve = Ca·Va / Cb.',
      'The more concentrated the solutions, the sharper the pH jump at equivalence.',
      'The beaker colour (universal indicator) goes from red (acid) to green (neutral) to violet (basic).',
    ],
    curriculum:
      'Final-year specialty physics-chemistry: strong acid–strong base titration, pH monitoring, locating the equivalence point and the equivalence relation Ca·Va = Cb·Vb (Ve = Ca·Va / Cb).',
    chartAria: 'pH curve as a function of the added titrant volume.',
    beakerAria: 'Beaker, solution at pH',
    labels: {
      ca: 'Acid concentration Ca',
      cb: 'Base concentration Cb',
      va: 'Initial acid volume Va',
      vb: 'Added titrant volume V',
    },
    buttons: { play: '▶ Pour', pause: '❚❚ Pause', reset: '↺ Reset' },
    stats: {
      ve: 'Equivalence volume Ve',
      vb: 'Added volume V',
      ph: 'Current pH',
      region: 'Region',
    },
    regions: {
      before: 'before equivalence',
      at: 'at equivalence',
      after: 'after equivalence',
    } as Record<Region, string>,
    chart: { volume: 'V (mL)', ph: 'pH', equivalence: 'Equivalence' },
  },
} as const;

export default function TitrationSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [ca, setCa] = useState(0.1);
  const [cb, setCb] = useState(0.1);
  const [va, setVa] = useState(20);
  const [rawVb, setRawVb] = useState(0);
  const [playing, setPlaying] = useState(false);

  const params: TitrationParams = { ca, cb, va };
  const ve = equivalenceVolume(params);
  const vMax = 2 * ve; // équivalence centrée sur le graphe
  const vb = Math.min(rawVb, vMax);

  // Animation : verse le titrant (parcourt vMax en ~10 s).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setRawVb((prev) => {
        const next = prev + dt * (vMax / 10);
        if (next >= vMax) {
          setPlaying(false);
          return vMax;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, vMax]);

  const curve = useMemo(() => titrationCurve(params, vMax), [ca, cb, va, vMax]);

  const ph = pHAt(params, vb);
  const region = regionAt(params, vb);
  const fill = (va + vb) / (va + vMax);

  const togglePlay = () => {
    if (!playing && rawVb >= vMax) setRawVb(0);
    setPlaying((p) => !p);
  };
  const reset = () => {
    setPlaying(false);
    setRawVb(0);
  };

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
            label={c.labels.ca}
            value={ca}
            min={0.01}
            max={1}
            step={0.01}
            onChange={setCa}
            format={(v) => v.toFixed(2)}
            unit="mol/L"
          />
          <Slider
            label={c.labels.cb}
            value={cb}
            min={0.01}
            max={1}
            step={0.01}
            onChange={setCb}
            format={(v) => v.toFixed(2)}
            unit="mol/L"
          />
          <Slider
            label={c.labels.va}
            value={va}
            min={5}
            max={100}
            step={5}
            onChange={setVa}
            unit="mL"
          />
          <Slider
            label={c.labels.vb}
            value={vb}
            min={0}
            max={vMax}
            step={vMax / 240}
            onChange={(v) => {
              setPlaying(false);
              setRawVb(v);
            }}
            format={(v) => v.toFixed(1)}
            unit="mL"
          />
          <PlaybackControls
            playing={playing}
            onToggle={togglePlay}
            onReset={reset}
            labels={c.buttons}
          />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <TitrationChart
            data={curve}
            ve={ve}
            currentV={vb}
            vMax={vMax}
            labels={c.chart}
            ariaLabel={c.chartAria}
          />

          <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
            <div className="flex justify-center">
              <SolutionBeaker pH={ph} fill={fill} ariaLabel={`${c.beakerAria} ${ph.toFixed(1)}`} />
            </div>
            <StatList
              columns={2}
              items={[
                { label: c.stats.ve, value: `${ve.toFixed(1)} mL` },
                { label: c.stats.vb, value: `${vb.toFixed(1)} mL` },
                { label: c.stats.ph, value: ph.toFixed(2), emphasize: true },
                { label: c.stats.region, value: c.regions[region] },
              ]}
            />
          </div>
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
