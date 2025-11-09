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

describe("User routes (CRUD + role checks)", () => {
  let managerToken: string;
  let employeeToken: string;
  let nodeId: string;
  let employeeId: string;

  beforeAll(async () => {
    const node = await Node.create({ name: "Root Node" });
    nodeId = node._id.toString();

    const manager = await User.create({
      username: "manager",
      password: "password",
      role: "manager",
      node: node._id,
    });

    const employee = await User.create({
      username: "employee",
      password: "password",
      role: "employee",
      node: node._id,
    });

    managerToken = generateToken((manager._id as Types.ObjectId).toString(), manager.role);
    employeeToken = generateToken((employee._id as Types.ObjectId).toString(), employee.role);
  });

  it("manager can create a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        username: "employee1",
        password: "password",
        role: "employee",
        node: nodeId,
      });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe("employee1");
    employeeId = res.body._id;
  });

  it("employee cannot create a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        username: "employee2",
        password: "password",
        role: "employee",
        node: nodeId,
      });

    expect(res.status).toBe(403);
  });

  it("manager can update a user", async () => {
    const res = await request(app)
      .put(`/api/users/${employeeId}`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ username: "updatedEmployee" });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("updatedEmployee");
  });

  it("employee cannot update a user", async () => {
    const res = await request(app)
      .put(`/api/users/${employeeId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ username: "hackedEmployee" });

    expect(res.status).toBe(403);
  });

  it("manager can delete a user", async () => {
    const res = await request(app)
      .delete(`/api/users/${employeeId}`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted");
  });

  it("employee cannot delete a user", async () => {
    const res = await request(app)
      .delete(`/api/users/${employeeId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });
});
