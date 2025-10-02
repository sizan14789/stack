import { useAppContext } from "@/context/AppContext";
import { useChatContext } from "@/context/ChatLayoutContext";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import Loading from "@/app/(home)/loading";
import { TiTick } from "react-icons/ti";
import { TiTickOutline } from "react-icons/ti";

export default function ChatWindow() {
  const { socket, localUser, setLocalChatsList } = useAppContext();
  const { localMessages, localChatInfo, setLocalMessages } = useChatContext();
  const [lastComingText, setLastComingText] = useState({});

  useEffect(() => {
    if (!socket) return;

    socket.on("text received", async (text) => {
      setLocalMessages((prev) => [text, ...prev]);
      setLastComingText(text);

      setLocalChatsList((prev) =>
        prev.map((cur) => {
          if (cur._id === text.chat) cur.lastText = text.text;
          return cur;
        })
      );
    });

    socket.on("read", async (text) => {
      setLocalMessages((prev) =>
        prev.map((message) => ({
          ...message,
          read: true,
        }))
      );
    });

    return () => socket.off("text received");
  }, [socket]);

  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [localMessages]);

  useEffect(() => {
    const syncSeen = async () => {
      const res = await fetch("/api/messages/read", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lastComingText),
        credentials: "include",
      });
    };
    syncSeen();
  }, [lastComingText]);

  useEffect(() => {
    // console.log(localChatInfo);
    if (Object.keys(localChatInfo).length === 0) return;

    const syncSeen = async () => {
      const res = await fetch("/api/chats/read", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localChatInfo),
        credentials: "include",
      });
    };
    syncSeen();
  }, [localChatInfo]);

  if (!(localUser && localMessages)) return <Loading />;
  else {
    let prevMessageSenderId;
    let nextMessageSenderId;

    return (
      <div className="flex flex-col-reverse px-4 py-2 overflow-y-auto overflow-x-hidden gap-1 grow">
        {localMessages.length === 0 ? (
          <p className="self-center text-secondary">No messages yet</p>
        ) : (
          localMessages.map((curMessage, index) => {
            const { _id, chat, text, read, createdAt, isImage } = curMessage;
            const senderDummy = curMessage.sender;
            const sender = senderDummy
              ? senderDummy
              : { _id: "a", username: "Stack User", avatarBg: "gray" };

            const selfSent = sender._id === localUser._id;

            const textTime = format(createdAt, "h:mm a");

            if (index !== 0)
              prevMessageSenderId = localMessages[index - 1]?.sender?._id;

            if (index < localMessages.length - 1)
              nextMessageSenderId = localMessages[index + 1]?.sender?._id;

            return (
              <div
                className={`flex gap-2 max-w-[70%] ${
                  selfSent ? "self-end flex-row-reverse" : ""
                }`}
                key={_id}
                ref={index === 0 ? textRef : null}
              >
                {prevMessageSenderId !== sender._id ? (
                  <figure
                    className="h-[2rem] sm:h-[2.5rem] min-w-[2rem] sm:min-w-[2.5rem] max-w-[2rem] sm:max-w-[2.5rem] flex justify-center items-center rounded-full overflow-hidden"
                    style={{ backgroundColor: sender.avatarBg }}
                  >
                    {sender.imageUrl ? (
                      <Image
                        src={sender.imageUrl}
                        alt="profile_pic"
                        height={100}
                        width={100}
                        className="object-cover h-full w-full"
                        priority
                      />
                    ) : (
                      <h1 className="text-white pb-1">{sender.username[0]}</h1>
                    )}
                  </figure>
                ) : (
                  <figure className="h-[2rem] sm:h-[2.5rem] aspect-square"></figure>
                )}

                {isImage ? (
                  <div className="h-full p-[2px] bg-[var(--accent)] overflow-hidden rounded-2xl">
                    <Image
                      src={text}
                      height={400}
                      width={400}
                      alt="text image"
                      className="w-[8rem] h-[8rem] sm:w-[10rem] sm:h-[10rem] rounded-xl overflow-hidden object-cover"
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={`text-xs border-[.5px] border-[var(--border)] px-4 pt-3 pb-1 rounded-md ${
                      selfSent
                        ? "rounded-bl-4xl rounded-tl-4xl"
                        : "rounded-br-4xl rounded-tr-4xl"
                    } ${
                      selfSent
                        ? prevMessageSenderId === sender._id
                          ? ""
                          : "rounded-br-4xl"
                        : prevMessageSenderId === sender._id
                        ? ""
                        : "rounded-bl-4xl"
                    } 
                ${
                  selfSent
                    ? nextMessageSenderId === sender._id
                      ? ""
                      : "rounded-tr-4xl"
                    : nextMessageSenderId === sender._id
                    ? ""
                    : "rounded-tl-4xl"
                }
                bg-[var(--chat-bg)] duration-150`}
                  >
                    <p className="break-words">
                      <span>{text}</span>
                      <span className="float-right flex gap-1 items-center mt-2 ml-4 mb-1 !text-[.5rem]  sm:!text-[.6rem] self-end whitespace-nowrap text-secondary">
                        {read && selfSent ? <span className="text-[.7rem] text-[var(--accent)] ">seen</span> : <></>}
                        {textTime}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }
}
