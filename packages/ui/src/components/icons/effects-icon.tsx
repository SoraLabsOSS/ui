export default function EffectsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="transparent"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 40 36"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M38 34H2V6c0-2.2 1.8-4 4-4h32z" stroke="transparent" />
      <path d="M15 1h20c2.2 0 4 1.8 4 4v26c0 2.2-1.8 4-4 4H5c-2.2 0-4-1.8-4-4V15" />
      <path d="M1 7c1.1 0 6 0 6 6 0-6 4.9-6 6-6-6 0-6-4.9-6-6 0 1.1 0 6-6 6m8 12c.7 0 4 0 4 4 0-4 3.3-4 4-4-4 0-4-3.3-4-4 0 .7 0 4-4 4" />
    </svg>
  );
}
