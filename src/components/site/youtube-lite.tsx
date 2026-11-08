"use client";

import { Play } from "lucide-react";
import { useState } from "react";

/** Click-to-load YouTube facade: no YouTube JS until the visitor presses play. */
export function YouTubeLite({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="yt">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`Play video: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- external thumbnail */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="play">
            <Play aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}
