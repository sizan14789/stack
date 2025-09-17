import getToken from "@/lib/getToken";
import Contacts from "./Contacts";
import Blank from "@/ui/placeholder/Blank";

const getChats = async (token) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats`, {
      method: "GET",
      headers: {
        Cookie: `auth_token=${token}`,
      },
    });
    if (res.status === 200) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.log(e.message);
  }
};

export default async function ContactsContainer() {
  const token = await getToken();
  const chatsList = await getChats(token);

  if (!chatsList) return <Blank />;
  else return <Contacts chatsList={chatsList} />;
}
