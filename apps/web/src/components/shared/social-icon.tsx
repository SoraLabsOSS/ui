import { GithubIcon } from "@/components/shared/github-icon";
import { LinkedinIcon } from "@/components/shared/linkedin-icon";
import { XIcon } from "@/components/shared/x-icon";

export function SocialIcon({ label }: { label: string }) {
  if (label === "GH") {
    return <GithubIcon className="h-4.5 w-4.5" />;
  }
  if (label === "Li") {
    return <LinkedinIcon className="h-3.5 w-3.5" />;
  }
  if (label === "X") {
    return <XIcon className="h-3 w-3" />;
  }
  return label;
}
