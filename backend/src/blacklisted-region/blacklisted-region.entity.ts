import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class BlacklistedRegion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('json')
    center: { latitude: number; longitude: number };

    @Column()
    radius: number;

    @ManyToOne(() => User, user => user.blacklistedRegions)
    user: User;
}