type EntityIconProps = {
  path: string;
  className?: string;
};

export default function EntityIcon({
  path,
  className = "h-4 w-4",
}: EntityIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}
