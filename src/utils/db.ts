export type UserDef = {
    credits: number;
};

export enum AuditType {
    MODIFY = 'MODIFY',
    SPEND = 'SPEND',
    FAILED = 'FAILED',
    TRANSFER = 'TRANSFER',
    TIMEOUT = 'TIMEOUT',
    MUTE = 'MUTE',
    RENAME = 'RENAME',
    SLOTMACHINE = 'SLOTMACHINE',
};

type AuditDef = {
    type: AuditType;
    to?: string;
    from: string;
    amount: number;
    timestamp: number;
    metadata?: any;
};

type DatabaseDef = {
    users: { [key: string]: UserDef },
    audit: AuditDef[];
}

export default class UserDB {
    private db: DatabaseDef;

    constructor(database: any) {
        this.db = database;
    }

    public modify(id: string, points: number) {
        if (!this.db.users[id]) {
            this.db.users[id] = { credits: 0 };
        }

        let { credits } = this.db.users[id];
        let operation = credits + points;
        this.db.users[id].credits = operation;

        this.db.audit.push({
            type: AuditType.MODIFY,
            from: id,
            amount: points,
            timestamp: Date.now()
        });
    }

    public spend(id: string, points: number) {
        let result = false;

        if (!this.db.users[id]) {
            this.db.users[id] = { credits: 0 };
        }

        let { credits } = this.db.users[id];
        if (credits >= points) {
            this.db.users[id].credits -= points;
            result = true;
        }

        if(!result) {
            this.db.audit.push({
                type: AuditType.FAILED,
                from: id,
                amount: points,
                timestamp: Date.now()
            });
        }

        return result;
    }

    public register(from: string, to: string, type: AuditType, amount: number, timestamp: number) {
        this.db.audit.push({
            type,
            from,
            to,
            amount,
            timestamp
        });
    }

    public retrieve(id: string): UserDef {
        if (!this.db.users[id]) {
            this.db.users[id] = { credits: 0 };
        }

        return this.db.users[id];
    }

    public audit() {
        return this.db.audit;
    }

    public static async load() {
        const file = Bun.file(Bun.env.DB_PATH);
        if (!file.exists()) {
            return new UserDB({
                users: {},
                audit: []
            });
        }
        return new UserDB(await file.json());
    }

    public async write() {
        await Bun.write(Bun.env.DB_PATH, JSON.stringify(this.db));
    }
}
