export function modifyArrayElement(array, index, getNewElement) {
  const currentElement = array[index];
  return [
    ...array.slice(0, index),
    getNewElement(currentElement),
    ...array.slice(index + 1)
  ];
}
