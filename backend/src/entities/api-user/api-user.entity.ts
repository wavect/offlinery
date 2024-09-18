import { randomBytes } from "crypto";
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ApiUser {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isAdmin: boolean;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ unique: true, nullable: false })
    apiKey: string;

    @BeforeInsert()
    createSecureApiKey() {
        this.apiKey = randomBytes(48).toString("hex");
    }
}
