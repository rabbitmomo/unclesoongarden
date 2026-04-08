import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Search, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const POSTS = [
  {
    id: "2",
    farmer: { id: "f2", name: "Mak Limah", avatar: "👩‍🌾", location: "Ipoh" },
    image: "/tomatogrowing.jpg",
    caption: "Tomato harvest this week — 3kg from 2 plants! Uncle Soon's fertilizer advice really worked 💪",
    likes: 41,
    comments: 12,
    daysAgo: 2,
    tags: ["tomato", "harvest", "organic"],
  },
  {
    id: "3",
    farmer: { id: "f3", name: "Pak Ali", avatar: "👨‍🌾", location: "Penang" },
    image: "/kangkunggrowing.jpg",
    caption: "Kangkung growing so fast after the rain. Anyone want to trade seeds?",
    likes: 15,
    comments: 8,
    daysAgo: 3,
    tags: ["kangkung", "seeds"],
  },
  {
    id: "5",
    farmer: { id: "f2", name: "Mak Limah", avatar: "👩‍🌾", location: "Ipoh" },
    image: "/lettucegrowing.jpg",
    caption: "Lettuce looking crispy and fresh! Perfect for salad tonight 🥗",
    likes: 30,
    comments: 7,
    daysAgo: 4,
    tags: ["lettuce", "organic"],
  },
  {
    id: "6",
    farmer: { id: "f3", name: "Pak Ali", avatar: "👨‍🌾", location: "Penang" },
    image: "/bellpeppergrowing.jpg",
    caption: "Bell pepper experiment Week 6 — flowers starting to appear!",
    likes: 12,
    comments: 4,
    daysAgo: 6,
    tags: ["pepper", "experiment"],
  },
  {
    id: "1",
    farmer: { id: "f1", name: "Ah Kow", avatar: "👨", location: "Johor Bahru" },
    image: "/ciligrowing.jpg",
    caption: "My cili padi finally turning red! 45 days from seed 🔥",
    likes: 23,
    comments: 5,
    daysAgo: 1,
    tags: ["chili", "harvest"],
  },
  {
    id: "4",
    farmer: { id: "f1", name: "Ah Kow", avatar: "👨", location: "Johor Bahru" },
    image: "/potatogrowing.jpg",
    caption: "First potato harvest! Small but mighty. Next round I'll use bigger pots.",
    likes: 18,
    comments: 3,
    daysAgo: 5,
    tags: ["potato", "harvest"],
  },
  {
    id: "7",
    farmer: { id: "f4", name: "Encik Razak", avatar: "👨‍🌾", location: "Kuala Lumpur" },
    image: "/duriangrowing.jpg",
    caption: "Durian season approaching! These beauties are almost ready to harvest. The King of Fruits awaits 👑",
    likes: 52,
    comments: 18,
    daysAgo: 3,
    tags: ["durian", "tropical", "harvest"],
  },
  {
    id: "8",
    farmer: { id: "f5", name: "Aunty Ros", avatar: "👩‍🌾", location: "Melaka" },
    image: "/rambutangrowing.jpg",
    caption: "Rambutan clusters looking amazing this season! Perfect ripeness with that vibrant red color 🔴",
    likes: 38,
    comments: 14,
    daysAgo: 2,
    tags: ["rambutan", "tropical", "organic"],
  },
  {
    id: "9",
    farmer: { id: "f4", name: "Encik Razak", avatar: "👨‍🌾", location: "Kuala Lumpur" },
    image: "/bananagrowing.jpg",
    caption: "Banana bunches developing nicely! Using Uncle Soon's spacing tips made a huge difference 💪",
    likes: 29,
    comments: 11,
    daysAgo: 4,
    tags: ["banana", "fruit", "spacing"],
  },
  {
    id: "10",
    farmer: { id: "f6", name: "Pak Ismail", avatar: "👨", location: "Pahang" },
    image: "/pineapplegrowing.jpg",
    caption: "Pineapple on Day 45 of growth. This variety grows so fast! Looking forward to the sweet harvest 🍍",
    likes: 24,
    comments: 8,
    daysAgo: 1,
    tags: ["pineapple", "tropical", "growth"],
  },
  {
    id: "11",
    farmer: { id: "f5", name: "Aunty Ros", avatar: "👩‍🌾", location: "Melaka" },
    image: "/watermelongrowing.jpg",
    caption: "Watermelon vines spreading beautifully across the garden. Can't wait for the crispy sweetness! 🍈",
    likes: 33,
    comments: 9,
    daysAgo: 3,
    tags: ["watermelon", "summer", "organic"],
  },
];

const ExplorePage = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Opened cart!");
  };

  const handleMessages = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/chat");
  };

  const handleNewPost = () => {
    navigate("/create-post");
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 pt-5 pb-3">
        <h1 className="text-display mb-3">Explore</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card rounded-xl px-3.5 py-2.5 card-shadow flex-1">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search farmers, plants..."
              className="bg-transparent text-body flex-1 outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            onClick={(e) => handleMessages(e)}
            className="w-10 h-10 rounded-xl bg-card card-shadow flex items-center justify-center active:scale-90 transition-transform"
          >
            <MessageCircle size={20} className="text-foreground" />
          </button>
          <button
            onClick={(e) => handleCart(e)}
            className="w-10 h-10 rounded-xl bg-card card-shadow flex items-center justify-center active:scale-90 transition-transform"
          >
            <ShoppingCart size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* 2-Column Grid Feed (小红书 style) */}
      <div className="px-3 mt-2 grid grid-cols-2 gap-2.5">
        {POSTS.map((post) => (
          <article
            key={post.id}
            className="bg-card rounded-2xl card-shadow overflow-hidden active:scale-[0.98] transition-transform cursor-pointer flex flex-col"
            onClick={() => navigate(`/explore/post/${post.id}`)}
          >
            {/* Image area */}
            <div className="relative bg-secondary/50 flex items-center justify-center overflow-hidden h-44">
              <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="p-2.5 flex flex-col flex-1">
              <p className="text-sm font-medium leading-snug line-clamp-2">{post.caption}</p>

              {/* Author row + likes */}
              <div className="flex items-center justify-between mt-2 pt-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/explore/farmer/${post.farmer.id}`);
                  }}
                  className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
                >
                  <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">
                    {post.farmer.avatar}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[70px]">{post.farmer.name}</span>
                </button>
                <button
                  onClick={(e) => toggleLike(post.id, e)}
                  className="flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Heart
                    size={14}
                    className={likedPosts.has(post.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}
                  />
                  <span className={`text-xs ${likedPosts.has(post.id) ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                  </span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Floating Action Button - New Post */}
      <button
        onClick={handleNewPost}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-90 transition-transform"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default ExplorePage;
