import { ReactLenis } from "lenis/react";
import Image from "next/image";
import { TextRevealBlock } from "@/registry/primitives/texts/text-reveal-block/index";

function SectionBackground({
  priority = false,
  src,
}: {
  priority?: boolean;
  src: string;
}) {
  return (
    <div className="section-bg">
      <Image alt="" fill priority={priority} sizes="100vw" src={src} />
    </div>
  );
}

export default function TextRevealDemoPage() {
  return (
    <>
      <ReactLenis root />

      <section className="intro">
        <SectionBackground
          priority
          src="/demo/photo-1510507024924-fc3847d49ae2.avif"
        />

        <TextRevealBlock blockColor="#e3e4d8">
          <h1>
            Framed in tungsten and shadows, every shot holds its own deliberate
            tension.
          </h1>
        </TextRevealBlock>
      </section>

      <section className="about">
        <TextRevealBlock blockColor="#000">
          <p>
            This is cinematography in its raw form with practical lamps, soft
            falloff, and the presence of grain that fills each corner of the
            frame. Every room functions as a set and every posture becomes a
            composition. Light moves across furniture and faces, shaping scenes
            with a natural sense of depth.
          </p>
        </TextRevealBlock>
      </section>

      {/* <section className="banner-img">
        <SectionBackground src="/demo/photo-1666009373373-d172cf109462.avif" />
      </section> */}

      <section className="services">
        <TextRevealBlock blockColor="#c8e600">
          <h1>
            Still frames with bold contrast and lighting choices that embrace
            imperfection.
          </h1>
        </TextRevealBlock>
      </section>

      {/* <section className="banner-img">
        <SectionBackground src="/demo/photo-1683275147274-50526d63bb1d.avif" />
      </section> */}

      <section className="cta">
        <TextRevealBlock blockColor="#000">
          <p>
            the camera settles into long takes and patient movement. Colors stay
            unrefined and shadows turn into texture. The image waits for action
            instead of chasing it. Every frame forms a clear visual language
            built through restraint.
          </p>
        </TextRevealBlock>
      </section>

      <section className="outro">
        <SectionBackground src="/demo/photo-1781520422650-02661061708e.avif" />

        <TextRevealBlock blockColor="#e3e4d8">
          <h1>
            Cinematography thrives in the details from the grain to the falloff
            to the glow.
          </h1>
        </TextRevealBlock>
      </section>
    </>
  );
}
