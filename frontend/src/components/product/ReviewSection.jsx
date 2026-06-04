import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaStar, FaRegStar, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../../services/api';
import Rating from '../ui/Rating';
import { formatDate } from '../../utils/helpers';
import './ReviewSection.css';

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} stars`}
        >
          {(hover || value) >= n ? <FaStar /> : <FaRegStar />}
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId, reviews = [], onChange }) {
  const { user } = useSelector((s) => s.auth);
  const myReview = reviews.find((r) => r.user?._id === user?._id);

  const [rating, setRating] = useState(myReview?.rating || 0);
  const [comment, setComment] = useState(myReview?.comment || '');
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a rating');
    if (!comment.trim()) return toast.error('Please write a review');

    setSubmitting(true);
    try {
      if (myReview) {
        await api.put(`/reviews/${myReview._id}`, { rating, comment });
        toast.success('Review updated');
      } else {
        await api.post(`/products/${productId}/reviews`, { rating, comment });
        toast.success('Thank you for your review!');
      }
      setEditing(false);
      onChange?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      toast.info('Review deleted');
      setRating(0);
      setComment('');
      onChange?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="reviews">
      <div className="reviews__head">
        <h2>Customer Reviews</h2>
        {reviews.length > 0 && (
          <span className="muted">{reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="reviews__layout">
        {/* Write / edit */}
        <div className="reviews__form-wrap">
          {user ? (
            <form className="reviews__form surface" onSubmit={submit}>
              <h3>{myReview && !editing ? 'Your Review' : 'Write a Review'}</h3>
              {myReview && !editing ? (
                <>
                  <Rating value={myReview.rating} />
                  <p className="muted" style={{ margin: '10px 0' }}>{myReview.comment}</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                      <FaEdit /> Edit
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(myReview._id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <label>Your Rating</label>
                  <StarInput value={rating} onChange={setRating} />
                  <textarea
                    className="textarea"
                    placeholder="Share your experience with this product…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ marginTop: 14 }}
                  />
                  <p className="reviews__note">
                    Only verified buyers who have received this product can post a review.
                  </p>
                  <button className="btn btn-primary btn-block" disabled={submitting}>
                    {submitting ? 'Submitting…' : myReview ? 'Update Review' : 'Submit Review'}
                  </button>
                </>
              )}
            </form>
          ) : (
            <div className="reviews__form surface text-center">
              <p className="muted">Please log in to write a review.</p>
            </div>
          )}
        </div>

        {/* List */}
        <div className="reviews__list">
          {reviews.length === 0 ? (
            <p className="muted">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="review-item">
                <div className="review-item__avatar">
                  {r.user?.avatar?.url ? (
                    <img src={r.user.avatar.url} alt={r.name} />
                  ) : (
                    <span>{r.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="review-item__body">
                  <div className="review-item__top">
                    <strong>{r.name}</strong>
                    <span className="badge badge-soft">Verified Buyer</span>
                  </div>
                  <Rating value={r.rating} size={13} />
                  <p>{r.comment}</p>
                  <span className="review-item__date">{formatDate(r.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
