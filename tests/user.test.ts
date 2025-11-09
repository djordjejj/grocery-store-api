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

describe("User routes", () => {
  let employeeToken: string;
  let nodeId: string;
  let employeeId: string;

  beforeAll(async () => {
    await User.deleteMany({});
    await Node.deleteMany({});
    const node = await Node.create({ name: "Root Node" });
    nodeId = node._id.toString();

    const employee = await User.create({
      username: "employee1",
      password: "password",
      role: "employee",
      node: node._id,
    });

    employeeToken = generateToken((employee._id as Types.ObjectId).toString(), employee.role);
  });

  it("user create", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        username: "employee2",
        password: "password",
        role: "employee",
        node: nodeId,
      });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe("employee2");
    employeeId = res.body._id;
  });

  it("user update", async () => {
    const res = await request(app)
      .put(`/api/users/${employeeId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ username: "updatedEmployee" });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("updatedEmployee");
  });

  it("user delete", async () => {
    const res = await request(app)
      .delete(`/api/users/${employeeId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted");
  });
});
