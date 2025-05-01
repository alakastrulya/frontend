// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import "bootstrap/dist/css/bootstrap.min.css";

// function UpdatePeople() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user, type } = useSelector((state) => state.auth);
//   const [name, setName] = useState("");
//   const [contact, setContact] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryId, setCategoryId] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [services, setServices] = useState([]);
//   const [selectedServiceIds, setSelectedServiceIds] = useState([]);
//   const [resumeFile, setResumeFile] = useState(null);
//   const [password, setPassword] = useState("");
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [isVerified, setIsVerified] = useState(false);

//   // Загружаем данные пользователя в зависимости от типа
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const endpoint = `/${type}s/${id}`; // Теперь поддерживает users, specialists, admin, moderators
//         const response = await fetch(endpoint);
//         if (response.ok) {
//           const data = await response.json();
//           setName(data.name);
//           setContact(data.contact);
//           setDescription(data.description || "");
//           setIsVerified(data.isVerified || false);
//           if (type === "specialist") {
//             setSelectedServiceIds(data.serviceIds || []);
//             if (data.serviceIds && data.serviceIds.length > 0) {
//               const serviceResponse = await fetch(`/services/${data.serviceIds[0]}`);
//               if (serviceResponse.ok) {
//                 const service = await serviceResponse.json();
//                 setCategoryId(service.categoryId);
//               }
//             }
//           }
//         } else {
//           alert("Failed to load user data");
//         }
//       } catch (error) {
//         console.error("Error loading user data:", error);
//       }
//     };

//     // Загружаем категории
//     const fetchCategories = async () => {
//       try {
//         const response = await fetch("/categories");
//         if (response.ok) {
//           const data = await response.json();
//           setCategories(data);
//         } else {
//           alert("Couldn't load categories");
//         }
//       } catch (error) {
//         console.error("Error loading categories:", error);
//       }
//     };

//     if (!user || user.id !== id) {
//       navigate("/login");
//     } else {
//       fetchUserData();
//       if (type === "specialist") {
//         fetchCategories();
//       }
//     }
//   }, [id, type, user, navigate]);

//   // Загружаем услуги для выбранной категории
//   useEffect(() => {
//     if (categoryId) {
//       fetch(`/services?categoryId=${categoryId}`)
//         .then(response => {
//           if (!response.ok) {
//             throw new Error("Failed to fetch services");
//           }
//           return response.json();
//         })
//         .then(data => setServices(data))
//         .catch(error => {
//           console.error("Error fetching services:", error);
//           setServices([]);
//         });
//     } else {
//       setServices([]);
//       setSelectedServiceIds([]);
//     }
//   }, [categoryId]);

//   // Обработчик изменения состояния чекбокса
//   const handleServiceChange = (serviceId) => {
//     setSelectedServiceIds(prev => {
//       if (prev.includes(serviceId)) {
//         return prev.filter(id => id !== serviceId);
//       } else {
//         return [...prev, serviceId];
//       }
//     });
//   };

//   const handleUpdatePeople = async () => {
//     try {
//       if (type === "specialist" && selectedServiceIds.length === 0) {
//         throw new Error("Выберите хотя бы одну услугу");
//       }

//       const formData = new FormData();
//       formData.append('name', name);
//       formData.append('contact', contact);
//       if (type === "specialist") {
//         formData.append('description', description);
//         formData.append('serviceIds', JSON.stringify(selectedServiceIds));
//         if (resumeFile) {
//           formData.append('resume', resumeFile);
//         }
//       }
//       if (password) {
//         formData.append('password', password);
//         formData.append('currentPassword', currentPassword);
//       }

//       const endpoint = `/${type}s/${id}`;
//       const response = await fetch(endpoint, {
//         method: "PUT",
//         body: formData, // Убрали заголовок Authorization
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to update profile");
//       }

//       setSuccess("Профиль успешно обновлён! Пожалуйста, войдите снова с новым паролем.");
//       setError("");
//       setTimeout(() => navigate("/login"), 2000);
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       setError(error.message || "Произошла ошибка при обновлении профиля");
//       setSuccess("");
//     }
//   };

