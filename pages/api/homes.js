import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);

    response.status(405)
        .json({ message: `HTTP method ${request.method} is not supported.` });

    return response;
  }

  const { image, title, description, price, guests, beds, baths } = request.body;

  try {
    const home = await prisma.home.create({
      data: {
        image, title, description, price, guests, beds, baths
      }
    });

    return response.status(201).json(home);
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
}