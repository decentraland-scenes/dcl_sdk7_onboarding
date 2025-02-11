import { Vector3 } from "@dcl/sdk/math"

export function randomNumbers(length: number) {
  var numbers = []
  for (let i = 0; i < length; i++) {
    numbers.push(i)
  }
  return shuffle(numbers)
}
export function shuffle<T>(array: Array<T>) {
  let currentIndex = array.length,
    randomIndex: number

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

/**
 * Returns the normaliced direction vector from point1 to point2
 * @param point1 - the first point position
 * @param point2 - the second point position
 * @returns normaliced direction vector
 */
export function directionVectorBetweenTwoPoints(point1: Vector3, point2: Vector3): Vector3 {
  return Vector3.normalize({x: point2.x - point1.x, y: point2.y - point1.y, z: point2.z - point1.z});
}