import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Share2, Leaf, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const POSTS_DATA: Record<string, {
  farmer: { id: string; name: string; avatar: string; location: string };
  image: string;
  caption: string;
  fullContent: string;
  likes: number;
  comments: { user: string; text: string }[];
  daysAgo: number;
  tags: string[];
  growthReport: { stage: string; day: number; totalDays: number; milestones: { label: string; day: number; status: string }[]; summary: string };
}> = {
  "1": {
    farmer: { id: "f1", name: "Ah Kow", avatar: "👨", location: "Johor Bahru" },
    image: "/ciligrowing.jpg",
    caption: "My cili padi finally turning red! 45 days from seed 🔥",
    fullContent: "Started from seeds I saved from last season's harvest. Used Uncle Soon's recommended soil mix — 60% compost, 30% peat moss, 10% perlite. Watered twice daily and placed in full sun. The first flowers appeared on Day 30, and now the fruits are turning red!",
    likes: 23,
    comments: [
      { user: "Mak Limah", text: "Wah so nice! What fertilizer you use?" },
      { user: "Pak Ali", text: "My cili also turning red soon 🔥" },
    ],
    daysAgo: 1,
    tags: ["chili", "harvest"],
    growthReport: {
      stage: "Fruiting",
      day: 45,
      totalDays: 60,
      milestones: [
        { label: "Sowed", day: 1, status: "done" },
        { label: "Sprouted", day: 7, status: "done" },
        { label: "Flowering", day: 30, status: "done" },
        { label: "Fruiting", day: 42, status: "done" },
        { label: "Harvest", day: 60, status: "upcoming" },
      ],
      summary: "🟢 Healthy growth. Capsaicin levels developing well. Expected yield: 500g from 3 plants. No pest damage detected. Soil pH optimal at 6.2."
    },
  },
  "2": {
    farmer: { id: "f2", name: "Mak Limah", avatar: "👩‍🌾", location: "Ipoh" },
    image: "/tomatogrowing.jpg",
    caption: "Tomato harvest this week — 3kg from 2 plants!",
    fullContent: "Uncle Soon suggested I switch to a potassium-rich fertilizer during fruiting stage, and it made a huge difference. Each plant produced about 1.5kg of tomatoes.",
    likes: 41,
    comments: [
      { user: "Ah Kow", text: "3kg from 2 plants?! That's amazing results" },
      { user: "Pak Ali", text: "Can share your fertilizer schedule?" },
      { user: "Uncle Soon Fan", text: "Uncle Soon never wrong one! 😄" },
    ],
    daysAgo: 2,
    tags: ["tomato", "harvest", "organic"],
    growthReport: {
      stage: "Harvested",
      day: 75,
      totalDays: 75,
      milestones: [
        { label: "Sowed", day: 1, status: "done" },
        { label: "Transplant", day: 21, status: "done" },
        { label: "Flowering", day: 40, status: "done" },
        { label: "Fruiting", day: 55, status: "done" },
        { label: "Harvest", day: 75, status: "done" },
      ],
      summary: "🟢 Excellent yield. Brix level ~8 (very sweet). Organic methods only — no chemical pesticide. Cherry variety outperformed beef tomato in Malaysian heat."
    },
  },
  "3": {
    farmer: { id: "f3", name: "Pak Ali", avatar: "👨‍🌾", location: "Penang" },
    image: "/kangkunggrowing.jpg",
    caption: "Kangkung growing so fast after the rain.",
    fullContent: "The monsoon rain has been great for my kangkung bed. Growing in a raised bed with rich compost. Already harvested twice this month — about 2kg total.",
    likes: 15,
    comments: [
      { user: "Mak Limah", text: "I want to swap! I have basil seeds" },
    ],
    daysAgo: 3,
    tags: ["kangkung", "seeds"],
    growthReport: {
      stage: "Harvesting",
      day: 28,
      totalDays: 30,
      milestones: [
        { label: "Sowed", day: 1, status: "done" },
        { label: "Sprouted", day: 4, status: "done" },
        { label: "Growing", day: 14, status: "done" },
        { label: "1st Harvest", day: 21, status: "done" },
        { label: "2nd Harvest", day: 28, status: "done" },
      ],
      summary: "🟢 Fast grower. Cut above 2nd node for regrowth. Pesticide-free. Total yield: 2kg this month. Ideal monsoon conditions."
    },
  },
  "4": {
    farmer: { id: "f1", name: "Ah Kow", avatar: "👨", location: "Johor Bahru" },
    image: "/potatogrowing.jpg",
    caption: "First potato harvest! Small but mighty.",
    fullContent: "Grew potatoes in a grow bag for the first time. The tubers are small (avg 50g each) but taste incredible — much sweeter than store-bought.",
    likes: 18,
    comments: [
      { user: "Mak Limah", text: "Homegrown potato taste best!" },
    ],
    daysAgo: 5,
    tags: ["potato", "harvest"],
    growthReport: {
      stage: "Harvested",
      day: 90,
      totalDays: 90,
      milestones: [
        { label: "Planted", day: 1, status: "done" },
        { label: "Sprouted", day: 14, status: "done" },
        { label: "Flowering", day: 50, status: "done" },
        { label: "Tuber Growth", day: 65, status: "done" },
        { label: "Harvest", day: 90, status: "done" },
      ],
      summary: "🟡 Good first attempt. Avg tuber 50g (small — need deeper container 40cm+). No chemical residue. Soil temp was too high. Try again in Dec."
    },
  },
  "7": {
    farmer: { id: "f1", name: "Ah Kow", avatar: "👨", location: "Johor Bahru" },
    image: "/duriangrowing.jpg",
    caption: "Durian cluster getting bigger this week",
    fullContent: "The fruits have started bulking up after steady rain and good potassium feeding. I am thinning smaller fruits to help the strongest ones size up.",
    likes: 27,
    comments: [
      { user: "Mak Limah", text: "Nice cluster! When will you harvest?" },
      { user: "Pak Ali", text: "Looks healthy and well supported." },
    ],
    daysAgo: 2,
    tags: ["durian", "fruiting"],
    growthReport: {
      stage: "Fruiting",
      day: 110,
      totalDays: 150,
      milestones: [
        { label: "Flowering", day: 70, status: "done" },
        { label: "Fruit Set", day: 85, status: "done" },
        { label: "Bulking", day: 110, status: "done" },
        { label: "Mature", day: 145, status: "upcoming" },
        { label: "Harvest", day: 150, status: "upcoming" },
      ],
      summary: "Healthy fruit development. Maintain balanced watering and potassium feed. Continue branch support as weight increases."
    },
  },
  "8": {
    farmer: { id: "f1", name: "Ah Kow", avatar: "👨", location: "Johor Bahru" },
    image: "/rambutangrowing.jpg",
    caption: "Rambutan colors starting to pop",
    fullContent: "The rambutan skins are changing from green to yellow-red, a good sign ripening has started. Sun exposure has been strong this week.",
    likes: 33,
    comments: [
      { user: "Mak Limah", text: "Color gradient looks beautiful!" },
      { user: "Pak Ali", text: "Almost ready already." },
    ],
    daysAgo: 3,
    tags: ["rambutan", "ripening"],
    growthReport: {
      stage: "Ripening",
      day: 95,
      totalDays: 110,
      milestones: [
        { label: "Flowering", day: 50, status: "done" },
        { label: "Fruit Set", day: 65, status: "done" },
        { label: "Color Break", day: 90, status: "done" },
        { label: "Sweet Spot", day: 105, status: "upcoming" },
        { label: "Harvest", day: 110, status: "upcoming" },
      ],
      summary: "Good ripening progress with even color change. Keep moisture stable to prevent fruit split and protect from birds."
    },
  },
  "9": {
    farmer: { id: "f1", name: "Ah Kow", avatar: "👨", location: "Johor Bahru" },
    image: "/cabbagegworing.jpg",
    caption: "Cabbage heads firming up nicely",
    fullContent: "These cabbage heads are filling out well and staying compact. I reduced nitrogen and focused on calcium to keep leaf quality strong.",
    likes: 21,
    comments: [
      { user: "Mak Limah", text: "Very round and neat heads." },
      { user: "Pak Ali", text: "Great spacing and clean leaves." },
    ],
    daysAgo: 4,
    tags: ["cabbage", "vegetable"],
    growthReport: {
      stage: "Heading",
      day: 62,
      totalDays: 80,
      milestones: [
        { label: "Sowed", day: 1, status: "done" },
        { label: "Transplant", day: 20, status: "done" },
        { label: "Leaf Expansion", day: 40, status: "done" },
        { label: "Head Formation", day: 62, status: "done" },
        { label: "Harvest", day: 80, status: "upcoming" },
      ],
      summary: "Uniform head formation and healthy foliage. Continue regular watering and monitor for caterpillars near inner leaves."
    },
  },
  "5": {
    farmer: { id: "f2", name: "Mak Limah", avatar: "👩‍🌾", location: "Ipoh" },
    image: "/lettucegrowing.jpg",
    caption: "Lettuce looking crispy and fresh! Perfect for salad tonight 🥗",
    fullContent: "Harvested this morning at peak freshness. The butterhead variety is much crispier than the loose leaf. Perfect for salads and wraps.",
    likes: 30,
    comments: [
      { user: "Ah Kow", text: "Wah so green and fresh!" },
      { user: "Pak Ali", text: "Can I buy some?" },
    ],
    daysAgo: 4,
    tags: ["lettuce", "organic"],
    growthReport: {
      stage: "Harvested",
      day: 35,
      totalDays: 35,
      milestones: [
        { label: "Sowed", day: 1, status: "done" },
        { label: "Sprouted", day: 5, status: "done" },
        { label: "Growing", day: 20, status: "done" },
        { label: "Mature", day: 30, status: "done" },
        { label: "Harvest", day: 35, status: "done" },
      ],
      summary: "🟢 Perfect yield. Crisp texture maintained. Butterhead variety very successful in local climate. Will plant again next month."
    },
  },
  "6": {
    farmer: { id: "f3", name: "Pak Ali", avatar: "👨‍🌾", location: "Penang" },
    image: "/bellpeppergrowing.jpg",
    caption: "Bell pepper experiment Week 6 — flowers starting to appear!",
    fullContent: "Week 6 of growth and I'm seeing the first flowers! The plants are healthy and growing strong. Expecting first peppers in about 3-4 weeks.",
    likes: 12,
    comments: [
      { user: "Mak Limah", text: "How big are the plants now?" },
      { user: "Ah Kow", text: "Looking good Pak Ali!" },
    ],
    daysAgo: 6,
    tags: ["pepper", "experiment"],
    growthReport: {
      stage: "Flowering",
      day: 42,
      totalDays: 70,
      milestones: [
        { label: "Sowed", day: 1, status: "done" },
        { label: "Sprouted", day: 8, status: "done" },
        { label: "Growing", day: 28, status: "done" },
        { label: "Flowering", day: 42, status: "done" },
        { label: "Fruiting", day: 70, status: "upcoming" },
      ],
      summary: "🟢 Healthy plants. First flowers appearing at Week 6. Expected yield: 8-10 peppers per plant. No disease or pest issues detected."
    },
  },
};

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = POSTS_DATA[id || ""];
  const [liked, setLiked] = useState(false);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const progress = (post.growthReport.day / post.growthReport.totalDays) * 100;

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg active:bg-secondary transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-body-lg font-semibold">Post</h1>
      </div>

      {/* Author */}
      <div className="px-4 flex items-center gap-3 mt-2">
        <button
          onClick={() => navigate(`/explore/farmer/${post.farmer.id}`)}
          className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-2xl active:scale-95 transition-transform"
        >
          {post.farmer.avatar}
        </button>
        <div className="flex-1">
          <p className="text-body-lg font-semibold">{post.farmer.name}</p>
          <p className="text-caption text-muted-foreground">{post.farmer.location} · {post.daysAgo}d ago</p>
        </div>
      </div>

      {/* Image */}
      <div className="mx-4 mt-4 rounded-2xl bg-secondary/50 h-64 flex items-center justify-center relative overflow-hidden">
        <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
        <button
          onClick={() => toast.success("Added to cart!")}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ShoppingCart size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        <p className="text-body-lg font-semibold mb-2">{post.caption}</p>
        <p className="text-body text-muted-foreground leading-relaxed">{post.fullContent}</p>

        {/* Tags */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {post.tags.map((tag) => (
            <span key={tag} className="text-caption text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 mt-4 py-3 border-y border-border">
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Heart size={20} className={liked ? "fill-destructive text-destructive" : "text-muted-foreground"} />
            <span className={`text-body ${liked ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
              {post.likes + (liked ? 1 : 0)}
            </span>
          </button>
          <button className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle size={20} />
            <span className="text-body">{post.comments.length}</span>
          </button>
          <button className="ml-auto text-muted-foreground active:scale-95 transition-transform">
            <Share2 size={20} />
          </button>
        </div>

        {/* Uncle Soon Growth Report */}
        <div className="mt-5 bg-primary/5 border border-primary/15 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Leaf size={18} className="text-primary" />
            <span className="text-body font-bold text-primary">Uncle Soon's Growth Report</span>
          </div>

          {/* Stage & Progress */}
          <div className="flex items-center justify-between text-caption mb-2">
            <span className="font-semibold">Stage: {post.growthReport.stage}</span>
            <span className="text-muted-foreground">Day {post.growthReport.day} / {post.growthReport.totalDays}</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-3">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          {/* Milestones */}
          <div className="flex justify-between mb-3">
            {post.growthReport.milestones.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${m.status === "done" ? "bg-primary" : "bg-secondary border-2 border-muted-foreground/30"}`} />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <p className="text-caption text-muted-foreground leading-relaxed">{post.growthReport.summary}</p>
        </div>

        {/* Comments */}
        <div className="mt-5 space-y-3">
          <p className="text-body-lg font-semibold">Comments</p>
          {post.comments.map((c, i) => (
            <div key={i} className="bg-secondary/40 rounded-xl p-3">
              <p className="text-body font-semibold">{c.user}</p>
              <p className="text-body text-muted-foreground mt-0.5">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
