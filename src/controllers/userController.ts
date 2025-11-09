import { Response } from "express";
import User from "../models/User";
import Node from "../models/Node";
import { CreateUserRequest } from "../types/requests/user/CreateUserRequest";
import { DeleteUserRequest } from "../types/requests/user/DeleteUserRequest";
import { UpdateUserRequest } from "../types/requests/user/UpdateUserRequest";
import { NodeIdUserRequest } from "../types/requests/user/NodeIdUserRequest";

export const createUser = async (req: CreateUserRequest, res: Response) => {
  try {
    const { username, password, role, node } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newUser = await User.create({ username, password, role, node });
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUser = async (req: UpdateUserRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req: DeleteUserRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getEmployeesByNode = async (req: NodeIdUserRequest, res: Response) => {
  const { nodeId } = req.params;
  const node = await Node.findById(nodeId).populate("children");

  if (!node) {
    return res.status(404).json({ message: "Node not found" });
  }

  const employees = await User.find({ node: nodeId, role: "employee" });
  res.json(employees);
};