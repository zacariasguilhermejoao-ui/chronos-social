export function TypingWave({ label = "a escrever" }: { label?: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
      <span className="flex h-3.5 items-center gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block w-[3px] h-full rounded-full bg-primary origin-center"
            style={{
              animation: "typing-wave 900ms cubic-bezier(0.4,0,0.2,1) infinite",
              animationDelay: `${i * 110}ms`,
            }}
          />
        ))}
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}
