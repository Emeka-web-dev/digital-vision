import { Module } from '@nestjs/common';
import { PasswordService } from 'src/auth/password.service';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [JwtModule],
    providers: [UsersResolver, PasswordService, AuthService, UsersService ],
    exports: [UsersService]
})
export class UsersModule { }
