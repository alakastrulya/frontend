import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function AdminPanel() {
  const [specialists, setSpecialists] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Загружаем список всех специалистов
  useEffect(() => {
    fetch('/admin/specialists')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch specialists');
        }
        return response.json();
      })
      .then(data => setSpecialists(data))
      .catch(error => {
        console.error('Error fetching specialists:', error);
        setError('Failed to load specialists');
      });
  }, []);

  // Функция для переключения статуса активности
  const handleToggleActive = async (id) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/admin/toggle-active/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok) {
        setSpecialists(prev =>
          prev.map(specialist =>
            specialist.id === id ? { ...specialist, isActive: !specialist.isActive } : specialist
          )
        );
        setSuccess(data.message);
      } else {
        setError(data.message || 'Error toggling specialist status');
      }
    } catch (error) {
      setError('Error toggling specialist status: ' + error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Panel - Manage Specialists</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {specialists.length === 0 ? (
        <p>No specialists found.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {specialists.map(specialist => (
              <tr key={specialist.id}>
                <td>{specialist.name}</td>
                <td>{specialist.contact}</td>
                <td>{specialist.description}</td>
                <td>{specialist.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button
                    className={`btn ${specialist.isActive ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => handleToggleActive(specialist.id)}
                  >
                    {specialist.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPanel;