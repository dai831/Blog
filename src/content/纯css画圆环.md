# 画圆环

### 通过锥形渐变和`mask`可以`css`非常简单的实现环状图

```html


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div class="circle"></div>
    <style>
        .circle {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: conic-gradient(#9ED110 0%, #9ED110 25%, #50B517 25%, #50B517 50%, #179067 50%, #179067 75%, #476EAF 75%, #476EAF 100%);
            mask: radial-gradient(circle at center, transparent 90px,#000 90px);
        }
    </style>
</body>

</html>

```

