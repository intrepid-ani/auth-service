import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { userRoles } from "../constants";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({
        unique: true,
    })
    email: string;

    @Column()
    password: string;

    @Column({
        type: "enum",
        enum: Object.values(userRoles),
        default: userRoles.CUSTOMER,
    })
    role: string;
}
