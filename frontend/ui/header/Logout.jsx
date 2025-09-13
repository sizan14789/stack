"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RiLogoutBoxLine } from "react-icons/ri";

export default function Logout() {
  const router = useRouter();
  const { localUser, setLocalUser } = useAppContext();

  const handleLogout = async () => {
    const res = await fetch(`/api/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
    if (res.status === 200) {
      toast.success("Logged out");
      router.push("/login");
      router.refresh();
      // setLocalUser({});
    } else {
      toast.error("Could not log out");
    }
  };

  return (
    <button className={`gap-1 button-primary`} onClick={handleLogout}>
      <RiLogoutBoxLine />
      <p className="">Logout</p>
    </button>
  );
}
