// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';

// function Register() {
//   const navigate = useNavigate();
//   const [userType, setUserType] = useState('user');
//   const [name, setName] = useState('');
//   const [contact, setContact] = useState('');
//   const [password, setPassword] = useState('');
//   const [description, setDescription] = useState('');
//   const [categoryId, setCategoryId] = useState('');
//   const [categories, setCategories] = useState([]);
//   const [services, setServices] = useState([]);
//   const [selectedServiceIds, setSelectedServiceIds] = useState([]);
//   const [resumeFile, setResumeFile] = useState(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Загружаем категории при монтировании
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await fetch('/categories');
//         if (response.ok) {
//           const data = await response.json();
//           setCategories(data);
//         } else {
//           setError('Не удалось загрузить категории');
//         }
//       } catch (error) {
//         setError('Ошибка при загрузке категорий');
//         console.error(error);
//       }
//     };
//     fetchCategories();
//   }, []);

//   // Загружаем услуги при выборе категории
//   useEffect(() => {
//     if (categoryId) {
//       fetch(`/services?categoryId=${categoryId}`)
//         .then(response => {
//           if (!response.ok) {
//             throw new Error('Failed to fetch services');
//           }
//           return response.json();
//         })
//         .then(data => setServices(data))
//         .catch(error => {
//           console.error('Error fetching services:', error);
//           setServices([]);
//         });
//     } else {
//       setServices([]);
//       setSelectedServiceIds([]);
//     }
//   }, [categoryId]);

//   const handleServiceChange = (serviceId) => {
//     setSelectedServiceIds(prev => {
//       if (prev.includes(serviceId)) {
//         return prev.filter(id => id !== serviceId);
//       } else {
//         return [...prev, serviceId];
//       }
//     });
//   };

//   const handleRegister = async () => {
//     try {
//       // Проверяем обязательные поля
//       if (!name || !contact || !password) {
//         throw new Error('Все поля (имя, контакт, пароль) обязательны для заполнения');
//       }

//       if (userType === 'specialist' && selectedServiceIds.length === 0) {
//         throw new Error('Выберите хотя бы одну услугу');
//       }

//       const formData = new FormData();
//       formData.append('name', name);
//       formData.append('contact', contact);
//       formData.append('password', password);

//       if (userType === 'specialist') {
//         formData.append('description', description);
//         formData.append('serviceIds', JSON.stringify(selectedServiceIds));
//         if (resumeFile) {
//           formData.append('resume', resumeFile);
//         }
//       }

//       const endpoint = userType === 'user' ? '/users' : '/specialists';
//       console.log('Sending registration request to:', endpoint);
//       console.log('FormData contents:', [...formData.entries()]); // Логируем содержимое FormData

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         body: formData,
//       });

//       const responseData = await response.json();
//       console.log('Response from server:', responseData);

//       if (!response.ok) {
//         throw new Error(responseData.message || 'Failed to register');
//       }

