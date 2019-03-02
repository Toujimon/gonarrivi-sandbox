/**
 * Modifies an element on an specific index of an array, returning the newly modified array.
 * @param {*} array Array whose element to be modified
 * @param {*} index Index of the element to be modified. It's expected to exist or it will throw an exception.
 * @param {*} getNewElement Function to generate the new element, it will be passed the current element
 * for that index as its first an only argument: (currentElement) => new Element. It's advised to be a pure function.
 * @returns A shallow copy of the original array with the same length and elements except for the modified one.
 */
export function modifyArrayElement(array, index, getNewElement) {
  const currentElement = array[index];
  return [
    ...array.slice(0, index),
    getNewElement(currentElement),
    ...array.slice(index + 1)
  ];
}
