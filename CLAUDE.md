# CLAUDE.md — Science Lab

Conventions et décisions d'architecture **durables** de ce projet. À lire avant toute
modification. Ne décrit pas le code en détail (il se relit) ; fige les règles et les choix
non triviaux qu'un résumé risquerait de perdre ou de mal généraliser.

## Nature du projet
App web éducative de simulations scientifiques interactives (niveau lycée avancé), bilingue
FR/EN, **100 % côté client** (aucun backend). Stack : Vite + React + TS + Tailwind + Recharts
+ Vitest. But pédagogique : **visualiser** des concepts, pas les lire.

## Workflow (IMPÉRATIF)
- **Livraison par phases** : une phase / un changement à la fois, puis **STOP** et attendre le
  « ok » explicite de l'utilisateur. Ne jamais grouper plusieurs phases.
- Avant toute nouvelle fonctionnalité : **proposer un plan** (arbo + étapes) et attendre validation.
- Commit après chaque phase validée, sur demande (« commite »). Message terminé par
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Après chaque modif : `tsc --noEmit` + `npm test` doivent passer (zéro régression).

## Architecture extensible — règle d'or
**Le registre `src/simulations/registry.ts` est la SOURCE UNIQUE DE VÉRITÉ.** La galerie
d'accueil et le regroupement par catégorie en découlent automatiquement.
**Ajouter une simulation = créer son module + UNE ligne dans le registre.** Rien d'autre.

Un module de simulation = dossier `src/simulations/<id>/` contenant :
`<id>Math.ts` (calcul pur) + `<id>Math.test.ts` (Vitest) + `<Nom>Simulation.tsx` (composant)
+ `<Nom>Icon.tsx` (icône galerie) + éventuels composants de visualisation.

- Le champ de catégorie s'appelle **`category`** (type `CategoryId = 'maths' | 'physics' |
  'chemistry'`), **PAS `discipline`**. Catégories définies dans `categories.ts` (leur ordre =
  ordre des groupes dans la galerie). Une catégorie vide est masquée.
- L'`id` du registre **EST** la route (`#/sim/<id>`). Doit être unique (test le vérifie).
- Composant de simulation : props `{ meta }` (`SimulationComponentProps`). L'eyebrow de section
  = le **libellé de catégorie** (jamais « Simulation N »).

## Routeur (maison, `src/router/useHashRoute.ts`)
- `#/` = galerie, `#/sim/<id>` = vue détail. `parse()` est exporté + protégé par `try/catch`
  (URL malformée → galerie). `simHref(id)` construit la route. Le bouton retour navigateur marche.
- Ce sont de **vraies routes**, pas des ancres de scroll (supprimées en Phase 4.5).

## Chargement différé
- Dans le registre, chaque composant de simulation est `lazy(() => import(...))`. Les **icônes
  restent en import direct** (nécessaires à la galerie). `App` enveloppe la vue détail dans
  `<Suspense>`. Conséquence : Recharts vit dans un chunk à la demande, la galerie reste légère.

## i18n (distinction critique, ne pas généraliser à tort)
- Système maison : `LanguageContext` + `useTranslation()` + `translations.ts`.
- **Libellés structurels partagés** (`section.*`, `gallery.*`, `hero.*`, `footer.*`, `a11y.*`)
  → dans `translations.ts` (clés plates, typage strict : clé inconnue = erreur TS).
- **Textes propres à une simulation** (théorie, « quoi observer », curriculum, labels de
  contrôles, légendes, stats…) → **CO-LOCALISÉS** dans le module, objet `content = { fr:{…},
  en:{…} }`, sélectionnés via `lang`. **NE PAS** les mettre dans `translations.ts`.
- Titre/description du registre = `LocalizedText { fr, en }` en ligne dans `registry.ts`.
- Tout texte visible doit exister en FR **et** EN. La langue est persistée (localStorage), init
  depuis `navigator.language`, et fixe `<html lang>`.

## Conventions de calcul (modules `*Math.ts`)
- **Robustesse** : toute fonction exportée gère 0/NaN/Infinity avec un **retour fini documenté**.
  **Jamais de `throw`**. Ne **jamais** borner artificiellement des entrées valides.
