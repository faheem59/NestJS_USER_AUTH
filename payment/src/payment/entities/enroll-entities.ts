import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Payment } from '../entities/payment-entities';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  courseId: number;

  @ManyToOne(() => Payment, (payment) => payment.enrollments)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @CreateDateColumn()
  enrolledAt: Date;

  @Column({ default: 'active' })
  status: string;
}
