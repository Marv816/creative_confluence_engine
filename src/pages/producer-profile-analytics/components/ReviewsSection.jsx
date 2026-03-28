import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { marketplaceService } from '../../../services/marketplaceService';
import { useAuth } from '../../../contexts/AuthContext';

const ReviewsSection = ({ reviews, producer, onReviewAdded }) => {
  const { user, isAuthenticated } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e) => {
    e?.preventDefault();
    if (!isAuthenticated) return;

    try {
      setSubmitting(true);
      await marketplaceService?.createReview({
        producerId: producer?.id,
        rating,
        reviewText
      });
      setShowReviewForm(false);
      setRating(5);
      setReviewText('');
      onReviewAdded?.();
    } catch (error) {
      console.error('Submit review error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count, interactive = false, onSelect = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5]?.map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onSelect?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Icon
              name="Star"
              size={interactive ? 24 : 16}
              className={star <= count ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Customer Reviews</h3>
            <div className="flex items-center gap-3">
              {renderStars(Math.round(producer?.rating || 0))}
              <span className="text-lg font-semibold text-foreground">
                {producer?.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-muted-foreground">
                ({producer?.totalReviews || 0} reviews)
              </span>
            </div>
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              iconName="MessageSquare"
              iconPosition="left"
            >
              Write Review
            </Button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-muted/50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-foreground mb-4">Write Your Review</h4>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
              {renderStars(rating, true, setRating)}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e?.target?.value)}
                placeholder="Share your experience with this producer..."
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting || !reviewText?.trim()}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
      {reviews?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground">
            Be the first to review this producer
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews?.map(review => (
            <div key={review?.id} className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  {review?.reviewer?.avatar_url ? (
                    <img
                      src={review?.reviewer?.avatar_url}
                      alt={review?.reviewer?.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={24} className="text-white" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{review?.reviewer?.full_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review?.rating)}
                        {review?.is_verified_purchase && (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review?.created_at)?.toLocaleDateString()}
                    </span>
                  </div>

                  {review?.sound?.title && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Reviewed: {review?.sound?.title}
                    </p>
                  )}

                  {review?.review_text && (
                    <p className="text-foreground">{review?.review_text}</p>
                  )}

                  {review?.helpful_count > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Icon name="ThumbsUp" size={14} />
                      <span>{review?.helpful_count} people found this helpful</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;