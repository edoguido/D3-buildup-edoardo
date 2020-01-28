//
// Functions used in different graphs
//

export function angularModulus(modulus, angle, startValue = 0) {
  return startValue + ((angle + Math.PI) % modulus)
}

export function opacityModulus(linesCount, counter, minValue = 0, maxValue = 1) {
  return Math.min((1 / linesCount) * counter + minValue, maxValue)
}

export function numberOfDistinctElements(array, category) {
  const singleCategoryArray = array.map(datum => datum[category])
  return singleCategoryArray.filter((v, i) => singleCategoryArray.indexOf(v) === i)
}

//
// trim a string starting from the very next space after specified length
export const trimLongString = (str, maxLength) => {
  if (str.length > maxLength) {
    const sliced = str.slice(0, maxLength)
    const lastSpacePosition = sliced.lastIndexOf(' ')
    return `${sliced.slice(0, lastSpacePosition)}...`
  } else return str
}
