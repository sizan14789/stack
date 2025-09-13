import ChatContextProvider from "@/context/ChatLayoutContext";
import ContactsContainer from "./components/ContactsContainer";
import getUser from "@/lib/getUser";
import LocalUserSetter from "./components/LocalUserSetter";

export default async function layout({ children }) {
  const user = await getUser()

  return (
    <ChatContextProvider>
    <LocalUserSetter user={user} />
      <div className="page">
        <div className="box grow grid md:grid-cols-[auto_1fr] h-[calc(100vh-14rem)] border-1 border-[var(--border)] rounded-xl shadow-[0px_0px_6px_2px_#00000011] overflow-hidden">
          <ContactsContainer />
          {children}
        </div>
      </div>
    </ChatContextProvider>
  );
}
