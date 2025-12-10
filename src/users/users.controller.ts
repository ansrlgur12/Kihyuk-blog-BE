import {
    Controller,
    Put,
    Delete,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * 닉네임 변경
     */
    @Post('nickname')
    @HttpCode(HttpStatus.OK)
    async updateNickname(
        @CurrentUser() user: any,
        @Body() updateNicknameDto: UpdateNicknameDto,
    ) {
        return this.usersService.updateNickname(user.userId, updateNicknameDto);
    }

    /**
     * 프로필 업데이트 (이미지 경로만 받아서 저장)
     */
    @Post('profile')
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @CurrentUser() user: any,
        @Body() updateProfileDto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfileImage(
            user.userId,
            updateProfileDto.user_image
        );
    }

    /**
     * 프로필 이미지 삭제
     */
    @Delete('profile-image')
    @HttpCode(HttpStatus.OK)
    async deleteProfileImage(@CurrentUser() user: any) {
        return this.usersService.deleteProfileImage(user.userId);
    }
}
