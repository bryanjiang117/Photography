import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Fragment,
} from "react";
import { FEATURES } from "../constants/features";
import { letterTraits, scatterTarget } from "../scatterText.mjs";

const HOVER_MQ = "(hover: hover) and (pointer: fine)";
const MOTION_MQ = "(prefers-reduced-motion: no-preference)";

function canScatter() {
  return (
    FEATURES.scatterText &&
    typeof window !== "undefined" &&
    window.matchMedia(HOVER_MQ).matches &&
    window.matchMedia(MOTION_MQ).matches
  );
}

function wrapText(text, ctx) {
  return text.split(/(\s+)/).map((part) => {
    if (!part) return part;
    if (/^\s+$/.test(part)) {
      return <span key={`s${ctx.word}`}>{part}</span>;
    }
    const wordKey = ctx.word++;
    return (
      <span key={`w${wordKey}`} className="inline-block whitespace-nowrap">
        {Array.from(part).map((ch) => {
          const i = ctx.char++;
          return (
            <span
              key={i}
              className="relative inline-block"
              data-scatter-rest=""
            >
              <span
                className="inline-block pointer-events-none"
                data-scatter-char=""
              >
                {ch}
              </span>
            </span>
          );
        })}
      </span>
    );
  });
}

function wrapNode(node, ctx) {
  if (node == null || typeof node === "boolean") return node;
  if (typeof node === "number") return wrapText(String(node), ctx);
  if (typeof node === "string") return wrapText(node, ctx);
  if (Array.isArray(node)) {
    return node.map((child) => wrapNode(child, ctx));
  }
  if (!isValidElement(node)) return node;
  if (node.type === Fragment) {
    return wrapNode(node.props.children, ctx);
  }
  return cloneElement(node, {
    children: wrapNode(node.props.children, ctx),
  });
}

function wrapChildren(children) {
  const ctx = { word: 0, char: 0 };
  return Children.map(children, (child) => wrapNode(child, ctx));
}

const ScatterText = ({ children, className = "" }) => {
  const enabled = useScatterEnabled();
  const rootRef = useRef(null);
  const itemsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, inside: false });
  const rafRef = useRef(0);

  const collect = () => {
    const root = rootRef.current;
    if (!root) return;
    const prev = itemsRef.current;
    itemsRef.current = [...root.querySelectorAll("[data-scatter-rest]")].map(
      (rest, i) => {
        const old = prev[i];
        return {
          rest,
          char: rest.querySelector("[data-scatter-char]"),
          traits: old?.traits ?? letterTraits(i),
          x: old?.x ?? 0,
          y: old?.y ?? 0,
          rotate: old?.rotate ?? 0,
        };
      },
    );
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  };

  const tick = () => {
    const { x: mx, y: my, inside } = mouseRef.current;
    const lerp = inside ? 0.34 : 0.16;
    let moving = false;

    for (const item of itemsRef.current) {
      if (!item.char) continue;
      const rect = item.rest.getBoundingClientRect();
      const lx = rect.left + rect.width / 2;
      const ly = rect.top + rect.height / 2;
      const target = inside
        ? scatterTarget(mx, my, lx, ly, item.traits)
        : { x: 0, y: 0, rotate: 0 };

      item.x += (target.x - item.x) * lerp;
      item.y += (target.y - item.y) * lerp;
      item.rotate += (target.rotate - item.rotate) * lerp;

      if (
        Math.abs(item.x) > 0.08 ||
        Math.abs(item.y) > 0.08 ||
        Math.abs(item.rotate) > 0.08
      ) {
        moving = true;
      } else if (!inside) {
        item.x = 0;
        item.y = 0;
        item.rotate = 0;
      }

      item.char.style.transform =
        item.x === 0 && item.y === 0 && item.rotate === 0
          ? ""
          : `translate(${item.x.toFixed(2)}px, ${item.y.toFixed(2)}px) rotate(${item.rotate.toFixed(2)}deg)`;
    }

    if (inside || moving) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = 0;
    }
  };

  const start = () => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  };

  useLayoutEffect(() => {
    if (!enabled) return;
    collect();
  });

  useEffect(() => () => stop(), []);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={rootRef}
      data-scatter-text=""
      className={`relative z-10 -m-2 p-2 ${className}`.trim()}
      onPointerEnter={(e) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        mouseRef.current.inside = true;
        collect();
        start();
      }}
      onPointerMove={(e) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        mouseRef.current.inside = true;
        start();
      }}
      onPointerLeave={() => {
        mouseRef.current.inside = false;
        start();
      }}
    >
      {wrapChildren(children)}
    </div>
  );
};

function useScatterEnabled() {
  const [enabled, setEnabled] = useState(canScatter);
  useEffect(() => {
    const hover = window.matchMedia(HOVER_MQ);
    const motion = window.matchMedia(MOTION_MQ);
    const update = () => setEnabled(canScatter());
    hover.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      hover.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);
  return enabled;
}

export default ScatterText;
