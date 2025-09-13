import Link from "next/link";
import SignupForm from "../components/SignupForm";
import getUser from "@/lib/getUser";
import { redirect } from "next/navigation";

export default async function Signup() {
  const user = await getUser();
    if(user)
      redirect('/');

  return (
    <div className="page">
      <div className="box grow flex flex-col sm:items-center justify-center pb-20">
        <h2 className="text-3xl mb-4 sm:mb-8 md:text-[5svw] xl:text-[4svw] ">
          New to Stack?
        </h2>
        <SignupForm />
        <p className="text-secondary mt-6">
          Already have an account? <Link href="/login" className="font-bold text-[var(--accent)]">Log in</Link>
        </p>
      </div>
    </div>
  );
}
