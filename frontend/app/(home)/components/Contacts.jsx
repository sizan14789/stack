"use client";

import { usePathname } from "next/navigation";
import ChatListContainer from "./ChatListContainer";
import SearchContact from "./SearchContact";
import { useEffect, useState } from "react";

export default function Contacts({ chatsList }) {
  const pathname = usePathname();
  const [isRoot, setIsRoot] = useState(false);

  useEffect(() => {
    setIsRoot(pathname === "/");
  }, [pathname]);

  if (isRoot)
    return (
      <div
        className={`md:w-[16rem] md:flex md:col-span-1  flex-col w-full col-span-2 md:border-r-1 border-r-[var(--accent)] h-full`}
      >
        <SearchContact />
        <ChatListContainer chatsList={chatsList} />
      </div>
    );
  else {
    return (
      <div
        className={`md:w-[16rem] hidden md:flex flex-col border-r-1 border-r-[var(--accent)]  h-full`}
      >
        <SearchContact />
        <ChatListContainer chatsList={chatsList} />
      </div>
    );
  }
}
