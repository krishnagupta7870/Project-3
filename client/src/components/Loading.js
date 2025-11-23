import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const Loading = () => {
  const group1Controls = useAnimation();
  const group2Controls = useAnimation();

  useEffect(() => {
    let cancelled = false; // cancellation flag

    const runSequence = async () => {
      try {
        while (!cancelled) {
          // Reset both groups to undrawn state
          group1Controls.set({ pathLength: 0 });
          group2Controls.set({ pathLength: 0 });

          // Animate Group 1 (Walls & Roof) over 1.75 seconds
          await group1Controls.start({
            pathLength: 1,
            transition: { duration: 1.75 }
          });
          if (cancelled) break;

          // Animate Group 2 (Door, Windows & Hole) over 0.75 seconds
          await group2Controls.start({
            pathLength: 1,
            transition: { duration: 0.75 }
          });
          if (cancelled) break;

          // Pause briefly before restarting the sequence
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (err) {
        console.error("Animation error:", err);
      }
    };

    runSequence();

    return () => {
      // On unmount, cancel the sequence and stop animations
      cancelled = true;
      group1Controls.stop();
      group2Controls.stop();
    };
  }, [group1Controls, group2Controls]);

  return (
    <div className="loading-container">
      <motion.svg
        width="200"
        height="200"
        viewBox="0 50 200 200"
        fill="none"
        stroke="black"
        strokeWidth="5"
        strokeLinecap="butt"
        strokeLinejoin="round"
        style={{ backgroundColor: "#fff" }}
      >
        {/* === STATIC BASE LINES & CONNECTORS === */}
        <path d="M7.5 230 L192.5 230" />
        <path d="M7.5 240 L192.5 240" />
        <path d="M10 240 L10 230" />
        <path d="M190 240 L190 230" />

        {/* === GROUP 1: WALLS & ROOF === */}
        {/* Left Wall */}
        <motion.path
          d="M30 230 L30 142"
          initial={{ pathLength: 0 }}
          animate={group1Controls}
        />
        {/* Right Wall */}
        <motion.path
          d="M170 230 L170 142"
          initial={{ pathLength: 0 }}
          animate={group1Controls}
        />
        {/* Roof */}
        <motion.path
          d="
            M101 60
            L10 140 
            Q8 150 20 150
            L100 80
            L180 150 
            Q190 150 189 140 
            L99 60
          "
          initial={{ pathLength: 0 }}
          animate={group1Controls}
        />

        {/* === GROUP 2: DOOR, WINDOWS, & HOLE === */}
        {/* Door */}
        <motion.path
          d="M120 230 L120 180 L80 180 L80 230 M90 200 L90 207"
          initial={{ pathLength: 0 }}
          animate={group2Controls}
        />
        {/* Left Window */}
        <motion.path
          d="M40 160 L80 160 M45 160 A1 1.25 0 0 1 75 160"
          initial={{ pathLength: 0 }}
          animate={group2Controls}
        />
        {/* Right Window */}
        <motion.path
          d="M120 160 L160 160 M125 160 A1 1.25 0 0 1 155 160"
          initial={{ pathLength: 0 }}
          animate={group2Controls}
        />
        {/* Circular Ring */}
        <motion.circle
          cx="100"
          cy="115"
          r="13"
          initial={{ pathLength: 0 }}
          animate={group2Controls}
        />
      </motion.svg>
    </div>
  );
};

export default Loading;
