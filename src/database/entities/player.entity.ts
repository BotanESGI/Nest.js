import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Match } from './match.entity';
import { Tournament } from './tournament.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ unique: true, length: 160 })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', nullable: true })
  avatar!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToMany(() => Tournament, (tournament) => tournament.players)
  tournaments!: Tournament[];

  @OneToMany(() => Match, (match) => match.player1)
  matchesAsPlayer1!: Match[];

  @OneToMany(() => Match, (match) => match.player2)
  matchesAsPlayer2!: Match[];

  @OneToMany(() => Match, (match) => match.winner)
  matchesWon!: Match[];
}
