import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: "timestamp",
        default: () => "NOW() + INTERVAL '7 days'",
    })
    expiresAt: Date;
}
