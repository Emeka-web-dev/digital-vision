import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { JwtDto } from './dto/jwt.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
        readonly configService: ConfigService,
    ) {
        const jwtSecret = configService.get<string>('JWT_ACCESS_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_ACCESS_SECRET is not defined in config');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: JwtDto): Promise<User> {
        const user = await this.authService.validateUser(payload.userId);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}