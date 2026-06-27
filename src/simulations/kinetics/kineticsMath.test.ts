import { describe, it, expect } from 'vitest';
import {
  CATALYST_GAIN_PER_DOSE,
  catalystFactor,
  concentration,
  effectiveK,
  halfTime,
  kineticsSeries,
  rate,
} from './kineticsMath';

describe('kineticsMath', () => {
  it('concentration et vitesse : [A](t)=[A]₀e^(−kt), v=k·[A]', () => {
    const a0 = 1.0;
    const k = 0.5;
    expect(concentration(0, a0, k)).toBeCloseTo(a0); // départ = [A]₀
    expect(concentration(2, a0, k)).toBeCloseTo(a0 * Math.exp(-1), 12);
    expect(rate(0, a0, k)).toBeCloseTo(k * a0, 12);
    expect(rate(2, a0, k)).toBeCloseTo(k * a0 * Math.exp(-1), 12);
  });

  it('temps de demi-réaction t½ = ln2/k', () => {
    expect(halfTime(Math.LN2)).toBeCloseTo(1, 12); // k = ln2 ⇒ t½ = 1
    expect(halfTime(0.5)).toBeCloseTo(Math.LN2 / 0.5, 12);
  });

  it('cas limite k = 0 : pas de réaction, v = 0, t½ = +∞ (pas de plantage)', () => {
    const a0 = 0.8;
    for (const t of [0, 1, 5, 50]) {
      expect(concentration(t, a0, 0)).toBeCloseTo(a0, 12); // [A] reste constante
      expect(rate(t, a0, 0)).toBe(0); // vitesse nulle partout
    }
    expect(halfTime(0)).toBe(Infinity);
    expect(Number.isFinite(halfTime(0))).toBe(false);
  });

  it('catalyseur : facteur 1 + doses·gain, courbe = substitution k → k·facteur', () => {
    const a0 = 1.2;
    const k = 0.3;
    expect(catalystFactor(0)).toBe(1); // aucune dose ⇒ aucun effet
    expect(catalystFactor(3)).toBeCloseTo(1 + 3 * CATALYST_GAIN_PER_DOSE, 12);
    expect(catalystFactor(-2)).toBe(1); // garde : doses négatives ⇒ 1
    expect(effectiveK(k, 0)).toBe(k);
    for (const doses of [1, 2, 5]) {
      const f = catalystFactor(doses);
      for (const t of [0, 1, 3, 10]) {
        expect(concentration(t, a0, effectiveK(k, doses))).toBeCloseTo(
          concentration(t, a0, k * f),
          12
        );
      }
      // Le catalyseur divise le temps de demi-réaction par le facteur.
      expect(halfTime(effectiveK(k, doses))).toBeCloseTo(halfTime(k) / f, 12);
    }
  });

  it('catalyseur : MÊME état final, vitesse différente', () => {
    const a0 = 1;
    const k = 0.4;
    const tFar = 200; // très loin : les deux réactions sont quasi terminées
    expect(concentration(tFar, a0, k)).toBeCloseTo(0, 6);
    expect(concentration(tFar, a0, effectiveK(k, 5))).toBeCloseTo(0, 6);
    // mais au départ la vitesse catalysée est « facteur » fois plus grande
    expect(rate(0, a0, effectiveK(k, 5))).toBeCloseTo(catalystFactor(5) * rate(0, a0, k), 12);
  });

  it('kineticsSeries : échantillonnage régulier, garde samples ≥ 1', () => {
    const s = kineticsSeries(1, 0.5, 10, 20);
    expect(s).toHaveLength(21);
    expect(s[0]).toEqual({ t: 0, a: 1, v: 0.5 });
    expect(kineticsSeries(1, 0.5, 10, 0)).toHaveLength(2); // 0 → normalisé à 1 intervalle
  });
});
