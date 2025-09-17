const prisma = {
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

export default prisma;
