// ordersReducer.js
const initialState = {
    orders: [], // Список заказов пользователя
  };
  
  const ordersReducer = (state = initialState, action) => {
    switch (action.type) {
      // Создание заказа
      case 'CREATE_ORDER_SUCCESS':
        return {
          ...state,
          orders: [...state.orders, action.payload], // Добавляем новый заказ в список
        };
  
      // Загрузка списка заказов
      case 'FETCH_ORDERS_SUCCESS':
        return {
          ...state,
          orders: action.payload,
        };
  
      default:
        return state;
    }
  };
  
  // Action Creators
  export const createOrderSuccess = (order) => ({
    type: 'CREATE_ORDER_SUCCESS',
    payload: order,
  });
  
  export const fetchOrdersSuccess = (orders) => ({
    type: 'FETCH_ORDERS_SUCCESS',
    payload: orders,
  });
  
  export default ordersReducer;