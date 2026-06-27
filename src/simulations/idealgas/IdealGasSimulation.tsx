import { useEffect, useRef, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import { particleCount, pressure, relativeSpeed, toBar } from './idealGasMath';
import ParticleBox, { type Particle } from './ParticleBox';

// Bornes des curseurs (partagées avec la mise à l'échelle de la boîte).
const VOL_MIN_L = 5;
const VOL_MAX_L = 50;
// Côté de la boîte (px) : proportionnel au volume, entre ces bornes lisibles.
const BOX_MIN_PX = 130;
const BOX_MAX_PX = 320;
// Cadence d'agitation à T_REF (unités normalisées/s) — facteur de mise en scène.
const SPEED_REF = 0.6;

interface MovingParticle extends Particle {
  vx: number; // direction unitaire
  vy: number;
}

function makeParticle(): MovingParticle {
  const a = Math.random() * 2 * Math.PI;
  return {
    x: 0.1 + Math.random() * 0.8,
    y: 0.1 + Math.random() * 0.8,
    vx: Math.cos(a),
    vy: Math.sin(a),
  };
}

function createParticles(count: number): MovingParticle[] {
  return Array.from({ length: count }, makeParticle);
}

const content = {
  fr: {
    theory: [
      'Un gaz parfait suit l’équation d’état P·V = n·R·T, soit P = n·R·T / V, avec R = 8,314 J·mol⁻¹·K⁻¹. T est en kelvin, V en m³ (réglé ici en litres, converti par V_m³ = V_L / 1000), n en moles et P en pascals (aussi affichée en bar, 1 bar = 100 000 Pa).',
      'La boîte montre un nombre de particules PROPORTIONNEL à n (≈ 20 par mole ici, plafonné pour rester lisible) : une mise en scène très réduite — chaque point représente en réalité un nombre gigantesque d’entités (une mole ≈ 6·10²³, impossible à dessiner). Augmenter n ajoute des particules, ce qui illustre pourquoi plus de matière = plus de chocs sur les parois = plus de pression. Leur vitesse est prise ∝ √T pour figurer l’agitation thermique (pas un calcul cinétique exact), et on néglige les collisions entre particules.',
      'Le modèle néglige le volume propre des molécules et les interactions entre elles : il décrit bien un gaz dilué, moins bien un gaz très comprimé ou proche de la liquéfaction.',
    ],
    observe: [
      'Comprime le volume (V plus petit) à T fixe : la boîte rétrécit, les particules se regroupent et la pression augmente (P ∝ 1/V).',
      'Chauffe (T plus grand) à V fixe : les particules s’agitent visiblement plus vite et la pression augmente (P ∝ T).',
      'Augmente n (plus de matière) à T et V fixes : il y a davantage de particules dans la boîte et la pression augmente proportionnellement (P ∝ n).',
    ],
    curriculum:
      'Terminale spécialité physique-chimie : équation d’état du gaz parfait P·V = n·R·T, lien qualitatif entre grandeurs macroscopiques (P, V, T) et agitation microscopique, et limites du modèle (volume propre des molécules et interactions négligés).',
    labels: { t: 'Température T', v: 'Volume V', n: 'Quantité de matière n' },
    stats: { bar: 'Pression P', pa: 'Pression P', vm3: 'Volume V', drawn: 'Particules dessinées' },
    aria: 'Boîte de gaz : particules en mouvement rebondissant sur les parois.',
  },
  en: {
    theory: [
      'An ideal gas obeys the equation of state P·V = n·R·T, i.e. P = n·R·T / V, with R = 8.314 J·mol⁻¹·K⁻¹. T is in kelvin, V in m³ (set here in litres, converted by V_m³ = V_L / 1000), n in moles and P in pascals (also shown in bar, 1 bar = 100,000 Pa).',
      'The box shows a number of particles PROPORTIONAL to n (≈ 20 per mole here, capped for readability): a heavily reduced staging — each point actually stands for a gigantic number of entities (a mole ≈ 6·10²³, impossible to draw). Increasing n adds particles, illustrating why more matter = more wall impacts = more pressure. Their speed is taken ∝ √T to depict thermal agitation (not an exact kinetic calculation), and particle–particle collisions are neglected.',
      'The model neglects the molecules’ own volume and their interactions: it describes a dilute gas well, a strongly compressed gas or one near liquefaction less so.',
    ],
    observe: [
      'Compress the volume (smaller V) at fixed T: the box shrinks, particles crowd together and pressure rises (P ∝ 1/V).',
      'Heat it up (larger T) at fixed V: particles visibly move faster and pressure rises (P ∝ T).',
      'Increase n (more matter) at fixed T and V: more particles fill the box and pressure rises proportionally (P ∝ n).',
    ],
    curriculum:
      'Final-year specialty physics-chemistry: ideal-gas equation of state P·V = n·R·T, qualitative link between macroscopic quantities (P, V, T) and microscopic agitation, and the model’s limits (molecules’ own volume and interactions neglected).',
    labels: { t: 'Temperature T', v: 'Volume V', n: 'Amount of substance n' },
    stats: { bar: 'Pressure P', pa: 'Pressure P', vm3: 'Volume V', drawn: 'Particles drawn' },
    aria: 'Gas box: particles moving and bouncing off the walls.',
  },
} as const;

export default function IdealGasSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [temp, setTemp] = useState(300);
  const [vol, setVol] = useState(20);
  const [n, setN] = useState(1);

  // Particules persistantes (créées une fois) + snapshot de rendu par frame.
  const count = particleCount(n); // nombre de particules ∝ n

  const particlesRef = useRef<MovingParticle[] | null>(null);
  if (!particlesRef.current) particlesRef.current = createParticles(count);
  const [frame, setFrame] = useState<Particle[]>(() =>
    particlesRef.current!.map((p) => ({ x: p.x, y: p.y }))
  );

  // T lue par la boucle sans la relancer (la vitesse en dépend).
  const tempRef = useRef(temp);
  tempRef.current = temp;

  // Ajuste le nombre de particules quand n change (ajoute / retire sans tout recréer).
  useEffect(() => {
    const ps = particlesRef.current!;
    if (count > ps.length) {
      while (ps.length < count) ps.push(makeParticle());
    } else if (count < ps.length) {
      ps.length = count;
    }
    setFrame(ps.map((p) => ({ x: p.x, y: p.y })));
  }, [count]);

  // Animation continue (le gaz est toujours agité).
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // plafond anti-saut au retour d'onglet
      last = now;
      const speed = SPEED_REF * relativeSpeed(tempRef.current);
      const ps = particlesRef.current!;
      for (const p of ps) {
        p.x += p.vx * speed * dt;
        p.y += p.vy * speed * dt;
        // Réflexion élastique sur les parois (composante normale inversée).
        if (p.x < 0) {
          p.x = -p.x;
          p.vx = -p.vx;
        } else if (p.x > 1) {
          p.x = 2 - p.x;
          p.vx = -p.vx;
        }
        if (p.y < 0) {
          p.y = -p.y;
          p.vy = -p.vy;
        } else if (p.y > 1) {
          p.y = 2 - p.y;
          p.vy = -p.vy;
        }
      }
      setFrame(ps.map((p) => ({ x: p.x, y: p.y })));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const boxPx =
    BOX_MIN_PX + ((vol - VOL_MIN_L) / (VOL_MAX_L - VOL_MIN_L)) * (BOX_MAX_PX - BOX_MIN_PX);
  const p = pressure(n, temp, vol);
  const bar = toBar(p);
  const paText = `${Math.round(p).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} Pa`;

  return (
    <SimulationSection
      id={meta.id}
      eyebrow={eyebrow}
      title={pick(meta.title, lang)}
      description={pick(meta.description, lang)}
      theory={
        <div className="space-y-3">
          <p>{c.theory[0]}</p>
          <p className="py-1 text-center text-[15px] text-slate-900">P = n·R·T / V</p>
          <p>{c.theory[1]}</p>
          <p>{c.theory[2]}</p>
        </div>
      }
      controls={
        <div className="space-y-5">
          <Slider
            label={c.labels.t}
            value={temp}
            min={100}
            max={1000}
            step={10}
            onChange={setTemp}
            unit="K"
          />
          <Slider
            label={c.labels.v}
            value={vol}
            min={VOL_MIN_L}
            max={VOL_MAX_L}
            step={1}
            onChange={setVol}
            unit="L"
          />
          <Slider
            label={c.labels.n}
            value={n}
            min={0.1}
            max={5}
            step={0.1}
            onChange={setN}
            format={(v) => v.toFixed(1)}
            unit="mol"
          />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <ParticleBox particles={frame} boxPx={boxPx} ariaLabel={c.aria} />

          <StatList
            columns={4}
            items={[
              { label: c.stats.bar, value: `${bar.toFixed(2)} bar`, emphasize: true },
              { label: c.stats.pa, value: paText },
              { label: c.stats.vm3, value: `${(vol / 1000).toFixed(3)} m³` },
              { label: c.stats.drawn, value: `${count}` },
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
