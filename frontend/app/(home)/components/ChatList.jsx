import ChatListCard from "./ChatListCard";
import { useAppContext } from "@/context/AppContext";

export default function ChatList() {
  const { localChatsList } = useAppContext()

  if (localChatsList)
    return (
      <>
        {localChatsList.map((curChat) => (
          <ChatListCard curChat={curChat} key={curChat._id} />
        ))}
      </>
    );
}
