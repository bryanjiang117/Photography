import { motion } from "motion/react";
import { galleryImageUrl } from "../galleryImages";

const HEIGHTS = [65, 100, 84];

const CaliforniaColorField = ({
  gap = "0.75rem",
  gapClassName = "gap-3",
  className = "",
  hidden = false,
  onClick,
}) => {
  return (
    <div
      className={`relative flex items-end ${gapClassName} ${className}`}
      onClick={onClick}
    >
      {HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="relative min-w-0 flex-1 overflow-hidden bg-california-primary"
          style={{ height: `${h}%` }}
        >
          <motion.img
            src={galleryImageUrl("california", "hills", "lg")}
            alt=""
            loading="lazy"
            className="absolute max-w-none object-cover"
            style={{
              width: `calc(300% + 2 * ${gap})`,
              height: `calc(${10000 / h}%)`,
              left: i === 0 ? 0 : `calc(-${i}00% - ${i} * ${gap})`,
              bottom: 0,
            }}
            initial={false}
            animate={
              hidden
                ? { clipPath: "inset(0 0 100% 0)" }
                : { clipPath: "inset(0 0 0% 0)" }
            }
            transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
          />
        </div>
      ))}
    </div>
  );
};

export default CaliforniaColorField;
