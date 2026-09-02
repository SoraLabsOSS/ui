export function Hero() {
  return (
    <section className="home-hero" data-theme-section="light">
      <div
        className="padding-hero"
        data-wf--padding-hero--variant="nav-large"
      />

      <div className="is--md-m container">
        <div className="home-hero__content">
          <div className="home-hero__title-row">
            <h1 className="h-xl">Motion First</h1>
            <h2 className="h-xl">For React</h2>
          </div>
          <div className="home-hero__description-row">
            <p className="home-hero__description-p">
              Open-source, fully animated React component distribution built
              with TypeScript, Tailwind CSS v4, Base UI, Radix UI &amp; Motion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
