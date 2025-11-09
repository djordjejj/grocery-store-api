import { AuthRequest } from "../AuthRequest";

export interface NodeIdUserRequest extends AuthRequest {
  params: { nodeId: string };
}