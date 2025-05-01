import "bootstrap/dist/css/bootstrap.min.css";
import './app.css';
import './styles.css';
import AddCategory from "./AddCategory";
import Orders from "./Orders";
import Header from "./Header";
import DataFetching from "./DataFetching";
import UpdateCategory from "./UpdateCategory";
import UserOrders from "./UserOrders";
import DeleteCategory from "./DeleteCategory";
import ModeratorDashboard from "./ModeratorDashboard";
import Login from "./Login";
import AdminPanel from "./AdminPanel";
import Register from "./Register";
import UpdatePeople from "./UpdatePeople";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const App = () => {
  const { user, type } = useSelector((state) => state.auth);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<DataFetching />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-orders" element={user && type === "user" ? <UserOrders />: <Navigate to="/login" />} />
        <Route path="/create" element={user && type === "admin" ? <AddCategory /> : <Navigate to="/login" />} />
        <Route path="/update/:id" element={user && type === "admin" ? <UpdateCategory /> : <Navigate to="/login" />} />
        <Route path="/del" element={user && type === "admin" ? <DeleteCategory /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user && type === "admin" ? <AdminPanel /> : <Navigate to="/login"/>} />
        <Route path="/update-specialist/:id" element={user && type === "specialist" ? <UpdatePeople /> : <Navigate to="/login" />} />
        <Route path="/orders" element={user && type === "specialist" ? <Orders />: <Navigate to="/login" />} />
        <Route path="/moderator" element={user && type === "moderator" ? <ModeratorDashboard /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
};

export default App;