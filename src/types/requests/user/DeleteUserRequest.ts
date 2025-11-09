import { AuthRequest } from "../AuthRequest";

export interface DeleteUserRequest extends AuthRequest {
  params: { id: string };
}