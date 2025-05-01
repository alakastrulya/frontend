import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, type } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0); // Для хранения текущей оценки
  const [ratingOrderId, setRatingOrderId] = useState(null); // ID заказа, для которого ставится рейтинг

  useEffect(() => {
    if (user && type === 'specialist') {
      fetch(`/orders?specialistId=${user.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }
          return response.json();
        })
        .then(data => {
          const sortedOrders = data.sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setOrders(sortedOrders);
        })
        .catch(error => {
          console.error('Error fetching orders:', error);
          setError('Failed to load orders');
        });
    }
  }, [user, type]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/orders/${orderId}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          ).sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
        );
        setSuccess(data.message);
        // Если статус "Completed", показываем форму для оценки клиента
        if (newStatus === 'Completed') {
          setRatingOrderId(orderId);
          setRating(0); // Сбрасываем рейтинг
        }
      } else {
        setError(data.message || 'Error updating order status');
      }
    } catch (error) {
      setError('Error updating order status: ' + error.message);
    }
  };

  const handleRateUser = async (orderId) => {
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5');
      return;
    }

    try {
      const order = orders.find(o => o.id === orderId);
      const response = await fetch(`/orders/${orderId}/rate-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistId: user.id,
          userId: order.user.id,
          rating,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to rate user');
      }

      const data = await response.json();
      setSuccess(data.message);
      setError('');
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, hasRatedUser: true } : order
        )
      );
      setRatingOrderId(null); // Закрываем форму оценки
      setRating(0); // Сбрасываем рейтинг
    } catch (err) {
      setError(err.message || 'Ошибка при оценке клиента');
      setSuccess('');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? '#ffd700' : '#d3d3d3',
            fontSize: '1em',
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const renderRatingInput = (orderId) => {
    return (
      <div className="mt-2">
        <p>Rate the client:</p>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            style={{
              cursor: 'pointer',
              color: star <= rating ? '#ffd700' : '#d3d3d3',
              fontSize: '1.2em',
            }}
            onClick={() => setRating(star)}
          >
            ★
          </span>
        ))}
        <div className="mt-2">
          <button
            className="button-small"
            onClick={() => handleRateUser(orderId)}
          >
            Submit Rating
          </button>
          <button
            className="button-small"
            style={{ backgroundColor: '#dc3545', marginLeft: '10px' }}
            onClick={() => setRatingOrderId(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (!user || type !== 'specialist') {
    return <div className="container mt-5"><h2>Please log in as a specialist to view orders.</h2></div>;
  }

  return (
    <div className="container mt-5">
      <h2>My Orders</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <p>
                <strong>Client:</strong> {order.user?.name || 'Unknown'}
                {order.averageUserRating != null && (
                  <span>
                    {' '}
                    ({order.averageUserRating.toFixed(1)} {renderStars(Math.round(order.averageUserRating))})
                  </span>
                )}
              </p>
              <p><strong>Description:</strong> {order.description}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              {order.status === 'Pending' && (
                <div>
                  <button
                    className="button-small"
                    onClick={() => handleUpdateStatus(order.id, 'In Progress')}
                  >
                    Accept
                  </button>
                  <button
                    className="button-small"
                    style={{ backgroundColor: '#dc3545' }}
                    onClick={() => handleUpdateStatus(order.id, 'Declined')}
                  >
                    Decline
                  </button>
                </div>
              )}
              {order.status === 'In Progress' && (
                <button
                  className="button-small"
                  onClick={() => handleUpdateStatus(order.id, 'Completed')}
                >
                  Mark as Completed
                </button>
              )}
              {order.status === 'Completed' && !order.hasRatedUser && ratingOrderId === order.id && (
                renderRatingInput(order.id)
              )}
              {order.status === 'Completed' && order.hasRatedUser && (
                <p><em>You have rated this client.</em></p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;