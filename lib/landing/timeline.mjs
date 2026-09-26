// Normalized scene timing is shared by the animation and chapter navigation.
export const chapterProgress = [0, 0.3, 0.5, 0.7, 0.9];
export function stageAt(progress) {
  return Math.min(5, Math.max(1, Math.floor((progress + 1e-9) / 0.2) + 1));
}
export function scrollDestination(start, height, viewport, progress) {
  return start + Math.max(0, height - viewport) * Math.min(1, Math.max(0, progress));
}

// Each property has one owner at any moment. Equal-duration crossfades avoid
// blank frames; explicit starting values make jumps and reverse seeks repeatable.
export function createStadiumTimeline(gsap, { layers, badges, intro }, compact = false) {
  const tl = gsap.timeline({ paused: true });
  tl.fromTo(intro, { autoAlpha: 1, y: 0 }, {
    autoAlpha: 0, y: -32, duration: 0.08, ease: "none",
  }, 0);
  layers.forEach((layer, i) => {
    const incoming = i === 0 ? 0 : i * 0.2 - 0.04;
    const outgoing = (i + 1) * 0.2 - 0.04;
    tl.fromTo(layer, {
      autoAlpha: i === 0 ? 1 : 0, scale: compact ? 0.98 : 0.94,
      xPercent: 0, yPercent: 0,
    }, {
      autoAlpha: 1, scale: 1, duration: 0.08, ease: "none",
    }, incoming);
    tl.to(layer, {
      scale: compact ? 1.04 : 1.12, duration: i === 4 ? 0.16 : 0.12,
      ease: "sine.inOut",
    }, incoming + 0.08);
    tl.fromTo(badges[i], {
      autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 12,
    }, { autoAlpha: 1, y: 0, duration: 0.06, ease: "power2.out" }, incoming + 0.02);
    if (i < 4) {
      tl.to(layer, { autoAlpha: 0, duration: 0.08, ease: "none" }, outgoing);
      tl.to(badges[i], { autoAlpha: 0, y: -12, duration: 0.06, ease: "none" }, outgoing);
    }
  });
  return tl;
}
