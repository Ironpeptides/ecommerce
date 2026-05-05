"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toggleReaction, ReactionCount } from "@/actions/reactions";

// ── Stable anonymous session ID stored in localStorage ────────────────────────
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("blog_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("blog_session_id", id);
  }
  return id;
}

// ── Floating "+1" particle that flies up and fades ───────────────────────────
type Particle = { id: number; emoji: string; x: number };

function FloatingParticle({ emoji, x }: { emoji: string; x: number }) {
  return (
    <span
      className="pointer-events-none fixed z-50 select-none text-2xl"
      style={{
        left: x,
        top: "50%",
        transform: "translateY(-50%)",
        animation: "floatUp 0.9s ease-out forwards",
      }}
    >
      {emoji}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  blogId: string;
  initialReactions: ReactionCount[];
};

export default function BlogReactions({ blogId, initialReactions }: Props) {
  const [reactions, setReactions] = useState<ReactionCount[]>(initialReactions);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPending, startTransition] = useTransition();
  const sessionId = useRef<string>("");
  const particleId = useRef(0);

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  function spawnParticle(emoji: string, x: number) {
    const id = ++particleId.current;
    setParticles((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== id)), 950);
  }

  function handleReact(emoji: string, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    // Optimistic update
    setReactions((prev) =>
      prev.map((r) =>
        r.emoji === emoji
          ? {
              ...r,
              count: r.userReacted ? r.count - 1 : r.count + 1,
              userReacted: !r.userReacted,
            }
          : r
      )
    );

    if (!reactions.find((r) => r.emoji === emoji)?.userReacted) {
      spawnParticle(emoji, centerX);
    }

    startTransition(async () => {
      try {
        const updated = await toggleReaction(blogId, emoji, sessionId.current);
        setReactions(updated);
      } catch {
        // revert optimistic update on error
        setReactions(initialReactions);
      }
    });
  }

  const totalReactions = reactions.reduce((s, r) => s + r.count, 0);

  return (
    <>
      {/* Floating particles */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} emoji={p.emoji} x={p.x} />
      ))}

      <div className="my-12 py-8 border-t border-b border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-medium">
            Reactions
          </p>
          {totalReactions > 0 && (
            <span className="text-xs text-gray-500">
              {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
            </span>
          )}
        </div>

        {/* Emoji buttons */}
        <div className="flex flex-wrap gap-3">
          {reactions.map(({ emoji, count, userReacted }) => (
            <button
              key={emoji}
              onClick={(e) => handleReact(emoji, e)}
              disabled={isPending}
              aria-label={`React with ${emoji}`}
              className={`
                group relative flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm
                font-medium transition-all duration-200 select-none
                ${
                  userReacted
                    ? "bg-white/15 border-white/30 text-white scale-105"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
                }
                ${isPending ? "cursor-not-allowed opacity-70" : "cursor-pointer active:scale-95"}
              `}
              style={{
                transform: userReacted ? "scale(1.05)" : undefined,
              }}
            >
              {/* Emoji with bounce on react */}
              <span
                className={`text-xl leading-none transition-transform duration-150 ${
                  userReacted ? "animate-none" : "group-hover:scale-125"
                }`}
                style={{
                  display: "inline-block",
                  animation: userReacted ? "popIn 0.25s ease-out" : undefined,
                }}
              >
                {emoji}
              </span>

              {/* Count */}
              {count > 0 && (
                <span
                  className={`tabular-nums transition-colors ${
                    userReacted ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                  }`}
                >
                  {count}
                </span>
              )}

              {/* "You reacted" dot */}
              {userReacted && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-black" />
              )}
            </button>
          ))}
        </div>

        {/* Subtle prompt */}
        <p className="text-xs text-gray-600 mt-4">
          Click an emoji to react · You can change your reaction anytime
        </p>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-80px) scale(1.4); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.7); }
          60%  { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}