- Sentinelles documentées : `riemannSum` → `NaN` si domaine invalide (l'appelant teste
  `isDomainValid` d'abord) ; helpers de marqueurs/mesure → `[]` ou `null` sur entrée dégénérée.
- Garde anti-boucle-infinie sur les fonctions à boucle dépendant d'un pas/seuil
  (ex. `halfLifeMarkers` si `t½ ≤ 0`, `measureOrbitalPeriod` si `dt ≤ 0`).
- Fonctions d'échantillonnage : normaliser `const n = Math.max(1, Math.floor(samples))`.
- **Toute constante non triviale est nommée + exportée + commentée** (sens physique/math).
- Tester les cas limites en Vitest **en même temps** que la simulation.

## Décisions scientifiques par simulation (à ne pas confondre)
- **euler** (maths) : `y'=k·y`, illustre l'**erreur d'une méthode numérique** (Euler EXPLICITE
  exprès). Ce n'est PAS de la physique, ≠ décroissance.
- **decay** (physique) : loi **exacte** `N(t)=N₀·e^(−λt)`, vrai phénomène. Grille d'atomes :
  ordre de désintégration aléatoire mais **stable** (PRNG mulberry32) ; le nombre allumé =
  `round(N(t))` par construction.
- **titration** (chimie) : acide fort/base forte. **3 formules par zone** (avant / à
  l'équivalence pH=7 / après), PAS une formule continue unique. `NEUTRAL_CONC = 1e-7` =
  approximation d'affichage au voisinage de l'équivalence (évite −∞/NaN). Courbe Recharts en
  `type="linear"` (fidèle au saut), pas `monotone`.
- **riemann** (maths) : liste **fermée** de fonctions (x², 1/x, eˣ, sin) + primitives exactes.
  Garde domaine `1/x` (a>0). Sur/sous-estimation gauche/droite dépend du **sens de variation**
  (PAS une règle universelle).
- **equilibrium** (chimie) : **racine positive** de `x²+KA·x−KA·C₀=0`. `ξ` est un
  **avancement, PAS le temps** (aucune allusion temporelle). Visuel = **barres de proportions**
  (distinct du bécher du titrage). `Qr(ξ)` tracé jusqu'à `min(0.95·C₀, 2·x)` (avant l'asymptote).
- **young** (physique) : `i = λ·D/a` (formule donnée), `I(y)=I₀·cos²(π·a·y/(λD))`. **Cœur seul**
  (pas de bonus diffraction). Fenêtre d'écran **fixe** → le nombre de franges visibles change.
- **kepler** (physique, LE PLUS DÉLICAT) :
  - **Euler SEMI-IMPLICITE (symplectique)** : vitesse mise à jour **AVANT** la position. PAS
    l'Euler explicite (qui ferait spiraler). Choix **opposé** à la simu euler — ne pas confondre.
  - Texte : « **limite la dérive d'énergie** », jamais « conserve l'énergie » (symplectique ≠
    conservation exacte).
  - `GM = 1` (unités **normalisées**, pas astronomiques). `R_MIN = 0.05` (collision → arrêt
    propre). `DEFAULT_DT = 0.004` **partagé** entre la simu et les tests. Vitesse initiale
    **perpendiculaire** au rayon. **viewBox fixe** (pas de zoom dynamique).
  - Vérif vis-viva : `semiMajorAxis = GM/(2GM/r₀ − v₀²)` (= r₀ au circulaire),
    `orbitalPeriod = 2π√(a³/GM)`, comparé à `measureOrbitalPeriod` (numérique). Période mesurée
    pour **toute orbite liée** (cercle ET ellipse). Tolérance test 0,5 % (erreur réelle ≤ 0,06 %).

## Animations
- Boucle via `requestAnimationFrame` dans un `useEffect`, nettoyage `cancelAnimationFrame`.
- Plafonner le `dt` réel : `Math.min(dt, 0.1)` (anti-saut au retour d'onglet).
- Kepler : pas fixe + **accumulateur de sous-pas** plafonné (`MAX_SUBSTEPS`), état physique dans
  des **refs** (pas de re-rendu par sous-pas), `setView` une fois par frame.

## Accessibilité
- `aria-label` + `<title>` sur chaque visualisation. `useId` pour tout identifiant SVG
  (`clipPath`, etc.). **Pas d'`aria-live`** sur du contenu qui s'anime en continu (spam lecteur
  d'écran) ; les panneaux de stats (texte) suffisent.

## Style
- Tailwind. Sobre/académique : ardoise/marine + accent **indigo** (`accent` dans la config).
  Police **Inter** (`@fontsource`, hors-ligne). Pas de caractère combinant (ex. U+20D7 flèche
  vecteur ne rend pas dans Inter → composant `ui/Vec.tsx` qui dessine la flèche en CSS).
- Responsive : tout réutilise `SimulationSection` (1 col mobile → contrôles/visu côte à côte en
  `lg`). Graphes Recharts en `ResponsiveContainer` ; SVG custom en `viewBox` + `w-full h-auto`.

## Environnement de dev (Windows)
- Node installé via winget → **préfixer `C:\Program Files\nodejs` au PATH** à chaque commande
  shell. Git : `C:\Program Files\Git\cmd`.
- Messages de commit : here-string PowerShell `@'…'@` — **éviter `"` et `'`** dans le message
  (cassent le parsing). `git log | Select-Object` peut afficher un « exit 255 » inoffensif
  (tuyau fermé) : le commit réussit quand même.
- Scripts : `npm run dev` / `build` / `preview` / `test` (Vitest). Tags jalons : `v1.0` (3
  simulations), `v2.0` (7 simulations).
