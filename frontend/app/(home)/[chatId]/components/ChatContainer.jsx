"use client"

import { useEffect } from "react";
import ChatBox from "./Chatbox";
import ChatWindow from "./ChatWindow";
import PartnerNavbar from "./PartnerNavbar";
import { useChatContext } from "@/context/ChatLayoutContext";

export default function ChatContainer({chatInfo, messages}) {
  const { setLocalMessages, setLocalChatInfo } = useChatContext();

  useEffect(()=>{
    setLocalMessages(messages)
    setLocalChatInfo(chatInfo)
  }, [])

  return (
    <>
      <PartnerNavbar />
      <ChatWindow />
      <ChatBox />
    </>
  );
}
