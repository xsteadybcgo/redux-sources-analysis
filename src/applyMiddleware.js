import compose from "./compose";

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 * 增强dispatch功能， 这样就可以使用更简明的方式dispatch type为function的action，打印log
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
  // createStore, reducer, preloadedState调用时来自createStore.js enhancer为undefined
  return createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    let dispatch = store.dispatch;
    let chain = [];

    const middlewareAPI = {
      getState: store.getState,
      // 保证middleware执行的时候，即新的enhancedDispatch执行的时候，
      // middlewareAPI中的dispatch始终与其（enhancedDispatch）保持一致
      dispatch: action => dispatch(action)
    };
    chain = middlewares.map(middleware => middleware(middlewareAPI));
    // dispatchCreator1 = middleware1(middlewareAPI)
    // dispatchCreator2 = middleware2(middlewareAPI)
    // dispatchCreator3 = middleware3(middlewareAPI)
    dispatch = compose(...chain)(store.dispatch);
    // dispatch = dispatchCreator1(dispatchCreator2(dispatchCreator3(store.dispatch)))
    // dispatchCreator3(store.dispatch) 返回newDispatch函数 action => store.dispatch(action)
    // dispatch2(newDispatch)
    // 新的dispatch执行时，洋葱一样一层层剥,subscribe的listerns队列也被执行
    return {
      ...store,
      dispatch
    };
  };
}
// logger middleware ,中间件利用 store 形参，即middlewareAPI实参做一些处理
// export default store => next => action => {
//   next为store.dispatch原始值，
//   不能在内部用store.dispatch, 该dispatch为middlewareAPI中的dispatch
//   这是最新的dispatch值，当store.dispatch(action)调用时，又回到compose(...chain)(store.dispatch)(action)这个过程
//   会造成代码死循环，非常危险
//   console.log(store.getState());
//   return next(action);
// }
