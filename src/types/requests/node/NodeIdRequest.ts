import { AuthRequest } from "../AuthRequest";

export interface NodeIdRequest extends AuthRequest {
  params: { nodeId: string };
}