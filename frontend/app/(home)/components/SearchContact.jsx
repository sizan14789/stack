"use client";

import { useChatContext } from "@/context/ChatLayoutContext";

export default function NewContact() {
  const { newContactSearch, setNewContactSearch } = useChatContext();

  return (
    <div className="p-4 flex flex-col gap-3">
      <p className="text-[var(--text-secondary)] !text-xs">Add new contact</p>
      <input
        type="search"
        name="search"
        className="input-field !w-full !py-2"
        value={newContactSearch}
        onChange={(e) => setNewContactSearch(e.target.value)}
      />
    </div>
  );
}
