import getUser from "@/lib/getUser";

export default async function Home() {
  const user = await getUser();

  return (
    <div className="hidden md:flex h-full justify-center items-center ">
      <h2 className="text-xl md:text-2xl xl:text-4xl">How you feeling today <span className="text-[var(--accent)]">{user?.username}</span>?</h2>
    </div> 
  );
}
