"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const REAPPEAR_DELAY_MS = 60_000;
const BUTTON_SIZE = 64;
const EDGE_GAP = 20;
const DRAG_THRESHOLD = 6;
const DELETE_TARGET_SIZE = 112;
const DELETE_TARGET_RADIUS = 68;
const DELETE_TARGET_BOTTOM_GAP = 48;
const POSITION_STORAGE_KEY = "prestigia-whatsapp-position";

type WhatsappButtonClientProps = {
  href: string;
};

type ButtonPosition = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  hasMoved: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampPosition(position: ButtonPosition): ButtonPosition {
  return {
    x: clamp(position.x, EDGE_GAP, window.innerWidth - BUTTON_SIZE - EDGE_GAP),
    y: clamp(position.y, EDGE_GAP, window.innerHeight - BUTTON_SIZE - EDGE_GAP),
  };
}

function getDefaultPosition() {
  return clampPosition({
    x: window.innerWidth - BUTTON_SIZE - EDGE_GAP,
    y: window.innerHeight - BUTTON_SIZE - EDGE_GAP,
  });
}

function getDeleteTargetCenter() {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight - DELETE_TARGET_BOTTOM_GAP - DELETE_TARGET_SIZE / 2,
  };
}

function isInsideDeleteTarget(x: number, y: number) {
  const center = getDeleteTargetCenter();
  const distance = Math.hypot(x - center.x, y - center.y);
  return distance <= DELETE_TARGET_RADIUS;
}

function savePosition(position: ButtonPosition) {
  try {
    window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
  } catch {
    // Local storage can be unavailable in strict privacy modes.
  }
}

export function WhatsappButtonClient({ href }: WhatsappButtonClientProps) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const ignoreClickRef = useRef(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverDeleteTarget, setIsOverDeleteTarget] = useState(false);
  const [position, setPosition] = useState<ButtonPosition | null>(null);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    previousPathname.current = pathname;
    setIsHidden(false);
  }, [pathname]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isHidden) return;

    timerRef.current = setTimeout(() => {
      setIsHidden(false);
      timerRef.current = null;
    }, REAPPEAR_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isHidden]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedPosition = window.localStorage.getItem(POSITION_STORAGE_KEY);
        if (savedPosition) {
          const parsed = JSON.parse(savedPosition) as Partial<ButtonPosition>;
          if (typeof parsed.x === "number" && typeof parsed.y === "number") {
            setPosition(clampPosition({ x: parsed.x, y: parsed.y }));
            return;
          }
        }
      } catch {
        // Fall back to the default position if the saved value is invalid.
      }

      setPosition(getDefaultPosition());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleResize() {
      setPosition((currentPosition) => {
        const nextPosition = clampPosition(currentPosition ?? getDefaultPosition());
        savePosition(nextPosition);
        return nextPosition;
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function hideButtonTemporarily() {
    const nextPosition = getDefaultPosition();
    setPosition(nextPosition);
    savePosition(nextPosition);
    setIsHidden(true);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    const origin = position ?? {
      x: rect?.left ?? window.innerWidth - BUTTON_SIZE - EDGE_GAP,
      y: rect?.top ?? window.innerHeight - BUTTON_SIZE - EDGE_GAP,
    };

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
      hasMoved: false,
    };

    setPosition(origin);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < DRAG_THRESHOLD && !dragState.hasMoved) return;

    event.preventDefault();
    dragState.hasMoved = true;
    setIsDragging(true);
    setIsOverDeleteTarget(isInsideDeleteTarget(event.clientX, event.clientY));
    setPosition(
      clampPosition({
        x: dragState.originX + deltaX,
        y: dragState.originY + deltaY,
      }),
    );
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const wasDragged = dragState.hasMoved;
    const nextPosition = clampPosition({
      x: dragState.originX + event.clientX - dragState.startX,
      y: dragState.originY + event.clientY - dragState.startY,
    });

    dragStateRef.current = null;
    setIsDragging(false);
    setIsOverDeleteTarget(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }

    if (!wasDragged) return;

    event.preventDefault();
    ignoreClickRef.current = true;

    if (isInsideDeleteTarget(event.clientX, event.clientY)) {
      hideButtonTemporarily();
    } else {
      setPosition(nextPosition);
      savePosition(nextPosition);
    }

    window.setTimeout(() => {
      ignoreClickRef.current = false;
    }, 120);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    setIsDragging(false);
    setIsOverDeleteTarget(false);
  }

  if (isHidden) return null;

  return (
    <>
      {isDragging ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 bottom-[calc(3rem+env(safe-area-inset-bottom))] z-[49] flex justify-center"
        >
          <div
            className={`grid size-28 place-items-center rounded-full border transition duration-200 ${
              isOverDeleteTarget
                ? "scale-110 border-red-300 bg-red-500/90 shadow-[0_0_45px_rgba(239,68,68,0.55)]"
                : "border-red-400/45 bg-red-500/20 shadow-[0_0_34px_rgba(239,68,68,0.22)]"
            }`}
          >
            <X className="size-12 text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.5)]" />
          </div>
        </div>
      ) : null}
      <div
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`fixed z-50 touch-none select-none ${
          position ? "" : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 sm:bottom-6 sm:right-6"
        }`}
        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
      >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter Prestigia Agency sur WhatsApp"
        title="Contacter Prestigia Agency sur WhatsApp"
        draggable={false}
        onClick={(event) => {
          if (!ignoreClickRef.current) return;

          event.preventDefault();
          event.stopPropagation();
          ignoreClickRef.current = false;
        }}
        className={`relative block size-16 cursor-grab overflow-hidden rounded-[22%] bg-white shadow-[0_12px_34px_rgba(37,211,102,0.38)] transition duration-300 active:cursor-grabbing ${
          isDragging
            ? isOverDeleteTarget
              ? "scale-90 opacity-80 ring-4 ring-red-400/70"
              : "scale-110 shadow-[0_18px_44px_rgba(37,211,102,0.5)]"
            : "hover:scale-105"
        }`}
      >
        <Image
          src="/whatsapp-icon.webp"
          alt=""
          fill
          sizes="64px"
          className="object-cover"
          priority={false}
          draggable={false}
        />
      </Link>
    </div>
    </>
  );
}
