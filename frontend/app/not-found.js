"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TbError404 } from "react-icons/tb";

export default function NotFound() {
  const  [ count, setCount ] = useState(5);
  const router = useRouter()

  useEffect(()=>{
    const counter = setInterval(() => {
      setCount(prev => prev-1)      
    }, 1000);

    return () => clearInterval(counter);
  }, [])

  useEffect(()=>{
    if(count<=0)
      router.push('/')
  }, [count])

  return (
    <div className="grow h-full w-full flex justify-center items-center">
      <h2 className="text-xl md:text-4xl flex gap-2 flex-col items-center">
        <TbError404 />{" "}
        <p className="text-secondary">
          redirecting to <Link href="/" className="text-[var(--accent)] font-semibold" > homepage</Link> in {count}
        </p>
      </h2>
    </div>
  );
}
