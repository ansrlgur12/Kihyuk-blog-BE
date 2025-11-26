import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

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
}
