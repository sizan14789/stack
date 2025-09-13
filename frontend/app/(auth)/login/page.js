import Link from "next/link";
import LoginForm from "../components/LoginForm";
import getUser from "@/lib/getUser";
import { redirect } from "next/navigation";

export default async function Login(){
  const user = await getUser();
  if(user)
    redirect('/');

  return(
    <div className="page">
      <div className="box grow flex flex-col sm:items-center justify-center pb-20">
        <h2 className="text-3xl mb-4 sm:mb-8 md:text-[5svw] xl:text-[4svw] ">Welcome to Stack</h2>
        <LoginForm />
        <p className="text-secondary mt-6">
          Don&apos;t have an account? <Link href="/signup" className="font-bold text-[var(--accent)]">Sign up</Link>
        </p>
      </div>
    </div>
  )
}