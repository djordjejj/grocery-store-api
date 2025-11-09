import { AuthRequest } from "../AuthRequest";

export interface UpdateNodeRequest extends AuthRequest {
  params: { id: string };
  body: {
    name?: string;
    parent?: string;
  };
}