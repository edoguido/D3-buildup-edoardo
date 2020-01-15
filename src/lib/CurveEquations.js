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
