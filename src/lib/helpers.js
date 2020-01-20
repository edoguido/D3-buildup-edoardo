//
// Functions used in different graphs
//

export function angularModulus(modulus, angle, startValue = 0) {
  return startValue + ((angle + Math.PI) % modulus)
}

export function numberOfDistinctElements(array, category) {
  const singleCategoryArray = array.map(datum => datum[category])
  return singleCategoryArray.filter((v, i) => singleCategoryArray.indexOf(v) === i)
}
