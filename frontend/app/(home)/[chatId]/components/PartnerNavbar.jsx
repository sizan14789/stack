import { useAppContext } from "@/context/AppContext";
import { useChatContext } from "@/context/ChatLayoutContext";
import Blank from "@/ui/placeholder/Blank";
import Image from "next/image";
import Link from "next/link";

export default function PartnerNavbar() {
  const { localUser } = useAppContext();
  const { localChatInfo } = useChatContext();

  let partner = localChatInfo?.participants?.find(
    (curUser) => curUser._id !== localUser._id
  );

  if (!partner)
    partner = { username: "Stack User", avatarBg: "gray", imageUrl: null };

  if (!localUser) return <Blank />;
  else
    return (
      <div className="h-[4rem] sm:h-[5rem] p-4 flex shadow-[0_3px_3px_-3px_#00000024] justify-between items-center">
        <div className="flex gap-2">
          <figure
            className=" h-[2.4rem] w-[2.4rem] sm:h-[3rem] sm:w-[3rem] flex justify-center items-center rounded-full bg-red-500 overflow-hidden"
            style={partner && { backgroundColor: partner.avatarBg }}
          >
            {partner.imageUrl ? (
              <Image
                src={partner.imageUrl}
                alt=""
                height={100}
                width={100}
                className="object-cover w-full h-full"
                priority
              />
            ) : (
              <h1 className="text-white sm:text-xl pb-1">
                {partner.username[0]}
              </h1>
            )}
          </figure>
          <h2 className="flex items-center text-sm sm:text-[1rem]">
            {partner.username}
          </h2>
        </div>
        <Link href="/" className="button-primary !w-[5rem] !h-[2rem] !text-xs">
          Go Back
        </Link>
      </div>
    );
}