//       setSuccess('Регистрация прошла успешно! Перенаправляем на страницу входа...');
//       setError('');
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (error) {
//       setError(error.message || 'Ошибка при регистрации');
//       setSuccess('');
//       console.error('Error:', error);
//     }
//   };

//   return (
//     <div className="container">
//       <br />
//       <h2>Регистрация</h2>
//       <div className="mb-3">
//         <label className="form-label">Тип пользователя:</label>
//         <select
//           className="form-select"
//           value={userType}
//           onChange={(e) => setUserType(e.target.value)}
//         >
//           <option value="user">Пользователь</option>
//           <option value="specialist">Специалист</option>
//         </select>
//       </div>

//       <div className="input-group input-group-lg">
//         <span className="input-group-text">Имя:</span>
//         <input
//           type="text"
//           className="form-control"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Введите ваше имя"
//         />
//       </div>
//       <br />
//       <div className="input-group input-group-lg">
//         <span className="input-group-text">Контакт:</span>
//         <input
//           type="text"
//           className="form-control bfh-phone"
//           value={contact}
//           onChange={(e) => setContact(e.target.value)}
//           data-format="+1 (ddd) ddd-dddd"
//           placeholder="Введите ваш контакт"
//         />
//       </div>
//       <br />
//       <div className="input-group input-group-lg">
//         <span className="input-group-text">Пароль:</span>
//         <input
//           type="password"
//           className="form-control"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Введите пароль"
//         />
//       </div>

//       {userType === 'specialist' && (
//         <>
//           <br />
//           <div className="input-group input-group-lg">
//             <span className="input-group-text">Категория:</span>
//             <select
//               className="form-control"
//               value={categoryId}
//               onChange={(e) => setCategoryId(e.target.value)}
//             >
//               <option value="">Выберите категорию</option>
//               {categories.map((category) => (
//                 <option key={category.id} value={category.id}>
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <br />
//           <div className="mb-3">
//             <label className="form-label">Услуги (выберите одну или несколько):</label>
//             {services.length === 0 ? (
//               <p className="text-muted">Сначала выберите категорию</p>
//             ) : (
//               <div
//                 style={{
//                   maxHeight: '150px',
//                   overflowY: 'auto',
//                   border: '1px solid #ced4da',
//                   borderRadius: '0.25rem',
//                   padding: '10px',
//                   backgroundColor: '#fff',
//                 }}
//               >
//                 {services.map(service => (
//                   <div key={service.id} className="form-check">
//                     <input
//                       type="checkbox"
//                       className="form-check-input"
//                       id={`service-${service.id}`}
//                       value={service.id}
//                       checked={selectedServiceIds.includes(service.id)}
//                       onChange={() => handleServiceChange(service.id)}
//                     />
//                     <label className="form-check-label" htmlFor={`service-${service.id}`}>
//                       {service.name}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="mb-3">
//             <label className="form-label">Резюме (необязательно):</label>
//             <input
//               type="file"
//               className="form-control"
//               accept=".pdf,.doc,.docx"
//               onChange={(e) => setResumeFile(e.target.files[0])}
//             />
//           </div>
//           <div className="mb-3">
//             <label className="form-label">Описание:</label>
//             <textarea
//               className="form-control"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               rows="3"
//               placeholder="Опишите свои навыки и опыт"
//             />
//           </div>
//         </>
//       )}

//       <br />
//       {error && <p className="text-danger">{error}</p>}
//       {success && <p className="text-success">{success}</p>}
//       <button type="button" className="btn btn-primary" onClick={handleRegister}>
//         Зарегистрироваться
//       </button>
//       <br />
//       <br />
//       <button
//         type="button"
//         className="btn btn-link"
//         onClick={() => navigate('/login')}
//       >
//         Уже есть аккаунт? Войти
//       </button>
//     </div>
//   );
// }

// export default Register;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        password: '',
        description: '',
        serviceIds: [],
        resume: null,
        avatar: null, // Добавляем поле для аватарки
    });
    const [services, setServices] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetch('/services')
            .then(response => response.json())
            .then(data => setServices(data))
            .catch(error => {
                console.error('Error fetching services:', error);
                setServices([]);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else if (type === 'select-multiple') {
            const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
            setFormData(prev => ({ ...prev, serviceIds: selectedOptions }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('contact', formData.contact);
        data.append('password', formData.password);
        data.append('description', formData.description);
        data.append('serviceIds', JSON.stringify(formData.serviceIds));
        if (formData.resume) {
            data.append('resume', formData.resume);
        }
        if (formData.avatar) {
            data.append('avatar', formData.avatar); // Добавляем аватарку в FormData
        }

        try {
            const response = await fetch('/specialists', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();
            if (response.ok) {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(result.message || 'Error registering specialist');
            }
        } catch (error) {
            setError('Error registering specialist: ' + error.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Register as a Specialist</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Name:</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Contact:</label>
                    <input
                        type="text"
                        name="contact"
                        className="form-control"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password:</label>
                    <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Description:</label>
                    <textarea
                        name="description"
                        className="form-control"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Services:</label>
                    <select
                        name="serviceIds"
                        multiple
                        className="form-control"
                        value={formData.serviceIds}
                        onChange={handleChange}
                    >
                        {services.map(service => (
                            <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Resume:</label>
                    <input
                        type="file"
                        name="resume"
                        className="form-control"
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Avatar:</label>
                    <input
                        type="file"
                        name="avatar"
                        className="form-control"
                        onChange={handleChange}
                        accept="image/*" // Ограничиваем типы файлов (только изображения)
                    />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
}

export default Register;