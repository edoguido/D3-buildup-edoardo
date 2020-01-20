//
// Functions used in different graphs
//

export function opacityModulus(modulus, angle) {
  return (angle + Math.PI) % modulus
}

export function numberOfDistinctElements(array, category) {
  const singleCategoryArray = array.map(datum => datum[category])
  return singleCategoryArray.filter((v, i) => singleCategoryArray.indexOf(v) === i)
}
