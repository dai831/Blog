---
技巧
---



# 1.`css`各种技巧网站分享

## 网站链接

> 1. [clip-path 可将div切割成不同图形](https://bennettfeely.com/clippy/)
> 2. [ `css`各种生成特效](https://css.bqrdh.com/animate)
> 3. [免费的背景`css3`样式](https://color.oulu.me/)
> 4. [border-radius生成各种不规则图形](https://9elements.github.io/fancy-border-radius/)
> 5. [生成不同的分隔符](https://wweb.dev/resources/css-separator-generator)
> 6. [生成不同的波浪线](https://getwaves.io/)
> 7. [`css`加载特效](https://css-loaders.com/classic/)



# 2.css出现的一些语法

## css一些新的用法

> ```css
> .main{
>   width: fit-content;
>   font-weight: bold;
>   font-family: sans-serif;
>   font-size: 30px;
>   padding-bottom: 8px;
>   color: aqua;
>   background: linear-gradient(currentColor 0 0) 0 100% / 0% 3px no-repeat;
>   animation: l2 2s linear infinite;
> }
> 
> currentColor : 当前颜色值，继承颜色
> 
> css3中对width的值多了几个值：
>  fill-available： 自动填满剩余的空间
>  max-content ： 使用子元素中最大的。无论是inline还是block
>  min-content ：使用子元素中宽度最小的
>  fit-content ： 根据内容自适应宽度
> 
> background: linear-gradient(currentColor 0 0) 0 100% / 0% 3px no-repeat;
> 这里（0 100% / 0% 3px ）在右上角的位置 定义了一个 宽度为0、高度为3px的线性渐变背景
> 
> @keyframes myfirst
> {
>  from {background: red;}  // form 0%
>  to {background: yellow;}  // to 100%
> }
> 
> ```
>
> 



# 3.边框渐变

## 代码示例

- ```css
  border-image: linear-gradient(45deg, #90cf5b, #00afee) 1;
  ```




# 4.img存在自带3px下边距

## 解决办法

> ```shell
> 1.img转换为块元素：display:block;
> 2.img外面包一个容器，如div，div高度和img高度一致即可
> 3.img添加vertical-align:top/bottom;不建议使用vertical-align:middle;
> 4.父元素字体大小为0：font-size:0;
> 5.如果父对象的宽、高固定，图片大小随父元素自适应，父元素设置： overflow:hidden;
> 6.img添加浮动：float:left/right;
> ```





# 5.修改主题颜色

## 解决方式

> ```js
> document.documentElement.style.setProperty("--theme_bgColor", cache_theme_bgColor);
> ```





# 6.使用highlight.js代码高亮⚠️

## 解决方式

> ```css
> 因为会居中显示，所有不能有空格
> <pre><code>{{JSON.parse(jsonData)}}</code></pre> 写成一行不要有空格
> ```



# 7.ChatGPT的字体风格

## 代码示例

> ```css
> font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace!important;
>         word-wrap: normal;
>         hyphens: none;
>         line-height: 2;
>         tab-size: 4;
>         white-space: pre;
>         word-break: normal;
>         word-spacing: normal;
>         -webkit-hyphens: none;
> 。‌ 这个属性的设置还受到white-space属性的影响,当white-space的属性值为pre或pre-wrap时,tab-size的设置才有效1  2(数字).
> ```

