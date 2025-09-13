"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const AppContext = createContext(null);

export default function AppProvider({ children }) {
  const [localUser, setLocalUser] = useState(null);

  // chat related
  const [localChatsList, setLocalChatsList] = useState([]); // contacts list for client

  // socket integration
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_API_URL, {
      withCredentials: true,
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (localUser && socket) {
      socket.emit("register", localUser._id);
    }
  }, [localUser, socket]);

  // Getting user locally at startup
  // useEffect(() => {
  //   const getUser = async () => {
  //     try {
  //       const res = await fetch(`/api/auth/token`, {
  //         method: "GET",
  //         credentials: "include",
  //       });

  //       if (res.status === 200) {
  //         const data = await res.json();
  //         setLocalUser(data);
  //       }
  //     } catch (error) {
  //       console.log(error.message);
  //     }
  //   };
  //   getUser();
  // }, []);

  // useEffect(() => {
  //   console.log(localUser);
  // }, [localUser]);

  const props = {
    setLocalUser,
    localUser,
    localChatsList,
    setLocalChatsList,
    socket,
  };

  return <AppContext.Provider value={props}>{children}</AppContext.Provider>;
}

export const useAppContext = () => useContext(AppContext);
