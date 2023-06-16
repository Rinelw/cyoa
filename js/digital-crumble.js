const WIDTH = document.body.offsetWidth;
const HEIGHT = document.body.offsetHeight;

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
        this.screen = {width: this.app.screen.width, height: this.app.screen.height};
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
    spinNFall(fallSpeed = Math.random() / 2, speed = 0.001 + Math.random() / 100){
        let fallRate = fallSpeed;
        let rate = speed;
        let speedUp = 0;
        let rotate = (Math.random() * 11 - 5) / 100
        this.app.ticker.add(() => {
            this.body.rotation = this.rotation += rotate;
            this.body.alpha -= rate
            if (this.body.alpha > 0) {
                this.setPos(this.size.x, this.size.y + fallRate + speedUp);
                if (fallSpeed > 0) speedUp += 0.001;
                else speedUp -= 0.001;
            }
            else {
                if (fallSpeed > 0) this.setPos(this.size.x, -this.size.width);
                else this.setPos(this.size.x, this.app.screen.height);
                this.body.alpha = 1;
                rate = speed;
                fallRate = fallSpeed;
                rotate = (Math.random() * 11 - 5) / 100
                speedUp = 0;
            }

        });
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
                const width = this.app.screen.width / this.screen.width;
                const height = this.app.screen.height / this.screen.height;
                this.setPos(x*width, y*height);
            });
            this.#center = false;
        } else {
            this.app.renderer.off('resize');
            this.#center = true;
        }
    }

    destroy(){
        this.body.destroy(true, true, true);
    }
}

const halfScreen = app.screen.width/2;
const filters = [new PIXI.filters.PixelateFilter(3), new PIXI.filters.RGBSplitFilter([-3,0], [0,3], [0,0])];
const container = new PIXI.Container;
const par = []
let i = 0;
for (let x = 2; x < app.screen.width; x+=5){
    let rand = Math.floor(Math.random() * 5 + 6)
    const middleDistance = Math.abs(halfScreen - x)
    const skipChance = Math.floor(Math.random()*800) - middleDistance;
    if (skipChance > 0 ) continue;
    par[i] = new particle(app, container);
    par[i].draw(0x8c5dca, rand, rand, Math.random() / 2);
    par[i].setPos(x, app.screen.height);
    par[i].spinNFall(-Math.random());
    par[i].center();
    i++;
    par[i] = new particle(app, container);
    par[i].draw(0x8c5dca, rand, rand, Math.random() / 2);
    par[i].setPos(x, 0);
    par[i].spinNFall(Math.random());
    par[i].center();
    i++;
}

container.filters = filters;

//set the size of the app
// move the sprite to the center of the screen