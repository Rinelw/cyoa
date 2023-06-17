const WIDTH = document.body.offsetWidth;
const HEIGHT = document.body.offsetHeight;
const biasedRandom = (influence = 1) => {
    return (Math.pow(Math.random(), influence));
}

const app = new PIXI.Application({ backgroundAlpha: 0, resizeTo: window });
document.getElementById('pixi').appendChild(app.view);

// create a new Particle
class particle {
    #center
    #drawn
    constructor(app, container) {
        this.app = app;
        this.body = new PIXI.Graphics();
        this.size = {x: 0, y: 0, width: 10, height: 10};
        if (container){
            container.addChild(this.body);
            this.app.stage.addChild(container);
        }else {
            this.app.stage.addChild(this.body);
        }

        this.color = 0x000000
        this.rotation = 0;
        this.#center = true;
        this.#drawn = false;
    }
    draw(color = this.color, width = this.size.width, height = this.size.height, rotation = this.rotation) {
        this.color = color;
        this.body.beginFill(this.color, 1);
        this.body.rotation = this.rotation = rotation;
        this.size.width = width;
        this.size.height = height;
        this.body.drawRect(this.size.x-width/2, this.size.y-height/2, width, height);
        this.body.endFill();
        this.#drawn = true;
    }
    clear(){
        this.body.clear();
        this.#drawn = false;
    }
    animate(fallSpeed = Math.random() / 2, speed = 0.001 + Math.random() / 100){
        let fallRate = fallSpeed;
        let rate = speed;
        let speedUp = 0;
        let rotate = (Math.random() * 11 - 5) / 100
        this.app.ticker.add(this.ticker = () => {
            this.body.rotation = this.rotation += rotate;
            this.body.alpha -= rate
            if (this.body.alpha > 0) {
                this.setPos(this.size.x, this.size.y + fallRate + speedUp);
                speedUp = fallSpeed > 0 ? speedUp += 0.001 : speedUp -= 0.001;
            }
            else {
                const rand =  Math.floor((biasedRandom(3 ) * this.app.screen.width)/5)*5
                const x = Math.random() >= 0.5 ? rand : this.app.screen.width-rand;
                if (fallSpeed > 0) this.setPos(x, -this.size.width);
                else this.setPos(x, this.app.screen.height + this.size.width);
                this.body.alpha = 1;
                rate = speed;
                fallRate = fallSpeed;
                rotate = (Math.random() * 11 - 5) / 100
                speedUp = 0;
            }

        }, 'rotator');
    }

    setPos(x = this.size.x, y = this.size.y) {
        if (this.#drawn) {
            this.body.x = this.size.x = x;
            this.body.y = this.size.y = y;
        }
        //this.body.position.set(x, y);
    }

    center(x = this.size.x, y = this.size.y) {
        if (this.#center){
            this.app.renderer.on('resize', () => {
                const width = this.app.screen.width / this.size.width;
                const height = this.app.screen.height / this.size.height;
                this.setPos(x*width, y*height);
            });
            this.#center = false;
        } else {
            this.app.renderer.off('resize');
            this.#center = true;
        }
    }

    destroy(){
        this.app.ticker.remove(this.ticker, 'rotator');
        this.body.destroy(true, true, true);
    }
}
const getRandomColor = (min = 0, max = 0x1000000) => {
    return min > max || max > 0x1000000 || min < 0 ? 0 : Math.floor(Math.random() * (max-min) + min);
}
const getRandomShade = (h = 0) => {
    const s = Math.floor(Math.random()*101);
    const l = Math.floor(Math.random()*41+25)/100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return Number(`0x${f(0)}${f(8)}${f(4)}`);
}

const filters = [new PIXI.filters.PixelateFilter(3), new PIXI.filters.RGBSplitFilter([-3,0], [0,3], [0,0])];
const container = new PIXI.Container;
const par = []
let i = 0;
for (let x = 2; x < app.screen.width; x+=5){
    const genParticle = (app, container, isDown = false)=> {
        let rand = Math.floor(Math.random() * 5 + 6)
        const par = new particle(app, container);
        par.draw(getRandomShade(270), rand, rand);
        par.setPos(x, app.screen.height);
        const down = isDown ? -1 : 1;
        par.animate(Math.random() * (down));
        par.center();
        return par;
    }
    par[i] = genParticle(app, container);
    i++;
    par[i] = genParticle(app, container,true);
    i++;
}

container.filters = filters;

//set the size of the app
// move the sprite to the center of the screen