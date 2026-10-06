"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { localePath } from "@/config/nav.config";
import type { HomeContent } from "@/features/public-home/content/home.en";
import { cn } from "@/lib/utils";

type HeroCarouselProps = {
  locale: string;
  content: HomeContent["hero"];
};

const AUTOPLAY_MS = 7000;

const DEFAULT_CTA = { label: "Inquire Now", href: "contact" };

/**
 * Billboard carousel — reliable autoplay:
 * - Interval advances slides (not hover-gated on the whole hero — that blocked play).
 * - Progress bar uses inline CSS animation (Tailwind arbitrary + CSS var was unreliable).
 * - Explicit pause + reduced-motion + video modal stop the timer.
 */
export function HeroCarousel({ locale, content }: HeroCarouselProps) {
  const { slides } = content;
  const [index, setIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = slides.length;
  const active = slides[index] ?? slides[0];
  const primaryCta = active?.primaryCta ?? DEFAULT_CTA;
  const videoSrc = active?.video?.src ?? "";
  const videoPoster = active?.video?.posterSrc ?? "";
  const videoLabel = active?.video?.label ?? "Watch video";
  const playing = count > 1 && !paused && !videoOpen && !reduceMotion;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduceMotion(mq.matches);
      if (mq.matches) setPaused(true);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [playing, count, index]);

  if (!active) return null;

  return (
    <section
      data-block="hero"
      className="bg-ink relative isolate overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start == null || end == null) return;
        const delta = end - start;
        if (Math.abs(delta) < 48) return;
        go(index + (delta < 0 ? 1 : -1));
      }}
    >
      <div
        className="relative flex w-full flex-col"
        style={{
          minHeight: "clamp(28rem, calc(100svh - 4rem), 52rem)",
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={`${slide.imageSrc}-${i}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-[var(--ease)] motion-reduce:duration-0",
              i === index ? "z-[1] opacity-100" : "z-0 opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.imageSrc}
              alt={i === index ? slide.imageAlt : ""}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-[center_30%] sm:object-center"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_18_47_/_0.55)_0%,rgb(0_18_47_/_0.72)_42%,rgb(0_18_47_/_0.92)_100%),linear-gradient(90deg,rgb(0_18_47_/_0.78)_0%,rgb(0_18_47_/_0.35)_55%,rgb(0_18_47_/_0.2)_100%)]"
              aria-hidden
            />
          </div>
        ))}

        <div className="relative z-[5] mx-auto flex w-full max-w-[var(--container)] flex-1 flex-col justify-end px-[var(--pad-inline)] pt-[clamp(1.25rem,4vw,2.5rem)] min-[768px]:justify-center">
          <div className="max-w-[min(100%,36rem)] min-[900px]:max-w-[40rem]">
            <p className="mb-3 inline-flex max-w-full items-center gap-2 text-[clamp(0.65rem,0.58rem+0.3vw,0.75rem)] font-bold tracking-[0.14em] text-brand-red uppercase">
              <span
                className="bg-brand-red hidden h-px w-5 shrink-0 min-[400px]:inline-block"
                aria-hidden
              />
              <span className="min-w-0 break-words">{active.eyebrow}</span>
            </p>
            <h1 className="font-display text-balance text-[clamp(1.75rem,1.15rem+2.8vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-white">
              {active.title}
            </h1>
            <p className="text-on-dark-muted mt-3 max-w-[min(100%,38ch)] text-[clamp(0.9375rem,0.88rem+0.28vw,1.125rem)] leading-relaxed min-[480px]:mt-4">
              {active.subtitle}
            </p>
            <div className="mt-5 flex w-full flex-col gap-2.5 min-[420px]:mt-7 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center min-[420px]:gap-3">
              <Button
                className="w-full min-[420px]:w-auto"
                render={<Link href={localePath(locale, primaryCta.href)} />}
              >
                {primaryCta.label}
              </Button>
              {videoSrc ? (
                <Button
                  type="button"
                  variant="ghost-light"
                  className="w-full min-[420px]:w-auto"
                  onClick={() => {
                    setPaused(true);
                    setVideoOpen(true);
                  }}
                >
                  <Play className="size-4" />
                  {videoLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {count > 1 ? (
          <div className="relative z-[6] mx-auto w-full max-w-[var(--container)] px-[var(--pad-inline)] pt-5 pb-[max(0.85rem,env(safe-area-inset-bottom))] min-[768px]:pt-8">
            <div className="flex items-center gap-3">
              <div
                className="flex min-w-0 flex-1 items-center gap-1"
                role="tablist"
                aria-label="Slides"
              >
                {slides.map((slide, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Slide ${i + 1}: ${slide.title}`}
                    className="relative h-10 min-w-0 flex-1"
                    onClick={() => go(i)}
                  >
                    <span className="bg-white/25 absolute inset-x-0 top-1/2 block h-0.5 -translate-y-1/2 overflow-hidden rounded-full min-[480px]:h-1">
                      {i === index ? (
                        <span
                          key={`bar-${index}-${playing ? "run" : "stop"}`}
                          className="bg-brand-red absolute inset-y-0 left-0 block h-full rounded-full"
                          style={{
                            width: playing ? undefined : "0%",
                            animation: playing
                              ? `hero-progress ${AUTOPLAY_MS}ms linear forwards`
                              : undefined,
                            animationPlayState: playing ? "running" : "paused",
                          }}
                        />
                      ) : (
                        <span
                          className={cn(
                            "bg-brand-red absolute inset-y-0 left-0 block h-full rounded-full",
                            i < index ? "w-full" : "w-0",
                          )}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 min-[480px]:size-10"
                  aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                  onClick={() => setPaused((p) => !p)}
                >
                  {paused || reduceMotion ? (
                    <Play className="size-3.5 min-[480px]:size-4" />
                  ) : (
                    <Pause className="size-3.5 min-[480px]:size-4" />
                  )}
                </button>
                <button
                  type="button"
                  className="hidden size-10 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 min-[720px]:inline-flex"
                  aria-label="Previous slide"
                  onClick={() => go(index - 1)}
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  className="hidden size-10 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 min-[720px]:inline-flex"
                  aria-label="Next slide"
                  onClick={() => go(index + 1)}
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-[max(0.85rem,env(safe-area-inset-bottom))]" />
        )}
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {index + 1} of {count}: {active.title}
      </div>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent
          className="w-full max-w-[min(920px,calc(100%-1rem))] overflow-hidden bg-black p-0 sm:max-w-[920px]"
          showCloseButton
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{videoLabel}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {videoOpen && videoSrc ? (
              <video
                key={`${index}-${videoSrc}`}
                className="size-full"
                controls
                playsInline
                autoPlay
                poster={videoPoster || undefined}
              >
                <source
                  src={videoSrc}
                  type={
                    videoSrc.toLowerCase().includes(".webm") ? "video/webm" : "video/mp4"
                  }
                />
              </video>
            ) : null}
          </div>
          {videoSrc.includes("alumina-process") ? (
            <p className="px-4 py-3 text-left text-xs leading-relaxed text-white/75">
              Alumina treatment at National Aluminium Company, Odisha. Footage by
              Subhashish Panigrahi, CC BY-SA 3.0. This is not the Kadi plant.
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
