//
// This module contains functions that compute curves.
// Function names are pretty self-explanatory,
// and require necessary parameters to compute the resulting point.
//

function checkParameters(...params) {
  params.forEach((param, i) => {
    switch (typeof param) {
      case 'number':
        isNaN(param) ? console.error('Parameter is NaN, please provide a Number') : Number(param)
        break
      default:
        console.log(typeof param, param)
        break
    }
  })
}

function circle(r, a) {
  return {
    x: r * Math.sin(a),
    y: r * -Math.cos(a),
  }
}

function spiral(rStart, a, factor) {
  return {
    x: (rStart + a * factor) * Math.sin(a),
    y: (rStart + a * factor) * -Math.cos(a),
  }
}

export { circle, spiral }
