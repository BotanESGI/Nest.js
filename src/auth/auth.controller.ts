import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ResponseTransformInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: "Inscription d'un utilisateur" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Utilisateur inscrit avec JWT.' })
  @ApiResponse({ status: 400, description: 'Payload invalide.' })
  @ApiResponse({ status: 409, description: 'Email ou username deja utilise.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'JWT genere avec profil utilisateur.' })
  @ApiResponse({ status: 400, description: 'Payload invalide.' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
