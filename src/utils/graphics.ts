import fs from "fs";
import sharp from "sharp";
import { createGif, Gif } from "sharp-gif2";

export type Image = {
    width: number;
    height: number;
    data: Uint8Array;
}

export class Graphics {
    
    private width: number;
    private height: number;

    private buffer: Uint8Array;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        // We only support RGB images
        this.buffer = new Uint8Array(width * height * 3);
    }

    public pixel(x: number, y: number, r: number, g: number, b: number) {
        let i = (y * this.width + x) * 3;
        this.buffer[i] = r;
        this.buffer[i+1] = g;
        this.buffer[i+2] = b;
    }

    public clear(r: number, g: number, b: number) {
        for (let i = 0; i < this.buffer.length; i += 3) {
            this.buffer[i] = r;
            this.buffer[i+1] = g;
            this.buffer[i+2] = b;
        }
    }

    public image(x: number, y: number, image: Image) {
        for (let i = 0; i < image.data.length; i += 4) {
            let j = (y + Math.floor(i / 4 / image.width)) * this.width + x + (i / 4) % image.width;
            this.buffer[j * 3] = image.data[i];
            this.buffer[j * 3 + 1] = image.data[i + 1];
            this.buffer[j * 3 + 2] = image.data[i + 2];
        }
    }

    public image_ex(x: number, y: number, u: number, v: number, width: number, height: number, image: Image) {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let k = (v + i) * image.width + u + j;
                let l = (y + i) * this.width + x + j;
                this.buffer[l * 3] = image.data[k * 4];
                this.buffer[l * 3 + 1] = image.data[k * 4 + 1];
                this.buffer[l * 3 + 2] = image.data[k * 4 + 2];
            }
        }
    }

    public rect(x: number, y: number, width: number, height: number, r: number, g: number, b: number, filled: boolean = true) {
        if(!filled) {
            for (let i = 0; i < width; ++i) {
                this.pixel(x + i, y, r, g, b);
                this.pixel(x + i, y + height - 1, r, g, b);
            }
        
            for (let i = 0; i < height; ++i) {
                this.pixel(x, y + i, r, g, b);
                this.pixel(x + width - 1, y + i, r, g, b);
            }
        } else {
            for (let i = 0; i < width; ++i) {
                for (let j = 0; j < height; ++j) {
                    this.pixel(x + i, y + j, r, g, b);
                }
            }
        }
    }

    public frame() {
        return sharp(this.buffer, {
            raw: {
                width: this.width,
                height: this.height,
                channels: 3,
            }
        });
    }

    public static async gif(frames: any[], delay: number, scale: number = 1): Promise<Buffer> {
        let a = await createGif({
            delay,
            repeat: 0
        }).addFrame(frames).toSharp();
        let metadata = await frames[0].metadata();
        if(scale > 1) {
            a = a.resize(metadata.width! * scale, metadata.height! * scale, { kernel: "nearest" });
        }

        return await a.toBuffer();
    }
}

export class Asset {
    static async load(file: string): Promise<Image> {
        // load image as rgba
        const image = await sharp(fs.readFileSync(file));
        const metadata = await image.metadata();
        const data = await image.raw().ensureAlpha().toBuffer();
        return {
            width: metadata.width!,
            height: metadata.height!,
            data: data
        };
    }
}

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