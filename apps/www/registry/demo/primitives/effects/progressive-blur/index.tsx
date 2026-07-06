import { ProgressiveBlur } from "@/registry/primitives/effects/progressive-blur";

const PARAGRAPHS = [
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati, reiciendis eum vitae nostrum, temporibus repudiandae voluptatibus, natus iure ipsa velit odit quibusdam illum.",
  "Quaerat cumque laudantium libero reprehenderit perferendis quo nulla voluptate. Repellat tenetur labore exercitationem dicta libero voluptate suscipit, iusto ea assumenda.",
  "Ipsa enim, quidem atque modi error eaque, debitis perferendis, hic iste libero dignissimos ea. Quod inventore beatae aspernatur nulla rem perferendis aperiam at debitis.",
  "Quod reiciendis in similique reprehenderit commodi quo blanditiis nobis hic ea optio illum placeat officia alias quasi autem earum quos obcaecati, voluptatum corporis quisquam.",
  "Quisquam iste, quas explicabo omnis harum aut quam adipisci, voluptatem saepe accusantium doloribus repellendus amet culpa magnam ex et dolores accusamus commodi facere.",
  "Beatae deserunt sequi id eos libero suscipit totam cum, sed architecto atque quisquam et incidunt quod fuga ullam repellat assumenda quos ab, voluptatum sint nesciunt.",
];

export default function ProgressiveBlurDemo() {
  return (
    <div className="relative h-80 w-full max-w-sm overflow-hidden rounded-xl border bg-background">
      <div className="h-full space-y-4 overflow-y-auto px-5 py-24 text-muted-foreground text-sm leading-relaxed">
        {PARAGRAPHS.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ProgressiveBlur direction="top" />
      <ProgressiveBlur direction="bottom" />
    </div>
  );
}
