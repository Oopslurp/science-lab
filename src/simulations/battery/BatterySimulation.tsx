import { useEffect, useMemo, useRef, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import PlaybackControls from '../../components/ui/PlaybackControls';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  CELLS,
  FARADAY_CONSTANT,
  dischargeCurve,
  dischargeVoltage,
  lifetime,
  maxCharge,
} from './batteryMath';
import DischargeChart from './DischargeChart';
import BatteryGauge from './BatteryGauge';

// Vitesse d'animation PROPORTIONNELLE à la durée de vie réelle t = Q_max / I
// (bornée) : une pile qui dure longtemps se décharge lentement à l'écran, une pile
// vite usée se vide vite. La vraie durée reste affichée en statistique.
const REAL_SECONDS_PER_VISUAL_SECOND = 8000; // échelle temps réel → temps visuel
const MIN_VISUAL_SECONDS = 4;
const MAX_VISUAL_SECONDS = 28;

const content = {
  fr: {
    theory: [
      'Une pile transforme une réaction d’oxydoréduction spontanée en courant électrique. À l’anode (pôle −) a lieu l’oxydation, à la cathode (pôle +) la réduction ; les électrons circulent dans le circuit extérieur.',
      'La charge totale que la pile peut débiter est fixée par la quantité de réactif limitant : Q_max = n₀·z·F, où n₀ est la quantité de matière (mol), z le nombre d’électrons échangés et F = 96485 C/mol la constante de Faraday. À courant constant I, la pile dure t = Q_max / I.',
      'La tension reste proche de la f.é.m. pendant presque toute la décharge (plateau), puis chute brutalement quand le réactif est épuisé (état de charge → 0). On exprime souvent la capacité en mAh (1 mAh = 3,6 C). L’énergie stockée vaut E ≈ Q_max·U : à charge égale, une pile de plus haute f.é.m. délivre plus d’énergie — c’est tout l’intérêt de changer de couple.',
    ],
    observe: [
      'Fais glisser la décharge (ou lance la lecture) : la jauge se vide, la tension tient un plateau puis s’effondre en toute fin.',
      'Augmente n₀ : Q_max et la capacité (mAh) augmentent proportionnellement — la pile dure plus longtemps à courant égal.',
      'Augmente le courant I : Q_max ne change pas, mais la durée de vie t = Q_max / I diminue.',
      'Change de pile : à n₀ et I fixés, la charge Q_max et la durée de vie ne bougent pas (z = 2 partout), mais la f.é.m. — donc l’énergie E ≈ Q·U — change : voilà l’intérêt du couple choisi.',
    ],
    curriculum:
      'Terminale spécialité physique-chimie : pile, oxydoréduction, quantité d’électricité Q = I·Δt = n·z·F, capacité et durée de vie d’une pile, et notion de réactif limitant.',
    labels: { cell: 'Pile', n0: 'Réactif limitant n₀', current: 'Courant débité I', discharge: 'Décharge' },
    buttons: { play: '▶ Décharger', pause: '❚❚ Pause', reset: '↺ Réinitialiser' },
    stats: {
      emf: 'f.é.m.',
      qmax: 'Charge max Q_max',
      capacity: 'Capacité',
      energy: 'Énergie E ≈ Q·U',
      life: 'Durée de vie t',
      u: 'Tension U',
      soc: 'État de charge',
    },
    chartAria: 'Courbe de la tension de la pile en fonction de la charge délivrée.',
    gaugeAria: 'Jauge de la pile : niveau de charge et tension.',
    duration: { s: 's', min: 'min', h: 'h', d: 'j' },
  },
  en: {
    theory: [
      'A cell turns a spontaneous redox reaction into an electric current. Oxidation occurs at the anode (− terminal), reduction at the cathode (+ terminal); electrons flow through the external circuit.',
      'The total charge the cell can deliver is set by the limiting reactant: Q_max = n₀·z·F, where n₀ is the amount of substance (mol), z the number of electrons exchanged and F = 96485 C/mol the Faraday constant. At constant current I, the cell lasts t = Q_max / I.',
      'The voltage stays close to the e.m.f. through most of the discharge (plateau), then drops sharply once the reactant runs out (state of charge → 0). Capacity is often given in mAh (1 mAh = 3.6 C). The stored energy is E ≈ Q_max·U: for the same charge, a higher-e.m.f. cell delivers more energy — that is the whole point of switching couple.',
    ],
    observe: [
      'Drag the discharge (or press play): the gauge empties, the voltage holds a plateau then collapses right at the end.',
      'Increase n₀: Q_max and the capacity (mAh) grow proportionally — the cell lasts longer at the same current.',
      'Increase the current I: Q_max is unchanged, but the lifetime t = Q_max / I shrinks.',
      'Switch cell: at fixed n₀ and I, the charge Q_max and the lifetime do not change (z = 2 for all), but the e.m.f. — hence the energy E ≈ Q·U — does: that is the point of the chosen couple.',
    ],
    curriculum:
      'Final-year specialty physics-chemistry: cell, redox, quantity of electricity Q = I·Δt = n·z·F, capacity and lifetime of a cell, and the notion of limiting reactant.',
    labels: { cell: 'Cell', n0: 'Limiting reactant n₀', current: 'Current drawn I', discharge: 'Discharge' },
    buttons: { play: '▶ Discharge', pause: '❚❚ Pause', reset: '↺ Reset' },
    stats: {
      emf: 'e.m.f.',
      qmax: 'Max charge Q_max',
      capacity: 'Capacity',
      energy: 'Energy E ≈ Q·U',
      life: 'Lifetime t',
      u: 'Voltage U',
      soc: 'State of charge',
    },
    chartAria: 'Cell voltage curve as a function of the delivered charge.',
    gaugeAria: 'Cell gauge: charge level and voltage.',
    duration: { s: 's', min: 'min', h: 'h', d: 'd' },
  },
} as const;

