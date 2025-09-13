import { useAppContext } from "@/context/AppContext";
import { useChatContext } from "@/context/ChatLayoutContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function NewContactList() {
  const [createWindow, setCreateWindow] = useState(false);
  const { localChatsList, setLocalChatsList } = useAppContext();
  const { searchContactsList, setNewContactSearch } = useChatContext();
  const [selectedContactId, setSelectedContactId] = useState("");
  const router = useRouter();

  const handleContactClick = (id) => {
    const chatExists = localChatsList.find((chat) => {
      return id === chat.participants[0]._id || id === chat.participants[1]._id;
    });

    if (chatExists) {
      const chatId = chatExists._id;
      setNewContactSearch("");
      router.push(`/${chatId}`);
      return;
    }

    setSelectedContactId(id);
    setCreateWindow(true);
  };

  const handleConfirmation = async (e) => {
    e.stopPropagation();
    setCreateWindow(false);

    try {
      const res = await fetch(`/api/chats`, {
        method: "POST",
        body: JSON.stringify({ partner: selectedContactId }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (res.status === 201) {
        const data = await res.json();
        toast.success("Contact added");
        setLocalChatsList((prev) => [data, ...prev]);
        setNewContactSearch("");
        router.push(`/${data._id}`);
      } else if (res.status === 205) {
        router.push(`/${id}`);
      }
    } catch (error) {
      toast.error("Could not add new conversation");
    }
  };

  if (searchContactsList) {
    return (
      <>
        <div
          className={`absolute top-0 left-0 h-svh w-svw flex justify-center items-center ${
            createWindow ? "" : "hidden"
          }`}
          // onClick={()=> setCreateWindow(false)}
        >
          <div
            className="p-8 border-1 rounded-xl border-[var(--border)] flex flex-col gap-4 bg-[var(--background)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-secondary">Start new conversation?</h2>
            <div className="flex gap-4">
              <button
                className="button-primary"
                onClick={() => setCreateWindow(false)}
              >
                No
              </button>
              <button className="button-secondary" onClick={handleConfirmation}>
                Yes
              </button>
            </div>
          </div>
        </div>

        <h2 className="px-4">Search result</h2>
        {searchContactsList.map((curContact) => {
          return (
            <button
              className="cursor-pointer border-b-[.5px] border-b-[var(--border)] hover:border-b-[var(--accent)] duration-200"
              key={curContact._id}
              onClick={() => handleContactClick(curContact._id)}
            >
              <div className={`flex gap-4 p-4 items-center hover:grayscale-0`}>
                <figure
                  className="flex items-center w-[3rem] h-[3rem] justify-center rounded-full overflow-hidden "
                  style={{ backgroundColor: curContact.avatarBg }}
                >
                  {curContact.imageUrl ? (
                    <Image
                      src={curContact.imageUrl}
                      alt=" "
                      height={100}
                      width={100}
                      priority
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <h1 className="text-white text-2xl pb-1">
                      {curContact.username[0]}
                    </h1>
                  )}
                </figure>
                <div>
                  <h2>{curContact.username}</h2>
                </div>
              </div>
            </button>
          );
        })}
      </>
    );
  }
}
