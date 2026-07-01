const SLIDE_TRANSITION = { duration: 2.5, ease: [0.32, 0.72, 0.25, 1] };

/** Slide-in props for gallery overlays; skip entrance when a shell already animated in. */
export function gallerySlideMotion(entrance, axis = "y") {
  if (!entrance) return { initial: false };
  if (axis === "x") {
    return {
      initial: { x: "100vw" },
      animate: { x: 0 },
      exit: { x: "100vw" },
      transition: SLIDE_TRANSITION,
    };
  }
  return {
    initial: { y: "100vh" },
    animate: { y: 0 },
    exit: { y: "100vh" },
    transition: SLIDE_TRANSITION,
  };
}

export { SLIDE_TRANSITION };
