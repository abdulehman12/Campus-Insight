import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { UserRole } from "@app/types/userRole.type";

@Entity({
    name: 'users'
})

export class UserEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    email!: string

    @Column()
    username!: string

    @Column()
    mobile_no!: string

    @Column()
    roll_no!: number

    @Column()
    unit!: string

    @Column({default: ''})
    bio!: string

    @Column({default: ''})
    image!: string

    @Column()
    password!: string

    @Column({ default: false })
    isVerified!: boolean;

        @Column({ nullable: true })
    otpCode!: string;

    

    @Column({ 
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENT })
    role!: UserRole;

    @BeforeInsert()
    async hashPassword() {
        // Hash the password before saving to the database
        this.password = await bcrypt.hash(this.password, 10);
    }


}