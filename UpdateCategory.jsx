import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Импортируем useParams

function UpdateCategory() {
  const { id } = useParams(); // Получаем id из URL
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // Получаем данные категории при монтировании компонента
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/categories/${id}`);
        if (response.ok) {
          const data = await response.json();
          setName(data.name);
        } else {
          alert("Failed to load category");
        }
      } catch (error) {
        console.error("Error loading category:", error);
      }
    };
    fetchCategory();
  }, [id]);

  const handleUpdateCategory = async () => {
    const updatedCategory = { name };

    try {
      const response = await fetch(`/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCategory),
      });

      if (response.ok) {
        alert("Category updated successfully!");
        navigate("/del");
      } else {
        alert("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  return (
    <>
      <div className="container">
        <br />
        <h2>Обновить категорию</h2> <br />
        <div className="input-group input-group-lg">
          <span className="input-group-text" id="inputGroup-sizing-lg">
            Название:
          </span>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a new category name"
            aria-describedby="inputGroup-sizing-default"
          />
        </div>
        <br />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleUpdateCategory}
        >
          Update category
        </button>
      </div>
    </>
  );
}

export default UpdateCategory;