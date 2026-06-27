import { useEffect, useMemo, useRef, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import StatList from '../../components/ui/StatList';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  CHALLENGES,
  getGroup,
  type GroupId,
  type Reaction,
  type ReactionDetail,
  type ReactionFamily,
} from './synthesisData';
import { availableReactions, findBestPath } from './synthesisGraph';
import MoleculeBadge from './MoleculeBadge';
import ReactionOverview from './ReactionOverview';

/** Anime une valeur numérique vers `target` (easeOut), pour le défilé du rendement. */
function useAnimatedNumber(target: number, duration = 450): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  useEffect(() => {
    valueRef.current = value;
  });
  useEffect(() => {
    const from = valueRef.current;
    if (Math.abs(from - target) < 1e-9) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** Puce du fil du chemin : entrée en fondu + léger glissement à son montage. */
function Chip({ label, highlight }: { label: string; highlight: boolean }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <span
      className={
        'inline-block rounded-md px-2 py-0.5 transition-all duration-300 ' +
        (shown ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0') +
        ' ' +
        (highlight ? 'bg-accent/10 font-medium text-accent' : 'bg-slate-100 text-slate-600')
      }
    >
      {label}
    </span>
  );
}

const content = {
  fr: {
    groups: {
      alcohol1: 'Alcool primaire',
      alcohol2: 'Alcool secondaire',
      aldehyde: 'Aldéhyde',
      ketone: 'Cétone',
      carboxylicacid: 'Acide carboxylique',
      ester: 'Ester',
      amide: 'Amide',
      haloalkane: 'Halogénoalcane',
      amine: 'Amine',
      alkene: 'Alcène',
    } as Record<GroupId, string>,
    families: {
      redox: 'Oxydoréduction',
      'acid-base': 'Acide-base',
      substitution: 'Substitution',
      addition: 'Addition',
      elimination: 'Élimination',
    } as Record<ReactionFamily, string>,
    details: {
      mildOxidation: 'oxydation douce',
      oxidation: 'oxydation',
      reduction: 'réduction',
      esterification: 'estérification',
      esterHydrolysis: 'hydrolyse',
      amidification: 'amidification',
      amideHydrolysis: 'hydrolyse',
      nucleophilicSubstitution: 'substitution nucléophile',
      elimination: 'élimination',
      hxAddition: 'addition de HX',
      hydration: 'hydratation',
    } as Record<ReactionDetail, string>,
    ui: {
      challenge: 'Défi',
      here: 'Tu es ici',
      target: 'Cible',
      reactions: 'Réactions possibles',
      cumYield: 'Rendement cumulé',
      steps: 'Étapes',
      stepYield: 'Rendement',
      undo: '↶ Annuler la dernière étape',
      restart: '↺ Recommencer',
      reached: 'Cible atteinte !',
      reachedDetail: (n: number, y: string) => `${n} étape(s) · rendement cumulé ${y}`,
      deadEnd: 'Impasse : aucune réaction ne part d’ici. Annule la dernière étape ou recommence.',
      pathStart: 'Départ',
      startReactant: 'Réactif de départ',
      finalProduct: 'Produit final',
      optimal: 'C’est le meilleur chemin possible 🎉',
      bestLabel: 'Meilleur chemin possible',
      overviewShow: 'Voir la banque de réactions',
      overviewHide: 'Masquer la banque de réactions',
    },
    table: { reaction: 'Réaction', type: 'Type', yield: 'Rendement' },
    theory: [
      'Une synthèse organique transforme un réactif de départ en un produit cible par une suite de réactions, chacune ne modifiant qu’un seul groupe caractéristique (le squelette à 3 carbones, lui, ne change pas). À chaque étape tu choisis une réaction ; le rendement cumulé est le produit des rendements des étapes prises.',
      'Cinq types de réaction sont rencontrés : oxydoréduction (oxydation ou réduction), acide-base, substitution, addition et élimination. Reconnaître le type aide à prévoir le groupe formé.',
      'Optimiser une synthèse, c’est atteindre la cible avec le meilleur rendement possible — donc souvent le moins d’étapes, car chaque étape fait chuter le rendement cumulé. Les rendements affichés sont illustratifs (mise en scène pédagogique), pas des données de laboratoire réelles. À noter aussi : l’estérification et l’amidification consomment un second réactif en excès (un alcool, ou de l’ammoniac/une amine), non suivi ici.',
      'Protection / déprotection (en synthèse réelle, pas dans ce jeu) : lorsqu’une molécule porte plusieurs groupes réactifs, on masque temporairement celui qu’on veut préserver (protection) avant de transformer l’autre, puis on le libère (déprotection). Ici le modèle ne suit qu’un seul groupe à la fois, il n’y a donc jamais de second groupe à protéger — mais c’est une étape clé d’une vraie synthèse.',
      'Une simplification assumée : l’addition de HX sur l’alcène. Le jeu représente chaque famille par une seule structure ; or, d’après la règle de Markovnikov, l’addition de HX sur le propène donne surtout l’halogénoalcane secondaire, pas la structure primaire générique utilisée ici. Un vrai chimiste doit suivre la structure exacte à chaque étape — c’est ce qui rend une vraie synthèse plus complexe que ce parcours simplifié.',
    ],
    observe: [
      'Le rendement global chute vite avec le nombre d’étapes : pour un meilleur rendement, vise le moins d’étapes possible (capacité du programme : justifier l’augmentation du rendement d’une synthèse).',
      'Défi B (alcène → amide) : le tout premier choix conditionne tout le reste — passer par l’halogénoalcane (5 étapes) bat le détour par l’alcool secondaire (6 étapes).',
      'Défi C (cétone → ester) : le détour est chimiquement obligatoire — un alcool secondaire ne s’oxyde pas directement en acide, il faut repasser par un alcool primaire. Ce n’est pas un manque d’imagination, c’est la chimie.',
    ],
    curriculum:
      'Terminale spécialité physique-chimie : élaborer une séquence réactionnelle à partir d’une banque de réactions (capacité explicite), identifier les types de réaction (oxydoréduction, acide-base, substitution, addition, élimination), notion de protection/déprotection, et optimisation du rendement d’une synthèse multi-étapes.',
    aria: {
      card: (family: string, detail: string, to: string, y: string) =>
        `${family}, ${detail}, vers ${to}, rendement ${y}`,
    },
  },
  en: {
    groups: {
      alcohol1: 'Primary alcohol',
      alcohol2: 'Secondary alcohol',
      aldehyde: 'Aldehyde',
      ketone: 'Ketone',
      carboxylicacid: 'Carboxylic acid',
      ester: 'Ester',
      amide: 'Amide',
      haloalkane: 'Haloalkane',
      amine: 'Amine',
      alkene: 'Alkene',
    } as Record<GroupId, string>,
    families: {
      redox: 'Redox',
      'acid-base': 'Acid–base',
      substitution: 'Substitution',
      addition: 'Addition',
      elimination: 'Elimination',
    } as Record<ReactionFamily, string>,
    details: {
      mildOxidation: 'mild oxidation',
      oxidation: 'oxidation',
      reduction: 'reduction',
      esterification: 'esterification',
      esterHydrolysis: 'hydrolysis',
      amidification: 'amidification',
      amideHydrolysis: 'hydrolysis',
      nucleophilicSubstitution: 'nucleophilic substitution',
      elimination: 'elimination',
      hxAddition: 'HX addition',
      hydration: 'hydration',
    } as Record<ReactionDetail, string>,
    ui: {
      challenge: 'Challenge',
      here: 'You are here',
      target: 'Target',
      reactions: 'Possible reactions',
      cumYield: 'Cumulative yield',
      steps: 'Steps',
      stepYield: 'Yield',
      undo: '↶ Undo last step',
      restart: '↺ Restart',
      reached: 'Target reached!',
      reachedDetail: (n: number, y: string) => `${n} step(s) · cumulative yield ${y}`,
      deadEnd: 'Dead end: no reaction leaves from here. Undo the last step or restart.',
      pathStart: 'Start',
      startReactant: 'Starting reactant',
      finalProduct: 'Final product',
      optimal: 'This is the best possible path 🎉',
      bestLabel: 'Best possible path',
      overviewShow: 'Show the reaction bank',
      overviewHide: 'Hide the reaction bank',
    },
    table: { reaction: 'Reaction', type: 'Type', yield: 'Yield' },
    theory: [
      'An organic synthesis turns a starting reactant into a target product through a sequence of reactions, each changing a single functional group (the 3-carbon skeleton itself stays the same). At every step you pick a reaction; the cumulative yield is the product of the yields of the steps taken.',
      'Five reaction types are encountered: redox (oxidation or reduction), acid–base, substitution, addition and elimination. Recognising the type helps predict the group formed.',
      'Optimising a synthesis means reaching the target with the best possible yield — so, often, the fewest steps, since each step lowers the cumulative yield. The yields shown are illustrative (a teaching device), not real laboratory data. Note too that esterification and amidification consume a second reactant in excess (an alcohol, or ammonia/an amine), not tracked here.',
      'Protection / deprotection (in real synthesis, not in this game): when a molecule carries several reactive groups, the one to preserve is temporarily masked (protection) before transforming the other, then freed again (deprotection). Here the model follows a single group at a time, so there is never a second group to protect — but it is a key step of a real synthesis.',
      'An acknowledged simplification: HX addition onto the alkene. The game represents each family by a single structure; yet, by Markovnikov’s rule, adding HX to propene mostly gives the secondary haloalkane, not the generic primary structure used here. A real chemist must follow the exact structure at every step — which is what makes a real synthesis more complex than this simplified route.',
    ],
    observe: [
      'The overall yield drops fast with the number of steps: for a better yield, aim for as few steps as possible (a syllabus skill: justifying the increase of a synthesis yield).',
      'Challenge B (alkene → amide): the very first choice dictates everything else — going through the haloalkane (5 steps) beats the detour via the secondary alcohol (6 steps).',
      'Challenge C (ketone → ester): the detour is chemically mandatory — a secondary alcohol does not oxidise directly to an acid, you must go back through a primary alcohol. Not a lack of imagination, just chemistry.',
    ],
    curriculum:
      'Final-year specialty physics-chemistry: build a reaction sequence from a reaction bank (explicit skill), identify reaction types (redox, acid–base, substitution, addition, elimination), the notion of protection/deprotection, and optimisation of the yield of a multi-step synthesis.',
    aria: {
      card: (family: string, detail: string, to: string, y: string) =>
        `${family}, ${detail}, to ${to}, yield ${y}`,
    },
  },
} as const;

const pctStep = (y: number) => `${Math.round(y * 100)} %`;
const pctCum = (y: number) => `${(y * 100).toFixed(1)} %`;

export default function SynthesisSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [challengeId, setChallengeId] = useState<(typeof CHALLENGES)[number]['id']>('A');
  const [path, setPath] = useState<Reaction[]>([]);
  const [unlocked, setUnlocked] = useState(false); // vue d'ensemble débloquée après 1 défi réussi
  const [showOverview, setShowOverview] = useState(false);

  const challenge = CHALLENGES.find((ch) => ch.id === challengeId) ?? CHALLENGES[0];
  const start = challenge.start;
  const target = challenge.target;

  const current: GroupId = path.length > 0 ? path[path.length - 1].to : start;
  const groups: GroupId[] = [start, ...path.map((s) => s.to)];
  const cumulative = path.reduce((acc, s) => acc * s.yield, 1);
  const reached = current === target;
  const available = availableReactions(current);

  const animatedYield = useAnimatedNumber(cumulative);
  const best = useMemo(() => findBestPath(start, target), [start, target]);
  const isOptimal = reached && best !== null && cumulative >= best.yield - 1e-9;

  // La vue d'ensemble se débloque dès qu'un défi est réussi (et le reste ensuite).
  useEffect(() => {
    if (reached) setUnlocked(true);
  }, [reached]);

  const selectChallenge = (id: (typeof CHALLENGES)[number]['id']) => {
    setChallengeId(id);
    setPath([]);
  };
  const chooseReaction = (r: Reaction) => setPath((p) => [...p, r]);
  const undo = () => setPath((p) => p.slice(0, -1));
  const restart = () => setPath([]);

  const challengeBtnClass = (active: boolean) =>
    'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ' +
    (active
      ? 'border-accent bg-accent/10 text-accent'
      : 'border-slate-300 text-slate-700 hover:bg-slate-100');

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
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{c.ui.challenge}</span>
            <div className="space-y-2">
              {CHALLENGES.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => selectChallenge(ch.id)}
                  className={challengeBtnClass(ch.id === challengeId)}
                >
                  <span className="font-semibold">
                    {c.ui.challenge} {ch.id}
                  </span>
                  <span className="block text-xs opacity-80">
                    {c.groups[ch.start]} → {c.groups[ch.target]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={path.length === 0}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {c.ui.undo}
            </button>
            <button
              type="button"
              onClick={restart}
              disabled={path.length === 0}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {c.ui.restart}
            </button>
          </div>
        </div>
      }
      visualization={
        <div className="space-y-4">
          {/* Cible du défi */}
          <p className="text-sm text-slate-600">
            {c.ui.target} :{' '}
            <strong className="text-slate-900">{c.groups[target]}</strong>{' '}
            <span className="font-mono text-slate-500">{getGroup(target)?.formula}</span>
          </p>

          {/* Badge « tu es ici » (fondu + pulsation au changement) */}
          <MoleculeBadge
            hereLabel={c.ui.here}
            name={c.groups[current]}
            formula={getGroup(current)?.formula ?? ''}
          />

          {/* Fil du chemin parcouru (nouvelle puce en fondu) */}
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {groups.map((g, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {i > 0 ? <span className="text-slate-300">→</span> : null}
                <Chip label={c.groups[g]} highlight={i === groups.length - 1} />
              </span>
            ))}
          </div>

          <StatList
            columns={2}
            items={[
              { label: c.ui.steps, value: `${path.length}` },
              { label: c.ui.cumYield, value: pctCum(animatedYield), emphasize: true },
            ]}
          />

          {/* État de fin OU réactions possibles OU impasse */}
          {reached ? (
            <div className="space-y-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-800">🎉 {c.ui.reached}</p>

              {/* Voici ce que tu as transformé : départ → produit final */}
              <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">{c.ui.startReactant}</p>
                  <p className="text-sm font-medium text-slate-800">{c.groups[start]}</p>
                  <p className="font-mono text-sm text-slate-600">{getGroup(start)?.formula}</p>
                </div>
                <span className="hidden text-slate-400 sm:block">→</span>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">{c.ui.finalProduct}</p>
                  <p className="text-sm font-medium text-slate-800">{c.groups[target]}</p>
                  <p className="font-mono text-sm text-slate-600">{getGroup(target)?.formula}</p>
                </div>
              </div>

              <p className="text-sm text-emerald-700">
                {c.ui.reachedDetail(path.length, pctCum(cumulative))}
              </p>

              {/* Comparaison au meilleur chemin (positif, jamais une correction négative) */}
              {isOptimal ? (
                <p className="text-sm font-medium text-emerald-800">{c.ui.optimal}</p>
              ) : best ? (
                <div className="rounded-lg border border-emerald-200 bg-white/70 p-2 text-sm text-slate-700">
                  <p className="font-medium">
                    {c.ui.bestLabel} : {best.steps.length} {c.ui.steps.toLowerCase()} · {pctCum(best.yield)}
                  </p>
                  <p className="mt-1 text-slate-500">{best.groups.map((g) => c.groups[g]).join(' → ')}</p>
                </div>
              ) : null}
            </div>
          ) : available.length === 0 ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              {c.ui.deadEnd}
            </p>
          ) : (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {c.ui.reactions}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {available.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => chooseReaction(r)}
                    aria-label={c.aria.card(
                      c.families[r.family],
                      c.details[r.detail],
                      c.groups[r.to],
                      pctStep(r.yield)
                    )}
                    className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-accent hover:bg-accent/5"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                      {c.families[r.family]} · {c.details[r.detail]}
                    </span>
                    <span className="text-sm font-medium text-slate-900">→ {c.groups[r.to]}</span>
                    <span className="font-mono text-sm text-slate-600">{getGroup(r.to)?.formula}</span>
                    <span className="text-xs text-slate-500">
                      {c.ui.stepYield} : {pctStep(r.yield)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vue d'ensemble — débloquée seulement après avoir réussi un défi */}
          {unlocked ? (
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setShowOverview((v) => !v)}
                className="text-sm font-medium text-accent hover:underline"
              >
                {showOverview ? c.ui.overviewHide : c.ui.overviewShow}
              </button>
              {showOverview ? (
                <ReactionOverview
                  groups={c.groups}
                  families={c.families}
                  details={c.details}
                  labels={c.table}
                />
              ) : null}
            </div>
          ) : null}
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
