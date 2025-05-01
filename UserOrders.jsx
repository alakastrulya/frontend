import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function UserOrders() {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user || !user.id) {
          throw new Error('User ID is not available. Please log in again.');
        }
        console.log('Fetching orders for user:', user);
        const response = await fetch(`/orders?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(sortedOrders);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
      } catch (error) {
        setError(error.message || 'Failed to load orders');
        console.error('Error fetching orders:', error);
      }
    };

    if (user && user.type === 'user') {
      fetchOrders();
    } else {
      setError('Please log in as a user to view orders');
    }
  }, [user]);

  const handleReviewClick = (order) => {
    if (selectedOrderId === order.id) {
      setSelectedOrderId(null);
    } else {
      setSelectedOrderId(order.id);
      setRating(0);
      setHoverRating(0);
      setComment('');
      setReviewError('');
      setReviewSuccess('');
    }
  };

  const handleReviewSubmit = async (order) => {
    if (rating < 1 || rating > 5) {
      setReviewError('Please select a rating between 1 and 5.');
      return;
    }

    try {
      const response = await fetch(`/specialists/${order.specialistId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          rating,
          comment
        })
      });

      const data = await response.json();
      if (response.ok) {
        setReviewSuccess(data.message);
        setOrders(prev =>
          prev.map(o =>
            o.id === order.id ? { ...o, hasReviewed: true } : o
          )
        );
        setTimeout(() => {
          setSelectedOrderId(null);
          setReviewSuccess('');
        }, 1500);
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (error) {
      setReviewError('Error submitting review: ' + error.message);
    }
  };

  const StarRatingSelector = ({ rating, setRating, hoverRating, setHoverRating }) => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="star-rating">
        {stars.map(star => (
          <span
            key={star}
            className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{ cursor: 'pointer', fontSize: '1.5em', color: star <= (hoverRating || rating) ? '#ffd700' : '#d3d3d3' }}
          >
            {star <= (hoverRating || rating) ? '★' : '☆'}
          </span>
        ))}
        <span className="ms-2">{rating.toFixed(1)} / 5</span>
      </div>
    );
  };

  return (
    <div className="container mt-5">
      <h2>My Orders</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card mb-3 p-3 border rounded">
              <p><strong>Specialist:</strong> {order.specialist?.name || 'Unknown'}</p> {/* Добавляем имя специалиста */}
              <p><strong>Description:</strong> {order.description}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              {order.status === 'Completed' && !order.hasReviewed && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleReviewClick(order)}
                    className="mb-2"
                  >
                    {selectedOrderId === order.id ? 'Cancel Review' : 'Leave Review'}
                  </Button>
                  {selectedOrderId === order.id && (
                    <div className="review-form mt-3 p-3 border rounded bg-light">
                      {reviewError && <div className="alert alert-danger">{reviewError}</div>}
                      {reviewSuccess && <div className="alert alert-success">{reviewSuccess}</div>}
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Rating</Form.Label>
                          <StarRatingSelector
                            rating={rating}
                            setRating={setRating}
                            hoverRating={hoverRating}
                            setHoverRating={setHoverRating}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Comment</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your review here..."
                          />
                        </Form.Group>
                        <Button
                          variant="primary"
                          onClick={() => handleReviewSubmit(order)}
                        >
                          Submit Review
                        </Button>
                      </Form>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserOrders;