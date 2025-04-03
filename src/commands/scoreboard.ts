import { Command, CommandContext, createStringOption, Declare, Options } from "seyfert";
import { AuditType, DB } from "../utils/db";

const filters = [ AuditType.MUTE, AuditType.TIMEOUT, AuditType.RENAME ];

enum QueryType {
    TIMEOUT = AuditType.TIMEOUT,
    MUTE = AuditType.MUTE,
    RENAME = AuditType.RENAME,
};

const options = {
    type: createStringOption({
        required: true,
        description: 'Tipo de scoreboard',
        choices: Object.values(QueryType).map(value => ({ 
            name: value.toLowerCase(), value 
        }))
    }),
};

const names = {
    [AuditType.TIMEOUT]: 'aislamientos',
    [AuditType.MUTE]: 'muteos',
    [AuditType.RENAME]: 'cambios de nombre'
}

@Options(options)
@Declare({
    name: "scoreboard",
    description: "Muestra el scoreboard",
})
export default class Scoreboard extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const audit = DB.getBinnacle();

        const filtered = audit.filter(({ type }) => filters.includes(type));
        const query = ctx.options.type as unknown as AuditType;

        const data = filtered.reduce<Record<string, number>>((acc, { recipient, type, amount }) => {
            if (type !== query) {
                return acc;
            }

            acc[recipient] = (acc[recipient] || 0) + (type === AuditType.RENAME ? 1 : amount);
            return acc;
        }, {});

        let sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

        if(sorted.length == 0) {
            ctx.write({ content: `No hay datos para mostrar` });
            return;
        }

        let output = `Top ${names[query]}:\n`;
        for (let i = 0; i < sorted.length; i++) {
            const [id, score] = sorted[i];
            output += `    ${i + 1}. <@${id}>: ${query == AuditType.RENAME ? score : `${(score / 1000) / 60} minutos`}\n`;
        }

        ctx.write({ content: output });
    }
}
