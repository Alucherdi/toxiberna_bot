type UserDef = {
    credits: number;
};

enum AuditType {
    ADD = 'ADD',
    REMOVE = 'REMOVE',
    SPEND = 'SPEND',
    FAILED = 'FAILED'
};

type AuditDef = {
    type: AuditType;
    to?: string;
    from: string;
    amount: number;
    timestamp: number;
};

type DatabaseDef = {
    users: Map<string, UserDef>,
    audit: AuditDef[];
}

export default class UserDB {
    private db: DatabaseDef;

    constructor(database: any) {
        this.db = database;
    }

    public modify(id: string, points: number) {
        if (!this.db.users.has(id)) {
            this.db.users.set(id, { credits: 0 });
        }

        let { credits } = this.db.users.get(id);
        let operation = credits + points;
        this.db.users.set(id, { credits: operation });

        this.db.audit.push({
            type: credits > operation ? AuditType.REMOVE : AuditType.ADD,
            from: id,
            amount: points,
            timestamp: Date.now()
        });
    }

    public spend(id: string, points: number) {
        let result = false;

        if (!this.db.users.has(id)) {
            this.db.users.set(id, { credits: 0 });
        }

        let { credits } = this.db.users.get(id);
        if (credits >= points) {
            this.db.users.set(id, { credits: credits - points });
            result = true;
        }

        this.db.audit.push({
            type: result ? AuditType.SPEND : AuditType.FAILED,
            from: id,
            amount: points,
            timestamp: Date.now()
        });

        return result;
    }

    public retrieve(id: string): UserDef {
        if (!this.db.users.has(id)) {
            this.db.users.set(id, { credits: 0 });
        }

        return this.db.users.get(id);
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
    
    public write() {
        Bun.write(Bun.env.DB_PATH, JSON.stringify(this.db));
    }
}