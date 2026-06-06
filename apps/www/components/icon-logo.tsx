import { cn } from "@workspace/ui/lib/utils";

const sizes = {
  xs: "size-5.5",
  sm: "size-7",
  md: "size-8",
  lg: "size-12",
  xl: "size-14",
};

export const IconLogo = ({
  size = "sm",
  className,
  ...props
}: {
  size?: keyof typeof sizes;
  className?: string;
} & React.ComponentProps<"svg">) => (
  <svg
    className={cn(sizes[size], className)}
    fill="currentColor"
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Sora UI</title>
    <g transform="translate(100 100) scale(0.8292) translate(-100 -100)">
      <path d="M 150.245 -0.676 L 150.658 49.581 L 49.237 49.477 L 49.714 -0.758 L 150.245 -0.676 Z M 49.342 150.419 L 49.237 49.477 L -1.04 49.794 L -1.304 150.337 L 49.342 150.419 Z M 150.763 150.523 L 150.658 49.581 L 201.304 49.663 L 201.04 150.206 L 150.763 150.523 Z M 150.763 150.523 L 49.342 150.419 L 49.755 200.676 L 150.286 200.758 L 150.763 150.523 Z" />
    </g>
  </svg>
);
