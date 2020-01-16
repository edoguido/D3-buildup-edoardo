//
// This module contains functions that compute curves.
// Function names are pretty self-explanatory,
// and require necessary parameters to compute the resulting point.
//

export function circle(r, a) {
  return {
    x: r * Math.sin(a),
    y: r * -Math.cos(a),
  }
}

export function spiral(rStart, a, factor) {
  return {
    x: (rStart + a * factor) * Math.sin(a),
    y: (rStart + a * factor) * -Math.cos(a),
  }
}

export function twistedSpiral(rStart, a, factor, index) {
  return {
    x: spiral(rStart, a, factor).x / 2 - Math.cos(a) * (4 + index / 12),
    y: spiral(rStart, a, factor).y / 2 - Math.sin(a) * (4 + index / 12),
  }
}
