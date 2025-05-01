// const initialState = { user: null, type: null };

const initialState = { 
  user: JSON.parse(localStorage.getItem("user")) || null, 
  type: localStorage.getItem("type") || null 
};

function authReducer(state = initialState, action) {
  console.log('Action received in reducer:', action);
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("type", action.payload.type);
      console.log('Updating state with payload:', action.payload);
      const newState = { ...state, user: action.payload.user, type: action.payload.type };
      console.log('New state after LOGIN:', newState);
      return newState;
    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("type");
      console.log('Logging out, new state:', { ...state, user: null, type: null });
      return { ...state, user: null, type: null };
    default:
      return state;
  }
}

export default authReducer;

export const login = (data) => ({
  type: "LOGIN",
  payload: data
});

export const logout = () => ({ type: "LOGOUT" });