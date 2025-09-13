"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter()
  const { setLocalUser } = useAppContext();

  const handleLogIn = async (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const loginData = Object.fromEntries(formdata);
    const username = loginData.username.trim()
    const loginDataUpdated = {
      ...loginData,
      username
    }
    try {
      const res = await fetch(
        `/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify(loginDataUpdated),
          credentials: "include",
        }
      );


      if (res.status === 200) {
        const data = await res.json();
        setLocalUser(data);
        router.refresh();
        toast.success("Logged in");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error(error.message==="JSON.parse: unexpected character at line 1 column 1 of the JSON data"? "Server down" : error.message );
    }
  };

  return (
    <form className="flex flex-col w-full max-w-[25rem]" onSubmit={handleLogIn}>
      <label htmlFor="username" className="mb-2 text-[var(--text-secondary)] !text-sm">
        Username or Email
      </label>
      <input
        type="text"
        required
        name="username"
        placeholder="Username or email"
        className="input-field mb-5"
      />

      <label htmlFor="username" className="mb-2 text-[var(--text-secondary)] !text-sm">
        Password
      </label>
      <input
        type="password"
        required
        name="password"
        placeholder="Password"
        className="input-field mb-5"
      />

      <button className="button-secondary !w-[8rem] ">Log in</button>
    </form>
  );
}
