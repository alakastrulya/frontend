import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';

function ModeratorDashboard() {
  const navigate = useNavigate();
  const { user, type } = useSelector((state) => state.auth);
  const [specialists, setSpecialists] = useState([]);
  const [reviews, setReviews] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);

  useEffect(() => {
    if (!user || type !== 'moderator') {
      navigate('/login');
      return;
    }

    // Загружаем список специалистов
    fetch('/moderator/specialists')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch specialists');
        return response.json();
      })
      .then(data => setSpecialists(data))
      .catch(err => {
        console.error('Error fetching specialists:', err);
        setError('Произошла ошибка при загрузке списка специалистов');
      });
  }, [user, type, navigate]);

  const fetchReviews = async (specialistId) => {
    try {
      const response = await fetch(`/specialists/${specialistId}/reviews?userType=moderator`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(prev => ({ ...prev, [specialistId]: data }));
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Ошибка при загрузке отзывов');
    }
  };

  const handleVerify = async (specialistId, isVerified) => {
    try {
      const response = await fetch(`/moderator/verify/${specialistId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify specialist');
      }

      setSuccess(`Специалист ${isVerified ? 'подтверждён' : 'отклонён'} успешно!`);
      setError('');
      setSpecialists(prev =>
        prev.map(specialist =>
          specialist.id === specialistId ? { ...specialist, isVerified } : specialist
        )
      );
    } catch (err) {
      console.error('Error verifying specialist:', err);
      setError(err.message || 'Произошла ошибка при верификации специалиста');
      setSuccess('');
    }
  };

  const handleToggleReviewHidden = async (reviewId) => {
    try {
      const response = await fetch(`/moderator/reviews/${reviewId}/toggle-hidden`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle review visibility');
      }

      const data = await response.json();
      setSuccess(data.message);
      setError('');

      // Обновляем отзывы в состоянии
      setReviews(prev => {
        const updatedReviews = { ...prev };
        Object.keys(updatedReviews).forEach(specialistId => {
          updatedReviews[specialistId] = updatedReviews[specialistId].map(review =>
            review.id === reviewId ? { ...review, isHidden: !review.isHidden } : review
          );
        });
        return updatedReviews;
      });
    } catch (err) {
      console.error('Error toggling review visibility:', err);
      setError(err.message || 'Ошибка при изменении видимости отзыва');
      setSuccess('');
    }
  };

  const handleSpecialistClick = (specialistId) => {
    if (selectedSpecialistId === specialistId) {
      setSelectedSpecialistId(null);
    } else {
      setSelectedSpecialistId(specialistId);
      if (!reviews[specialistId]) {
        fetchReviews(specialistId); // Загружаем отзывы
      }
      // Прокручиваем страницу вниз
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100); // Задержка для рендеринга
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
            fontSize: '1.2em',
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="container mt-5">
      <h2>Панель модератора</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Список специалистов */}
      <h3>Специалисты</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Контакт</th>
            <th>Описание</th>
            <th>Резюме</th>
            <th>Статус</th>
            <th>Действия</th>
            <th>Отзывы</th>
          </tr>
        </thead>
        <tbody>
          {specialists.map(specialist => (
            <tr key={specialist.id}>
              <td>{specialist.name}</td>
              <td>{specialist.contact}</td>
              <td>{specialist.description}</td>
              <td>
                {specialist.resumeFile ? (
                  <a href={`/${specialist.resumeFile}`} download>
                    Скачать резюме
                  </a>
                ) : (
                  'Нет резюме'
                )}
              </td>
              <td>
                {specialist.isVerified ? (
                  <span className="badge bg-success">Верифицирован</span>
                ) : (
                  <span className="badge bg-warning">Ожидает верификации</span>
                )}
              </td>
              <td>
                {!specialist.isVerified && (
                  <>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleVerify(specialist.id, true)}
                    >
                      Подтвердить
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleVerify(specialist.id, false)}
                    >
                      Отклонить
                    </button>
                  </>
                )}
              </td>
              <td>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => handleSpecialistClick(specialist.id)}
                >
                  {selectedSpecialistId === specialist.id ? 'Скрыть отзывы' : 'Показать отзывы'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Список отзывов для выбранного специалиста */}
      {selectedSpecialistId && reviews[selectedSpecialistId] && (
        <div className="mt-4">
          <h4>Отзывы для специалиста</h4>
          {reviews[selectedSpecialistId].length === 0 ? (
            <p>Отзывов пока нет.</p>
          ) : (
            <div className="row">
              {reviews[selectedSpecialistId].map(review => (
                <div key={review.id} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <p>
                        <strong>Рейтинг:</strong> {review.rating}/5 {renderStars(review.rating)}
                      </p>
                      <p>
                        <strong>Комментарий:</strong> {review.comment || 'Нет комментария'}
                      </p>
                      <p>
                        <small>{new Date(review.createdAt).toLocaleString()}</small>
                      </p>
                      <p>
                        <strong>Статус:</strong>{' '}
                        {review.isHidden ? (
                          <span className="badge bg-danger">Скрыт</span>
                        ) : (
                          <span className="badge bg-success">Видим</span>
                        )}
                      </p>
                      <button
                        className={`btn btn-sm ${review.isHidden ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => handleToggleReviewHidden(review.id)}
                      >
                        {review.isHidden ? 'Показать' : 'Скрыть'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ModeratorDashboard;