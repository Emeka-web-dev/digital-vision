import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from 'src/common/configs/config.interface';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { GqlAuthGuard } from './gql-auth.guard';
import { PasswordService } from './password.service';
import { UsersService } from 'src/users/users.service';

@Module({
    imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.registerAsync({
        useFactory: async (configService: ConfigService) => {
          const securityConfig = configService.get<SecurityConfig>('security');
          return {
            secret: configService.get<string>('JWT_ACCESS_SECRET'),
            signOptions: {
              expiresIn: securityConfig?.expiresIn,
            },
          };
        },
        inject: [ConfigService],
      }),
    ],
    providers: [
      AuthService,
      UsersService,
      AuthResolver,
      JwtStrategy,
      GqlAuthGuard,
      PasswordService,
    ],
    exports: [GqlAuthGuard],
  })
  export class AuthModule {}