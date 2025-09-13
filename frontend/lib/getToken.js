import { cookies } from "next/headers";

export default async function getToken(){
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}