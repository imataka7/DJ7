
/**
 * Sleep until given time passed
 * @param ms Time for sleep. Min value is 1 msec.
 */
export default async function sleep(ms: number) {
  return new Promise(r => setTimeout(() => r(), ms));
}
