import { useState, useEffect } from "react";
import { Star, Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { reviewsAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const ProductReviews = ({ productId }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  useEffect(() => {
    fetchReviews();
    // Poll for new reviews every 5 seconds
    const interval = setInterval(fetchReviews, 5000);
    return () => clearInterval(interval);
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const data = await reviewsAPI.getReviews(productId);
      setReviews(data.reviews || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles, ...files].slice(0, 5); // Max 5 files
    setSelectedFiles(newFiles);

    // Create previews
    const newPreviews = [];
    let loadedCount = 0;
    
    newFiles.forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews[index] = { type: "image", url: e.target.result, file };
          loadedCount++;
          if (loadedCount === newFiles.length) {
            setFilePreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews[index] = { type: "file", name: file.name, file };
        loadedCount++;
        if (loadedCount === newFiles.length) {
          setFilePreviews(newPreviews);
        }
      }
    });
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to submit a review.",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a review comment.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await reviewsAPI.addReview(productId, { rating, comment }, selectedFiles);
      toast({
        title: "Review submitted",
        description: "Your review has been posted successfully.",
      });
      setComment("");
      setRating(5);
      setSelectedFiles([]);
      setFilePreviews([]);
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="mt-8 sm:mt-10 rounded-[24px] sm:rounded-[32px] border border-white/15 bg-[var(--card)]/90 p-6 sm:p-8">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-10 rounded-[24px] sm:rounded-[32px] border border-white/15 bg-[var(--card)]/90 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black">Reviews & Ratings</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(averageRating)
                      ? "fill-secondary text-secondary"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">
              {averageRating} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-foreground text-background px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.4em]"
          >
            {showForm ? "Cancel" : "Write Review"}
          </Button>
        )}
      </div>

      {showForm && isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] border border-primary/30 bg-primary/5">
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= rating
                        ? "fill-secondary text-secondary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full rounded-[16px] border border-white/20 bg-background/70 p-3 sm:p-4 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Add Photos or Files (Max 5)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  {preview.type === "image" ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                      <img src={preview.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-background/90 rounded-full p-1 hover:bg-background"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-20 h-20 rounded-lg border border-white/20 bg-background/70 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-background/90 rounded-full p-1 hover:bg-background"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-primary/20 transition-colors">
              <Upload className="h-4 w-4" />
              Upload Files
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                disabled={selectedFiles.length >= 5}
              />
            </label>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-foreground text-background px-6 sm:px-8 py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.4em]"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      <div className="space-y-4 sm:space-y-6">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-[20px] sm:rounded-[24px] border border-white/20 bg-background/70 p-4 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-foreground">{review.userName || "Anonymous"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            i < review.rating
                              ? "fill-secondary text-secondary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-foreground mb-3">{review.comment}</p>
              {review.attachments && review.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {review.attachments.map((attachment, index) => {
                    const fileUrl = attachment.url.startsWith('http') 
                      ? attachment.url 
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${attachment.url}`;
                    return (
                      <div key={index} className="rounded-lg overflow-hidden border border-white/20">
                        {attachment.type === "image" ? (
                          <img
                            src={fileUrl}
                            alt={`Review attachment ${index + 1}`}
                            className="h-20 w-20 object-cover cursor-pointer"
                            onClick={() => window.open(fileUrl, "_blank")}
                          />
                        ) : (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-background/70"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="text-xs truncate max-w-[100px]">{attachment.name}</span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

