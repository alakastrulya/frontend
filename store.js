import { createStore, combineReducers } from "redux";
import authReducer from "./authReducer";
import ordersReducer from "./ordersReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  orders: ordersReducer,
});

const store = createStore(rootReducer);
export default store;