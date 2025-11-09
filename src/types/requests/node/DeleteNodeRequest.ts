import { AuthRequest } from "../AuthRequest";

export interface DeleteNodeRequest extends AuthRequest {
  params: { id: string };
}