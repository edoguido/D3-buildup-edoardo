//
// Functions used in different graphs
//

export function opacityModulus(constant, modulus, angle) {
  return constant + ((angle + Math.PI) % modulus)
}
