import { IsInt, IsNotEmpty, IsOptional, IsString, IsIn } from "class-validator";

export class CommentDto {
    @IsString()
    @IsNotEmpty()
    comment_content: string;

    @IsInt()
    @IsNotEmpty()
    comment_author_id: number;

    @IsInt()
    @IsNotEmpty()
    comment_post_id: number;

    @IsString()
    @IsOptional()
    @IsIn(['Y', 'N', 'T', 'H'])
    comment_status?: string;
}



