import { Bunny } from "@/components/docs/bunny";

export function InfoSection() {
  return (
    <section className="info" data-theme-section="light">
      <div className="is--md-m container">
        <div className="info__wrap">
          <div className="info__small-col">
            <div className="info__graphic">
              <Bunny
                className="text-neutral-900 dark:text-neutral-100"
                size={80}
                sleeping={false}
              />
            </div>
          </div>
          <div className="info__large-col">
            <div className="info__scribble">
              <p className="scribble">Why Sora?</p>
              <svg
                aria-hidden="true"
                className="scribble-arrow is--info-col"
                fill="none"
                viewBox="0 0 32 32"
                width="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Arrow</title>
                <path
                  d="M30.3491 31.5811L30.558 30.3311L31.1618 29.9525C29.2036 30.1222 28.2898 27.0739 26.4295 26.369C25.8681 26.1568 25.7735 26.8128 25.9497 27.0119C25.9921 27.0609 26.6775 27.2502 27.0985 27.6516C27.4575 27.9975 29.1938 29.5543 28.8805 29.9492C23.8153 29.4434 19.1711 28.2358 14.7619 25.6477C5.77699 20.3802 0.852119 10.8502 0.0231477 0.612125C-0.616531 15.7327 12.0922 28.8428 26.9223 30.2821C26.5796 31.1372 23.8022 30.2234 23.9882 31.5811H30.3459H30.3491Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="info__title">
              <h3 className="is--long h-ml">
                Craft exceptional web experiences with production-grade animated
                components and motion primitives for React.
              </h3>
            </div>
            <ul className="info__list">
              <li className="info__li">
                <div className="info__li-title">
                  <h4 className="u--fw-medium p-l">
                    Craft faster, animate effortlessly
                  </h4>
                </div>
                <p className="p-m">
                  Skip the complex animation choreographies and boilerplate.
                  Every motion primitive is built for seamless drop-in
                  integration into your modern React and Next.js applications.
                </p>
              </li>
              <li className="info__li">
                <div className="info__li-title">
                  <h4 className="u--fw-medium p-l">
                    Engineered for production
                  </h4>
                </div>
                <p className="p-m">
                  Not just surface-level visual gimmicks. Every component is
                  powered by Tailwind CSS v4, Base UI, and Motion — prioritizing
                  accessibility, keyboard navigation, and fluid responsiveness.
                </p>
              </li>
              <li className="info__li">
                <div className="info__li-title">
                  <h4 className="u--fw-medium p-l">
                    A living, evolving toolkit
                  </h4>
                </div>
                <p className="p-m">
                  Continuously growing with new interaction patterns,
                  micro-animations, and full-page layout showcases so your
                  product interfaces always stay ahead of the curve.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
