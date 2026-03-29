import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Camera, X, Plus, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type Step = "photo-source" | "photos" | "sell-option" | "description";

interface Photo {
  id: string;
  url: string;
  file?: File;
}

interface SellOptions {
  isSelling: boolean;
  priceRM?: number;
  weight?: number;
  weightUnit?: "kg" | "g";
  shipping?: "free" | "paid" | "meetup";
  shippingCost?: number;
}

const CreatePostPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("photo-source");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sellOptions, setSellOptions] = useState<SellOptions>({
    isSelling: false,
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Handle photo selection from gallery
  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  // Process selected files
  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        newPhotos.push({
          id: Date.now().toString() + i,
          url: e.target?.result as string,
          file,
        });
        if (newPhotos.length === files.length) {
          setPhotos((prev) => [...prev, ...newPhotos]);
          setStep("sell-option");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (photos.length === 1) {
      setStep("photo-source");
    }
  };

  const handleAddMorePhotos = () => {
    setStep("photo-source");
  };

  const handleNextFromSellOption = () => {
    setStep("description");
  };

  const handlePublishPost = () => {
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }

    // Here you would typically send to backend
    toast.success("Post published!");
    console.log({
      photos: photos.map((p) => p.url),
      sellOptions,
      title,
      description,
    });

    // Redirect back to explore
    navigate("/explore");
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 pt-5 pb-4 flex items-center justify-between">
        <h1 className="text-display">New Post</h1>
        <button
          onClick={() => navigate("/explore")}
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>
      </div>

      {/* Step 1: Photo Source Selection */}
      {step === "photo-source" && (
        <div className="px-4 pt-6 pb-8">
          <p className="text-body mb-6 text-muted-foreground">
            {photos.length > 0 ? "Add more photos or continue?" : "Choose how to add photos"}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGallerySelect}
              className="w-full bg-card rounded-2xl p-5 card-shadow flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Image size={24} className="text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-label">Photo Gallery</p>
                <p className="text-caption text-muted-foreground">Choose from your photos</p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>

            <button
              onClick={handleCameraCapture}
              className="w-full bg-card rounded-2xl p-5 card-shadow flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Camera size={24} className="text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="text-label">Take Photo</p>
                <p className="text-caption text-muted-foreground">Capture a new photo</p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>

            {photos.length > 0 && (
              <button
                onClick={() => setStep("sell-option")}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-label font-medium active:scale-[0.97] transition-transform mt-6"
              >
                Continue ({photos.length} photo{photos.length > 1 ? "s" : ""})
              </button>
            )}
          </div>

          {photos.length > 0 && (
            <div className="mt-8">
              <p className="text-label mb-3">Selected Photos</p>
              <div className="grid grid-cols-3 gap-2.5">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative rounded-lg overflow-hidden">
                    <img
                      src={photo.url}
                      alt="Selected"
                      className="w-full h-24 object-cover"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Sell Option Configuration */}
      {step === "sell-option" && (
        <div className="px-4 pt-6 pb-8">
          <p className="text-body mb-6">Do you want to sell these crops?</p>

          <div className="space-y-4 mb-8">
            <button
              onClick={() =>
                setSellOptions((prev) => ({ ...prev, isSelling: false }))
              }
              className={`w-full rounded-2xl p-4 card-shadow flex items-center justify-between transition-all ${
                !sellOptions.isSelling
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              }`}
            >
              <span className="text-label">Just Share - No Sale</span>
              {!sellOptions.isSelling && (
                <div className="w-5 h-5 rounded-full bg-primary-foreground" />
              )}
            </button>

            <button
              onClick={() =>
                setSellOptions((prev) => ({ ...prev, isSelling: true }))
              }
              className={`w-full rounded-2xl p-4 card-shadow flex items-center justify-between transition-all ${
                sellOptions.isSelling
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              }`}
            >
              <span className="text-label">Yes, I want to sell</span>
              {sellOptions.isSelling && (
                <div className="w-5 h-5 rounded-full bg-primary-foreground" />
              )}
            </button>
          </div>

          {/* Sell Details Form */}
          {sellOptions.isSelling && (
            <div className="bg-card rounded-2xl p-5 card-shadow mb-8 space-y-4">
              <div>
                <label className="text-label block mb-2">Price (RM)</label>
                <input
                  type="number"
                  placeholder="e.g. 15.50"
                  value={sellOptions.priceRM || ""}
                  onChange={(e) =>
                    setSellOptions((prev) => ({
                      ...prev,
                      priceRM: parseFloat(e.target.value) || undefined,
                    }))
                  }
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-body outline-none placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label block mb-2">Weight</label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={sellOptions.weight || ""}
                    onChange={(e) =>
                      setSellOptions((prev) => ({
                        ...prev,
                        weight: parseFloat(e.target.value) || undefined,
                      }))
                    }
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-body outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
                <div>
                  <label className="text-label block mb-2">Unit</label>
                  <select
                    value={sellOptions.weightUnit || "kg"}
                    onChange={(e) =>
                      setSellOptions((prev) => ({
                        ...prev,
                        weightUnit: e.target.value as "kg" | "g",
                      }))
                    }
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-body outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-label block mb-2">Shipping Option</label>
                <select
                  value={sellOptions.shipping || "free"}
                  onChange={(e) =>
                    setSellOptions((prev) => ({
                      ...prev,
                      shipping: e.target.value as "free" | "paid" | "meetup",
                    }))
                  }
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-body outline-none"
                >
                  <option value="free">Free Shipping</option>
                  <option value="paid">Paid Shipping</option>
                  <option value="meetup">Meetup Only</option>
                </select>
              </div>

              {sellOptions.shipping === "paid" && (
                <div>
                  <label className="text-label block mb-2">Shipping Cost (RM)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5.00"
                    value={sellOptions.shippingCost || ""}
                    onChange={(e) =>
                      setSellOptions((prev) => ({
                        ...prev,
                        shippingCost: parseFloat(e.target.value) || undefined,
                      }))
                    }
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-body outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
              )}

              {sellOptions.isSelling &&
                sellOptions.priceRM &&
                sellOptions.weight && (
                  <div className="bg-secondary rounded-lg p-3 mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Total Price:</p>
                    <p className="text-display text-primary">
                      RM {sellOptions.priceRM.toFixed(2)}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {sellOptions.weight} {sellOptions.weightUnit}
                    </p>
                  </div>
                )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("photo-source")}
              className="flex-1 bg-card rounded-xl py-3 text-label font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={handleNextFromSellOption}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-label font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Add Description */}
      {step === "description" && (
        <div className="px-4 pt-6 pb-8">
          <div className="mb-8">
            <p className="text-body mb-4">Add your content details</p>

            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-lg overflow-hidden border-2 border-primary/30"
                >
                  <img
                    src={photo.url}
                    alt="Selected"
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-label block mb-2">Title *</label>
              <input
                type="text"
                placeholder="e.g. Fresh red chili padi harvest!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="w-full bg-card rounded-xl px-3.5 py-3 text-body outline-none placeholder:text-muted-foreground/60 border border-muted"
              />
              <p className="text-caption text-muted-foreground mt-1">
                {title.length}/100
              </p>
            </div>

            <div className="mt-4">
              <label className="text-label block mb-2">Description</label>
              <textarea
                placeholder="Share your farming experience, tips, growth process, analysis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="w-full bg-card rounded-xl px-3.5 py-3 text-body outline-none placeholder:text-muted-foreground/60 border border-muted resize-none h-32"
              />
              <p className="text-caption text-muted-foreground mt-1">
                {description.length}/500
              </p>
            </div>

            {sellOptions.isSelling && (
              <div
                className="bg-primary/10 rounded-lg p-3 mt-4 border border-primary/20"
              >
                <p className="text-xs text-muted-foreground mb-1">Selling Info:</p>
                <p className="text-sm font-medium">
                  RM {sellOptions.priceRM} • {sellOptions.weight}
                  {sellOptions.weightUnit} • {sellOptions.shipping}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("sell-option")}
              className="flex-1 bg-card rounded-xl py-3 text-label font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={handlePublishPost}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-label font-medium active:scale-[0.97] transition-transform"
            >
              Publish Post
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

export default CreatePostPage;
