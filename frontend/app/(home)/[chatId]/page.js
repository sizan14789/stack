import getToken from "@/lib/getToken";
import ChatContainer from "./components/ChatContainer";
import { redirect } from "next/navigation";
import Loading from "@/app/(home)/loading";

const getChatInfo = async (chatId, token) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${chatId}`,
      {
        method: "GET",
        headers: {
          Cookie: `auth_token=${token}`,
        },
      }
    );

    if (res.status === 200) {
      const data = await res.json();
      return data;
    } else {
      redirect("/");
    }
  } catch (error) {
    console.log(error.message + "-at chatId/page.js");
  }
};

const getMessages = async (chatId, token) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${chatId}`,
      {
        method: "GET",
        headers: {
          Cookie: `auth_token=${token}`,
        },
      }
    );
    if (res.status === 200) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.log(error.message + "-at chatId/page.js");
  }
};

export default async function ChatId({ params }) {
  const token = await getToken();
  const { chatId } = await params;
  const chatInfo = await getChatInfo(chatId, token);
  const messages = await getMessages(chatId, token);

  if (!(chatInfo && messages)) <Loading />;
  else
    return (
      <div className="flex flex-col w-full overflow-hidden">
        <ChatContainer chatInfo={chatInfo} messages={messages} />
      </div>
    );
}
