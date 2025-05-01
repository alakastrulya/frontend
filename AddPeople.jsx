import { useState } from "react";

function AddPeople() {
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState(0);
    const [contact, setContact] = useState("");
    const [description, setDescription] = useState("");
  

    useEffect(() => {
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
      fetchCategories();
    }, []);
  
    const handleAddnewPeople = async () => {
      const newPeople = { name, categoryId: parseInt(categoryId), contact, description };
  
      try {
        const response = await fetch("/specialists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPeople),
        });
  
        if (response.ok) {
          alert("Person added successfully!");
          setName('');
          setCategoryId(0);
          setContact('');
          setDescription('');
        } else {
          alert("Failed to add people");
        }
      } catch (error) {
        console.error("Error adding people:", error);
      }
    };

  return (
    <div className="container"> <br />
      <h2>Add New People</h2> <br />
      <div className="input-group input-group-lg">
      <span className="input-group-text" id="inputGroup-sizing-lg"> Name:</span>
      <input type="text" className="form-control" value={name}
       onChange={(e) => setName(e.target.value)}
       placeholder="Enter new People name"
       aria-describedby="inputGroup-sizing-lg" />
      </div><br />
      <div className="input-group input-group-lg">
      <span className="input-group-text" id="inputGroup-sizing-lg"> Category Id:</span>
      <input type="text" className="form-control" value={categoryId}
      onChange={(e) => setCategoryId(e.target.value)}
      placeholder="Enter new People category id"
       aria-describedby="inputGroup-sizing-lg" />
      </div><br />
      <input type="text" className="form-control bfh-phone" value={contact} onChange={(e) => setContact(e.target.value)} data-format="+1 (ddd) ddd-dddd"/>

      <div class="mb-3"><br />
      <label for="exampleFormControlTextarea1" className="form-label" >Description</label>
      <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} id="exampleFormControlTextarea1" rows="3"></textarea>

      <br />
      <button type="button" className="btn btn-outline-secondary" onClick={handleAddnewPeople}>Add People</button>
    </div>
    </div>


  );
}

export default AddPeople;