import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class BlacklistedRegion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('float')
    latitude: number;

    @Column('float')
    longitude: number;

    @Column('float')
    radius: number;

    @ManyToOne(() => User, user => user.blacklistedRegions)
    user: User;
}