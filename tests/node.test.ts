import request from "supertest";
import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import User from "../src/models/User";
import Node from "../src/models/Node";
import { generateToken } from "../src/utils/tokenUtils";
import app from "../src/app";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Node routes (CRUD + role checks)", () => {
  let managerToken: string;
  let employeeToken: string;
  let rootNodeId: string;
  let childNodeId: string;

  beforeAll(async () => {
    const rootNode = await Node.create({ name: "Root Node" });
    rootNodeId = rootNode._id.toString();

    const manager = await User.create({
      username: "manager",
      password: "password",
      role: "manager",
      node: rootNode._id,
    });

    const employee = await User.create({
      username: "employee",
      password: "password",
      role: "employee",
      node: rootNode._id,
    });

    managerToken = generateToken((manager._id as Types.ObjectId).toString(), manager.role);
    employeeToken = generateToken((employee._id as Types.ObjectId).toString(), employee.role);
  });

  it("manager can create a node", async () => {
    const res = await request(app)
      .post("/api/nodes")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ name: "Child Node", parent: rootNodeId });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Child Node");
    childNodeId = res.body._id;
  });

  it("employee cannot create a node", async () => {
    const res = await request(app)
      .post("/api/nodes")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ name: "Forbidden Node" });

    expect(res.status).toBe(403);
  });

  it("manager can update a node", async () => {
    const res = await request(app)
      .put(`/api/nodes/${childNodeId}`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ name: "Updated Child Node" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Child Node");
  });

  it("employee cannot update a node", async () => {
    const res = await request(app)
      .put(`/api/nodes/${childNodeId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ name: "Hacked Node" });

    expect(res.status).toBe(403);
  });

  it("manager can delete a node", async () => {
    const res = await request(app)
      .delete(`/api/nodes/${childNodeId}`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Node deleted");
  });

  it("employee cannot delete a node", async () => {
    const res = await request(app)
      .delete(`/api/nodes/${rootNodeId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });
});
