# dragRotateScale
移动端旋转、缩放、移动图片组件

# 安装   
```
npm install drag-img -S
```  

# 使用  
``` javascript
import dragrotatescale from 'drag-img'
new dragrotatescale(preImg2, {
    src: img,         //要拖动的图片地址
    rotateButton: 30, // 按钮的宽高
    imgScaleMax: 10,  //缩放限制
    imgScaleMin: 0.1,
    rotateStart() {   //钩子
        console.log('rotateStart')
    },
    rotateMove(o) {
        console.log('rotateMove', o)
    },
    imgStart() {
        console.log('imgStart')
    },
    imgMove() {
        console.log('imgMove')
    },
    imgEnd() {
        console.log('imgEnd')
    },
    imgClose() {
        console.log('imgClose')
    }
})


```
