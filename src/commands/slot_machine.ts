import { Command, CommandContext, Declare } from "seyfert";
import UserDB, { AuditType } from "../utils/db";
import SlotMachine from "../utils/slot_machine";

const cost = 1;
const intentions = [1, 1, 1, 1, 1, 4, 10];
const prizes = [2, 3, 5, 7, 10, -5];

@Declare({
    name: "slotmachine",
    description: "Jugar a la máquina tragamonedas"
})
export default class SlotMachineC extends Command {
    async run(ctx: CommandContext) {
        const udb = await UserDB.load()

        if (!udb.spend(ctx.author.id, cost)) {
            ctx.write({ content: 'No tienes créditos suficientes' });
            return;
        }

        await ctx.deferReply();
        const slotMachine = new SlotMachine(intentions);
        const gif = await slotMachine.generateGif();
        await ctx.editOrReply({ content: "¡Buena suerte!", files: [{ filename: "slot.gif", data: gif }] });

        setTimeout(async () => {
            const choosen = slotMachine.getChoosen();
            const win = choosen < 6;

            if (win) {
                let credits = prizes[choosen];
                udb.modify(ctx.author.id, credits);
                udb.register(ctx.author.id, ctx.author.id, AuditType.SLOTMACHINE, credits, Date.now());

                if(credits < 0) {
                    await ctx.editResponse({ content: `:skull_crossbones: ¡Has perdido ${Math.abs(credits)} creditos, suerte la próxima vez!`, attachments: []});
                } else {
                    await ctx.editResponse({ content: `¡Has ganado ${credits} creditos`, attachments: []});
                }
            } else {
                await ctx.editResponse({ content: "¡Has perdido!", attachments: []});
            }

            await udb.write();
        }, 2200 * 3);
    }
}
