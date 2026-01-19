"use client";

import { useEffect } from "react";

type Props = {
  behavior?: ScrollBehavior;
};

export function ScrollToTopOnMount({ behavior = "auto" }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior });
  }, [behavior]);

  return null;
}
