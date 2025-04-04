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
    user: string;
    amount: number;
    timestamp: number;
    metadata?: any;
};

export function report(data: Audit) {
    const db = new Database(Bun.env.DB_PATH);

    const recipient = data.recipient ?
        "'" + data.recipient + "'" :
        'NULL';

    db.query(`
        INSERT INTO audit(type, recipient, user, amount, timestamp) VALUES(
            '${data.type}',
            ${recipient},
            '${data.user}',
            ${data.amount},
            ${data.timestamp}
        );
    `).run();
}

export class User {
    id: string;
    credits: number;
    db: Database;

    constructor(id: string, credits: number) {
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
            WHERE id = '${this.id}'
        `).run();
    }
}

export class DB {
    public static getUser(id: string): User {
        const db = new Database(Bun.env.DB_PATH);
        let user = db
            .query(`SELECT * FROM users WHERE id = '${id}'`)
            .as(User)
            .get();

        if (!user) {
            db.query(`INSERT INTO users VALUES('${id}', 0)`)
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
