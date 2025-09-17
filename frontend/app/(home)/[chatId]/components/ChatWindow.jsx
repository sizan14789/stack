import { useAppContext } from "@/context/AppContext";
import { useChatContext } from "@/context/ChatLayoutContext";
import { useEffect } from "react";
import { format } from "date-fns";
import Image from "next/image";
import Loading from "@/app/(home)/loading";

export default function ChatWindow() {
  const { socket, localUser } = useAppContext();
  const { localMessages, setLocalMessages } = useChatContext();

  useEffect(() => {
    if (!socket) return;

    socket.on("text received", (text) => {
      setLocalMessages((prev) => [text, ...prev]);
    });

    return () => socket.off("text received");
  }, [socket]);

  if (!(localUser && localMessages)) return <Loading />;
  else {
    let prevMessageSenderId;
    let nextMessageSenderId;

    return (
      <div className="flex flex-col-reverse px-4 py-2 overflow-y-auto overflow-x-hidden gap-1 grow">
        {localMessages.map((curMessage, index) => {
          const { _id, chat, text, read, createdAt } = curMessage;
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
            >
              {prevMessageSenderId !== sender._id ? (
                <figure
                  className="h-[2rem] sm:h-[2.5rem] min-w-[2rem] sm:min-w-[2.5rem] flex justify-center items-center rounded-full overflow-hidden"
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
                  <span className="float-right mt-2 ml-4 mb-1 !text-[.5rem]  sm:!text-[.6rem] self-end whitespace-nowrap text-secondary">
                    {textTime}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
