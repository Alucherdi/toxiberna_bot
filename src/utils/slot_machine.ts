import type { Sharp } from "sharp";
import { Graphics, SpriteSheet } from "./graphics";

class SlotMachine {
    private possibilities = 6;
    private intentions: number[];
    private targets: number[] = [];
    private duration = 25;
    private frames: Sharp[] = []; 
    private sheet = new SpriteSheet('assets/Items.png', 18, 14, 6, 1);
    private rows: number[] = Array(3).fill(0).map((_, i) => i * (Math.round(Math.random() * (100 / 3)) / 100.0));
    private results: number[] = Array(3).fill(0);
    private choosen: number = -1;

    constructor(intentions?: number[]) {
        if (intentions) this.setIntentions(intentions);
    }

    private animate(
        g: Graphics,
        x: number,
        y: number,
        p: number
    ): number {
        const img = this.sheet;

        let v = 0;
        let m = img.height * img.cols;
        let s = Math.floor(p * m);
        let idx = Math.floor(s / img.height) % img.cols;

        for(let i = 0; i < 2; i++) {
            v = idx + (idx < img.cols ? 0 : 1);

            g.imageEx(
                x + 1,
                y - img.height * i + (s % img.height) + 1,
                0,
                img.height * v,
                img.width,
                img.height,
                img.image());
        }

        let r = Math.random() * 255;
        let gn = Math.random() * 255;
        let b = Math.random() * 255;
        g.rect(x, y, img.width + 2, img.height + 2, r, gn, b, false);

        return idx;
    }

    private async generateFrame(iteration: number, frame: Graphics) {
        await this.sheet.load();
        for (let i = 0; i < 3; i++) {
            this.results[i] = this.animate(
                frame,
                i * (this.sheet.width + 2),
                0, this.rows[i]);
        }

        for (let i = 0; i < this.rows.length; i++) {
            if (iteration < this.duration + (i * 10) || this.results[i] != this.targets[i]) {
                this.rows[i] += 0.1;
            } else {
                this.rows[i] = Math.round(this.rows[i] * this.sheet.cols) / this.sheet.cols;
            }
        }
    }

    async generateGif() {
        let frame: Graphics;
        for (let i = 0; i < 90; i++) {
            frame = new Graphics((this.sheet.width + 2) * 3, this.sheet.height + 2);
            await this.generateFrame(i, frame);
            this.frames.push(frame.frame());
        }

        return await Graphics.gif(this.frames, 2, 4);
    }

    setIntentions(data: number[]) {
        const exactIntentions = this.possibilities + 1;
        if (data.length != exactIntentions)
            throw Error(`Must be ${exactIntentions} intentions`);

        const sum = data.reduce((a, v) => a + v, 0);
        this.intentions = data.map(v => v / sum);

        this.normalizeIntentions();
    }

    private normalizeIntentions() {
        const reference = Math.random();
        let accumulation = 0;
        let distances = this.intentions
            .map((v, i) => [i, accumulation += v])

        let closest: number[];
        for (let distance of distances) {
            if (reference <= distance[1]) {
                closest = distance;
                break;
            }
        }

        // Looser
        if (closest[0] === this.possibilities) {
            const initial = 0 | (Math.random() * this.possibilities);
            this.targets.push(initial);
            this.targets.push(this.randomSlot(initial));
            this.targets.push(this.randomSlot(initial));
        }

        // Winner
        else {
            this.targets = Array(3).fill(closest[0]);
        }

        this.choosen = closest[0];
    }

    getChoosen(): number { return this.choosen; }

    private randomSlot(value: number): number {
        return (value + (0 | (Math.random() * this.possibilities))) % this.possibilities
    }
}

export default SlotMachine;

