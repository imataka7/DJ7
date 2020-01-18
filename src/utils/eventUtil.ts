export default function setEvent(
  target: EventTarget,
  event: string,
  callbackfn: (e: Event) => void,
  options?: EventListenerOptions,
) {
  target.addEventListener(event, callbackfn, options);

  return {
    func: callbackfn,
    off: () => target.removeEventListener(event, callbackfn, options),
  };
}
