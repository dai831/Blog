# 数组的扁平化

## 方法1

>
> ```js
> function _flat(targetArray, container = []) {
>     if (!Array.isArray(targetArray)) return container;
>     
>     targetArray.forEach(item => {
>         if (!Array.isArray(item)) {
>             container.push(item);
>         } else {
>             _flat(item, container);
>         }
>     });
>     
>     return container;
> }
> 
> const rst = _flat([[[[[[1],2],3],4],5,6],7]);
> console.log('rst: ', rst);
> 
> ```
>



## 方法2

>
> ```
> function _flat2(targetArray) {
>     if (!Array.isArray(targetArray)) return [];
>     
>     let _loop = targetArray;
>     while (true) {
>         const beforeFlat = _loop.length;
>         const _Arr = _loop.flat();
>         const afterFlat = _Arr.length;
> 
>         if (beforeFlat === afterFlat) return _Arr;
>         _loop = _Arr;
>     }
> }
> 
> const rst2 = _flat2([[[[[[1],2],3],4],5,6],7]);
> console.log('rst2: ', rst2);
> 
> ```
>





