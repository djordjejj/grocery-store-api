import { AuthRequest } from "../AuthRequest";

export interface CreateNodeRequest extends AuthRequest {
  body: {
    name: string;
    parent?: string;
  };
}