import { describe, it, expect } from 'vitest';
import { exact, eulerPoints, exactPoints, errorSummary } from './eulerMath';

describe('eulerMath', () => {
  it('exact : y(0) = y0', () => {
    expect(exact(3, 0.8, 0)).toBe(3);
  });

  it('exact : y(x) = y0·e^(k·x)', () => {
    expect(exact(1, 1, 1)).toBeCloseTo(Math.E, 10);
  });

  it('eulerPoints : longueur = steps+1, démarre en (0, y0)', () => {
    const pts = eulerPoints({ y0: 1, k: 0.8, h: 0.5, steps: 8 });
    expect(pts).toHaveLength(9);
    expect(pts[0]).toEqual({ x: 0, y: 1 });
  });

  it('eulerPoints : k=0 laisse y constant', () => {
    const pts = eulerPoints({ y0: 2, k: 0, h: 0.5, steps: 5 });
    expect(pts.every((p) => p.y === 2)).toBe(true);
  });

  it('eulerPoints : récurrence y_{i+1} = y_i·(1+k·h)', () => {
    const y0 = 1;
    const k = 1;
    const h = 0.5;
    const pts = eulerPoints({ y0, k, h, steps: 3 });
    expect(pts[1].y).toBeCloseTo(y0 * (1 + k * h));
    expect(pts[2].y).toBeCloseTo(y0 * (1 + k * h) ** 2);
  });

  it('exactPoints : couvre [0, xMax] avec samples+1 points', () => {
    const pts = exactPoints(1, 0.8, 4, 240);
    expect(pts).toHaveLength(241);
    expect(pts[0].x).toBe(0);
    expect(pts[pts.length - 1].x).toBeCloseTo(4);
  });

  it('errorSummary : Euler sous-estime la solution exacte pour k>0', () => {
    const s = errorSummary({ y0: 1, k: 0.8, h: 0.5, steps: 8 });
    expect(s.eulerValue).toBeLessThan(s.exactValue);
    expect(s.absolute).toBeGreaterThan(0);
    expect(s.relative).toBeGreaterThan(0);
  });

  it('errorSummary : erreur nulle quand k=0', () => {
    const s = errorSummary({ y0: 5, k: 0, h: 0.5, steps: 8 });
    expect(s.absolute).toBeCloseTo(0);
    expect(s.exactValue).toBe(5);
  });
});
