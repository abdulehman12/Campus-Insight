import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserLoginDto } from '@app/User/dto/userLogin.dto';
import { UserResponseInterface } from '@app/User/types/userResonse.interface';
import { UserService } from '@app/User/user.service';
import { AdminGuard } from './guards/admin.guard';
import { Delete, Param } from '@nestjs/common';
import { User } from '@app/User/decorators/user.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService,
    private readonly userService: UserService) { }





  @Get('dashboard-stats')
  async getStats() {
    const students = await this.adminService.getAllStudents();
    return {
      totalStudents: students.length,
      pendingVerification: students.filter(s => !s.isVerified).length,
    };
  }

  @Get('unverified-students')
  @UseGuards(AdminGuard)
  async getPendingApprovals() {
    return await this.adminService.getPendingApprovals();
  }

  @Get('report-content')
  @UseGuards(AdminGuard)
  async getReportContent() {
    return await this.adminService.getReportContent();
  }

  @Delete('insights/:id')
  @UseGuards(AdminGuard)
  async deleteInsight(@User() currentUser: any,@Param('id') insightId: string){
    return await this.adminService.deleteInsight(currentUser, insightId)
  }

  @Get('analytics')
  @UseGuards(AdminGuard)
  async getAnalytics() {
    return await this.adminService.getAdminAnalytics();
  }
}