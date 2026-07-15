import { DecoderMark } from "@/components/home/decoder-mark";

export function AboutSection() {
  return (
    <div className="no-scrollbar border-[#1a1a1a] border-b px-[26px] pt-7 pb-15 lg:h-full lg:overflow-y-auto lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-4.5">
        <p className="text-xs leading-[1.75]">Hi. Hello. Hola.</p>
        <p className="text-xs leading-[1.75]">
          ↪ I&apos;m Axyl, a developer with 2+ years of experience working at
          the{" "}
          <DecoderMark>
            intersection of software engineering, creative coding, and product
            design.
          </DecoderMark>
        </p>
        <p className="text-xs leading-[1.75]">
          Over the last 2+ years, I&apos;ve worked closely with{" "}
          <DecoderMark>
            distributed and remote-first teams across industries and
            disciplines.
          </DecoderMark>{" "}
          I care most about meaningful work and enjoy collaborating on projects
          driven by curiosity, purpose, and thoughtful ideas.
        </p>
        <p className="text-xs leading-[1.75]">
          I believe, the things we&apos;ve lived colour how we see the world. My
          perspective has been shaped by{" "}
          <DecoderMark>
            years of building, learning, and creating in Vietnam:
          </DecoderMark>{" "}
          from personal projects to collaborating with{" "}
          <DecoderMark>
            individuals, early-stage startups, and global design studios.
          </DecoderMark>
        </p>
        <p className="text-xs leading-[1.75]">
          Currently based in Vietnam, I work best in{" "}
          <DecoderMark>
            remote-first, cross-functional environments.
          </DecoderMark>{" "}
          When I&apos;m not coding, you&apos;ll usually find me in nature,{" "}
          <a
            className="text-inherit no-underline"
            href="https://www.strava.com/athletes/149601110"
            rel="noopener noreferrer"
            target="_blank"
          >
            <DecoderMark>somewhere in the mountains</DecoderMark>
          </a>
          , or at home baking or gardening.
        </p>
        <p className="text-xs leading-[1.75]">
          I&apos;m open to collaborations and connections. If you&apos;d like to
          work together on a project,{" "}
          <DecoderMark>
            feel free to reach out or connect with me on social media
          </DecoderMark>
          , where I share selected work and ongoing experiments.
        </p>
      </div>
    </div>
  );
}
