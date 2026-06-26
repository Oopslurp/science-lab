# Science Lab

Application web éducative de **simulations scientifiques interactives** (niveau lycée
avancé / début du supérieur), pour **visualiser** des concepts de mathématiques, physique
et chimie plutôt que de seulement les lire.

Bilingue **FR / EN**, 100 % côté client (aucun backend, aucune donnée ne quitte le
navigateur).

## Stack

- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** pour le style
- **Recharts** pour les courbes (décroissance, titrage, équilibre, intensité de Young) ;
  **SVG custom** pour Euler, Riemann, les franges de Young et l'orbite de Kepler
- i18n maison (contexte React + dictionnaire + hook `useTranslation`)
- **Vitest** pour les tests unitaires (fonctions de calcul, registre, routeur)

## Installation & lancement

Prérequis : **Node.js 18+** (testé avec Node 24).

```bash
npm install      # installe les dépendances
npm run dev      # serveur de développement → http://localhost:5173
```

Autres scripts :

```bash
npm run build    # vérifie les types (tsc) puis build de production dans dist/
npm run preview  # sert le build de production en local
npm test         # lance la suite de tests unitaires (Vitest)
```

> Sous Windows, si `npm` n'est pas reconnu : ouvrir un terminal **après** l'installation de
> Node, ou utiliser le chemin complet `& "C:\Program Files\nodejs\npm.cmd" run dev`.

## Architecture (extensible)

Le projet est conçu pour accueillir de nouvelles simulations sans réécrire l'existant.

```
src/
├── i18n/                     # contexte de langue + dictionnaire + hook t()
├── router/                   # mini-routeur d'URL (#/ galerie, #/sim/<id> détail)
├── components/
│   ├── SimulationSection.tsx # gabarit commun : théorie / contrôles / visu / observer / curriculum
│   ├── SimulationGallery.tsx # galerie d'accueil, cases groupées par catégorie
│   ├── SimulationCard.tsx
│   └── ui/                    # Slider, NumberInput, StatList, Legend, PlaybackControls
└── simulations/
    ├── categories.ts         # disciplines (Maths / Physique / Chimie)
    ├── registry.ts           # SOURCE UNIQUE : la galerie en découle
    ├── riemann/              # sommes de Riemann (SVG : courbe + rectangles)
    ├── euler/                # méthode d'Euler (SVG custom)
    ├── decay/                # décroissance radioactive (Recharts + grille d'atomes)
    ├── young/                # interférences de Young (Recharts + bande de franges)
    ├── kepler/               # gravitation / orbites (SVG, intégration symplectique)
    ├── titration/            # titrage acide-base (Recharts + bécher coloré)
    └── equilibrium/          # équilibre chimique Qr vs K (Recharts + barres)
```

Les composants `ui/` partagés : `Slider`, `NumberInput`, `StatList`, `Legend`,
`PlaybackControls`, `Vec` (notation vectorielle).

**Ajouter une simulation** = créer son module (`composant + icône`) puis ajouter **une
entrée** dans `registry.ts` (id, catégorie, titre/description FR-EN, icône, composant).
Elle apparaît alors automatiquement dans la galerie, dans la bonne catégorie.

## Scénarios de test

### 1. Méthode d'Euler (Mathématiques)
Illustre l'**erreur d'une méthode numérique** sur `y′ = k·y` (solution exacte `y₀·e^(k·x)`).

- **Défaut** (y₀=1, k=0.8, h=0.5, 8 pas) : la ligne brisée d'Euler passe **sous** la courbe
  exacte ; l'écart (pointillés rouges) grandit avec x. Erreur relative ≈ 15–20 %.
- **Réduire h → 0.05** : la ligne brisée colle à la courbe, l'erreur s'effondre.
- **h = 1.0** : gros pas → erreur visible qui s'accumule.
- **k = −1.2, h = 1.0** : Euler peut devenir **négatif**, impossible pour une vraie exponentielle.

### 2. Décroissance radioactive (Physique)
Loi **exacte** `N(t) = N₀·e^(−λt)`, demi-vie réglable.

- **t½ = 5, glisser t** : aux points verts (t = 5, 10, 15…) il reste exactement N₀/2, N₀/4, N₀/8.
- **▶ Lecture** : les noyaux s'éteignent dans un ordre **aléatoire**, mais leur nombre suit la courbe.
- **Changer N₀ seul** : la forme de la courbe et le rythme de la grille ne changent pas
  (la demi-vie ne dépend pas de N₀).

### 3. Titrage acide fort / base forte (Chimie)
Courbe **pH = f(V)** (HCl titré par NaOH), 3 formules selon la zone.

- **Défaut** (Ca = Cb = 0.1 ; Va = 20) : équivalence à **Ve = 20 mL**, pH passe de 1 à ~13
  avec un saut brutal ; **pH = 7 exact** à l'équivalence (point vert).
- **▶ Verser** : le bécher se colore en direct (rouge → vert → violet, indicateur universel).
- **Changer Ca, Va ou Cb** : le point d'équivalence se déplace (Ve = Ca·Va / Cb).
- **Concentrations plus fortes** : saut de pH plus marqué.

### 4. Sommes de Riemann (Mathématiques)
Méthode des rectangles : encadrer une intégrale, dialogue discret/continu.

- **x² sur [0, 2]** : `Gauche` sous-estime, `Droite` sur-estime ; augmenter `n` fait
  converger la somme vers la valeur exacte (8/3).
- **`sin(x)` sur [0, 3]** (change de variation) : la règle « gauche sous-estime » n'est
  plus universelle.
- **`1/x` avec a ≤ 0** : message clair (domaine invalide) au lieu d'un graphe cassé.

### 5. Interférences — fentes de Young (Physique)
Franges de deux fentes, **interfrange i = λ·D / a**, intensité `I(y) = I₀·cos²(π·a·y/(λD))`.

- **Augmenter a** : franges plus serrées (i diminue). **Augmenter λ ou D** : franges plus espacées.
- **Glisser λ (400 → 700 nm)** : la couleur de la bande passe du violet/bleu au rouge.

### 6. Gravitation — orbites de Kepler (Physique)
Intégration **semi-implicite (symplectique)**, `GM = 1` normalisé.

- **v₀ = 100 %** : orbite **circulaire** stable (reste sur le cercle pointillé, pas de spirale).
- **v₀ = 80 % / 120 %** : ellipse ; « T mesurée » colle à `2π√(a³/GM)` (écart < 0,1 %).
- **v₀ ≥ 141,4 %** : régime d'**évasion** ; **v₀ très bas + r₀ petit** : **collision**.

### 7. Équilibre chimique — Qr vs K (Chimie)
Acide faible `HA ⇌ A⁻ + H₃O⁺`, avancement = racine positive de `x² + KA·x − KA·C₀ = 0`.

- **pKA grand** (acide faible) : x petit, HA majoritaire ; **pKA petit** : dissociation quasi totale.
- L'intersection `Qr = KA` (point vert) se déplace avec C₀ et pKA.

### Bascule FR / EN
Bouton **FR | EN** en haut à droite : tous les textes (titres, théorie, contrôles, stats,
« quoi observer », curriculum) basculent ensemble, sur la galerie comme dans les simulations.

### Affichage responsive
Tester en redimensionnant la fenêtre (ou outils dev, mode appareil) :

- **Mobile (~375 px)** : les 7 cases (groupées par discipline) passent en 1 colonne,
  contrôles et graphes en pleine largeur.
- **Tablette (~768 px)** : galerie en 2 colonnes par groupe.
- **Desktop (~1280 px)** : galerie en 3 colonnes, contrôles à gauche / visualisation à droite.
