import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import Node, { INode } from "../models/Node";
import User from "../models/User";

dotenv.config();

async function createNode(name: string, parentId?: Types.ObjectId): Promise<INode> {
  const node = await Node.create({ name, parent: parentId, children: [] });
  if (parentId) {
    await Node.findByIdAndUpdate(parentId, { $push: { children: node._id } });
  }
  return node;
}

async function seed(): Promise<void> {
  try {
    const uri = process.env.MONGO_URI as string;
    if (!uri) throw new Error("MONGO_URI not set in .env");
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    await Node.deleteMany({});
    await User.deleteMany({});

    const srbija = await createNode("Srbija");

    const vojvodina = await createNode("Vojvodina", srbija._id);
    const severnobacki = await createNode("Severnobacki okrug", vojvodina._id);
    const juznobacki = await createNode("Juznobacki okrug", vojvodina._id);

    const subotica = await createNode("Subotica", severnobacki._id);
    const radnja1 = await createNode("Radnja 1", subotica._id);

    const noviSad = await createNode("Novi Sad", juznobacki._id);
    const detelinara = await createNode("Detelinara", noviSad._id);
    const liman = await createNode("Liman", noviSad._id);

    const radnja2 = await createNode("Radnja 2", detelinara._id);
    const radnja3 = await createNode("Radnja 3", detelinara._id);
    const radnja4 = await createNode("Radnja 4", liman._id);
    const radnja5 = await createNode("Radnja 5", liman._id);

    const beograd = await createNode("Grad Beograd", srbija._id);
    const noviBeograd = await createNode("Novi Beograd", beograd._id);
    const bezanija = await createNode("Bezanija", noviBeograd._id);
    const radnja6 = await createNode("Radnja 6", bezanija._id);

    const vracar = await createNode("Vracar", beograd._id);
    const neimar = await createNode("Neimar", vracar._id);
    const radnja7 = await createNode("Radnja 7", neimar._id);
    const crveniKrst = await createNode("Crveni krst", vracar._id);
    const radnja8 = await createNode("Radnja 8", crveniKrst._id);
    const radnja9 = await createNode("Radnja 9", crveniKrst._id);

    const managerNS = new User({
      username: "manager_novisad",
      password: "123456",
      role: "manager",
      node: noviSad._id,
    });
    await managerNS.save();

    const employeeLiman = new User({
      username: "employee_liman",
      password: "123456",
      role: "employee",
      node: liman._id,
    });
    await employeeLiman.save();

    const managerBG = new User({
      username: "manager_beograd",
      password: "123456",
      role: "manager",
      node: beograd._id,
    });
    await managerBG.save();

    const employeeRadnja4 = new User({
      username: "employee_radnja4",
      password: "123456",
      role: "employee",
      node: radnja4._id,
    });
    await employeeRadnja4.save();

    console.log("\n🎉 Seeding completed!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
