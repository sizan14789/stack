import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

export default function Loading() {
  return (
    <div className="grow h-full w-full flex justify-center items-center">
      <Bouncy size="45" speed="1.75" color="var(--accent)" />
    </div>
  );
}

