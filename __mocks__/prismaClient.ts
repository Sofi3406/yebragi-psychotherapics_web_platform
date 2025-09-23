const prisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  jobRecord: {
    create: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

export default prisma;
