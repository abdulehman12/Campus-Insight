import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../User/user.module'; // Import UserModule
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../User/user.entity';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [
    UserModule, // Gives access to UserService
    TypeOrmModule.forFeature([UserEntity]), // Gives access to User Repository
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}