interface BlobConfig {
  color: "primary" | "secondary" | "tertiary";
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  size?: "sm" | "md" | "lg";
}

interface AmbientBackgroundProps {
  blobs?: BlobConfig[];
  fixed?: boolean;
}

const COLOR_MAP = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
};

const POSITION_MAP = {
  "top-left": "top-1/4 -left-20",
  "top-right": "-top-[100px] -right-[100px]",
  "bottom-left": "-bottom-[100px] -left-[100px]",
  "bottom-right": "bottom-1/4 -right-20",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

const SIZE_MAP = {
  sm: "w-[300px] h-[300px] blur-[100px]",
  md: "w-[400px] h-[400px] blur-[120px]",
  lg: "w-[600px] h-[600px] blur-[160px]",
};

const DEFAULT_BLOBS: BlobConfig[] = [
  { color: "secondary", position: "top-left", size: "md" },
  { color: "tertiary", position: "bottom-right", size: "md" },
];

export default function AmbientBackground({
  blobs = DEFAULT_BLOBS,
  fixed = true,
}: AmbientBackgroundProps) {
  return (
    <>
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={`
            ${fixed ? "fixed" : "absolute"}
            ${POSITION_MAP[blob.position]}
            ${SIZE_MAP[blob.size || "md"]}
            ${COLOR_MAP[blob.color]}
            opacity-10 rounded-full pointer-events-none -z-10
          `}
        />
      ))}
    </>
  );
}
