import { describe, it, expect } from 'vitest';
import {
  DOPPLER_MAX_SPEED_RATIO,
  SOUND_SPEED,
  clampSpeed,
  perceivedFrequency,
  radialVelocity,
} from './dopplerMath';

describe('perceivedFrequency', () => {
  it('vitesse radiale nulle ⇒ f0 inchangée', () => {
    expect(perceivedFrequency(440, 0)).toBeCloseTo(440, 9);
  });

  it('source qui s’approche ⇒ f’ > f0 ; qui s’éloigne ⇒ f’ < f0', () => {
    expect(perceivedFrequency(440, 100)).toBeGreaterThan(440);
    expect(perceivedFrequency(440, -100)).toBeLessThan(440);
  });

  it('valeur de référence : f0=400, v=34 m/s, c=340 ⇒ 444,44 Hz', () => {
    expect(perceivedFrequency(400, 34, 340)).toBeCloseTo((400 * 340) / 306, 6);
  });

  it('symétrie approche/éloignement (l’écart n’est pas symétrique)', () => {
    const up = perceivedFrequency(440, 100) - 440;
    const down = 440 - perceivedFrequency(440, -100);
    expect(up).toBeGreaterThan(down); // c/(c−v) s'éloigne plus vite que c/(c+v)
  });

  it('Infinity si c − vRadial ≤ 0 (source supersonique vers l’observateur)', () => {
    expect(perceivedFrequency(440, 340)).toBe(Infinity);
    expect(perceivedFrequency(440, 400)).toBe(Infinity);
  });

  it('NaN sur entrée non finie', () => {
    expect(perceivedFrequency(NaN, 10)).toBeNaN();
    expect(perceivedFrequency(440, Infinity)).toBeNaN();
  });
});

describe('clampSpeed', () => {
  it('borne à ±0,9·c', () => {
    const max = DOPPLER_MAX_SPEED_RATIO * SOUND_SPEED;
    expect(clampSpeed(1000)).toBeCloseTo(max, 9);
    expect(clampSpeed(-1000)).toBeCloseTo(-max, 9);
    expect(clampSpeed(50)).toBe(50);
  });

  it('entrée non finie ⇒ 0', () => {
    expect(clampSpeed(NaN)).toBe(0);
    expect(clampSpeed(Infinity)).toBe(0);
  });
});

describe('radialVelocity', () => {
  it('source alignée et à gauche de l’observateur ⇒ vitesse radiale = vitesse', () => {
    expect(radialVelocity(100, 0, 50, 200, 50)).toBeCloseTo(100, 9);
  });

  it('source à droite de l’observateur ⇒ vitesse radiale négative (s’éloigne)', () => {
    expect(radialVelocity(100, 300, 50, 200, 50)).toBeCloseTo(-100, 9);
  });

  it('au plus près (même abscisse) ⇒ vitesse radiale nulle', () => {
    expect(radialVelocity(100, 200, 0, 200, 100)).toBeCloseTo(0, 9);
  });

  it('projection à 45° ⇒ vitesse·cos45° ', () => {
    expect(radialVelocity(100, 0, 0, 100, 100)).toBeCloseTo(100 * Math.SQRT1_2, 6);
  });

  it('distance nulle ou entrée non finie ⇒ 0', () => {
    expect(radialVelocity(100, 200, 50, 200, 50)).toBe(0);
    expect(radialVelocity(NaN, 0, 0, 1, 1)).toBe(0);
  });
});
