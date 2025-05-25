import sharp from "sharp";
import { createGif } from "sharp-gif2";
import { createCanvas, loadImage, Canvas, type SKRSContext2D, type Image } from "@napi-rs/canvas";

export class SpriteSheet {
    private path: string;
    public width: number;
    public height: number;
    public cols: number;
    public rows: number;

    private data: Image;

    constructor(path: string, width: number, height: number, cols: number, rows: number = 1) {
        this.path = path;
        this.width = width;
        this.height = height;
        this.cols = cols;
        this.rows = rows;
    }

    async load() {
        this.data = await Asset.load(this.path);
    }

    public image() {
        return this.data;
    }
}

export class Graphics {
    private width: number;
    private height: number;
    private canvas: Canvas;
    private ctx: SKRSContext2D;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext("2d");
    }

    public pixel(x: number, y: number, r: number, g: number, b: number) {
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillRect(x, y, 1, 1);
    }

    public clear(r: number, g: number, b: number) {
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    public image(x: number, y: number, image: Image) {
        this.ctx.drawImage(image, x, y, image.width, image.height);
    }

    public imageEx(x: number, y: number, u: number, v: number, width: number, height: number, image: Image) {
        this.ctx.drawImage(image, u, v, width, height, x, y, width, height);
    }

    public rect(x: number, y: number, width: number, height: number, r: number, g: number, b: number, filled: boolean = true) {
        if(!filled) {
            this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.strokeRect(x, y, width, height);
        } else {
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.fillRect(x, y, width, height);
        }
    }

    public ellipse(x: number, y: number, radius: number, red: number, green: number, blue: number, filled: boolean = true) {
        this.ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.closePath();
        if(filled) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }

    public async frame() {
        return sharp(this.canvas.data(), {
            raw: {
                width: this.width,
                height: this.height,
                channels: 3,
            }
        });
    }

    public static async gif(frames: any[], delay: number, scale: number = 1): Promise<Buffer> {
        let gif = await createGif({
            delay,
            repeat: 0
        }).addFrame(frames).toSharp();

        if(scale > 1) {
            let metadata = await frames[0].metadata();
            gif = gif.resize(metadata.width! * scale, metadata.height! * scale, { kernel: "nearest" });
        }

        return await gif.toBuffer();
    }
}

export class Asset {
    static async load(path: string): Promise<Image> {
        const image = await loadImage(path);
        return image;
    }
}
