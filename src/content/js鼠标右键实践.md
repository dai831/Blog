# 1.鼠标右键示范demo

## 代码示例

> ```html
> <!DOCTYPE html>
> <html lang="en">
> 
> <head>
>     <meta charset="UTF-8">
>     <meta name="viewport" content="width=device-width, initial-scale=1.0">
>     <title>Document</title>
> </head>
> 
> <body>
>     <style>
>         div {
>             width: 100px;
>             height: 100px;
>             background: pink;
>             text-align: center;
>             line-height: 100px;
>         }
>     </style>
>     <!-- 此处主要是事件源头 -->
>     <div oncontextmenu="onContextmenu(event)">点击我</div>
>     <script>
>         function onContextmenu(event) {
>             console.log(event,'event')
>             event.preventDefault();
>         }
>     </script>
> </body>
> 
> </html>
> ```
>

