import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Node from "../models/Node";
import User from "../models/User";
import { CreateNodeRequest } from "../types/requests/node/CreateNodeRequest";
import { DeleteNodeRequest } from "../types/requests/node/DeleteNodeRequest";
import { UpdateNodeRequest } from "../types/requests/node/UpdateNodeRequest";
import { NodeIdRequest } from "../types/requests/node/NodeIdRequest";

export const createNode = async (req: CreateNodeRequest, res: Response, next: NextFunction) => {
  try {
    const { name, parent } = req.body;

    const node = await Node.create({ name, parent });

    // If parent exists, add this node to parent's children array
    if (parent) {
      const parentNode = await Node.findById(parent);
      if (parentNode) {
        parentNode.children.push(node._id);
        await parentNode.save();
      }
    }

    res.status(201).json(node);
  } catch (err) {
    next(err);
  }
};

export const updateNode = async (req: UpdateNodeRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, parent } = req.body;

    const node = await Node.findById(id);
    if (!node) {
        return res.status(404).json({ message: "Node not found" });
    }

    // Update parent relationship
    if (parent && parent !== node.parent?.toString()) {
      // Remove from old parent's children
      if (node.parent) {
        const oldParent = await Node.findById(node.parent);
        if (oldParent) {
          oldParent.children = oldParent.children.filter(c => c.toString() !== node._id.toString());
          await oldParent.save();
        }
      }

      // Add to new parent's children
      const newParent = await Node.findById(parent);
      if (newParent) {
        newParent.children.push(node._id);
        await newParent.save();
      }

      node.parent = new mongoose.Types.ObjectId(parent);
    }

    if (name) node.name = name;

    await node.save();
    res.json(node);
  } catch (err) {
    next(err);
  }
};

export const deleteNode = async (req: DeleteNodeRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const node = await Node.findById(id);
    if (!node) {
        return res.status(404).json({ message: "Node not found" });
    }

    // Remove this node from parent's children
    if (node.parent) {
      const parentNode = await Node.findById(node.parent);
      if (parentNode) {
        parentNode.children = parentNode.children.filter(c => c.toString() !== id);
        await parentNode.save();
      }
    }

    await Node.deleteMany({ _id: { $in: node.children } });
    await node.deleteOne();

    res.json({ message: "Node deleted" });
  } catch (err) {
    next(err);
  }
};

async function getNodeAndDescendantIds(nodeId: string): Promise<string[]> {
  const objectId = new mongoose.Types.ObjectId(nodeId);

  const res = await Node.aggregate([
    { $match: { _id: objectId } },
    {
      $graphLookup: {
        from: "nodes",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent",
        as: "descendants"
      }
    },
    {
      $project: {
        all: {
          $concatArrays: [
            ["$_id"],
            { $map: { input: "$descendants", as: "d", in: "$$d._id" } }
          ]
        }
      }
    }
  ]);

  if (!res || res.length === 0) {
    return [];
  }
  return res[0].all.map((id: mongoose.Types.ObjectId) => id.toString());
}

export const getEmployeesForNode = async (req: NodeIdRequest, res: Response, next: NextFunction) => {
  try {
    const { nodeId } = req.params;
    const includeDesc = req.query.descendants === "true";

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const targetNode = await Node.findById(nodeId);
    if (!targetNode) {
        return res.status(404).json({ message: "Node not found" });
    }

    const requesterNodeId = req.user.node?.toString();
    if (!requesterNodeId) {
        return res.status(400).json({ message: "Requester has no node assigned" });
    }

    const requesterSubtree = await getNodeAndDescendantIds(requesterNodeId);

    if (!requesterSubtree.includes(nodeId)) {
      return res.status(403).json({ message: "Forbidden: node outside your subtree" });
    }

    let nodesToQuery = [nodeId];
    if (includeDesc) nodesToQuery = await getNodeAndDescendantIds(nodeId);

    const employees = await User.find({ node: { $in: nodesToQuery }, role: "employee" })
      .select("-password -__v");

    return res.json(employees);
  } catch (err) {
    next(err);
  }
};

export const getManagersForNode = async (req: NodeIdRequest, res: Response, next: NextFunction) => {
  try {
    const { nodeId } = req.params;
    const includeDesc = req.query.descendants === "true";

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "manager") {
        return res.status(403).json({ message: "Only managers can view managers" });
    }

    const targetNode = await Node.findById(nodeId);
    if (!targetNode) {
        return res.status(404).json({ message: "Node not found" });
    }

    const requesterNodeId = req.user.node?.toString();
    if (!requesterNodeId) {
        return res.status(400).json({ message: "Requester has no node assigned" });
    }

    const requesterSubtree = await getNodeAndDescendantIds(requesterNodeId);
    if (!requesterSubtree.includes(nodeId)) {
      return res.status(403).json({ message: "Forbidden: node outside your subtree" });
    }

    let nodesToQuery = [nodeId];
    if (includeDesc) {
        nodesToQuery = await getNodeAndDescendantIds(nodeId);
    }

    const managers = await User.find({ node: { $in: nodesToQuery }, role: "manager" })
      .select("-password -__v");

    return res.json(managers);
  } catch (err) {
    next(err);
  }
};
