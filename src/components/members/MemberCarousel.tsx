"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CalendarDays, Lock } from "lucide-react";
import Image from "@/components/common/Image";
import type { Post } from "@/gql/types";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

/**
 * A member post carrying its body already sanitised on the server, so the
 * client bundle never has to pull the sanitiser in.
 */
export type MemberPost = Post & { contentHtml?: string | null };

/** Degrees the ring turns per pixel dragged. */
const DEG_PER_PX = 0.22;
/** Per-frame velocity decay once the drag is released. */
const FRICTION = 0.94;
/** Below this angular speed the ring stops coasting and settles on a slot. */
const SETTLE_SPEED = 0.08;
/** How quickly the ring eases onto the nearest slot. */
const SETTLE_LERP = 0.14;

/** Folds an angle into the -180..180 range. */
function normalise(angle: number): number {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}

/** Every distinct picture on a post, thumbnail first. */
function getGallery(post: MemberPost): string[] {
  const urls = [
    post.thumbnail?.url,
    ...(post.images ?? []).map((image) => image.url),
  ].flatMap((url) => (url?.trim() ? [url.trim()] : []));

  return urls.filter((url, index) => urls.indexOf(url) === index);
}

export function MemberCarousel({
  posts,
  badge,
}: {
  posts: MemberPost[];
  badge: string;
}) {
  const step = 360 / Math.max(posts.length, 1);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rotation = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastMoveAt = useRef(0);
  const targetRotation = useRef<number | null>(null);
  const activeRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Painting, coasting, settling and resize all live in one effect so the
  // frame loop never closes over a stale callback.
  useEffect(() => {
    let raf = 0;

    /** Places every card on the circle for the current rotation. */
    function paint() {
      const stage = stageRef.current;
      if (!stage) return;

      const radius = stage.offsetWidth < 720 ? 300 : 430;
      let nearest = 0;
      let nearestDistance = Infinity;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const angle = normalise(index * step + rotation.current);
        const radians = (angle * Math.PI) / 180;
        const x = Math.sin(radians) * radius;
        const y = radius - Math.cos(radians) * radius;
        const distance = Math.abs(angle);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }

        // Cards further round the ring shrink and fade, so the slot at the top
        // always reads as the front of the wheel.
        const falloff = Math.min(distance / 90, 1);
        const scale = 1.2 - falloff * 0.36;
        const opacity = 1 - falloff * 0.55;

        card.style.transform =
          "translate3d(" +
          x +
          "px, " +
          y +
          "px, 0) rotate(" +
          angle +
          "deg) scale(" +
          scale +
          ")";
        card.style.opacity = String(Math.max(opacity, 0.18));
        card.style.zIndex = String(100 - Math.round(distance));
      });

      if (nearest !== activeRef.current) {
        activeRef.current = nearest;
        setActiveIndex(nearest);
      }
    }

    function loop() {
      if (!dragging.current) {
        if (Math.abs(velocity.current) > SETTLE_SPEED) {
          rotation.current += velocity.current;
          velocity.current *= FRICTION;
          targetRotation.current = null;
        } else {
          velocity.current = 0;
          if (targetRotation.current === null) {
            targetRotation.current = Math.round(rotation.current / step) * step;
          }
          const delta = targetRotation.current - rotation.current;
          if (Math.abs(delta) > 0.02) {
            rotation.current += delta * SETTLE_LERP;
          } else {
            rotation.current = targetRotation.current;
          }
        }
      }

      paint();
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", paint);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", paint);
    };
  }, [step]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = true;
    velocity.current = 0;
    targetRotation.current = null;
    lastX.current = event.clientX;
    lastMoveAt.current = event.timeStamp;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;

    const deltaX = event.clientX - lastX.current;
    const deltaTime = Math.max(event.timeStamp - lastMoveAt.current, 1);
    const deltaAngle = deltaX * DEG_PER_PX;

    rotation.current += deltaAngle;
    // Carry the drag speed into the release so the ring keeps its momentum.
    velocity.current = (deltaAngle / deltaTime) * 16;
    lastX.current = event.clientX;
    lastMoveAt.current = event.timeStamp;
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      velocity.current = 0;
    }
  }

  /** Brings a card to the front slot — the click and keyboard path. */
  function focusCard(index: number) {
    velocity.current = 0;
    const current = rotation.current;
    // Pick the equivalent angle nearest the current rotation, so the ring
    // never spins the long way round.
    targetRotation.current = current + normalise(-index * step - current);
  }

  const activePost = posts[activeIndex];
  const activeDate = activePost?.publishedDate ?? activePost?.createdAt;
  const activeFormattedDate = formatDate(activeDate);
  const activeGallery = activePost ? getGallery(activePost) : [];

  return (
    <div>
      {/* `isolate` keeps the per-card z-index inside this stage, so a card at
          the front of the ring can never stack above the sticky header. */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative isolate h-[420px] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[500px]"
      >
        <div className="absolute left-1/2 top-6 h-0 w-0 sm:top-10">
          {posts.map((post, index) => {
            const isActive = index === activeIndex;
            const date = post.publishedDate ?? post.createdAt;
            const formattedDate = formatDate(date);

            return (
              <button
                key={post._id}
                type="button"
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                onClick={() => focusCard(index)}
                onFocus={() => focusCard(index)}
                aria-current={isActive ? "true" : undefined}
                aria-controls="member-detail"
                style={{ transformOrigin: "center center" }}
                className={cn(
                  "absolute left-0 top-0 -ml-[110px] flex aspect-square w-[220px] flex-col justify-between overflow-hidden rounded-3xl border p-5 text-left backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ease-brand sm:-ml-[130px] sm:w-[260px] sm:p-6",
                  isActive
                    ? "border-highlight/70 bg-highlight/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_26px_54px_-18px_rgba(244,196,62,0.45)]"
                    : "border-white/20 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_18px_38px_-20px_rgba(6,26,47,0.8)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[11px] font-extrabold uppercase tracking-[0.04em] transition-colors duration-500 ease-brand",
                      isActive
                        ? "bg-highlight text-primary-900"
                        : "bg-white/15 text-white/80"
                    )}
                  >
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {badge}
                  </span>
                  {post.thumbnail?.url && (
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/25">
                      <Image
                        src={post.thumbnail.url}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  {date && formattedDate && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 font-sans text-[12px] font-bold transition-colors duration-500 ease-brand",
                        isActive ? "text-highlight" : "text-accent-200/80"
                      )}
                    >
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      <time dateTime={date}>{formattedDate}</time>
                    </span>
                  )}
                  <h3 className="mt-2 line-clamp-3 font-sans text-base font-extrabold leading-snug text-white sm:text-lg">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-primary-100/75">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* A ring card only has room for the first few lines, so the post the
          reader has brought to the front is written out in full here. */}
      {activePost && (
        <article
          key={activePost._id}
          id="member-detail"
          aria-live="polite"
          className="member-detail mx-auto mt-6 max-w-3xl rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_26px_60px_-30px_rgba(6,26,47,0.9)] backdrop-blur-xl sm:mt-10 sm:p-9"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1.5 font-sans text-[11px] font-extrabold uppercase tracking-[0.04em] text-primary-900">
              <Lock className="h-3 w-3" aria-hidden="true" />
              {badge}
            </span>
            {activeDate && activeFormattedDate && (
              <span className="inline-flex items-center gap-1.5 font-sans text-[13px] font-bold text-highlight">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                <time dateTime={activeDate}>{activeFormattedDate}</time>
              </span>
            )}
          </div>

          <h3 className="mt-4 font-sans text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {activePost.title}
          </h3>

          {activePost.excerpt && (
            <p className="mt-4 text-base leading-7 text-primary-100/80">
              {activePost.excerpt}
            </p>
          )}

          {activeGallery.length > 0 && (
            <div
              className={cn(
                "mt-6 grid gap-3",
                activeGallery.length > 1 && "sm:grid-cols-2"
              )}
            >
              {activeGallery.map((url) => (
                <span
                  key={url}
                  className="relative block aspect-[16/9] overflow-hidden rounded-2xl border border-white/20"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 360px, 100vw"
                    className="object-cover"
                  />
                </span>
              ))}
            </div>
          )}

          {activePost.contentHtml && (
            <div
              className="cms-content cms-content--invert mt-6 border-t border-white/15 pt-6"
              dangerouslySetInnerHTML={{ __html: activePost.contentHtml }}
            />
          )}
        </article>
      )}
    </div>
  );
}
