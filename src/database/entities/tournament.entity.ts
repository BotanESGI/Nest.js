import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Match } from './match.entity';
import { Player } from './player.entity';

export enum TournamentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ type: 'int' })
  maxPlayers!: number;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.PENDING,
  })
  status!: TournamentStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Game, (game) => game.tournaments, { nullable: false })
  game!: Game;

  @ManyToMany(() => Player, (player) => player.tournaments)
  @JoinTable({
    name: 'tournament_players',
    joinColumn: { name: 'tournament_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'player_id', referencedColumnName: 'id' },
  })
  players!: Player[];

  @OneToMany(() => Match, (match) => match.tournament)
  matches!: Match[];
}
