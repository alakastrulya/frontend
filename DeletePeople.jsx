import { useState, useEffect } from "react";

function DeletePeople() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch("/specialists");
        if (response.ok) {
          const data = await response.json();
          setPeople(data);
        } else {
          alert("Failed to fetch people");
        }
      } catch (error) {
        console.error("Error fetching people:", error);
      }
    };
    fetchPeople();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/specialists/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert(`Person with id ${id} deleted successfully!`);
        setPeople(people.filter((person) => person.id !== id));
      } else {
        alert("Failed to delete person");
      }
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  return (
    <div className="container">
         <br />
      <h2>Specialists List for Delete</h2> <br />
      {people.length === 0 ? (
        <p>No people in list.</p>
      ) : (
        <div >
        <div className="row g-4">
          {people.map((person) => (
            <div className="col-sm-6" key={person.id}>
              <div className="card">
              <div className="card-body">     
              <h5 className="card-title">{person.name}</h5>
             <strong> <p className="card-text"> Contact number: {person.contact}, CategoryId: {person.categoryId}, {person.description}</p></strong>
             <br /> <button className="btn btn-dark" onClick={() => handleDelete(person.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}

export default DeletePeople;
