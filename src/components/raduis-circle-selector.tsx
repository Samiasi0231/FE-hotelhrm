// // src/components/settings/RadiusCircleSelector.tsx
// // Interactive geofence radius picker — drag the handle to resize, or use +/- buttons.

// import { useRef, useCallback, useState } from "react";

// interface Props {
//   radiusMeters: number;
//   onChange: (radius: number) => void;
//   min?: number;
//   max?: number;
// }

// const VIEWBOX = 240;
// const CENTER = VIEWBOX / 2;
// const MIN_PX_RADIUS = 30;
// const MAX_PX_RADIUS = 100;

// export default function RadiusCircleSelector({
//   radiusMeters,
//   onChange,
//   min = 20,
//   max = 2000,
// }: Props) {
//   const svgRef = useRef<SVGSVGElement>(null);
//   const [dragging, setDragging] = useState(false);

//   const metersToPx = (m: number) => {
//     const t = (m - min) / (max - min);
//     return MIN_PX_RADIUS + t * (MAX_PX_RADIUS - MIN_PX_RADIUS);
//   };
//   const pxToMeters = (px: number) => {
//     const t = (px - MIN_PX_RADIUS) / (MAX_PX_RADIUS - MIN_PX_RADIUS);
//     const m = min + t * (max - min);
//     return Math.round(Math.min(max, Math.max(min, m)) / 10) * 10;
//   };

//   const pxRadius = metersToPx(radiusMeters);
//   const handleAngle = -45;
//   const handleX = CENTER + pxRadius * Math.cos((handleAngle * Math.PI) / 180);
//   const handleY = CENTER + pxRadius * Math.sin((handleAngle * Math.PI) / 180);

//   const updateFromPointer = useCallback(
//     (clientX: number, clientY: number) => {
//       if (!svgRef.current) return;
//       const rect = svgRef.current.getBoundingClientRect();
//       const scale = VIEWBOX / rect.width;
//       const x = (clientX - rect.left) * scale;
//       const y = (clientY - rect.top) * scale;
//       const dist = Math.hypot(x - CENTER, y - CENTER);
//       const clampedPx = Math.min(MAX_PX_RADIUS, Math.max(MIN_PX_RADIUS, dist));
//       onChange(pxToMeters(clampedPx));
//     },
//     [onChange, min, max],
//   );

//   const handlePointerDown = (e: React.PointerEvent) => {
//     e.preventDefault();
//     setDragging(true);
//     (e.target as Element).setPointerCapture(e.pointerId);
//   };
//   const handlePointerMove = (e: React.PointerEvent) => {
//     if (!dragging) return;
//     updateFromPointer(e.clientX, e.clientY);
//   };
//   const handlePointerUp = () => setDragging(false);

//   const step = (delta: number) => {
//     const next = Math.min(max, Math.max(min, radiusMeters + delta));
//     onChange(next);
//   };

//   return (
//     <div className="flex flex-col items-center gap-4">
//       <svg
//         ref={svgRef}
//         viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
//         className="w-56 h-56 touch-none select-none"
//         onPointerMove={handlePointerMove}
//         onPointerUp={handlePointerUp}
//         onPointerLeave={handlePointerUp}
//       >
//         {[
//           MIN_PX_RADIUS,
//           (MIN_PX_RADIUS + MAX_PX_RADIUS) / 2,
//           MAX_PX_RADIUS,
//         ].map((r, i) => (
//           <circle
//             key={i}
//             cx={CENTER}
//             cy={CENTER}
//             r={r}
//             fill="none"
//             stroke="#e2e8f0"
//             strokeWidth={1}
//             strokeDasharray="3 3"
//           />
//         ))}

//         <circle
//           cx={CENTER}
//           cy={CENTER}
//           r={pxRadius}
//           fill="rgba(37, 99, 235, 0.12)"
//           stroke="#2563eb"
//           strokeWidth={2}
//         />
//         <circle cx={CENTER} cy={CENTER} r={5} fill="#1e293b" />

//         <circle
//           cx={handleX}
//           cy={handleY}
//           r={9}
//           fill="#2563eb"
//           stroke="white"
//           strokeWidth={2}
//           className="cursor-grab active:cursor-grabbing"
//           onPointerDown={handlePointerDown}
//         />
//       </svg>

//       <div className="flex items-center gap-3">
//         <button
//           type="button"
//           onClick={() => step(-10)}
//           className="w-9 h-9 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center justify-center font-bold text-lg"
//         >
//           −
//         </button>
//         <div className="text-center min-w-[90px]">
//           <p className="text-2xl font-bold text-blue-600 tabular-nums">
//             {radiusMeters}m
//           </p>
//           <p className="text-xs text-slate-400">radius</p>
//         </div>
//         <button
//           type="button"
//           onClick={() => step(10)}
//           className="w-9 h-9 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center justify-center font-bold text-lg"
//         >
//           +
//         </button>
//       </div>

//       <p className="text-xs text-slate-400 text-center max-w-[220px]">
//         Drag the blue dot to resize, or use the buttons for fine adjustment.
//       </p>
//     </div>
//   );
// }
