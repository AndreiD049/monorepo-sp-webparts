type SetType<T> = Set<T> | ReadonlySet<T>

export function setIntersection<T>(setA: SetType<T>, setB: SetType<T>): Set<T> {
    const intersection = new Set<T>();
    setA.forEach((elem) => {
        if (setB.has(elem)) {
            intersection.add(elem);
        }
    });
    return intersection;
}

export function setUnion<T>(setA: SetType<T>, setB: SetType<T>): Set<T> {
  const union = new Set<T>(setA);
  setB.forEach((elem) => {
    union.add(elem);
  })
  return union;
}

export function filterSet<T>(originalSet: SetType<T>, condition: (item: T) => boolean): Set<T> {
  const filteredSet = new Set<T>();
  originalSet.forEach((item) => {
    if (condition(item)) {
      filteredSet.add(item);
    }
  })
  return filteredSet;
}