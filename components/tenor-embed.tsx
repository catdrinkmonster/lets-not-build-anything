"use client";

import { useEffect, useId, useRef } from "react";

const TENOR_SCRIPT_ID = "tenor-embed-script";
const TENOR_SCRIPT_SRC = "https://tenor.com/embed.js";

const TENOR_EMBEDS = {
  planning: {
    postId: "3349401281762803381",
    aspectRatio: "1",
    href: "https://tenor.com/view/67-67-kid-edit-analog-horror-phonk-gif-3349401281762803381",
    label: "67 67 Kid GIF",
    searchHref: "https://tenor.com/search/67-gifs",
    searchLabel: "67 GIFs",
  },
  "watch-dog": {
    postId: "17430511343641148586",
    aspectRatio: "0.761044",
    href: "https://tenor.com/view/stop-whining-bru-hmm-hmm-hmm-hmm-hmm-hmm-hmm-hmmmmm-dog-whining-dog-whining-gif-17430511343641148586",
    label: "Stop Whining Bru GIF",
    searchHref: "https://tenor.com/search/stop+whining+bru-gifs",
    searchLabel: "Stop Whining Bru GIFs",
  },
} as const;

export function TenorEmbed({
  embed,
  maxWidth = 220,
}: {
  embed: keyof typeof TENOR_EMBEDS;
  maxWidth?: number;
}) {
  const embedRef = useRef<HTMLDivElement | null>(null);
  const fallbackId = useId();
  const config = TENOR_EMBEDS[embed];

  useEffect(() => {
    const currentScript = document.getElementById(TENOR_SCRIPT_ID);
    const nextScript = document.createElement("script");

    nextScript.id = TENOR_SCRIPT_ID;
    nextScript.src = TENOR_SCRIPT_SRC;
    nextScript.async = true;

    if (currentScript?.parentNode) {
      currentScript.parentNode.replaceChild(nextScript, currentScript);
    } else {
      document.body.appendChild(nextScript);
    }
  }, [embed]);

  return (
    <div
      className="mt-5 overflow-hidden bg-[var(--field)] p-3"
      style={{ maxWidth }}
    >
      <div
        ref={embedRef}
        className="tenor-gif-embed"
        data-postid={config.postId}
        data-share-method="host"
        data-aspect-ratio={config.aspectRatio}
        data-width="100%"
      >
        <a href={config.href}>{config.label}</a>
        from{" "}
        <a href={config.searchHref} id={`tenor-${fallbackId}`}>
          {config.searchLabel}
        </a>
      </div>
    </div>
  );
}
