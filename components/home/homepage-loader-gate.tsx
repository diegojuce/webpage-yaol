"use client";

import { ReactNode, useState } from "react";
import HomepageLogoLoader from "components/home/homepage-logo-loader";

type HomepageLoaderGateProps = {
  children: ReactNode;
};

export default function HomepageLoaderGate({
  children,
}: HomepageLoaderGateProps) {
  const [isReady, setIsReady] = useState(false);

  return (
    <>
      <HomepageLogoLoader onFinish={() => setIsReady(true)} />
      <div style={{ visibility: isReady ? "visible" : "hidden" }}>
        {children}
      </div>
    </>
  );
}
