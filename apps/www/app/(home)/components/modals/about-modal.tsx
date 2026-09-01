"use client";

import { useEffect } from "react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-hidden="false"
      className="modal__group"
      data-modal-wrap=""
      style={{
        display: "flex",
        opacity: 1,
        visibility: "visible",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
      }}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop click closes modal */}
      <div
        className="modal__bg"
        data-modal-bg=""
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
        }}
      />
      <div
        className="modal__item"
        data-modal-status="active"
        data-modal-target="about"
        style={{
          position: "relative",
          zIndex: 10,
          width: "90%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          overflowY: "auto",
          margin: "auto",
          backgroundColor: "var(--color-neutral-200)",
          borderRadius: "16px",
          padding: "2rem",
          color: "var(--color-neutral-800)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2 className="h-l" style={{ margin: 0 }}>
            About Sora UI
          </h2>
          <button
            className="button"
            data-shape="round"
            onClick={onClose}
            style={{ cursor: "pointer" }}
            type="button"
          >
            <div
              className="button-bg"
              data-wf--button-theme--variant="neutral-600"
            />
            <div className="button-label__wrap">
              <div className="button-label">
                <span>Close</span>
              </div>
              <div aria-hidden="true" className="button-label">
                <span>Close</span>
              </div>
            </div>
          </button>
        </div>

        <section className="about-hero">
          <div className="about-container">
            <div className="about-hero__intro">
              <p className="p-l">
                Sora UI is the creative developer component distribution packed
                with React, Tailwind CSS v4, Base UI, Radix UI, and Motion
                resources. Learn the techniques and animations behind
                award-winning websites.
              </p>
            </div>
            <div
              className="about-hero__row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                marginTop: "2rem",
              }}
            >
              <div
                className="about-item"
                style={{
                  background: "var(--color-neutral-300)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                }}
              >
                <img
                  alt="Dennis Snellenberg"
                  className="cover-image"
                  loading="lazy"
                  src="https://cdn.prod.website-files.com/68a5787bba0829184628bd51/68df797e4ca697aab5d1332f_pf-dennis.avif"
                  style={{
                    borderRadius: "8px",
                    aspectRatio: "1",
                    objectFit: "cover",
                    marginBottom: "1rem",
                  }}
                />
                <h3 className="h-s">Dennis Snellenberg</h3>
                <p
                  className="p-s"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Co-founder & Creative Developer
                </p>
              </div>
              <div
                className="about-item"
                style={{
                  background: "var(--color-neutral-300)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                }}
              >
                <img
                  alt="Ilja van Eck"
                  className="cover-image"
                  loading="lazy"
                  src="https://cdn.prod.website-files.com/68a5787bba0829184628bd51/68df797eb5ebd492f244b7f6_pf-ilja.avif"
                  style={{
                    borderRadius: "8px",
                    aspectRatio: "1",
                    objectFit: "cover",
                    marginBottom: "1rem",
                  }}
                />
                <h3 className="h-s">Ilja van Eck</h3>
                <p
                  className="p-s"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  Co-founder & Creative Developer
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
