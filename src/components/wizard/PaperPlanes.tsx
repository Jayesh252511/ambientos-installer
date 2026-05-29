export function PaperPlanes() {
  const planes = Array.from({ length: 7 });
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {planes.map((_, i) => {
        const left = (i * 137) % 100;
        const top = (i * 73) % 100;
        const delay = (i * 0.7).toFixed(2);
        const scale = 0.6 + ((i * 17) % 60) / 100;
        return (
          <svg
            key={i}
            className="absolute animate-float-slow"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`,
              transform: `scale(${scale})`,
            }}
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M2 12L22 2L17 22L12 13L2 12Z"
              fill="oklch(0.72 0.28 350 / 0.55)"
              stroke="oklch(0.85 0.2 200 / 0.6)"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}
