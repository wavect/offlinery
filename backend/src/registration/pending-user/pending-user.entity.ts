import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { EVerificationStatus } from '../../types/user.types';
import { IEntityToDTOInterface } from 'src/interfaces/IEntityToDTO.interface';
import { PendingUserPublicDto } from 'src/DTOs/pending-user.dto';

@Entity()
export class PendingUser
  implements IEntityToDTOInterface<PendingUserPublicDto>
{
  convertToPublicDTO(): PendingUserPublicDto {
    return {
      id: this.id,
      email: this.email,
      verificationStatus: this.verificationStatus,
    };
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  /**
   * This verificationStatus is different to the verificationStatus in the user Entity.
   * The whole purpose of this entity is, to only allow user creating a 'user' when they have verified
   * their email address, to avoid spam emails etc.
   *   */

  @Column()
  verificationStatus: EVerificationStatus;

  @Column()
  verificationCode: string;
}
