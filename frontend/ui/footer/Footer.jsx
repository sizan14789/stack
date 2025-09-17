import Link from "next/link";

export default function Footer(){
  return(
    <div className="px-4 py-4 lg:py-8 max-w-[90rem] mx-auto flex justify-center">
      <p className="text-secondary">© 2025 Sizan Molla. All rights reserved. <Link href="/" className="text-[var(--accent)] font-bold">Stack</Link></p>
    </div>
  )
}