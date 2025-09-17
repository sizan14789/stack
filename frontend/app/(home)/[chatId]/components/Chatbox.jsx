"use client";

import { useAppContext } from "@/context/AppContext";
import { useChatContext } from "@/context/ChatLayoutContext";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsFillSendFill } from "react-icons/bs";
import { CiImageOn } from "react-icons/ci";

export default function ChatBox() {
  const { setLocalChatsList, localUser } = useAppContext();
  const { localChatInfo, setLocalMessages } = useChatContext();

  // for textbox
  const [textInput, setTextInput] = useState("");
  const [sendingImage, setSendingImage] = useState(null);

  const handleTextSending = async (e) => {
    e.preventDefault();
    if (textInput === "" && !sendingImage) {
      toast("No input");
      return;
    }

    // todo setup image sending system
    const postBody = {
      chat: localChatInfo._id,
      text: textInput,
    };

    const syncLastText = async () => {
      try {
        await fetch(`/api/chats/update/${localChatInfo._id}`, {
          method: "PUT",
          body: JSON.stringify({ text: textInput }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
      } catch (error) {
        console.log(error.message + "-at ChatBox.jsx");
        toast.error("Last text sync failed");
      }
    };

    const syncLastTextUi = () => {
      const chatId = localChatInfo._id;
      setLocalChatsList((prev) => {
        prev.forEach((chat) => {
          if (chatId === chat._id) chat.lastText = textInput;
        });
        return prev;
      });
    };

    const syncLocalUi = () => {
      const newMessage = {
        ...postBody,
        sender: {
          _id: localUser._id,
          username: localUser.username,
          avatarBg: localUser.avatarBg,
          imageUrl: localUser.imageUrl,
        },
        _id: JSON.stringify(crypto.randomUUID()),
        createdAt: new Date(),
      };
      setLocalMessages((prev) => [newMessage, ...prev]);
      setTextInput("");
    };

    const syncDatabase = async () => {
      try {
        const res = await fetch(`/api/messages`, {
          method: "POST",
          body: JSON.stringify(postBody),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (res.status === 201) {
          return res;
        } else {
          return false;
        }
      } catch (error) {
        console.log(error);
      }
    };

    try {
      syncLocalUi();
      syncLastTextUi();
      const res = await syncDatabase();

      if (res.status === 201) {
        await syncLastText();
      } else {
        toast.error("Failed to send");
      }
    } catch (error) {
      console.log(error.message + "-at ChatBox.jsx");
      toast.error(e.message);
    }
  };

  // image sending

  const handleImageInput = (e) => {
    setSendingImage(() => ({
      file: e.target.files[0],
      url: URL.createObjectURL(e.target.files[0]),
    }));
  };

  return (
    <div className="border-t-[.5px] border-t-[var(--border)] min-h-[4rem] sm:min-h-[5rem] p-4 flex">
      <div className="flex gap-4 justify-center items-center w-full">
        <div className="flex">
          <div className="cursor-pointer rounded-xl hover:bg-[var(--text-primary)] hover:text-[var(--background)] p-2 duration-200 border-[.5px]">
            <label htmlFor="textImage">
              <CiImageOn className="sm:text-2xl font-bold cursor-pointer" />
              <input
                type="file"
                name="textImage"
                id="textImage"
                className="hidden"
                onChange={handleImageInput}
                required
              />
            </label>
          </div>
        </div>
        <form
          className="flex gap-4 justify-self-end"
          onSubmit={handleTextSending}
        >
          {sendingImage ? (
            <div className="relative">
              <Image
                src={sendingImage.url}
                height={200}
                width={200}
                alt="selecting pic"
                className="object-cover rounded-2xl"
              />
              <button
                className="absolute text-white font-bold top-2 right-4 cursor-pointer"
                onClick={() => setSendingImage(null)}
              >
                X
              </button>
            </div>
          ) : (
            <input
              type="text"
              placeholder="text"
              name="message"
              required
              className="input-field !py-0 sm:!py-1 w-full md:min-w-[20rem] lg:min-w-[30rem] !rounded-4xl "
              onChange={(e) => setTextInput(e.target.value)}
              value={textInput}
            />
          )}
          <button
            type="submit"
            className="cursor-pointer p-2 sm:p-3 aspect-square flex justify-center items-center rounded-full bg-[var(--accent)] text-[var(--background)] max-h-[2rem] sm:max-h-[2.75rem] self-center"
          >
            <BsFillSendFill className="sm:text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
}
