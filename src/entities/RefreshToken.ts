import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: "timestamptz",
        default: () => "CURRENT_TIMESTAMP + INTERVAL '7 days'",
    })
    expiresAt: Date;

    @Column({ type: "uuid" })
    userId: string;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "userId" })
    user: User;
}
