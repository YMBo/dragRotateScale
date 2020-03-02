import './static/index.css'
let ITEMLIST = []
class EventManage {
    constructor(ele) {
        this.handlers = {}
        this.ele = ele
    }
    on(type, handler) {
        if (this.handlers[type]) {
            this.handlers[type].push(handler)
        } else {
            this.handlers[type] = [handler]
        }
        return true
    }
    off(type) {
        this.handlers[type] = []
    }
    fire(event) {
        let ele = event.currentTarget
        let type = event.type
        ele.handler.handlers[type].forEach(e => {
            e(event)
        })
    }
}
let EMIT = {
    on(ele, type, handler) {
        if (!ele.handler) {
            ele.handler = new EventManage()
        }
        ele.handler.on(type, handler);
        ele.addEventListener(type, ele.handler.fire, false);
    },
    off(ele, type) {
        ele.handler.off(type);
        ele.removeEventListener(type, ele.handler.fire, false);
    }
}



class dragRotateScale {
    constructor(target, options = {}) {
        this.target = target

        // 对象唯一标识
        this.increaseId = Math.random() * 100000
        this.left = 0;
        this.top = 0;
        this.src = options.src || ''
        this.dragImgClass = options.dragImgClass || 'drag_moveImg'

        // 最大放大
        this.imgScaleMax = options.imgScaleMax || 10

        // 最小
        this.imgScaleMin = options.imgScaleMin || 0.1
            // 旋转角度
        this.rotate = 0
        this.scale = 1

        // 拖拽元素初始化
        this.createHTML('img', {
            src: this.src,
            width: target.offsetWidth / 3,
            class: this.dragImgClass
        }).then(html => {
            this.imgChild = html
            let style = target.getAttribute('style')
            style = style ? style + 'position:relative' : 'position:relative'
            target.setAttribute('style', style)
            this.elelayer = this.createelelayer(options.rotateButton)
            this.elelayer.appendChild(this.imgChild)
            target.appendChild(this.elelayer)
            this.widthOrg = this.imgChild.offsetWidth
            this.heightOrg = this.imgChild.offsetHeight

            // 如果父元素存在则直接按照父元素定位
            this.left = target.offsetWidth / 2 - this.widthOrg / 2;
            this.top = target.offsetHeight / 2 - this.heightOrg / 2
            this.elelayer.style['left'] = this.left + 'px'
            this.elelayer.style['top'] = this.top + 'px'

            // 图片中心位置（相对target）
            this.ox = this.left + this.widthOrg / 2
            this.oy = this.top + this.heightOrg / 2
                // 半径默认按照图片大小算，实际旋转会根据手指位置变动
            this.r = Math.sqrt(this.widthOrg * this.widthOrg + this.heightOrg * this.heightOrg) / 2
            ITEMLIST.push(this)
            this.drag(options)
        })
        return this
    }

    createelelayer(rotateButton) {
        let strL = rotateButton ? `style='
        width:${rotateButton}px;
        height:${rotateButton}px;
        left: -${rotateButton/2}px;
        bottom: -${rotateButton/2}px;
        '` : ''
        let strR = rotateButton ? `style='
        width:${rotateButton}px;
        height:${rotateButton}px;
        right: -${rotateButton/2}px;
        top: -${rotateButton/2}px;
        '` : ''
        let dom = this.createHTML('span', {
            'data-id': this.increaseId,
            class: "dragRotateScale_move dragRotateScale_active"
        })
        dom.innerHTML = `
        <a class="dragRotateScale_close" ${strL}></a><a class="dragRotateScale_rotate" ${strR}></a>
        `
        return dom
    }
    createHTML(name, options = {}) {
        if (name == 'img') {
            return new Promise((resolve, reject) => {
                let html = document.createElement(name)
                for (let i in options) {
                    html.setAttribute(i, options[i])
                }
                html.onload = () => {
                    resolve(html)
                }
                html.error = (err) => {
                    reject(err)
                }
                return html
            })
        } else {
            let html = document.createElement(name)
            for (let i in options) {
                html.setAttribute(i, options[i])
            }
            return html
        }
    }

