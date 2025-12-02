import { IsNotEmpty, IsOptional, IsString, IsIn } from "class-validator";

export class PostDto {
    @IsString()
    @IsNotEmpty()
    post_title: string;

    @IsString()
    @IsNotEmpty()
    post_content: string;

    @IsString()
    @IsNotEmpty()
    post_thumbnail: string;

    @IsString()
    @IsOptional()
    @IsIn(['Y', 'N', 'T', 'H'])
    post_status?: string;
}