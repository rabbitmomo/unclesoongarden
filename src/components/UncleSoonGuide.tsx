import { useState, useEffect } from "react";
import { Camera, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import uncleSoonCharacter from "@/assets/uncle-soon-character.png";
//test lovable
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

const greetings = [
  { text: `${getTimeGreeting()}!!! Let me check on your plants today 🌿`, delay: 0 },
  { text: "Your Tomato plant hasn't been checked in 3 days.", delay: 3000 },
  { text: "Tap below and I'll run my AI tools to analyze your plant health 🧠", delay: 6000 },
];

const UncleSoonGuide = () => {
  const navigate = useNavigate();
  const [currentMsg, setCurrentMsg] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  const [isBobbing, setIsBobbing] = useState(true);

  // Typing animation
  useEffect(() => {
    const fullText = greetings[currentMsg].text;
    setIsTyping(true);
    setDisplayedText("");

    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));
      if (charIndex >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentMsg]);

  // Auto-cycle messages
  useEffect(() => {
    if (isTyping) return;
    const timer = setTimeout(() => {
      setCurrentMsg((prev) => (prev + 1) % greetings.length);
    }, 3500);
    return () => clearTimeout(timer);
  }, [isTyping]);

  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-card to-secondary/30 rounded-3xl p-5 card-shadow overflow-hidden">
      {/* Decorative leaves */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <svg viewBox="0 0 100 100" fill="hsl(var(--primary))">
          <path d="M80,20 Q60,60 20,80 Q40,50 30,20 Q50,40 80,20Z" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-16 opacity-10 rotate-180">
        <svg viewBox="0 0 100 100" fill="hsl(var(--primary))">
          <path d="M80,20 Q60,60 20,80 Q40,50 30,20 Q50,40 80,20Z" />
        </svg>
      </div>

      <div className="flex items-end gap-2 relative z-10">
        {/* Uncle Soon Character */}
        <div className="flex-shrink-0 relative">
          <div
            className="transition-transform duration-1000 ease-in-out"
            style={{
              animation: isBobbing ? "uncle-bob 3s ease-in-out infinite" : "none",
            }}
          >
            <img
              src={uncleSoonCharacter}
              alt="Uncle Soon"
              className="w-40 h-auto drop-shadow-lg"
              width={158}
              height={237}
            />
          </div>
          {/* Speaking indicator */}
          {isTyping && (
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 mb-4">
          <div className="relative bg-card rounded-2xl rounded-bl-sm p-4 card-shadow">
            {/* Speech bubble tail */}
            <div className="absolute -left-2 bottom-3 w-4 h-4 bg-card rotate-45 card-shadow" />
            <div className="absolute -left-1 bottom-2 w-4 h-6 bg-card" />
            
            <p className="text-label text-primary mb-1">Uncle Soon</p>
            <p className="text-body text-foreground min-h-[3.2rem] leading-relaxed">
              {displayedText}
              {isTyping && <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse align-middle" />}
            </p>

            {/* Message dots */}
            <div className="flex gap-1.5 mt-3">
              {greetings.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentMsg
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => navigate("/check")}
        className="w-full mt-4 bg-primary text-primary-foreground rounded-2xl py-4 flex items-center justify-center gap-2.5 text-label active:scale-[0.97] transition-transform relative overflow-hidden group"
      >
        <span className="absolute inset-0 bg-primary/80 rounded-2xl animate-pulse-ring opacity-30" />
        <Camera size={22} />
        <span className="text-body-lg font-bold">Let Uncle Soon Check Your Plant</span>
        <ChevronRight size={18} className="group-active:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default UncleSoonGuide;
