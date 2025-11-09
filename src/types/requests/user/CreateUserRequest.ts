import { AuthRequest } from "../AuthRequest";

export interface CreateUserRequest extends AuthRequest {
  body: {
    username: string;
    password: string;
    role: "manager" | "employee";
    node: string;
  };
}