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
import { Player } from '../src/database/entities/player.entity';
import { TournamentStatus } from '../src/database/entities/tournament.entity';
import { TournamentsController } from '../src/tournaments/tournaments.controller';
import { TournamentsService } from '../src/tournaments/tournaments.service';

describe('TournamentsController (e2e)', () => {
  let app: INestApplication;
  let accessToken = '';

  const game = {
    id: 'ea4140da-ba9e-4181-a6b8-df0776b1f59c',
    name: 'Test',
    publisher: 'Test',
    releaseDate: new Date('2026-04-27'),
    genre: 'HOMME',
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
    save: jest.fn(async (player: Player): Promise<Player> => {
      const savedPlayer: Player = {
        ...player,
        id: player.id ?? '11111111-1111-4111-8111-111111111111',
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
      controllers: [AuthController, TournamentsController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: ConfigService, useValue: { get: (_key: string, fallback: string) => fallback } },
        { provide: getRepositoryToken(Player), useValue: playersRepositoryMock },
        { provide: TournamentsService, useValue: tournamentsServiceMock },
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

  it('POST /auth/register returns 201 and a valid JWT', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register').send({
      username: 'aya',
      email: 'aya@example.com',
      password: 'VeryStrongPass1',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe('aya@example.com');
    expect(response.body.data.accessToken).toBeDefined();
    accessToken = response.body.data.accessToken;
  });

  it('POST /auth/login returns 201', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'aya@example.com',
      password: 'VeryStrongPass1',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.accessToken).toBeDefined();
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
      .set('Authorization', `Bearer ${accessToken}`)
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
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Spring Cup Updated' })
      .expect(200);

    expect(response.body.data.name).toBe('Spring Cup Updated');
  });

  it('POST /tournaments/:id/join with token returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tournaments/${tournament.id}/join`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(response.body.data.players).toHaveLength(1);
  });

  it('DELETE /tournaments/:id with token returns 204', async () => {
    await request(app.getHttpServer())
      .delete(`/tournaments/${tournament.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });
});