//   return (
//     <div className="container">
//       <br />
//       <h2>Обновить профиль</h2>
//       {type === "specialist" && isVerified && (
//         <span className="badge bg-success ms-2">✔ Верифицирован</span>
//       )}
//       <div className="mb-3">
//     <label className="form-label">Avatar:</label>
// </div>
//       <br />
//       <div className="input-group input-group-lg">
//         <span className="input-group-text" id="inputGroup-sizing-lg">Имя:</span>
//         <input
//           type="text"
//           className="form-control"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Enter a new name"
//         />
//       </div>
//       <br />
//       <div className="input-group input-group-lg">
//         <span className="input-group-text" id="inputGroup-sizing-lg">Контакт:</span>
//         <input
//           type="text"
//           className="form-control bfh-phone"
//           value={contact}
//           onChange={(e) => setContact(e.target.value)}
//           data-format="+1 (ddd) ddd-dddd"
//         />
//       </div>
//       {type === "specialist" && (
//         <>
//           <br />
//           <div className="input-group input-group-lg">
//             <span className="input-group-text" id="inputGroup-sizing-lg">Категория:</span>
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
//                   maxHeight: "150px",
//                   overflowY: "auto",
//                   border: "1px solid #ced4da",
//                   borderRadius: "0.25rem",
//                   padding: "10px",
//                   backgroundColor: "#fff",
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
//             <label htmlFor="exampleFormControlTextarea1" className="form-label">Описание</label>
//             <textarea
//               className="form-control"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               id="exampleFormControlTextarea1"
//               rows="3"
//             />
//           </div>
//         </>
//       )}
//       <br />
//       <div className="input-group input-group-lg">
//         <span className="input-group-text" id="inputGroup-sizing-lg">Новый пароль (оставьте пустым, если не меняете):</span>
//         <input
//           type="password"
//           className="form-control"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//       </div>
//       <br />
//       <div className="input-group input-group-lg">
//         <span className="input-group-text" id="inputGroup-sizing-lg">Текущий пароль (обязательно при смене пароля):</span>
//         <input
//           type="password"
//           className="form-control"
//           value={currentPassword}
//           onChange={(e) => setCurrentPassword(e.target.value)}
//           required={password !== ""}
//         />
//       </div>
//       <br />
//       {error && <p className="text-danger">{error}</p>}
//       {success && <p className="text-success">{success}</p>}
//       <button type="button" className="btn btn-outline-secondary" onClick={handleUpdatePeople}>
//         Обновить профиль
//       </button>
//     </div>
//   );
// }

// export default UpdatePeople;


import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";

