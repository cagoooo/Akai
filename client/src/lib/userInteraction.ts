/** 非必要的第三方驗證與統計，在實際操作後才啟動；不辨識或豁免測試機器。 */
const interactionEvents = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;
export const userInteractionReady = typeof window === 'undefined' ? Promise.resolve() : new Promise<void>((resolve) => {
  const engaged = () => {
    for (const type of interactionEvents) window.removeEventListener(type, engaged, true);
    resolve();
  };
  for (const type of interactionEvents) window.addEventListener(type, engaged, { capture: true, passive: true });
});
