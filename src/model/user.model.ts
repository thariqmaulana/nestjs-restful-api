export class RegisterUserRequest {
  username: string;
  password: string;
  name: string;
}

export class LoginUserRequest {
  username: string;
  password: string;
}

export class UpdateUserRequest {
  password?: string;
  name?: string;
}

// export class RegisterUserResponse {
// }
export class UserResponse {
  username: string;
  name: string;
  token?: string | null
}