import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ChatListCard({ curChat }) {
  const { localUser } = useAppContext();
  const url = useParams()?.chatId;

  if (localUser && curChat) {
    const { _id, groupChat, participants, lastText } = curChat;
    let otherPerson = participants?.find(
      (cur) => cur.username !== localUser?.username
    );

    if (!otherPerson) otherPerson = { username: "Stack User", avatarBg: "gray", imageUrl: null };

    return (
      <Link
        href={`/${_id}`}
        className="cursor-pointer border-b-[.5px] border-b-[var(--border)] hover:border-b-[var(--accent)] duration-200"
      >
        <div
          className={`flex gap-4 p-4 items-center hover:grayscale-0 ${
            _id === url ? "" : "grayscale-100"
          }`}
        >
          <figure className="flex items-center justify-center w-[2rem] h-[2rem] sm:w-[3rem] sm:h-[3rem] rounded-full overflow-hidden"
          style={{ backgroundColor: otherPerson.avatarBg }}>
            {otherPerson.imageUrl ? (
                    <Image
                      src={otherPerson.imageUrl}
                      alt="profile_pic"
                      width={100}
                      priority
                      height={100}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <h1 className="text-white text-2xl pb-1">
                      {otherPerson.username[0]}
                    </h1>
                  )}
          </figure>
          <div>
            <h2>{otherPerson.username}</h2>
            <p className="text-secondary !text-xs">
              {lastText.length > 15 ? lastText.slice(0, 15) + "..." : lastText}
            </p>
          </div>
        </div>
      </Link>
    );
  }
}
