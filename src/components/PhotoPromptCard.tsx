import uncleSoon from "@/assets/uncle-soon.png";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PhotoPromptProps {
  message: string;
  plantName?: string;
}

const PhotoPromptCard = ({ message, plantName }: PhotoPromptProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow border-2 border-primary/20 animate-fade-up">
      <div className="flex items-start gap-3">
        <img
          src={uncleSoon}
          alt="Uncle Soon"
          className="w-11 h-11 rounded-full border-2 border-primary flex-shrink-0"
          width={44}
          height={44}
        />
        <div className="flex-1">
          <p className="text-label text-primary">Uncle Soon says:</p>
          <p className="text-body-lg text-foreground mt-1">{message}</p>
          {plantName && (
            <p className="text-caption text-muted-foreground mt-1">
              For your {plantName}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() =>
          navigate("/identify", {
            state: {
              sourcePlantName: plantName,
            },
          })
        }
        className="w-full mt-4 bg-primary text-primary-foreground rounded-xl py-3.5 flex items-center justify-center gap-2 text-label active:scale-[0.97] transition-transform relative overflow-hidden"
      >
        <span className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse-ring" />
        <Camera size={20} /> Take a Photo Now
      </button>
    </div>
  );
};

export default PhotoPromptCard;
