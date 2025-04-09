import { Module } from '@nestjs/common';
import { PasswordService } from 'src/auth/passwort.service';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [],
  providers: [UsersResolver, PasswordService],
})
export class UsersModule {}
