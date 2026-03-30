import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, MapPin, Leaf } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";

const FARMERS: Record<string, {
  name: string;
  avatar: string;
  location: string;
  bio: string;
  joinedMonths: number;
  rating: number;
  posts: { id: string; image: string; caption: string; daysAgo: number }[];
  products: { id: string; name: string; emoji: string; price: string; unit: string; stock: string; analysis: string }[];
}> = {
  f1: {
    name: "Ah Kow",
    avatar: "👨",
    location: "Johor Bahru",
    bio: "Backyard farmer since 2023. Growing chili, potato & herbs. All organic, no pesticide!",
    joinedMonths: 14,
    rating: 4.8,
    posts: [
      { id: "1", image: "/ciligrowing.jpg", caption: "Cili padi turning red — Day 45", daysAgo: 1 },
      { id: "7", image: "/duriangrowing.jpg", caption: "Durian cluster getting bigger this week", daysAgo: 2 },
      { id: "8", image: "/rambutangrowing.jpg", caption: "Rambutan colors starting to pop", daysAgo: 3 },
      { id: "9", image: "/cabbagegworing.jpg", caption: "Cabbage heads firming up nicely", daysAgo: 4 },
      { id: "4", image: "/potatogrowing.jpg", caption: "First potato harvest!", daysAgo: 5 },
      { id: "p3", image: "/lettucegrowing.jpg", caption: "Basil cutting doing well in water", daysAgo: 12 },
      { id: "p4", image: "/bellpeppergrowing.jpg", caption: "Green pepper seedlings week 2", daysAgo: 18 },
    ],
    products: [
      { id: "pr1", name: "Fresh Cili Padi", emoji: "🌶️", price: "RM 8", unit: "100g", stock: "In stock", analysis: "🟢 Healthy — No pest damage detected. Rich red color indicates high capsaicin content. Harvested at optimal ripeness (Day 45). Uncle Soon rating: 9/10" },
      { id: "pr8", name: "Village Durian", emoji: "🍈", price: "RM 28", unit: "kg", stock: "Limited", analysis: "🟢 Strong fruit development and healthy husk spikes. Good sugar build-up expected in 1-2 weeks. Keep fruits supported on branch to avoid drop damage. Uncle Soon rating: 8.8/10" },
      { id: "pr9", name: "Fresh Rambutan", emoji: "🍒", price: "RM 12", unit: "500g", stock: "In stock", analysis: "🟢 Good ripening progression with bright shell color. Flesh moisture looks balanced, sweetness likely high at full red stage. Uncle Soon rating: 9.1/10" },
      { id: "pr10", name: "Green Cabbage", emoji: "🥬", price: "RM 6", unit: "head", stock: "In stock", analysis: "🟢 Compact head structure and clean outer leaves. Low pest marks detected and good firmness for harvest window. Uncle Soon rating: 8.9/10" },
      { id: "pr2", name: "Organic Potato", emoji: "🥔", price: "RM 5", unit: "500g", stock: "Limited", analysis: "🟡 Good — Slightly smaller than average due to container growing. No chemical residue. Firm texture, good for frying. Uncle Soon rating: 7/10" },
      { id: "pr3", name: "Fresh Basil", emoji: "🌿", price: "RM 3", unit: "bunch", stock: "In stock", analysis: "🟢 Excellent — Strong aroma, dark green leaves. Grown hydroponically. No wilting detected. Uncle Soon rating: 9.5/10" },
    ],
  },
  f2: {
    name: "Mak Limah",
    avatar: "👩‍🌾",
    location: "Ipoh",
    bio: "Retired teacher turned urban farmer. Specializing in tomatoes and leafy greens.",
    joinedMonths: 8,
    rating: 4.9,
    posts: [
      { id: "2", image: "🍅", caption: "3kg tomato harvest from 2 plants!", daysAgo: 2 },
      { id: "p5", image: "🥗", caption: "Lettuce ready for picking", daysAgo: 8 },
      { id: "5", image: "🥗", caption: "Lettuce looking crispy and fresh!", daysAgo: 4 },
      { id: "p6", image: "🍅", caption: "Cherry tomato vs beef tomato test", daysAgo: 14 },
    ],
    products: [
      { id: "pr4", name: "Cherry Tomato", emoji: "🍅", price: "RM 6", unit: "250g", stock: "In stock", analysis: "🟢 Excellent — Bright red, uniform size. Brix level estimated at 8+ (very sweet). Organic-grown with compost only. Uncle Soon rating: 9.5/10" },
      { id: "pr5", name: "Butterhead Lettuce", emoji: "🥬", price: "RM 4", unit: "head", stock: "In stock", analysis: "🟢 Healthy — Crisp leaves, no pest marks. Harvested same day. Best consumed within 3 days. Uncle Soon rating: 8.5/10" },
    ],
  },
  f3: {
    name: "Pak Ali",
    avatar: "👨‍🌾",
    location: "Penang",
    bio: "Community garden organizer. Love sharing seeds and knowledge with neighbors.",
    joinedMonths: 20,
    rating: 4.7,
    posts: [
      { id: "3", image: "🥬", caption: "Kangkung growing fast after rain", daysAgo: 3 },
      { id: "p7", image: "🫑", caption: "Bell pepper experiment — Week 6", daysAgo: 15 },
      { id: "6", image: "🫑", caption: "Bell pepper flowers appearing!", daysAgo: 6 },
      { id: "p8", image: "🌶️", caption: "Chili seedling swap day", daysAgo: 22 },
    ],
    products: [
      { id: "pr6", name: "Fresh Kangkung", emoji: "🥬", price: "RM 2", unit: "bunch", stock: "In stock", analysis: "🟢 Excellent — Thick stems, dark green. Grown in raised bed with rich compost. Pesticide-free. Uncle Soon rating: 9/10" },
      { id: "pr7", name: "Green Bell Pepper", emoji: "🫑", price: "RM 4", unit: "piece", stock: "Limited", analysis: "🟡 Good — Medium size, firm. Slightly irregular shape but great flavor. First harvest from experimental batch. Uncle Soon rating: 7.5/10" },
    ],
  },
};

const FarmerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const farmer = FARMERS[id || ""];
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [expandedReport, setExpandedReport] = useState<Set<string>>(new Set());

  if (!farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Farmer not found</p>
      </div>
    );
  }

  const addToCart = (productId: string, productName: string) => {
    setCart((prev) => new Set(prev).add(productId));
    toast.success(`${productName} added to order!`);
  };

  const toggleReport = (productId: string) => {
    setExpandedReport((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg active:bg-secondary transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-body-lg font-semibold">{farmer.name}</h1>
      </div>

      {/* Profile Card */}
      <div className="mx-4 mt-2 bg-card rounded-2xl p-5 card-shadow text-center">
        <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center text-4xl mb-3">
          {farmer.avatar}
        </div>
        <h2 className="text-title font-bold">{farmer.name}</h2>
        <div className="flex items-center justify-center gap-1.5 text-caption text-muted-foreground mt-1">
          <MapPin size={14} />
          <span>{farmer.location}</span>
          <span>·</span>
          <Star size={14} className="text-accent fill-accent" />
          <span className="text-foreground font-semibold">{farmer.rating}</span>
        </div>
        <p className="text-body text-muted-foreground mt-2">{farmer.bio}</p>
        <p className="text-caption text-muted-foreground mt-1">Joined {farmer.joinedMonths} months ago</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-5">
        <Tabs defaultValue="posts">
          <TabsList className="w-full bg-secondary/60 rounded-xl p-1">
            <TabsTrigger value="posts" className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-body font-semibold">
              Posts
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-body font-semibold">
              Products
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab — 2 column grid */}
          <TabsContent value="posts" className="mt-4">
            <div className="grid grid-cols-2 gap-2.5">
              {farmer.posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/explore/post/${post.id}`)}
                  className="bg-card rounded-2xl card-shadow overflow-hidden active:scale-[0.98] transition-transform text-left flex flex-col"
                >
                  <div className="bg-secondary/50 h-32 flex items-center justify-center text-4xl overflow-hidden">
                    <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-medium leading-snug line-clamp-2">{post.caption}</p>
                    <p className="text-xs text-muted-foreground mt-1">{post.daysAgo}d ago</p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-4 space-y-4">
            {farmer.products.map((product) => (
              <div key={product.id} className="bg-card rounded-2xl card-shadow overflow-hidden">
                {/* Product header */}
                <div className="p-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center text-3xl flex-shrink-0">
                    {product.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-body-lg font-semibold">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-primary font-bold text-body-lg">{product.price}</span>
                      <span className="text-caption text-muted-foreground">/ {product.unit}</span>
                    </div>
                    <span className={`text-caption font-medium ${product.stock === "In stock" ? "text-primary" : "text-accent"}`}>
                      {product.stock}
                    </span>
                  </div>
                </div>

                {/* View Report toggle */}
                <div className="mx-4 mb-3">
                  <button
                    onClick={() => toggleReport(product.id)}
                    className="flex items-center gap-1.5 text-caption font-semibold text-primary active:opacity-70 transition-opacity"
                  >
                    <Leaf size={14} />
                    <span>{expandedReport.has(product.id) ? "Hide" : "View"} Uncle Soon's Report</span>
                  </button>

                  {expandedReport.has(product.id) && (
                    <div className="mt-2 bg-primary/5 border border-primary/15 rounded-xl p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-caption text-muted-foreground leading-relaxed">{product.analysis}</p>
                    </div>
                  )}
                </div>

                {/* Order button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => addToCart(product.id, product.name)}
                    disabled={cart.has(product.id)}
                    className={`w-full py-2.5 rounded-xl font-semibold text-body flex items-center justify-center gap-2 transition-colors ${
                      cart.has(product.id)
                        ? "bg-secondary text-muted-foreground"
                        : "bg-primary text-primary-foreground active:bg-primary/90"
                    }`}
                  >
                    <ShoppingCart size={18} />
                    {cart.has(product.id) ? "Added to Order" : "Order Now"}
                  </button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FarmerProfilePage;
