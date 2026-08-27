---
js技巧方式
---



# **1. 获取浏览器 Cookie 的值**

- 使用 document.cookie 来获取 Cookie 的值。

> ```javascript
> const cookie = name => `; ${document.cookie}`.split(`; ${name}=`).pop().split(';').shift();
> 
> cookie('_ga');
> // Result: "GA1.2.1929736587.1601974046"
> 
> ```




# **2. 将 RGB 转换为十六进制**

- ```javascript
  const rgbToHex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  
  rgbToHex(0, 51, 255);
  // Result: #0033ff`
  ```

  

# **3. 复制到剪贴板**

- 使用 navigator.clipboard.writeText 轻松将任何文本复制到剪贴板上。

  ```javascript
  const copyToClipboard = (text) => navigator.clipboard.writeText(text);
  copyToClipboard("Hello World");
  
  ```

  

# **4.检查日期是否有效**

- 使用以下代码段检查日期是否有效。

  ```javascript
  const isDateValid = (...val) => !Number.isNaN(new Date(...val).valueOf());
  isDateValid("December 17, 1995 03:24:00");
  // Result: true
  
  ```



# **5.找出一年中的某一天**

- 查找日期中的某一天。

  ```javascript
  const dayOfYear = (date) => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  dayOfYear(new Date());
  // Result: 272
  
  ```

  ​	

# **6.字符串首字母大写**

- Javascript 没有内置的大写函数，因此我们可以使用以下代码。

  ```javascript
  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
  capitalize("follow for more")
  // Result: Follow for more
  
  ```

  

# 7.计算两天之间相差的天数

- 使用以下代码段查找给定 2 天之间相差的天数。

  ```javascript
  const dayDif = (date1, date2) => Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / 86400000)
  dayDif(new Date("2020-10-21"), new Date("2021-10-22"))
  // Result: 366
  
  ```



# 8.清除所有 Cookie

- 通过使用 document.cookie 可以轻松清除存储在网页中的所有 cookie 。

  ```javascript
  const clearCookies = document.cookie.split(';').forEach(cookie => document.cookie = cookie.replace(/^ +/, '').replace(/=.\*/, `=;expires=${new Date(0).toUTCString()};path=/`));
  
  ```



# 9. 生成随机十六进制

- 使用 Math.random 和 padEnd 属性生成随机的十六进制。

  ```javascript
  const randomHex = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, "0")}`;
  console.log(randomHex());
  // Result: #92b008
  
  ```

  

# 10. 数组去重

- 使用 Math.random 和 padEnd 属性生成随机的十六进制。

  ```javascript
  const removeDuplicates = (arr) => [...new Set(arr)];
  console.log(removeDuplicates([1, 2, 3, 3, 4, 4, 5, 5, 6]));
  // Result: [ 1, 2, 3, 4, 5, 6 ]
  
  ```



# 11. 从 URL 获取查询参数

- 通过 window.location 或原始 URL 轻松查询 goole.com?search=easy&page=3 的参数。

  ```javascript
  const getParameters = (URL) => { 
      URL = JSON.parse('{"' + decodeURI(URL.split("?")[1]).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') +'"}');
      return JSON.stringify(URL);
  };
  getParameters(window.location)
  // Result: { search : "easy", page : 3 }
  
  /---------------or-------------/
  
  Object.fromEntries(new URLSearchParams(window.location.search))
  
  ```



# 12. 从日期获取“时分秒”格式的时间

- 我们可以从日期中，获取到 hour : minutes : seconds 格式的时间：

  ```javascript
  const timeFromDate = date => date.toTimeString().slice(0, 8);
  console.log(timeFromDate(new Date(2021, 0, 10, 17, 30, 0)));
  // Result: "17:30:00"
  
  ```



# 13. 确认奇偶数

- ```javascript
  const isEven = num => num % 2 === 0;
  console.log(isEven(2));
  // Result: True
  /---------------------or----------------/
  const isEven = num => (num & 1) === 0
  console.log(isEven(2));
  // Result: True
  
  ```

  

# 14. 求平均值

- 使用 reduce 方法找到多个数字的平均值。

  ```javascript
  const average = (...args) => args.reduce((a, b) => a + b) / args.length;
  average(1, 2, 3, 4);
  // Result: 2.5
  
  ```



# 15. 回到顶部

- 使用 window.scrollTo(0, 0) 方法自动回到顶部。将 x 和 y 都设置为 0。

  ```javascript
  const goToTop = () => window.scrollTo(0, 0);
  goToTop();
  
  ```



# 16. 翻转字符串

- 使用split,reverse 和 join 方法轻松翻转字符串。

  ```javascript
  const reverse = str => str.split('').reverse().join('');
  reverse('hello world');
  // Result: 'dlrow olleh'
  
  ```



# 17. 检查数组是否为空

- 检查数组是否为空的简单代码，结果将返回 true 或 false。

- ```javascript
  const isNotEmpty = arr => Array.isArray(arr) && arr.length > 0;
  isNotEmpty([1, 2, 3]);
  // Result: true
  ```



# 18. 获取用户选定的文本

- 使用内置 getSelection 属性获取用户选择的文本。

- ```javascript
  const getSelectedText = () => window.getSelection().toString();
  getSelectedText();
  ```



