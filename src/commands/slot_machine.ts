import { Command, CommandContext, Declare } from "seyfert";
import UserDB, { AuditType } from "../utils/db";
import { Asset, Graphics, type Image } from "../utils/graphics";

const cost = 1;

function drawSlot(g: Graphics, img: Image, x: number, y: number, p: number) {    
    let v = 0;
    let m = 14 * 4;
    let s = Math.floor(p * m);
    let idx = Math.floor(s / 14) % 4;
    for(let i = 0; i < 2; i++) {
        v = 14 * idx + (idx < 4 ? 0 : 1);
        g.image_ex(x + 1, y + -14 * i + (s % 14), 0, v, 17, 14, img);
    }
    
    let r = Math.random() * 255;
    let gn = Math.random() * 255;
    let b = Math.random() * 255;

    g.rect(x, y, 19, 15, r, gn, b, false);
    return v % 4;
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

        const img = await Asset.load("assets/Items.png");
        const rows = [0, 0.25, 0.50];
        const results = Array(rows.length).fill(0);
        const frames = [];
        const target = Math.random() * (20 - 30) + 30;

        await ctx.deferReply();

        let draw = async (g: Graphics, frame: number) => {
            for(let i = 0; i < rows.length; i++) {
                results[i] = drawSlot(g, img, i * 19, 0, rows[i]);
            }

            for(let i = 0; i < rows.length; i++) {
                if(frame < target + i * 10) {
                    rows[i] += 0.1;
                } else {
                    rows[i] = Math.round(rows[i] * 4) / 4;
                }
            }
        }

        for(let i = 0; i < 20 * rows.length; i++) {
            const ctx = new Graphics(19 * rows.length, 15);
            await draw(ctx, i);
            frames.push(await ctx.frame());
        }

        const result = await Graphics.gif(frames, 2, 4);    
        await ctx.editOrReply({ content: "¡Buena suerte!", files: [{ filename: "slot.gif", data: result }] });
        
        setTimeout(async () => {
            let win = results.every(v => v === results[0]);
            let credits = results[0] + 1;

            if(win) {
                await udb.modify(ctx.author.id, credits);
                await udb.register(ctx.author.id, ctx.author.id, AuditType.SLOTMACHINE, credits, Date.now());
                await udb.write();

                ctx.editResponse({ content: `¡Has ganado ${credits} creditos`, attachments: []});
            } else {
                ctx.editResponse({ content: "¡Has perdido!", attachments: []});
            }
        }, 1900 * rows.length);
    }
}
