"use client";

import { useAppContext } from "@/context/AppContext";
import { useEffect } from "react";

export default function LocalUserSetter({ user }) {
  const { setLocalUser } = useAppContext();
  useEffect(() => {
    setLocalUser(user);
  }, []);
  return <></>;
}
