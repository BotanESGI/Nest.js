import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TournamentStatus } from '../src/database/entities/tournament.entity';
import { TournamentsController } from '../src/tournaments/tournaments.controller';
import { TournamentsService } from '../src/tournaments/tournaments.service';

describe('TournamentsController (e2e)', () => {
  let app: INestApplication;

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TournamentsController],
      providers: [{ provide: TournamentsService, useValue: tournamentsServiceMock }],
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
      .set('Authorization', 'Bearer test-token')
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
      .set('Authorization', 'Bearer test-token')
      .send({ name: 'Spring Cup Updated' })
      .expect(200);

    expect(response.body.data.name).toBe('Spring Cup Updated');
  });

  it('POST /tournaments/:id/join with token returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tournaments/${tournament.id}/join`)
      .set('Authorization', 'Bearer test-token')
      .send({ playerId: '2a1fbb0c-cd4a-40ea-95ca-d1f9e86a3229' })
      .expect(201);

    expect(response.body.data.players).toHaveLength(1);
  });

  it('DELETE /tournaments/:id with token returns 204', async () => {
    await request(app.getHttpServer())
      .delete(`/tournaments/${tournament.id}`)
      .set('Authorization', 'Bearer test-token')
      .expect(204);
  });
});
