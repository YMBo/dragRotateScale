import dragrotatescale from 'dragrotatescale'
import img from './static/k.png'
let preImg = document.getElementById('preImg')
let preImg2 = document.getElementById('preImg2')
let o = new dragrotatescale(preImg, {
    src: img, //要拖动的图片地址
    rotateButton: 30, // 按钮的宽高
    imgScaleMax: 10, //缩放限制
    imgScaleMin: 0.1,
    rotateStart() {
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

new dragrotatescale(preImg2, {
    src: img, //要拖动的图片地址
    rotateButton: 30, // 按钮的宽高
    imgScaleMax: 10, //缩放限制
    imgScaleMin: 0.1
})
