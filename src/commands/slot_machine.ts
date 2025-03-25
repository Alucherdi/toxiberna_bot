import { Command, CommandContext, Declare } from "seyfert";
import UserDB, { AuditType } from "../utils/db";
import { Graphics, SpriteSheet } from "../utils/graphics";

const cost = 1;
const slots = 3;

const sheet = new SpriteSheet(
    "assets/Items.png", 17, 14, 6, 1
);

function drawSlot(g: Graphics, img: SpriteSheet, x: number, y: number, p: number) {
    let v = 0;
    let m = img.height * img.cols;
    let s = Math.floor(p * m);
    let idx = Math.floor(s / img.height) % img.cols;

    let r = Math.random() * 255;
    let gn = Math.random() * 255;
    let b = Math.random() * 255;

    for(let i = 0; i < 2; i++) {
        v = idx + (idx < img.cols ? 0 : 1);
        g.image_ex(x + 1, y + -img.height * i + (s % img.height) + 1, 0, img.height * v, img.width, img.height, img.image());
    }

    g.rect(x, y, img.width + 2, img.height + 2, r, gn, b, false);
    return idx;
}

function range(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

@Declare({
    name: "slotmachine",
    description: "Jugar a la máquina tragamonedas"
})
export default class SlotMachine extends Command {
    async run(ctx: CommandContext) {
        const udb = await UserDB.load()

        if (!udb.spend(ctx.author.id, cost)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        await sheet.load();
        const rows = Array(slots).fill(0).map((_, i) => i * (Math.round(Math.random() * 25) / 100.0));
        const results = Array(rows.length).fill(0);
        const base = range(20, 30);
        // TODO: This could be a little bit unfair, we don't fully know if the user is going to win or not - Help
        const target = rows.map((_, i) => base + range(0, 10) + (i * 10));
        const frames = [];

        await ctx.deferReply();

        let draw = async (g: Graphics, frame: number) => {
            for(let i = 0; i < rows.length; i++) {
                results[i] = drawSlot(g, sheet, i * (sheet.width + 2), 0, rows[i]);
            }

            for(let i = 0; i < rows.length; i++) {
                if(frame < target[i]) {
                    rows[i] += 0.1;
                } else {
                    rows[i] = Math.round(rows[i] * sheet.cols) / sheet.cols;
                }
            }
        }

        for(let i = 0; i < 30 * rows.length; i++) {
            const ctx = new Graphics((sheet.width + 2) * rows.length, (sheet.height + 2));
            await draw(ctx, i);
            frames.push(await ctx.frame());
        }

        const result = await Graphics.gif(frames, 2, 4);
        await ctx.editOrReply({ content: "¡Buena suerte!", files: [{ filename: "slot.gif", data: result }] });

        setTimeout(async () => {
            let win = results.every(v => v === results[0]);
            let credits = [2, 3, 5, 7, 10, -5][results[0]];

            if(win) {
                await udb.modify(ctx.author.id, credits);
                await udb.register(ctx.author.id, ctx.author.id, AuditType.SLOTMACHINE, credits, Date.now());

                if(credits < 0) {
                    ctx.editResponse({ content: `:skull_crossbones: ¡Has perdido ${Math.abs(credits)} creditos, suerte la próxima vez!`, attachments: []});
                } else {
                    ctx.editResponse({ content: `¡Has ganado ${credits} creditos`, attachments: []});
                }
            } else {
                ctx.editResponse({ content: "¡Has perdido!", attachments: []});
            }

            await udb.write();
        }, 2100 * rows.length);
    }
}
