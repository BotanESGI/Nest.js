import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './database/entities/game.entity';
import { Match } from './database/entities/match.entity';
import { Player } from './database/entities/player.entity';
import { Tournament } from './database/entities/tournament.entity';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { MatchesModule } from './matches/matches.module';
import { PlayersModule } from './players/players.module';
import { TournamentsModule } from './tournaments/tournaments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'tournaments_db'),
        entities: [Tournament, Player, Match, Game],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    GamesModule,
    MatchesModule,
    PlayersModule,
    TournamentsModule,
  ],
})
export class AppModule {}
