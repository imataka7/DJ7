/**
 * Durstenfeld's algorithm
 * @param arrOriginal array
 */
export default function shuffleArray<T>(arrOriginal: T[]) {
  const arr = [...arrOriginal];
  for (let i = arr.length; i > 1; i -= 1) {
    const k = Math.floor(Math.random() * i);
    [arr[k], arr[i - 1]] = [arr[i - 1], arr[k]];
  }

  return arr;
}