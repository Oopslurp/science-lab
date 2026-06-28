import { describe, it, expect } from 'vitest';
import { intensityProfile, interfringe, intensity, wavelengthToRgb } from './youngMath';

describe('youngMath', () => {
  it('interfringe i = λD/a (500 nm, 2 m, 0,5 mm) = 2 mm', () => {
    expect(interfringe(500, 2, 0.5)).toBeCloseTo(2e-3, 6);
  });

  it('a augmente → i diminue ; λ et D augmentent → i augmente', () => {
    expect(interfringe(500, 2, 1)).toBeLessThan(interfringe(500, 2, 0.5));
    expect(interfringe(700, 2, 0.5)).toBeGreaterThan(interfringe(500, 2, 0.5));
    expect(interfringe(500, 4, 0.5)).toBeGreaterThan(interfringe(500, 2, 0.5));
  });

  it('gardes a=0 / D=0 : valeur finie, pas de throw ni Infinity', () => {
    expect(() => interfringe(500, 2, 0)).not.toThrow();
    expect(Number.isFinite(interfringe(500, 2, 0))).toBe(true);
    expect(interfringe(500, 2, 0)).toBe(0);
    expect(interfringe(500, 0, 0.5)).toBe(0);
  });

  it('intensité : max au centre, nulle à la 1re frange sombre (y=i/2), max à y=i', () => {
    const i = interfringe(500, 2, 0.5); // 2 mm
    expect(intensity(500, 2, 0.5, 0)).toBeCloseTo(1, 10);
    expect(intensity(500, 2, 0.5, i / 2)).toBeCloseTo(0, 10);
    expect(intensity(500, 2, 0.5, i)).toBeCloseTo(1, 10);
  });

  it('intensityProfile : garde samples NaN/∞ (pas de boucle non bornée)', () => {
    expect(intensityProfile(500, 2, 0.5, Infinity)).toHaveLength(241);
    expect(intensityProfile(500, 2, 0.5, NaN)).toHaveLength(241);
  });

  it('wavelengthToRgb : canaux entiers dans [0,255], teintes cohérentes', () => {
    for (const nm of [420, 480, 550, 620, 680]) {
      const { r, g, b } = wavelengthToRgb(nm);
      for (const c of [r, g, b]) {
        expect(Number.isInteger(c)).toBe(true);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(255);
      }
    }
    expect(wavelengthToRgb(680).r).toBeGreaterThan(wavelengthToRgb(680).b); // rouge
    expect(wavelengthToRgb(480).b).toBeGreaterThan(wavelengthToRgb(480).r); // bleu
  });
});
