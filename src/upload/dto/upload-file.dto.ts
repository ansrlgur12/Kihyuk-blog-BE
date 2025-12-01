import { IsString, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  att_target_type?: string;

  @IsOptional()
  @IsString()
  att_target?: string;
}
