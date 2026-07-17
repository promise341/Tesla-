import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password, name, username } = req.body;
  if (!email || !password || !name || !username) return res.status(400).json({ error: "Missing fields" });

  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (exists) return res.status(409).json({ error: "User already exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, username, phone: "", country: "", passwordHash: hash } });
  return res.status(201).json({ id: user.id, email: user.email });
}
