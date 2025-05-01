    import { Link } from "react-router-dom";
    import { useSelector, useDispatch } from "react-redux";
    import { logout } from "./authReducer";
    import './Header.css';

    export default function Header() {
        const { user, type } = useSelector((state) => state.auth);
        const dispatch = useDispatch();

        console.log('Header state:', { user, type });

        return (
            <header>
                <h3>Services KZ</h3>
                <ul className="nav justify-content-end">
                    <li className="nav-item">
                        <strong><Link className="nav-link active" to="/">Home</Link></strong>
                    </li>
                    {user ? (
                        <>
                            {type === "user" && (
                                <>
                                 <li className="nav-item">
                                    <Link className="nav-link" to="/my-orders">My Orders</Link>
                                </li>
                                <li className="nav-item">
                                    <strong><button className="nav-link btn btn-link" onClick={() => dispatch(logout())}>Logout</button></strong>
                                </li>
                                </>
                            )}
                            {type === "specialist" && (
                                <>
                                    <li className="nav-item">
                                        <strong><Link className="nav-link" to={`/update-specialist/${user?.id || ''}`}>Update profile</Link></strong>
                                    </li>
                                    <li className="nav-item">
                                            <Link className="nav-link" to="/orders">Orders</Link>
                                    </li>
                                    <li className="nav-item">
                                        <strong><button className="nav-link btn btn-link" onClick={() => dispatch(logout())}>Logout</button></strong>
                                    </li>

                                </>
                            )}
                            {type === "admin" && (
                                <>
                                    <li className="nav-item">
                                        <strong><Link className="nav-link" to="/create">Add category</Link></strong>
                                    </li>
                                    <li className="nav-item">
                                        <strong><Link className="nav-link" to="/del">Update/Delete</Link></strong>
                                    </li>
                                    <li className="nav-item">
                                        <strong><Link className="nav-link" to="/admin">Accounts</Link></strong>
                                    </li>
                                    <li className="nav-item">
                                        <strong><button className="nav-link btn btn-link" onClick={() => dispatch(logout())}>Logout</button></strong>
                                    </li>
                                </>
                            )}
                            {type === "moderator" && (
                                <>
                                    <li className="nav-item">
                                        <strong><Link className="nav-link" to="/moderator">Accounts</Link></strong>
                                    </li>
                                    <li className="nav-item">
                                        <strong><button className="nav-link btn btn-link" onClick={() => dispatch(logout())}>Logout</button></strong>
                                    </li>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <strong><Link className="nav-link" to="/register">Register</Link></strong>
                            </li>
                            <li className="nav-item">
                                <strong><Link className="nav-link" to="/login">Login</Link></strong>
                            </li>
                        </>
                    )}
                </ul>
            </header>
        );
    }