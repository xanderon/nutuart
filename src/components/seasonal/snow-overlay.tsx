"use client";

const flakes = Array.from({ length: 36 }, (_, index) => {
  const left = (index * 37) % 100;
  const delay = ((index * 53) % 40) / 10; // 0–3.9s
  const duration = 14 + ((index * 7) % 10); // 14–23s
  const size = 0.8 + ((index % 5) * 0.18);
  const drift = ((index * 17) % 12) - 6;

  return { left, delay, duration, size, drift };
});

export function SnowOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/3 via-transparent to-transparent" />
      {flakes.map((flake) => (
        <span
          key={`${flake.left}-${flake.delay}`}
          className="absolute rounded-full bg-white/70 blur-[1px] opacity-0"
          style={
            {
              left: `${flake.left}%`,
              width: `${flake.size * 4}px`,
              height: `${flake.size * 4}px`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
              animationName: "snowFall",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationFillMode: "forwards",
              "--drift": `${flake.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
