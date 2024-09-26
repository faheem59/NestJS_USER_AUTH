import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Enrollment } from '../entities/enroll-entities';
import { PaymentMethod, Status } from '../../enum/common.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: Status,
  })
  status: Status;

  @Column()
  transactionId: string;

  @Column()
  createdAt: Date;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.payment)
  enrollments: Enrollment[];
}
