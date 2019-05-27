/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  // compose函数中， func执行顺序从右向左
  // const a=(x)=>{console.log("x",x) return x}
  // const b=(x)=>{console.log("x+1",x+1) return x+1}
  // const c=(x)=>{console.log("x*2",x*2) return x*2}
  // const d=(x)=>{console.log("x-1",x-1) return x-1}
  // compose(a, b, c, d)
  // return function(args) {
  //  return (((x-1)*2)+1)
  // }
  // 分析reduce函数，compose()执行过程中，执行reduce时，
  // 返回数为function 即 return (...args)=>a(b(...args)) funcs均为缓存，并未执行func()
  // eg:
  // const b1 = (...args) => a(b(...args)) ... 1  注：b(...arg)并没有执行调用
  // const c1 = (...args) => b1(c(...args))  ... 2   将2的c(...args)作为上1式的...args带入合并
  //    .
  // const c1 = (...args) => a(b(c(...args))))
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
