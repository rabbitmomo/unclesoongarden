import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";

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

const ChatDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [draft, setDraft] = useState("");

  const selectedUser = useMemo(() => {
    return CHAT_USERS.find((user) => user.id === id) || null;
  }, [id]);

  if (!selectedUser) {
    return (
      <div className="min-h-screen pb-24 max-w-md mx-auto bg-background px-4 pt-8">
        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-2 text-primary active:opacity-70"
        >
          <ArrowLeft size={20} /> Back to chats
        </button>
        <div className="mt-6 bg-card rounded-2xl p-5 card-shadow border border-border">
          <p className="text-title">Chat not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-background flex flex-col">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 pt-5 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-2 text-primary active:opacity-70"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-display">Chat</h1>
          <div className="w-8" />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
            {selectedUser.avatar}
          </div>
          <div>
            <p className="text-label font-semibold text-foreground">{selectedUser.name}</p>
            <p className="text-caption text-muted-foreground">{selectedUser.lastSeen}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex-1 flex min-h-0">
        <div className="bg-card rounded-2xl p-4 card-shadow border border-border flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={18} className="text-primary" />
            <p className="text-label font-semibold">Chatting with {selectedUser.name}</p>
          </div>

          <div className="space-y-2 mb-3 flex-1 overflow-y-auto pr-1">
            <div className="max-w-[80%] bg-secondary rounded-xl px-3 py-2 text-caption text-foreground">
              Hi! How's your garden this week?
            </div>
            <div className="max-w-[80%] ml-auto bg-primary text-primary-foreground rounded-xl px-3 py-2 text-caption">
              Looking good! I am testing Uncle Soon app now.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-secondary rounded-xl px-3 py-2 text-body outline-none"
            />
            <button
              onClick={() => setDraft("")}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDetailPage;