# 19. 打乱数组

- 使用 sort 和 random 方法对数组进行打乱混合。

- ```javascript
  const shuffleArray = (arr) => arr.sort(() => 0.5 - Math.random());
  console.log(shuffleArray([1, 2, 3, 4]));
  // Result: [ 1, 4, 3, 2 ]
  ```



# 20. 检测用户是否处于暗模式

- 使用以下代码检查用户的设备是否处于暗模式。

- ```javascript
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  console.log(isDarkMode) // Result: True or False
  ```



# 21.判断为空

- ```javascript
  function validatenull(val) {
      if (typeof val == 'boolean') {
          return false;
      }
      if (typeof val == 'number') {
          return false;
      }
      if (val instanceof Array) {
          if (val.length == 0) return true;
      } else if (val instanceof Object) {
          if (JSON.stringify(val) === '{}') return true;
      } else {
          if (val == 'null' || val == null || val == 'undefined' || val == undefined || val == '') return true;
          return false;
      }
      return false;
  }
  ```




# 22.随机获取M~N的随机整数

- ```javascript
  // 取到 N ~ M 的随机整数
  function getRandom(N, M) {
      return Math.floor(Math.random() * (M - N + 1)) + N
  }
  console.log(getRandom(4, 8))
  ```




# 23.查询某一年中日期

- ```javascript
  //查询每个月共有多少天
  function getDaysInMonth(year, month) {
      return new Date(year ,month, 0).getDate();
  }
  
  //查询每个月第一天属于星期几
  function getOneDayWeekMonth(year, month) {
      return new Date(year ,month, 0).getDay();
  }
  
  //示例: 查询2024年2月有多少天
  console.log(getDaysInMonth(2024, 2))  //结果 29
  console.log(getOneDayWeekMonth(2024, 2)) // 4
  ```




# 24.判断是否是闰年

- ```javascript
  function isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
  
  //示例：
  console.log(isLeapYear(2024)) // true 
  ```




# 25.js回文数的判断

- ```javascript
  方法一：先转化为字符串，然后进行翻转，然后在进行比较，如果值为true为真否则为false,
  	`次方法有个弊端 如果数字特别大不行`
  
  方法二：目前最优办法： 
  `我们可以反转数字的一半并与另一半进行比较。如果反转后的部分与未反转的部分相等，则该数是回文数`
  
  function isPalindrome(num) {
    // 负数和尾部为零的数不是回文数
    if (num < 0 || (num % 10 === 0 && num !== 0)) {
      return false;
    }
  
    let reversedHalf = 0;
    while (num > reversedHalf) {
      reversedHalf = reversedHalf * 10 + num % 10;
      num = Math.floor(num / 10);
    }
  
    // 当数字长度为偶数时，num 应该与 reversedHalf 完全相等；
    // 当数字长度为奇数时，num 除以 10 后与 reversedHalf 相等
    return num === reversedHalf || num === Math.floor(reversedHalf / 10);
  }
  
  // 示例
  console.log(isPalindrome(121)); // true
  console.log(isPalindrome(-121)); // false
  console.log(isPalindrome(10)); // false
  
  解释：
  负数和尾部为零的数：负数不是回文数，且除非数字本身是零，尾部是零的数也不可能是回文数（如 10、100）。
  反转一半的数字：我们通过提取数字的末尾部分来反转它，直到反转的数字大于或等于原数字的一半。
  比较两部分：
  如果数字的长度是偶数，num 和 reversedHalf 应该完全相等。
  如果数字的长度是奇数，num 应该等于 reversedHalf 去掉最后一位。
  优点：
  这个方法的时间复杂度是 即数字的位数
  它不需要额外的空间来存储反转后的字符串。
  
  普通大数字：可以使用字符串表示或 BigInt 来处理非常大的数字。
  无穷大：无法表示为回文数，因此直接返回 false。
  如果你面对的数字超出了 JavaScript Number 类型的处理范围，使用 BigInt 或字符串方法通常是最可靠的做法。
  
  ```
  
  ​	



# 26.打字机效果自适应宽度

- ```vue
  // 页面的标签
  <textarea 
    	class="colorone" 
      v-model="textarea" 
      id="myTextarea" 
  ></textarea>
  onMounted(() => {
      strCss();
  });
  
  //实现方式
  const strCss = () => {
      let text = "解决问题的方式，直接面对它！解决问题的方式，直接面对它！解决问题的方式，直接面对它！解决问题的方式，直接面对它！解决问题的方式，直接面对它！解决问题的方式，直接面对它！";
      let index = 0;
      let myTextarea = document.getElementById("myTextarea");
      if(myTextarea) {
          function type() {
              if (index < text.length) {
                  textarea.value += text.charAt(index);
                  myTextarea.style.height = 'auto';
                  console.log(textarea,'textarea.style');
                  myTextarea.style.height = myTextarea.scrollHeight + 'px';
                  index++;
                  timer.value = setTimeout(type, 300); // 设置字符显示的间隔
                  myTextarea.focus();
              } else {
                  // 动画结束后可以选择光标消失或者其他效果
                  timer.value = null;
                  myTextarea.blur();
              }
          }
          type();
      }
  };
  ```