function UpdatePeople() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, type } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null); // Новое состояние для аватарки
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Загружаем данные пользователя в зависимости от типа
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const endpoint = `/${type}s/${id}`; // Теперь поддерживает users, specialists, admin, moderators
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setName(data.name);
          setContact(data.contact);
          setDescription(data.description || "");
          setIsVerified(data.isVerified || false);
          if (type === "specialist") {
            setSelectedServiceIds(data.serviceIds || []);
            if (data.serviceIds && data.serviceIds.length > 0) {
              const serviceResponse = await fetch(`/services/${data.serviceIds[0]}`);
              if (serviceResponse.ok) {
                const service = await serviceResponse.json();
                setCategoryId(service.categoryId);
              }
            }
          }
        } else {
          alert("Failed to load user data");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    // Загружаем категории
    const fetchCategories = async () => {
      try {
        const response = await fetch("/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          alert("Couldn't load categories");
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    if (!user || user.id !== id) {
      navigate("/login");
    } else {
      fetchUserData();
      if (type === "specialist") {
        fetchCategories();
      }
    }
  }, [id, type, user, navigate]);

  // Загружаем услуги для выбранной категории
  useEffect(() => {
    if (categoryId) {
      fetch(`/services?categoryId=${categoryId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to fetch services");
          }
          return response.json();
        })
        .then(data => setServices(data))
        .catch(error => {
          console.error("Error fetching services:", error);
          setServices([]);
        });
    } else {
      setServices([]);
      setSelectedServiceIds([]);
    }
  }, [categoryId]);

  // Обработчик изменения состояния чекбокса
  const handleServiceChange = (serviceId) => {
    setSelectedServiceIds(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleUpdatePeople = async () => {
    try {
      if (type === "specialist" && selectedServiceIds.length === 0) {
        throw new Error("Выберите хотя бы одну услугу");
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('contact', contact);
      if (type === "specialist") {
        formData.append('description', description);
        formData.append('serviceIds', JSON.stringify(selectedServiceIds));
        if (resumeFile) {
          formData.append('resume', resumeFile);
        }
        if (avatarFile) {
          formData.append('avatar', avatarFile); // Добавляем аватарку в FormData
        }
      }
      if (password) {
        formData.append('password', password);
        formData.append('currentPassword', currentPassword);
      }

      const endpoint = `/${type}s/${id}`;
      const response = await fetch(endpoint, {
        method: "PUT",
        body: formData, // Убрали заголовок Authorization
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      setSuccess("Профиль успешно обновлён! Пожалуйста, войдите снова с новым паролем.");
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Произошла ошибка при обновлении профиля");
      setSuccess("");
    }
  };

  return (
    <div className="container">
      <br />
      <h2>Обновить профиль</h2>
      {type === "specialist" && isVerified && (
        <span className="badge bg-success ms-2">✔ Верифицирован</span>
      )}
      <div className="mb-3">
        <label className="form-label">Avatar:</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files[0])} // Обновляем состояние avatarFile
        />
      </div>
      <br />
      <div className="input-group input-group-lg">
        <span className="input-group-text" id="inputGroup-sizing-lg">Имя:</span>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a new name"
        />
      </div>
      <br />
      <div className="input-group input-group-lg">
        <span className="input-group-text" id="inputGroup-sizing-lg">Контакт:</span>
        <input
          type="text"
          className="form-control bfh-phone"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          data-format="+1 (ddd) ddd-dddd"
        />
      </div>
      {type === "specialist" && (
        <>
          <br />
          <div className="input-group input-group-lg">
            <span className="input-group-text" id="inputGroup-sizing-lg">Категория:</span>
            <select
              className="form-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Выберите категорию</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <br />
          <div className="mb-3">
            <label className="form-label">Услуги (выберите одну или несколько):</label>
            {services.length === 0 ? (
              <p className="text-muted">Сначала выберите категорию</p>
            ) : (
              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  border: "1px solid #ced4da",
                  borderRadius: "0.25rem",
                  padding: "10px",
                  backgroundColor: "#fff",
                }}
              >
                {services.map(service => (
                  <div key={service.id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`service-${service.id}`}
                      value={service.id}
                      checked={selectedServiceIds.includes(service.id)}
                      onChange={() => handleServiceChange(service.id)}
                    />
                    <label className="form-check-label" htmlFor={`service-${service.id}`}>
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Резюме (необязательно):</label>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="exampleFormControlTextarea1" className="form-label">Описание</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="exampleFormControlTextarea1"
              rows="3"
            />
          </div>
        </>
      )}
      <br />
      <div className="input-group input-group-lg">
        <span className="input-group-text" id="inputGroup-sizing-lg">Новый пароль (оставьте пустым, если не меняете):</span>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <br />
      <div className="input-group input-group-lg">
        <span className="input-group-text" id="inputGroup-sizing-lg">Текущий пароль (обязательно при смене пароля):</span>
        <input
          type="password"
          className="form-control"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required={password !== ""}
        />
      </div>
      <br />
      {error && <p className="text-danger">{error}</p>}
      {success && <p className="text-success">{success}</p>}
      <button type="button" className="btn btn-outline-secondary" onClick={handleUpdatePeople}>
        Обновить профиль
      </button>
    </div>
  );
}

export default UpdatePeople;