import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../User/user.entity';
import { UserRole } from '@app/types/userRole.type';
import { UserLoginDto } from '@app/User/dto/userLogin.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService
  ) {}

  

  async getAllStudents() {
    return await this.userRepository.find({
      where: { role: UserRole.STUDENT },
      select: ['id', 'username', 'roll_no', 'isVerified', 'otpCode']
    });
  }

  async getPendingApprovals() {
    return await this.userRepository.find({
      where: { isVerified: false, role: UserRole.STUDENT },
    });
  }
}