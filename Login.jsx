import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "./authReducer";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [contact, setContact] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact, password }),
            });

            const responseData = await response.json();
            console.log('Response from server:', responseData);

            if (response.ok) {
                const { user, type } = responseData;
                console.log('Dispatching login with:', { user, type });
                // Убедимся, что данные корректны перед отправкой в Redux
                if (!user || !type) {
                    throw new Error('Invalid user or type received from server');
                }
                dispatch(login({ user, type })); // Сохраняем пользователя и тип в Redux
                setTimeout(() => {
                    if (type === 'moderator') {
                        navigate('/moderator');
                    } else if (type === 'admin') {
                        navigate('/admin'); // Перенаправление для админа
                    } else {
                        navigate('/');
                    }
                }, 2000);
            } else {
                alert(`Login failed: ${responseData.message || 'Incorrect data'}`);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred when logging in");
        }
    }

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label className="form-label">Contact:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
            <p className="mt-3">
                Нет аккаунта? <a href="/register">Зарегистрируйтесь</a>
            </p>
        </div>
    );
}

export default Login;