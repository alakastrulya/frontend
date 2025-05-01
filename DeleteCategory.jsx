import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import DeletePeople from "./DeletePeople";

function DeleteCategory() {
  const [categories, setCategories] = useState([]);

 
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch("/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          alert("couldn't load categories");
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    fetchCategory();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert(`Category with id ${id} successfully deleted!`);
        setCategories(categories.filter((category) => category.id !== id));
      } else {
        alert("Couldn't delete category");
      }
    } catch (error) {
      console.error("Error when deleting a category:", error);
    }
  };

  return (
    <div className="container">
      <br />
      <h2>List of categories to delete</h2> <br />
      {categories.length === 0 ? (
        <p>There are no available categories.</p>
      ) : (
        <div>
          <div className="row g-4">
            {categories.map((category) => (
              <div className="col-sm-6" key={category.id}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{category.name}</h5>
                    <button
                      className="btn btn-dark me-2" 
                      onClick={() => handleDelete(category.id)}
                    >
                      Удалить
                    </button>
                    <Link to={`/update/${category.id}`}>
                      <button className="btn btn-outline-secondary">
                        Обновить
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <DeletePeople />
    </div>
  );
}

export default DeleteCategory;