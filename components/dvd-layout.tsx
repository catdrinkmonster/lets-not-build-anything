"use client";

import { layoutNextLine, prepareWithSegments, type LayoutCursor, type PreparedTextWithSegments } from "@chenglou/pretext";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { moveBouncingRect, type MovingRectState } from "@/lib/dvd-motion";

const COPY =
  "This card exists purely to prove that the layout can survive a deeply unnecessary moving obstacle. The DVD logo keeps bouncing around the paragraph while the text recomputes itself in real time, which is absolutely not helping your product, but it does look committed. If this thing ever lands perfectly in the corner, we will immediately treat that as a technical green light and pretend it was all part of the roadmap.";
const FONT = '15px "IBM Plex Mono"';
const LINE_HEIGHT = 26;
const LOGO_WIDTH = 88;
const LOGO_HEIGHT = 44;
const LOGO_GAP = 12;
const MIN_HEIGHT = 188;
const MIN_FRAGMENT_WIDTH = 84;

type LogoState = MovingRectState;

type PositionedLine = {
  key: string;
  text: string;
  x: number;
  y: number;
};

const INITIAL_LOGO_STATE: LogoState = {
  x: 12,
  y: 18,
  vx: 112,
  vy: 96,
};

export function DvdLayout() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boundsHeightRef = useRef(MIN_HEIGHT);
  const [width, setWidth] = useState(0);
  const [logo, setLogo] = useState<LogoState>(INITIAL_LOGO_STATE);
  const [prepared, setPrepared] = useState<PreparedTextWithSegments | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function prepareText() {
      if (typeof window === "undefined") {
        return;
      }

      await document.fonts?.ready;

      if (!isMounted) {
        return;
      }

      setPrepared(prepareWithSegments(COPY, FONT));
    }

    prepareText();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setWidth(entry.contentRect.width);
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => {
    if (!prepared || width <= 0) {
      return {
        height: MIN_HEIGHT,
        lines: [] as PositionedLine[],
      };
    }

    return computeLayout(prepared, width, logo);
  }, [logo, prepared, width]);

  useEffect(() => {
    boundsHeightRef.current = Math.max(layout.height, MIN_HEIGHT);
  }, [layout.height]);

  useEffect(() => {
    if (width <= 0) {
      return;
    }

    let animationFrame = 0;
    let previousTimestamp = 0;

    const animate = (timestamp: number) => {
      if (previousTimestamp === 0) {
        previousTimestamp = timestamp;
      }

      const dt = Math.min((timestamp - previousTimestamp) / 1000, 0.032);
      previousTimestamp = timestamp;

      setLogo((current) =>
        moveBouncingRect(
          current,
          width,
          boundsHeightRef.current,
          LOGO_WIDTH,
          LOGO_HEIGHT,
          dt,
        ),
      );

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [width]);

  return (
    <div
      ref={containerRef}
      className="mt-5 w-full"
      style={{ minHeight: Math.max(layout.height, MIN_HEIGHT) }}
    >
      <div
        className="relative w-full"
        style={{ height: Math.max(layout.height, MIN_HEIGHT) }}
      >
        {layout.lines.map((line) => (
          <p
            key={line.key}
            className="terminal-text absolute whitespace-pre text-sm leading-[26px] text-white/54"
            style={{ left: line.x, top: line.y }}
          >
            {line.text}
          </p>
        ))}

        <Image
          src="/Dvd_logo.svg.avif"
          alt=""
          className="absolute select-none"
          unoptimized
          draggable={false}
          style={{
            left: logo.x,
            top: logo.y,
          }}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
        />
      </div>
    </div>
  );
}

function computeLayout(
  prepared: PreparedTextWithSegments,
  width: number,
  logo: Pick<LogoState, "x" | "y">,
) {
  const lines: PositionedLine[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let lineIndex = 0;
  const logoLeft = logo.x;
  const logoRight = logo.x + LOGO_WIDTH;
  const textRightX = Math.min(logoRight + LOGO_GAP, width);

  while (true) {
    const y = lineIndex * LINE_HEIGHT;
    const verticalOverlap =
      y < logo.y + LOGO_HEIGHT + LOGO_GAP && y + LINE_HEIGHT > logo.y - LOGO_GAP;
    const leftWidth = Math.max(logoLeft - LOGO_GAP, 0);
    const rightWidth = Math.max(width - textRightX, 0);

    if (!verticalOverlap) {
      const line = layoutNextLine(prepared, cursor, width);

      if (line === null) {
        break;
      }

      lines.push({
        key: `${line.start.segmentIndex}:${line.start.graphemeIndex}:full`,
        text: line.text,
        x: 0,
        y,
      });
      cursor = line.end;
      lineIndex += 1;
      continue;
    }

    let consumedOnRow = false;

    if (leftWidth >= MIN_FRAGMENT_WIDTH) {
      const leftLine = layoutNextLine(prepared, cursor, leftWidth);

      if (leftLine !== null) {
        lines.push({
          key: `${leftLine.start.segmentIndex}:${leftLine.start.graphemeIndex}:left`,
          text: leftLine.text,
          x: 0,
          y,
        });
        cursor = leftLine.end;
        consumedOnRow = true;
      }
    }

    if (rightWidth >= MIN_FRAGMENT_WIDTH) {
      const rightLine = layoutNextLine(prepared, cursor, rightWidth);

      if (rightLine !== null) {
        lines.push({
          key: `${rightLine.start.segmentIndex}:${rightLine.start.graphemeIndex}:right`,
          text: rightLine.text,
          x: textRightX,
          y,
        });
        cursor = rightLine.end;
        consumedOnRow = true;
      }
    }

    if (!consumedOnRow) {
      const fallbackX = leftWidth >= rightWidth ? 0 : textRightX;
      const fallbackWidth = Math.max(Math.max(leftWidth, rightWidth), MIN_FRAGMENT_WIDTH);
      const fallbackLine = layoutNextLine(prepared, cursor, fallbackWidth);

      if (fallbackLine === null) {
        break;
      }

      lines.push({
        key: `${fallbackLine.start.segmentIndex}:${fallbackLine.start.graphemeIndex}:fallback`,
        text: fallbackLine.text,
        x: fallbackX,
        y,
      });
      cursor = fallbackLine.end;
    }

    lineIndex += 1;
  }

  return {
    lines,
    height: Math.max(lineIndex * LINE_HEIGHT, logo.y + LOGO_HEIGHT),
  };
}
