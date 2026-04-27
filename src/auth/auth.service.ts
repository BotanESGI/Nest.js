import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Player, PlayerRole } from '../database/entities/player.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

type AuthResponse = {
  accessToken: string;
  expiresIn: string;
  user: Pick<Player, 'id' | 'username' | 'email' | 'role'>;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingByEmail = await this.playersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingByEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingByUsername = await this.playersRepository.findOne({
      where: { username: dto.username },
    });
    if (existingByUsername) {
      throw new ConflictException('Username already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const playersCount = await this.playersRepository.count();
    const player = this.playersRepository.create({
      username: dto.username,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      role: playersCount === 0 ? PlayerRole.ADMIN : PlayerRole.USER,
      avatar: null,
    });

    const savedPlayer = await this.playersRepository.save(player);
    return this.buildAuthResponse(savedPlayer);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const player = await this.playersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!player) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, player.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(player);
  }

  async validateUserById(id: string): Promise<Player | null> {
    return this.playersRepository.findOne({ where: { id } });
  }

  private buildAuthResponse(player: Player): AuthResponse {
    const payload: JwtPayload = {
      sub: player.id,
      email: player.email,
      username: player.username,
      role: player.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1d');

    return {
      accessToken,
      expiresIn,
      user: {
        id: player.id,
        username: player.username,
        email: player.email,
        role: player.role,
      },
    };
  }
}
