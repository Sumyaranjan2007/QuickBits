import { Inject, Controller, Get, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, IApiResponse } from '@quickbite/types';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: { firstName?: string; lastName?: string; avatarUrl?: string },
  ): Promise<IApiResponse> {
    const result = await this.usersService.updateProfile(userId, body);
    return {
      success: true,
      data: result,
      message: 'Profile updated successfully',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all users (admin only)' })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<IApiResponse> {
    const result = await this.usersService.getUsers(page, limit);
    return {
      success: true,
      data: result,
      message: 'Users retrieved successfully',
    };
  }
}
