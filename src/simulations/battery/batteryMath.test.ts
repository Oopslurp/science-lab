import { describe, it, expect } from 'vitest';
import {
  CELLS,
  FARADAY_CONSTANT,
  dischargeCurve,
  dischargeVoltage,
  lifetime,
  maxCharge,
  stateOfCharge,
} from './batteryMath';

describe('maxCharge — Q_max = n₀·z·F', () => {
  it('valeur de référence (0,1 mol, z = 2)', () => {
    expect(maxCharge(0.1, 2)).toBeCloseTo(0.1 * 2 * FARADAY_CONSTANT, 6);
    expect(maxCharge(0.1, 2)).toBeCloseTo(19297, 0);
  });

  it('0 (sans exception) sur entrée invalide', () => {
    expect(maxCharge(-1, 2)).toBe(0);
    expect(maxCharge(0.1, 0)).toBe(0);
    expect(maxCharge(NaN, 2)).toBe(0);
  });
});

describe('lifetime — t = Q_max / I', () => {
  it('durée finie à courant donné', () => {
    expect(lifetime(19297, 0.1)).toBeCloseTo(192970, 0);
  });

  it('Infinity si I ≤ 0 (pile jamais usée)', () => {
    expect(lifetime(19297, 0)).toBe(Infinity);
    expect(lifetime(19297, -1)).toBe(Infinity);
  });

  it('NaN sur entrée non finie', () => {
    expect(lifetime(NaN, 1)).toBeNaN();
  });
});

describe('stateOfCharge', () => {
  it('1 à vide, 0 à plein débit, 0,5 à mi-décharge', () => {
    expect(stateOfCharge(0, 1000)).toBe(1);
    expect(stateOfCharge(1000, 1000)).toBe(0);
    expect(stateOfCharge(500, 1000)).toBeCloseTo(0.5, 12);
  });

  it('borné et robuste (Q_max ≤ 0 ⇒ 0)', () => {
    expect(stateOfCharge(2000, 1000)).toBe(0); // au-delà de Q_max
    expect(stateOfCharge(100, 0)).toBe(0);
  });
});

describe('dischargeVoltage — plateau puis chute', () => {
  it('≈ emf à pleine charge, 0 à plat', () => {
    expect(dischargeVoltage(1.1, 1)).toBeCloseTo(1.1, 6);
    expect(dischargeVoltage(1.1, 0)).toBe(0);
  });

  it('plateau : U reste ≈ emf sur l’essentiel de la décharge', () => {
    expect(dischargeVoltage(1.1, 0.5)).toBeCloseTo(1.1, 4);
    expect(dischargeVoltage(1.1, 0.2)).toBeGreaterThan(0.99 * 1.1);
  });

  it('chute : U s’effondre en toute fin de décharge', () => {
    expect(dischargeVoltage(1.1, 0.02)).toBeLessThan(0.6 * 1.1);
  });

  it('croissante avec l’état de charge, et bornée (SoC clampé)', () => {
    expect(dischargeVoltage(1.1, 0.3)).toBeGreaterThan(dischargeVoltage(1.1, 0.05));
    expect(dischargeVoltage(1.1, 5)).toBeCloseTo(1.1, 6); // SoC > 1 borné
  });

  it('NaN sur entrée non finie', () => {
    expect(dischargeVoltage(NaN, 0.5)).toBeNaN();
  });
});

describe('dischargeCurve', () => {
  it('part du plateau (Q = 0 ⇒ U ≈ emf) et finit à plat (Q = Q_max ⇒ U = 0)', () => {
    const pts = dischargeCurve(1.1, 19297, 160);
    expect(pts[0]).toMatchObject({ q: 0 });
    expect(pts[0].U).toBeCloseTo(1.1, 4);
    expect(pts[pts.length - 1].q).toBeCloseTo(19297, 6);
    expect(pts[pts.length - 1].U).toBe(0);
  });

  it('garde un nombre d’échantillons valide sur entrée dégénérée', () => {
    expect(dischargeCurve(1.1, 19297, 0).length).toBeGreaterThanOrEqual(2);
    expect(dischargeCurve(1.1, 19297, NaN).length).toBeGreaterThanOrEqual(2);
  });
});

describe('données', () => {
  it('3 piles, toutes à z = 2 et emf positive', () => {
    expect(CELLS).toHaveLength(3);
    for (const cell of CELLS) {
      expect(cell.z).toBe(2);
      expect(cell.emf).toBeGreaterThan(0);
    }
  });
});
