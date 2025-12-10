import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from "class-validator";

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    user_email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    user_password: string;

    @IsString()
    @IsNotEmpty()
    user_nickname: string;

    @IsString()
    @IsOptional()
    @IsIn(['Y', 'N', 'T', 'H'])
    user_status?: string;

    @IsString()
    @IsOptional()
    user_image?: string;
}