function formatDuration(seconds: number, u: { s: string; min: string; h: string; d: string }): string {
  if (!Number.isFinite(seconds)) return '∞';
  if (seconds < 60) return `${seconds.toFixed(0)} ${u.s}`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} ${u.min}`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} ${u.h}`;
  return `${(seconds / 86400).toFixed(1)} ${u.d}`;
}

function formatEnergy(joules: number): string {
  if (!Number.isFinite(joules)) return '—';
  return joules >= 1000 ? `${(joules / 1000).toFixed(1)} kJ` : `${joules.toFixed(0)} J`;
}

export default function BatterySimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [cellId, setCellId] = useState(CELLS[0].id);
  const [n0, setN0] = useState(0.1);
  const [currentMA, setCurrentMA] = useState(200);
  const [p, setP] = useState(0); // fraction déchargée ∈ [0, 1]
  const [playing, setPlaying] = useState(false);

  const cell = CELLS.find((x) => x.id === cellId) ?? CELLS[0];
  const qMax = maxCharge(n0, cell.z);
  const curve = useMemo(() => dischargeCurve(cell.emf, qMax), [cell.emf, qMax]);

  const soc = 1 - p;
  const qNow = p * qMax;
  const uNow = dischargeVoltage(cell.emf, soc);
  const capacityMah = qMax / 3.6;
  const tMax = lifetime(qMax, currentMA / 1000); // I en A
  const energyJ = qMax * cell.emf; // énergie délivrable ≈ Q_max·U (plateau)

  // Vitesse d'animation ∝ durée de vie réelle (bornée) ; lue via ref pour ne pas
  // relancer la boucle à chaque réglage de n₀ ou I.
  const visualDuration = Number.isFinite(tMax)
    ? Math.max(MIN_VISUAL_SECONDS, Math.min(MAX_VISUAL_SECONDS, tMax / REAL_SECONDS_PER_VISUAL_SECOND))
    : MAX_VISUAL_SECONDS;
  const rateRef = useRef(1 / visualDuration);
  rateRef.current = 1 / visualDuration;

  // Décharge animée : avance la fraction p sur DISCHARGE_VISUAL_SECONDS.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // plafond anti-saut au retour d'onglet
      last = now;
      setP((prev) => Math.min(1, prev + dt * rateRef.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Arrêt en fin de décharge.
  useEffect(() => {
    if (playing && p >= 1) setPlaying(false);
  }, [playing, p]);

  const togglePlay = () => {
    if (!playing && p >= 1) setP(0); // relance depuis le plein
    setPlaying((prev) => !prev);
  };
  const reset = () => {
    setPlaying(false);
    setP(0);
  };

  return (
    <SimulationSection
      id={meta.id}
      eyebrow={eyebrow}
      title={pick(meta.title, lang)}
      description={pick(meta.description, lang)}
      theory={
        <div className="space-y-3">
          {c.theory.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      }
      controls={
        <div className="space-y-5">
          {/* Sélecteur de pile */}
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{c.labels.cell}</span>
            <div className="flex flex-wrap gap-2">
              {CELLS.map((x) => (
                <SegButton key={x.id} active={x.id === cellId} onClick={() => setCellId(x.id)}>
                  {x.anode} / {x.cathode}
                </SegButton>
              ))}
            </div>
          </div>

          <Slider
            label={c.labels.n0}
            value={n0}
            min={0.01}
            max={0.5}
            step={0.01}
            onChange={setN0}
            format={(v) => v.toFixed(2)}
            unit="mol"
          />
          <Slider
            label={c.labels.current}
            value={currentMA}
            min={10}
            max={1000}
            step={10}
            onChange={setCurrentMA}
            unit="mA"
          />
          <Slider
            label={c.labels.discharge}
            value={Math.round(p * 100)}
            min={0}
            max={100}
            step={1}
            onChange={(v) => {
              setPlaying(false);
              setP(v / 100);
            }}
            format={(v) => `${v.toFixed(0)} %`}
          />
          <PlaybackControls playing={playing} onToggle={togglePlay} onReset={reset} labels={c.buttons} />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <div className="flex justify-center">
            <BatteryGauge soc={soc} voltage={uNow} anode={cell.anode} cathode={cell.cathode} ariaLabel={c.gaugeAria} />
          </div>

          <DischargeChart
            data={curve}
            qMax={qMax}
            emf={cell.emf}
            qNow={qNow}
            uNow={uNow}
            labels={{ q: 'Q (C)', u: c.stats.u }}
            ariaLabel={c.chartAria}
          />

          <StatList
            items={[
              { label: c.stats.emf, value: `${cell.emf.toFixed(2)} V` },
              { label: c.stats.qmax, value: `${Math.round(qMax)} C` },
              { label: c.stats.capacity, value: `${Math.round(capacityMah)} mAh` },
              { label: c.stats.energy, value: formatEnergy(energyJ) },
              { label: c.stats.life, value: formatDuration(tMax, c.duration) },
              { label: c.stats.u, value: `${uNow.toFixed(2)} V`, emphasize: true },
              { label: c.stats.soc, value: `${Math.round(soc * 100)} %` },
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
      curriculum={
        <p>
          {c.curriculum} F = {FARADAY_CONSTANT} C/mol.
        </p>
      }
    />
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ' +
        (active
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-300 text-slate-600 hover:bg-slate-100')
      }
    >
      {children}
    </button>
  );
}
