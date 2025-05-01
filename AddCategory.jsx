import { useState } from "react";
import UpdateCategory from "./UpdateCategory";


function AddCategory() {
  const [name, setName] = useState("");

  const handleAddCategory = async () => {
    const newCategory = { name };

    try {
      const response = await fetch("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        alert("Category added successfully!");
        setName('');
      } else {
        alert("Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="container"><br /><br />
      <h2>Add New Category</h2><br />
      <div className="input-group input-group-lg">
      <span className="input-group-text" id="inputGroup-sizing-lg"> Name:</span>
      <input type="text" className="form-control" value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter new Category"
      aria-describedby="inputGroup-sizing-default" />
      </div>
      <div><br />
      <button type="button" className="btn btn-outline-secondary" onClick={handleAddCategory}>Update Category</button>
      </div><br />
    
    </div>

  );
}

export default AddCategory;