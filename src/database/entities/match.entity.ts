import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Tournament } from './tournament.entity';

export enum MatchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  score!: string | null;

  @Column({ type: 'int' })
  round!: number;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.PENDING,
  })
  status!: MatchStatus;

  @ManyToOne(() => Tournament, (tournament) => tournament.matches, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  tournament!: Tournament;

  @ManyToOne(() => Player, (player) => player.matchesAsPlayer1, {
    nullable: false,
  })
  player1!: Player;

  @ManyToOne(() => Player, (player) => player.matchesAsPlayer2, {
    nullable: false,
  })
  player2!: Player;

  @ManyToOne(() => Player, (player) => player.matchesWon, { nullable: true })
  winner!: Player | null;
}
