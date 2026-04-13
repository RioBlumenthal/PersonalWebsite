"use client";

import Link from "next/link";
import HeadFollowClient from "./HeadFollowClient";

export default function HeadFollowPage() {
  return (
    <div className="-m-4 flex h-full w-[calc(100%+2rem)] flex-col">
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 py-3">
        <Link
          href="/games"
          className="text-sm font-medium text-zinc-200 underline-offset-4 hover:text-white hover:underline"
        >
          ← Games
        </Link>
        <h1 className="text-sm font-semibold tracking-tight text-white">
          Head follow
        </h1>
      </header>
      <HeadFollowClient />
    </div>
  );
}
