import compose from "./compose";

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 * 创建富功能store，于dispatch上应用dispatch， 用于 使用更简明的方式表示异步actions，打印log
 * See `redux-thunk` package as an example of the Redux middleware.
 * middleware为异步的，applyMiddleware应该在compose过程中第一个执行
 * 即compose(applyMiddleware())
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
// A createStore=> (createStore函数参数相同) => {
// const store = createStore(reducer, preloadedState, enhancer);
// 在createStore.js中被调用
// 调用栈内递归调用createStore(), store最后返回， 中间代码用于增强dispatch
//}
export default function applyMiddleware(...middlewares) {
  return createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    let dispatch = store.dispatch;
    let chain = [];

    const middlewareAPI = {
      getState: store.getState,
      dispatch: action => dispatch(action)
    };
    chain = middlewares.map(middleware => middleware(middlewareAPI));
    // dispatch1 = middleware1(middlewareAPI)
    // dispatch2 = middleware2(middlewareAPI)
    // dispatch3 = middleware3(middlewareAPI)
    dispatch = compose(...chain)(store.dispatch);
    // dispatch = dispatch1(dispatch2(dispatch3(store.dispatch)))
    // dispatch3(store.dispatch) 返回newDispatch函数 action => store.dispatch(action)
    // dispatch2(newDispatch)
    // 洋葱一样一层层往外执行
    return {
      ...store,
      dispatch
    };
  };
}
// logger middleware ,中间件利用 store 形参，即middlewareAPI实参做一些处理
// export default store => next => action => {
//   console.log(store.getState());
//   store.dispatch(action); // 原始的 dispatch
//   next(action);
//   console.log(store.getState());
// }
