import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away";
  preview: string;
  lastSeen: string;
}

const CHAT_USERS: ChatUser[] = [
  {
    id: "f2",
    name: "Mak Limah",
    avatar: "👩‍🌾",
    status: "online",
    preview: "Tomato harvest this week — 3kg from 2 plants!",
    lastSeen: "Now",
  },
  {
    id: "f3",
    name: "Pak Ali",
    avatar: "👨‍🌾",
    status: "away",
    preview: "Kangkung growing so fast after the rain.",
    lastSeen: "5m ago",
  },
  {
    id: "f1",
    name: "Ah Kow",
    avatar: "👨",
    status: "online",
    preview: "My cili padi finally turning red!",
    lastSeen: "Now",
  },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return CHAT_USERS;
    return CHAT_USERS.filter((user) => user.name.toLowerCase().includes(keyword));
  }, [searchText]);

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-background">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 pt-5 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center gap-2 text-primary active:opacity-70"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-display">Chat</h1>
          <div className="w-8" />
        </div>

        <div className="flex items-center gap-2 bg-card rounded-xl px-3.5 py-2.5 card-shadow">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search farmers..."
            className="bg-transparent text-body flex-1 outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="space-y-2.5">
          {filteredUsers.map((user) => {
            return (
              <button
                key={user.id}
                onClick={() => navigate(`/chat/${user.id}`)}
                className="w-full text-left rounded-2xl p-3.5 card-shadow transition-all active:scale-[0.99] bg-card border border-border"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                      {user.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-label font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-caption text-muted-foreground truncate">{user.preview}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-caption text-muted-foreground">{user.lastSeen}</p>
                    <span
                      className={`inline-block w-2 h-2 rounded-full mt-1 ${
                        user.status === "online" ? "bg-green-500" : "bg-amber-500"
                      }`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
