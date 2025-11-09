import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface INode extends Document {
  _id: Types.ObjectId;               // 👈 add this line!
  name: string;
  parent?: Types.ObjectId;
  children: Types.ObjectId[];
}

const NodeSchema = new Schema<INode>({
  name: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, ref: "Node" },
  children: [{ type: Schema.Types.ObjectId, ref: "Node" }],
});

// 👇 Explicitly type the model as Model<INode>
const Node: Model<INode> = mongoose.model<INode>("Node", NodeSchema);

export default Node;
