import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Добавляем useDispatch
import { Button } from 'react-bootstrap';
import { createOrderSuccess } from './ordersReducer'; // Импортируем действие
import 'bootstrap/dist/css/bootstrap.min.css';

function DataFetching() {
  const dispatch = useDispatch(); // Добавляем dispatch
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [people, setPeople] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
  const [reviews, setReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState({});
  const [errorReviews, setErrorReviews] = useState({});
  const [selectedSpecialistForOrder, setSelectedSpecialistForOrder] = useState(null);
  const [orderDescription, setOrderDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const specialistsRef = useRef(null);

  useEffect(() => {
    fetch('/categories')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        return response.json();
      })
      .then(data => {
        setCategories(data);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/services?categoryId=${selectedCategory.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch services');
          }
          return response.json();
        })
        .then(data => {
          setServices(data);
        })
        .catch(err => {
          console.error('Error fetching services:', err);
          setError('Failed to load services');
        });
    } else {
      setServices([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedService) {
      fetch(`/specialists?serviceId=${selectedService.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch specialists');
          }
          return response.json();
        })
        .then(data => {
          setPeople(data);
          setSelectedSpecialistId(null);
          setReviews({});
          if (specialistsRef.current) {
            specialistsRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        })
        .catch(err => {
          console.error('Error fetching specialists:', err);
          setError('Failed to load specialists');
        });
    }
  }, [selectedService]);

  const fetchReviews = (specialistId) => {
    setLoadingReviews(prev => ({ ...prev, [specialistId]: true }));
    setErrorReviews(prev => ({ ...prev, [specialistId]: null }));

    fetch(`/specialists/${specialistId}/reviews?userType=${user?.type || 'user'}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        return response.json();
      })
      .then(data => {
        console.log('Received reviews for specialist', specialistId, data); // Лог для отладки
        setReviews(prev => ({ ...prev, [specialistId]: data }));
        setLoadingReviews(prev => ({ ...prev, [specialistId]: false }));
      })
      .catch(err => {
        console.error('Error fetching reviews:', err);
        setErrorReviews(prev => ({ ...prev, [specialistId]: 'Failed to load reviews' }));
        setLoadingReviews(prev => ({ ...prev, [specialistId]: false }));
      });
  };

  const handleReviewsClick = (specialist) => {
    if (selectedSpecialistId === specialist.id) {
      setSelectedSpecialistId(null);
    } else {
      setSelectedSpecialistId(specialist.id);
      if (!reviews[specialist.id]) {
        fetchReviews(specialist.id);
      }
    }
  };

  const handleOrderClick = (specialist) => {
    if (!user) {
      setError('Please log in to place an order.');
      return;
    }
    if (selectedSpecialistForOrder === specialist.id) {
      setSelectedSpecialistForOrder(null);
    } else {
      setSelectedSpecialistForOrder(specialist.id);
      setOrderDescription('');
      setError('');
      setSuccess('');
    }
  };

  const handleOrderSubmit = async (specialist) => {
    if (!orderDescription.trim()) {
      setError('Order description cannot be empty');
      return;
    }

    try {
      const response = await fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          specialistId: specialist.id,
          description: orderDescription,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        dispatch(createOrderSuccess(data)); // Сохраняем заказ в Redux
        setSuccess(data.message || 'Order created successfully!');
        setSelectedSpecialistForOrder(null);
        setOrderDescription('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= roundedRating ? '#ffd700' : '#d3d3d3',
            fontSize: '1.2em',
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getImageUrl = (id) => {
    return `/images/${id}.jpg`;
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Our Categories</h1>
      <div className="container">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-3 justify-content-center">
          {categories.map((category) => (
            <div key={category.id} className="col">
              <div className="card mb-3" style={{ maxWidth: '540px' }}>
                <div className="row g-0">
                  <div className="col-md-4">
                    <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                      <img
                        src={getImageUrl(category.id)}
                        className="img-fluid rounded-start"
                        alt={`${category.name} category`}
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title mb-1">{category.name}</h5>
                      <strong>
                        <p className="card-text mb-1">
                          <a
                            href="#services-section"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedCategory(category.id === selectedCategory?.id ? null : category);
                            }}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {category.id === selectedCategory?.id ? 'Hide services' : 'Click to view services in this category.'}
                          </a>
                        </p>
                      </strong>
                      {selectedCategory && selectedCategory.id === category.id && (
                        <div className="mt-2">
                          <ul className="list-group list-group-flush">
                            {services.map((service) => (
                              <li
                                key={service.id}
                                className="list-group-item p-1"
                                style={{ cursor: 'pointer', border: 'none' }}
                                onClick={() => setSelectedService(service)}
                              >
                                <div style={{ transition: 'color 0.2s', fontSize: '0.95rem' }}>
                                  <strong style={{ color: 'inherit' }}>{service.name}</strong>
                                  <p className="mb-0 text-muted">{service.description}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <style>
                {`
                  .list-group-item:hover div {
                    color: #0d6efd !important;
                  }
                  .list-group-item {
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                  }
                `}
              </style>
            </div>
          ))}
        </div>
      </div>

      <div ref={specialistsRef} id="specialists-section">
        {selectedService && (
          <div className="mt-5">
            <h2>Specialists for {selectedService.name}</h2>
            {people.length === 0 ? (
              <p>No specialists found for this service.</p>
            ) : (
              <div className="row">
                {people.map((peop) => (
                  <div key={peop.id} className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                          <img
                            src={peop.avatarFile || '/avatars/placeholder-avatar.jpg'}
                            alt={`${peop.name}'s avatar`}
                            className="rounded-circle me-2"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/avatars/placeholder-avatar.jpg';
                            }}
                          />
                          <div>
                            <h5 className="card-title mb-0">{peop.name}</h5>
                            <p className="card-text mb-0">
                              {peop.averageRating != null ? (
                                <>
                                  {peop.averageRating.toFixed(1)} {renderStars(peop.averageRating)}
                                </>
                              ) : (
                                'Not rated yet'
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="card-text">{peop.description}</p>
                        <p className="card-text">{peop.contact}</p>
                        <div className="d-flex gap-2">
                          <Button variant="secondary" onClick={() => handleReviewsClick(peop)}>
                            {selectedSpecialistId === peop.id ? 'Hide Reviews' : 'Reviews'}
                          </Button>
                          {user && user.type === 'user' && selectedSpecialistId !== peop.id && (
                            <Button variant="primary" onClick={() => handleOrderClick(peop)}>
                              {selectedSpecialistForOrder === peop.id ? 'Cancel Order' : 'Place Order'}
                            </Button>
                          )}
                        </div>
                        {selectedSpecialistForOrder === peop.id && user && user.type === 'user' && (
                          <div className="order-form mt-3 p-3 border rounded bg-light">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            <div>
                              <label htmlFor="orderDescription" className="form-label">
                                Order Description
                              </label>
                              <textarea
                                id="orderDescription"
                                className="form-control"
                                rows={3}
                                value={orderDescription}
                                onChange={(e) => setOrderDescription(e.target.value)}
                                placeholder="Describe your order..."
                              />
                            </div>
                            <Button
                              variant="primary"
                              onClick={() => handleOrderSubmit(peop)}
                              className="mt-3"
                            >
                              Submit Order
                            </Button>
                          </div>
                        )}
                        {selectedSpecialistId === peop.id && (
                          <div className="mt-3">
                            <h6>Average Rating</h6>
                            <p>
                              {peop.averageRating != null ? (
                                <>
                                  {peop.averageRating.toFixed(1)} {renderStars(peop.averageRating)}
                                </>
                              ) : (
                                'Not rated yet'
                              )}
                            </p>
                            <h6>Reviews</h6>
                            {loadingReviews[peop.id] ? (
                              <p>Loading reviews...</p>
                            ) : errorReviews[peop.id] ? (
                              <p className="text-danger">{errorReviews[peop.id]}</p>
                            ) : reviews[peop.id] && reviews[peop.id].length > 0 ? (
                              <ul>
                                {reviews[peop.id]
                                  .filter((review) => !review.isHidden)
                                  .map((review) => (
                                    <li key={review.id} className="mb-2">
                                      <p>
                                        <strong>Rating:</strong> {review.rating}/5{' '}
                                        {renderStars(review.rating)}
                                      </p>
                                      <p>{review.comment || 'No comment provided.'}</p>
                                      <p>
                                        <small>{new Date(review.createdAt).toLocaleString()}</small>
                                      </p>
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <p>No reviews yet.</p>
                            )}
                            {user && user.type === 'user' && selectedSpecialistId !== peop.id && (
                              <Button
                                variant="primary"
                                onClick={() => handleOrderClick(peop)}
                                className="mt-2"
                              >
                                {selectedSpecialistForOrder === peop.id
                                  ? 'Cancel Order'
                                  : 'Place Order'}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataFetching;