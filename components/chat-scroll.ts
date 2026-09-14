"use client";

import { useCallback, useRef, useState } from "react";

/** Distance from the bottom (px) still considered "at the bottom". */
export const BOTTOM_THRESHOLD = 64;

/**
 * Pin-to-bottom decision: stay pinned while the user is at the bottom, and
 * release the moment they scroll up. The chat effect calls
 * `scrollToBottomIfPinned` on each content change, so an unpinned viewport is
 * never yanked back down mid-read.
 */
export function isNearBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold: number = BOTTOM_THRESHOLD,
): boolean {
  return scrollHeight - scrollTop - clientHeight < threshold;
}

export function useChatScroll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);

  const handleScroll = useCallback(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }
    setPinnedToBottom(
      isNearBottom(element.scrollTop, element.scrollHeight, element.clientHeight),
    );
  }, []);

  const jumpToLatest = useCallback(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }
    element.scrollTop = element.scrollHeight;
    setPinnedToBottom(true);
  }, []);

  const scrollToBottomIfPinned = useCallback(() => {
    const element = viewportRef.current;
    if (element && pinnedToBottom) {
      element.scrollTop = element.scrollHeight;
    }
  }, [pinnedToBottom]);

  return { viewportRef, pinnedToBottom, handleScroll, jumpToLatest, scrollToBottomIfPinned };
}