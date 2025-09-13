"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignupForm() {
  const router = useRouter()
  const { setLocalUser } = useAppContext();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const signupData = Object.fromEntries(formdata);
    const username = signupData.username.trim();
    const email = signupData.email.trim();
    const signupDataUpdated = {
      ...signupData,
      username,
      email
    }
    try {
      const res = await fetch(
        `/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupDataUpdated),
          credentials: "include",
        }
      );

      if (res.status === 200) {
        const data = await res.json();
        setLocalUser(data);
        toast.success("Signed up");
        router.push('/');
        router.refresh()
      } else {
        console.log(res);
        // toast.error("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message==="JSON.parse: unexpected character at line 1 column 1 of the JSON data"? "Server down" : error.message );
    }
  };

  return (
    <form
      className="flex flex-col w-full max-w-[25rem]"
      onSubmit={handleSignUp}
    >
      <label htmlFor="username" className="mb-2 sm:text-xl">
        Username
      </label>
      <input
        type="text"
        required
        name="username"
        placeholder="Username"
        className="input-field mb-5"
      />

      <label htmlFor="username" className="mb-2 sm:text-xl">
        Email
      </label>
      <input
        type="email"
        required
        name="email"
        placeholder="Email"
        className="input-field mb-5"
      />

      <label htmlFor="username" className="mb-2 sm:text-xl">
        Password
      </label>
      <input
        type="password"
        required
        name="password"
        placeholder="Password"
        className="input-field mb-5"
      />

      <button type="submit" className="button-secondary !w-[8rem] ">
        Sign Up
      </button>
    </form>
  );
}
