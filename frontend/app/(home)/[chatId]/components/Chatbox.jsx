"use client";

import { useAppContext } from "@/context/AppContext";
import { useChatContext } from "@/context/ChatLayoutContext";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsFillSendFill } from "react-icons/bs";
import { CiImageOn } from "react-icons/ci";
import imageCompression from "browser-image-compression";

export default function ChatBox() {
  const { setLocalChatsList, localUser } = useAppContext();
  const { localChatInfo, setLocalMessages } = useChatContext();

  // for textbox
  const [textInput, setTextInput] = useState("");
  const [sendingImage, setSendingImage] = useState(null);

  // image sending
  const handleImageInput = (e) => {
    setSendingImage(() => ({
      file: e.target.files[0],
      url: URL.createObjectURL(e.target.files[0]),
    }));
  };

  const handleSending = (e) => {
    e.preventDefault();
    if (sendingImage) {
      handleImageSending(e);
    } else {
      handleTextSending(e);
    }
  };

  // todo update ui instant with placeholder
  const handleImageSending = async () => {
    if (!sendingImage) {
      toast("No image");
      return;
    }

    setSendingImage(null);

    const id = toast.loading("Uploading...")

    const handleImageUpload = async () => {
      const formData = new FormData();

      const compressed = await imageCompression(sendingImage.file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      });

      formData.append("file", compressed);
      formData.append("upload_preset", "text_image");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (res.status !== 200) {
        // console.log(res);
        toast.error("Failed to upload to cloudinary", { id });
      } else {
        const data = await res.json();
        toast.success("Uploaded", { id })
        return data.secure_url;
      }
    };

    const imageUrl = await handleImageUpload();

    const postBody = {
      chat: localChatInfo._id,
      text: imageUrl,
      isImage: true,
    };

    const handleDatabaseSync = async () => {
      if (!imageUrl) {
        return;
      }

      const res = await fetch(`/api/messages`, {
        method: "POST",
        body: JSON.stringify(postBody),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (res.status === 201) {
        return true;
      } else {
        return false;
      }
    };

    // todo identify who sent
    const syncLastText = async () => {
      try {
        await fetch(`/api/chats/update/${localChatInfo._id}`, {
          method: "PUT",
          body: JSON.stringify({ text: "Sent a photo" }),
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

    const syncLocalUi = () => {
      if (postBody.text) {
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
      } else {
        console.log("Sending image at client level");
      }
    };

    // todo identify who sent
    const syncLastTextUi = () => {
      const chatId = localChatInfo._id;
      setLocalChatsList((prev) => {
        prev.forEach((chat) => {
          if (chatId === chat._id) chat.lastText = "Sent a photo";
        });
        return prev;
      });
    };

    try {
      syncLocalUi();
      syncLastTextUi();

      const res = await handleDatabaseSync();
      if (res) {
        toast.success("Sent");
        syncLastText();
      } else {
        toast.error("Failed at database sync");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTextSending = async () => {
    if (textInput === "") {
      toast("No input");
      return;
    }

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
      // toast.error(e.message);
    }
  };

  return (
    <div className={`border-t-[.5px] border-t-[var(--border)] h-[4rem] sm:min-h-[5rem] p-4 flex ${sendingImage? "h-[9rem] sm:min-h-[10rem]" : "" } `}>
      <div className="flex gap-4 justify-center items-center w-full">
        <div className="flex">
          <label
            htmlFor="textImage"
            className="cursor-pointer rounded-xl hover:bg-[var(--text-primary)] hover:text-[var(--background)] p-2 duration-200 border-[.5px]"
          >
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
        <form className="flex gap-4 justify-self-end" onSubmit={handleSending}>
          {sendingImage ? (
            <div className="relative max-h-[8rem] sm:max-h-[9rem]">
              <Image
                src={sendingImage.url}
                height={200}
                width={200}
                alt="selecting pic"
                className="object-cover rounded-2xl h-full"
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
