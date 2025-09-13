"use client";

import { useChatContext } from "@/context/ChatLayoutContext";
import NewContactList from "./NewContactList";
import { useEffect } from "react";
import ChatList from "./ChatList";
import { useAppContext } from "@/context/AppContext";

export default function ChatListContainer({ chatsList }) {
  const { newContactSearch } = useChatContext()
  const { setLocalChatsList } = useAppContext()

  useEffect(()=>{
    setLocalChatsList(chatsList)
  }, [])

  return (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
      {newContactSearch === "" ? <ChatList /> : <NewContactList />}
    </div>
  );
}
