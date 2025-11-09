import { AuthRequest } from "../AuthRequest";

export interface UpdateUserRequest extends AuthRequest {
  params: { id: string };
  body: Partial<{
    username: string;
    password: string;
    role: "manager" | "employee";
    node: string;
  }>;
}