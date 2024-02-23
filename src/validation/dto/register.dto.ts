import { IsString, Length, IsEmail } from "class-validator";
import { IsEqualTo } from "../decorator/check-password.decorator";

export class RegisterDto {
  @IsString({ message: "Full name must be a string" })
  fullName: string;

  @IsString()
  @Length(3, 30, { message: "Username must be between 3 and 30 characters" })
  username: string;

  @IsEmail({}, { message: "Email must be a valid email address" })
  email: string;

  @IsString()
  @Length(6, undefined, {
    message: "Password must be at least 6 characters long",
  })
  password: string;

  @IsString()
  @IsEqualTo("password", {
    message: "Password Confirm must be the same as password",
  })
  confirm_password: string;
}
