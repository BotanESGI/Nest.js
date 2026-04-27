import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tournament } from './tournament.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 120 })
  name!: string;

  @Column({ length: 120 })
  publisher!: string;

  @Column({ type: 'date' })
  releaseDate!: Date;

  @Column({ length: 80 })
  genre!: string;

  @OneToMany(() => Tournament, (tournament) => tournament.game)
  tournaments!: Tournament[];
}
