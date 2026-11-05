"use client";
import { useEffect } from "react";

// The hero is pinned and the page slides over it; once it is covered, take its buttons out of the tab order.
export default function HeroInert() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    const cover = document.getElementById("cover");
    const pinned = matchMedia("(min-height: 700px)"); // below that height the hero scrolls normally and is never covered
    if (!hero || !cover) return;
    const io = new IntersectionObserver(([e]) => { hero.inert = e.isIntersecting && pinned.matches; }, { rootMargin: "0px 0px -20% 0px" });
    io.observe(cover);
    return () => { io.disconnect(); hero.inert = false; };
  }, []);
  return null;
}
