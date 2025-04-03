import { Database } from "bun:sqlite";

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

class Audit {
    type: AuditType;
    recipient?: string;
    user: number;
    amount: number;
    timestamp: number;
    metadata?: any;
};

export function report(data: Audit) {
    const db = new Database(Bun.env.DB_PATH);
    db.query(`
        INSERT INTO audit VALUES(
            ${data.type},
            ${data.recipient ?? 'NULL'},
            ${data.user},
            ${data.amount},
            ${data.timestamp}
        );
    `).run();
}

export class User {
    id: number;
    credits: number;
    db: Database;

    constructor(id: number, credits: number) {
        this.id = id;
        this.credits = credits;
    }

    public modify(amount: number) {
        this.credits += amount;
        this.write();

        report({
            amount,
            type: AuditType.MODIFY,
            user: this.id,
            timestamp: Date.now()
        });

        return true;
    }

    public spend(amount: number) {
        if ((this.credits - amount) < 0) {
            report({
                amount,
                type: AuditType.FAILED,
                user: this.id,
                timestamp: Date.now()
            });

            return false;
        }

        return this.modify(-amount);
    }

    private write() {
        this.db.query(`
            UPDATE users
            SET credits = ${this.credits}
            WHERE id = ${this.id}
        `).run();
    }
}

export class DB {
    public static getUser(id: number): User {
        const db = new Database(Bun.env.DB_PATH);
        let user = db
            .query(`SELECT * FROM users WHERE id = ${id}`)
            .as(User)
            .get();

        if (!user) {
            db.query(`INSERT INTO users VALUES(${id}, 0)`)
            .as(User)
            .get();

            user = new User(id, 0);
        }

        user.db = db;

        return user;
    }

    public static getBinnacle(): Audit[] {
        const db = new Database(Bun.env.DB_PATH);
        const binnacle = db
            .query(`SELECT * FROM audit`)
            .as(Audit)
            .all();

        return binnacle;
    }
}
