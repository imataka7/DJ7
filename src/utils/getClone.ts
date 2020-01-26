export default function getClone<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj)) as T;
}
