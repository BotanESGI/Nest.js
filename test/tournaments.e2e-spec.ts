import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { Game } from '../src/database/entities/game.entity';
import { Player, PlayerRole } from '../src/database/entities/player.entity';
import { GamesController } from '../src/games/games.controller';
import { GamesService } from '../src/games/games.service';
import { PlayersController } from '../src/players/players.controller';
import { PlayersService } from '../src/players/players.service';
import { TournamentStatus } from '../src/database/entities/tournament.entity';
import { TournamentsController } from '../src/tournaments/tournaments.controller';
import { TournamentsService } from '../src/tournaments/tournaments.service';

describe('TournamentsController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken = '';
  let userAccessToken = '';

  const game: Game = {
    id: 'ea4140da-ba9e-4181-a6b8-df0776b1f59c',
    name: 'Test',
    publisher: 'Test',
    releaseDate: new Date('2026-04-27'),
    genre: 'MOBA',
    tournaments: [],
  };

  const tournament = {
    id: '3770e18f-22b6-41b4-b73f-88682b1422fc',
    name: 'Spring Cup',
    maxPlayers: 16,
    startDate: new Date('2026-05-10T18:00:00.000Z'),
    status: TournamentStatus.PENDING,
    createdAt: new Date('2026-04-27T12:33:35.272Z'),
    game,
    players: [],
    matches: [],
  };

  const tournamentsServiceMock: Partial<TournamentsService> = {
    findAll: jest.fn().mockResolvedValue([tournament]),
    findOne: jest.fn().mockResolvedValue(tournament),
    create: jest.fn().mockResolvedValue(tournament),
    update: jest.fn().mockResolvedValue({ ...tournament, name: 'Spring Cup Updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
    joinTournament: jest.fn().mockResolvedValue({
      ...tournament,
      players: [{ id: '2a1fbb0c-cd4a-40ea-95ca-d1f9e86a3229' }],
    }),
  };

  const gamesServiceMock: Partial<GamesService> = {
    findAll: jest.fn().mockResolvedValue([game]),
    create: jest.fn().mockResolvedValue({
      ...game,
      id: 'bcb93f2f-a31b-4e6f-9092-0a91ddfae60a',
      name: 'Counter Strike 2',
      publisher: 'Valve',
      releaseDate: new Date('2023-09-27'),
      genre: 'FPS',
    }),
  };

  const playersServiceMock: Partial<PlayersService> = {
    findAll: jest.fn().mockResolvedValue([
      {
        id: '11111111-1111-4111-8111-111111111111',
        username: 'aya',
        email: 'aya@example.com',
        role: PlayerRole.ADMIN,
        avatar: null,
        createdAt: new Date('2026-04-27T12:33:35.272Z'),
        tournaments: [],
        matchesAsPlayer1: [],
        matchesAsPlayer2: [],
        matchesWon: [],
      },
    ]),
    findOne: jest.fn().mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      username: 'aya',
      email: 'aya@example.com',
      role: PlayerRole.ADMIN,
      avatar: null,
      createdAt: new Date('2026-04-27T12:33:35.272Z'),
      tournaments: [],
      matchesAsPlayer1: [],
      matchesAsPlayer2: [],
      matchesWon: [],
    }),
    create: jest.fn().mockResolvedValue({
      id: '33333333-3333-4333-8333-333333333333',
      username: 'new-player',
      email: 'new-player@example.com',
      role: PlayerRole.USER,
      avatar: null,
      createdAt: new Date('2026-04-28T09:00:00.000Z'),
      tournaments: [],
      matchesAsPlayer1: [],
      matchesAsPlayer2: [],
      matchesWon: [],
    }),
    update: jest.fn().mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      username: 'aya-updated',
      email: 'aya@example.com',
      role: PlayerRole.ADMIN,
      avatar: null,
      createdAt: new Date('2026-04-27T12:33:35.272Z'),
      tournaments: [],
      matchesAsPlayer1: [],
      matchesAsPlayer2: [],
      matchesWon: [],
    }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const players: Player[] = [];
  const playersRepositoryMock = {
    findOne: jest.fn(
      async ({
        where,
      }: {
        where: Partial<Pick<Player, 'id' | 'email' | 'username'>>;
      }): Promise<Player | null> => {
        if (where.id) {
          return players.find((player) => player.id === where.id) ?? null;
        }
        if (where.email) {
          return players.find((player) => player.email === where.email) ?? null;
        }
        if (where.username) {
          return players.find((player) => player.username === where.username) ?? null;
        }
        return null;
      },
    ),
    create: jest.fn((payload: Partial<Player>): Player => payload as Player),
    count: jest.fn(async (): Promise<number> => players.length),
    save: jest.fn(async (player: Player): Promise<Player> => {
      const savedPlayer: Player = {
        ...player,
        id:
          player.id ??
          (players.length === 0
            ? '11111111-1111-4111-8111-111111111111'
            : '22222222-2222-4222-8222-222222222222'),
        role: player.role ?? PlayerRole.USER,
        createdAt: player.createdAt ?? new Date(),
        tournaments: player.tournaments ?? [],
        matchesAsPlayer1: player.matchesAsPlayer1 ?? [],
        matchesAsPlayer2: player.matchesAsPlayer2 ?? [],
        matchesWon: player.matchesWon ?? [],
      };
      players.push(savedPlayer);
      return savedPlayer;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({ secret: 'super_secret_key', signOptions: { expiresIn: '1d' } }),
      ],
      controllers: [AuthController, TournamentsController, GamesController, PlayersController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: ConfigService, useValue: { get: (_key: string, fallback: string) => fallback } },
        { provide: getRepositoryToken(Player), useValue: playersRepositoryMock },
        { provide: TournamentsService, useValue: tournamentsServiceMock },
        { provide: GamesService, useValue: gamesServiceMock },
        { provide: PlayersService, useValue: playersServiceMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tournaments', async () => {
    const response = await request(app.getHttpServer())
      .get('/tournaments?status=pending')
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(tournament.id);
    expect(response.body.path).toBe('/tournaments?status=pending');
  });

  it('POST /auth/register (first user) returns 201 and admin token', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register').send({
      username: 'aya',
      email: 'aya@example.com',
      password: 'VeryStrongPass1',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe('aya@example.com');
    expect(response.body.data.user.role).toBe(PlayerRole.ADMIN);
    expect(response.body.data.accessToken).toBeDefined();
    adminAccessToken = response.body.data.accessToken;
  });

  it('POST /auth/login returns 201', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'aya@example.com',
      password: 'VeryStrongPass1',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('POST /auth/register (second user) returns user token', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register').send({
      username: 'neo',
      email: 'neo@example.com',
      password: 'VeryStrongPass1',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe(PlayerRole.USER);
    expect(response.body.data.accessToken).toBeDefined();
    userAccessToken = response.body.data.accessToken;
  });

  it('POST /auth/register validates payload', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: '',
        email: 'invalid-email',
        password: '123',
      })
      .expect(400);
  });

  it('GET /tournaments/:id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/tournaments/${tournament.id}`)
      .expect(200);

    expect(response.body.data.id).toBe(tournament.id);
  });

  it('POST /tournaments without token returns 401', async () => {
    await request(app.getHttpServer())
      .post('/tournaments')
      .send({
        name: 'Spring Cup',
        maxPlayers: 16,
        startDate: '2026-05-10T18:00:00.000Z',
        status: 'pending',
        gameId: game.id,
      })
      .expect(401);
  });

  it('POST /tournaments with token returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/tournaments')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Spring Cup',
        maxPlayers: 16,
        startDate: '2026-05-10T18:00:00.000Z',
        status: 'pending',
        gameId: game.id,
      })
      .expect(201);

    expect(response.body.data.id).toBe(tournament.id);
  });

  it('PUT /tournaments/:id with token returns 200', async () => {
    const response = await request(app.getHttpServer())
      .put(`/tournaments/${tournament.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: 'Spring Cup Updated' })
      .expect(200);

    expect(response.body.data.name).toBe('Spring Cup Updated');
  });

  it('POST /tournaments/:id/join with token returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tournaments/${tournament.id}/join`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(201);

    expect(response.body.data.players).toHaveLength(1);
  });

  it('DELETE /tournaments/:id with token returns 204', async () => {
    await request(app.getHttpServer())
      .delete(`/tournaments/${tournament.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(204);
  });

  it('GET /games returns 200', async () => {
    const response = await request(app.getHttpServer()).get('/games').expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(game.id);
  });

  it('POST /games without token returns 401', async () => {
    await request(app.getHttpServer())
      .post('/games')
      .send({
        name: 'Counter Strike 2',
        publisher: 'Valve',
        releaseDate: '2023-09-27',
        genre: 'FPS',
      })
      .expect(401);
  });

  it('POST /games with non-admin token returns 403', async () => {
    await request(app.getHttpServer())
      .post('/games')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: 'Counter Strike 2',
        publisher: 'Valve',
        releaseDate: '2023-09-27',
        genre: 'FPS',
      })
      .expect(403);
  });

  it('POST /games with admin token returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/games')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Counter Strike 2',
        publisher: 'Valve',
        releaseDate: '2023-09-27',
        genre: 'FPS',
      })
      .expect(201);

    expect(response.body.data.name).toBe('Counter Strike 2');
  });

  it('POST /games validates payload', async () => {
    await request(app.getHttpServer())
      .post('/games')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: '',
        publisher: '',
        releaseDate: 'invalid-date',
        genre: '',
      })
      .expect(400);
  });

  it('GET /players without token returns 401', async () => {
    await request(app.getHttpServer()).get('/players').expect(401);
  });

  it('GET /players with non-admin token returns 403', async () => {
    await request(app.getHttpServer())
      .get('/players')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });

  it('GET /players with admin token returns 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/players')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].email).toBe('aya@example.com');
  });

  it('GET /players/:id with admin token returns 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/players/11111111-1111-4111-8111-111111111111')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.data.id).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('POST /players with admin token returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/players')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        username: 'new-player',
        email: 'new-player@example.com',
        password: 'VeryStrongPass1',
      })
      .expect(201);

    expect(response.body.data.email).toBe('new-player@example.com');
    expect(response.body.data.password).toBeUndefined();
  });

  it('PATCH /players/:id with admin token returns 200', async () => {
    const response = await request(app.getHttpServer())
      .patch('/players/11111111-1111-4111-8111-111111111111')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ username: 'aya-updated' })
      .expect(200);

    expect(response.body.data.username).toBe('aya-updated');
  });

  it('DELETE /players/:id with admin token returns 204', async () => {
    await request(app.getHttpServer())
      .delete('/players/11111111-1111-4111-8111-111111111111')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(204);
  });
});
