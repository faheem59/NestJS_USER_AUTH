import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Payment } from '../entities/payment-entities';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Payment, (payment) => payment.enrollments, { eager: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ type: 'jsonb' })
  user: {
    id: number;
  };

  @Column({ type: 'jsonb' })
  course: {
    id: number;
  };

  @Column()
  enrolledAt: Date;

  @Column({ default: 'active' })
  status: string;
}
