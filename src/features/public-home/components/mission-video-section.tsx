"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

import { Reveal } from "@/components/atoms/reveal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { HomeContent } from "@/features/public-home/content/home.en";

type MissionVideoSectionProps = {
  content: HomeContent["mission"];
  videoSrc: string;
  videoPoster: string;
};

export function MissionVideoSection({
  content,
  videoSrc,
  videoPoster,
}: MissionVideoSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section
      data-block="mission"
      id="home-sustainability"
      className="relative overflow-hidden text-white"
    >
      <div className="relative min-h-[clamp(22rem,58vw,36rem)]">
        <Image
          src={content.imageSrc}
          alt={content.imageAlt}
          fill
          sizes="100vw"
          priority={false}
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(165deg,rgb(0_18_47_/_0.82)_0%,rgb(0_18_47_/_0.45)_45%,rgb(3_66_171_/_0.55)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(0_18_47_/_0.35)_100%)]"
          aria-hidden
        />

        <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-[var(--pad-inline)] text-center">
          <Reveal className="flex max-w-[42rem] flex-col items-center">
            <p className="text-[0.7rem] font-bold tracking-[0.16em] text-brand-red uppercase">
              Our mission
            </p>
            <p className="font-display mt-4 text-balance text-[clamp(1.25rem,1rem+1.6vw,2.1rem)] font-semibold leading-[1.28]">
              {content.statement}
            </p>
            {videoSrc ? (
              <button
                type="button"
                aria-label="Play aluminium process film"
                className="group mt-8 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 py-2 pr-5 pl-2 backdrop-blur-md transition-[background,transform] hover:scale-[1.02] hover:bg-white/16"
                onClick={() => setOpen(true)}
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_24px_rgb(0_0_0_/_0.3)] min-[480px]:size-12">
                  <Play className="ml-0.5 size-4 fill-current min-[480px]:size-[18px]" />
                </span>
                <span className="text-left text-[0.8125rem] font-semibold tracking-tight">
                  Watch process film
                </span>
              </button>
            ) : null}
          </Reveal>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-full max-w-[min(920px,calc(100%-1rem))] overflow-hidden bg-black p-0 sm:max-w-[920px]"
          showCloseButton
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Aluminium process film</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {open ? (
              <video
                className="size-full"
                controls
                playsInline
                autoPlay
                poster={videoPoster || content.imageSrc}
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