    // 事件绑定
    drag(obj = {}) {
            var target = this.target
            var obj_this = this

            let roateButton = this.elelayer.querySelector('.dragRotateScale_rotate')
            let closeButton = this.elelayer.querySelector('.dragRotateScale_close')
                // 旋转事件绑定 事件委托
            EMIT.on(target, 'touchstart', function(e) {
                if (e.target !== roateButton) return
                e.preventDefault();
                // 按手指实际触摸位置计算圆半径
                let pagex = e.touches[0].clientX
                let pagey = e.touches[0].clientY
                    // 手指落点相对圆心距离
                let pos = obj_this.target.getBoundingClientRect()
                obj_this.disOx = pagex - pos.left - obj_this.ox
                obj_this.disOy = obj_this.oy - (pagey - pos.top)
                obj_this.r = Math.sqrt(obj_this.disOx * obj_this.disOx + obj_this.disOy * obj_this.disOy) / obj_this.scale
                obj_this.anglePre = obj_this.getAngle(obj_this.ox, obj_this.oy, pagex - pos.left, pagey - pos.top);
                obj.rotateStart && obj.rotateStart(obj_this)
            })

            // 旋转事件绑定
            EMIT.on(target, "touchmove", function(e) {
                if (e.target !== roateButton) return
                e.preventDefault();
                let pagex = e.touches[0].clientX
                let pagey = e.touches[0].clientY
                obj_this.disOx = pagex - obj_this.target.getBoundingClientRect().left - obj_this.ox
                obj_this.disOy = obj_this.oy - (pagey - obj_this.target.getBoundingClientRect().top)

                // obj_this.disPtoO = obj_this.getDistancs(obj_this.ox, obj_this.oy, e.offsetX , e.offsetY);
                let pos = obj_this.target.getBoundingClientRect()
                obj_this.disPtoO = obj_this.getDistancs(0, 0, obj_this.disOx, obj_this.disOy)
                obj_this.scale = (obj_this.disPtoO / obj_this.r).toFixed(2);
                if (obj_this.scale >= obj_this.imgScaleMax) obj_this.scale = obj_this.imgScaleMax
                if (obj_this.scale <= obj_this.imgScaleMin) obj_this.scale = obj_this.imgScaleMin
                obj_this.angleNext = obj_this.getAngle(obj_this.ox, obj_this.oy, pagex - pos.left, pagey - pos.top);
                obj_this.rotate += obj_this.angleNext - obj_this.anglePre;

                obj_this.setStyle(obj_this.elelayer, {
                    transform: `scale(${obj_this.scale})  rotate(${obj_this.rotate}deg)`
                })
                let buttonScale = (1 / obj_this.scale) < 0.2 ? 0.2 : (1 / obj_this.scale)
                obj_this.setStyle(closeButton, {
                    transform: `scale(${buttonScale })`,
                    left: -closeButton.offsetWidth / 2 + 'px',
                    bottom: -closeButton.offsetHeight / 2 + 'px',
                })
                obj_this.setStyle(roateButton, {
                    transform: `scale(${buttonScale })`,
                    right: -roateButton.offsetWidth / 2 + 'px',
                    top: -roateButton.offsetHeight / 2 + 'px'
                })
                obj_this.anglePre = obj_this.angleNext;
                obj.rotateMove && obj.rotateMove(obj_this)
            })

            let img = this.imgChild
            let elelayer = this.elelayer
                // 拖动图片事件
            EMIT.on(target, 'touchstart', function(e) {
                if (e.target != img) return
                obj_this.flag = true
                    // let pos = elelayer.getBoundingClientRect()
                    // obj_this.tx = e.touches[0].clientX - pos.left;
                    // obj_this.ty = e.touches[0].clientY - pos.top;
                    // 采用增加的方式
                obj_this.tx = e.touches[0].clientX;
                obj_this.ty = e.touches[0].clientY;
                obj.imgStart && obj.imgStart(obj_this)
            })

            // 拖动图片事件
            EMIT.on(target, 'touchmove', function(e) {
                if (e.target != img || !obj_this.flag) return

                obj_this._tx = (e.touches[0].clientX - obj_this.tx)
                obj_this._ty = (e.touches[0].clientY - obj_this.ty)
                obj_this.left += obj_this._tx;
                obj_this.top += obj_this._ty;

                obj_this.setStyle(obj_this.elelayer, {
                    left: `${obj_this.left}px`,
                    top: `${obj_this.top}px`
                })
                obj_this.ox = obj_this.left + obj_this.widthOrg / 2;
                obj_this.oy = obj_this.top + obj_this.heightOrg / 2;
                obj_this.tx = e.touches[0].clientX;
                obj_this.ty = e.touches[0].clientY;
                obj.imgMove && obj.imgMove(obj_this)
            })

            EMIT.on(target, 'touchend', function(e) {
                if (e.target != img) return
                obj_this.flag = false
                obj.imgEnd && obj.imgEnd(obj_this)
            })

            // 销毁实例
            EMIT.on(target, 'touchstart', function(e) {
                if (e.target != closeButton) return
                obj_this.elelayer.remove()
                obj.close && obj.close(obj_this)
                EMIT.off(target, 'touchend')
                EMIT.off(target, 'touchstart')
                EMIT.off(target, 'touchmove')
                obj.imgClose && obj.imgClose(obj_this)
            })
            return obj_this
        }
        // 圆心相对视口的位置，圆父级元素相对视口的位置
    getAngle(px, py, mx, my) {
        var x = px - mx;
        var y = py - my;
        var angle = Math.atan2(y, x) * 360 / Math.PI;
        return angle;
    }

    getDistancs(cx, cy, pointer_x, pointer_y) {
        var ox = pointer_x - cx;
        var oy = pointer_y - cy;
        return Math.sqrt(ox * ox + oy * oy);
    }

    // 设置行内样式
    setStyle(ele, opstions) {
        let prev = ele.style.cssText.replace(/\s/g, '')
        let prevObj = {}
        prev.replace(/(\w+):([\w\.\(\)\s+-]+)[\w|;]/g, function(_, k, v) {
            prevObj[k] = v
        })
        for (let i in opstions) {
            prevObj[i] = opstions[i]
        }
        ele.style = JSON.stringify(prevObj).replace(/[\}|\{|"|']/g, '').replace(/[\,]/g, ';')
    }
}

export default dragRotateScale
