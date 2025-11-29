"use client";

const flakes = Array.from({ length: 72 }, (_, index) => {
  // PRNG simplu pentru variații deterministice fără Math.random
  const seed = (index * 73 + 17) % 9973;
  const rand = (n: number) => ((seed % n) / n);

  const left = ((index * 23) % 100) + rand(100) * 0.6; // mic offset suplimentar
  const size = 0.6 + rand(10) * 0.6; // 0.6–1.2 (~2.4–4.8px)
  const delay = rand(60) * 6; // 0–6s, mai aleator
  const duration =
    (size > 1 ? 12 : 16) + rand(10) * (size > 1 ? 6 : 10); // fulg mare cade mai repede
  const drift = (rand(16) * 14 - 7) * (size > 1 ? 0.55 : 1.05); // mari deviază mai puțin

  return { left, delay, duration, size, drift };
});

export function SnowOverlay() {
  // Lower initial opacity so the "on load" stack is less visible; fade in as they fall.
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
              // drift via CSS var to avoid recalcs
              "--drift": `${flake.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
