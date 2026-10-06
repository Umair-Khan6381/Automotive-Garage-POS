import prisma from '../database/prisma';

export const invoiceRepository = {
  findAll: async () => {
    return prisma.invoice.findMany({
      include: {
        customer: true,
        vehicle: true,
        items: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  findById: async (id: string) => {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        items: true,
        payments: true
      }
    });
  },

  create: async (data: any, items: any[]) => {
    return prisma.$transaction(async tx => {
      const invoice = await tx.invoice.create({
        data: {
          ...data,
          items: {
            create: items
          }
        },
        include: {
          items: true
        }
      });
      return invoice;
    });
  },

  update: async (id: string, data: any) => {
    return prisma.invoice.update({ where: { id }, data });
  },

  addPayment: async (invoiceId: string, paymentData: any) => {
    return prisma.$transaction(async tx => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          ...paymentData
        }
      });

      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (invoice) {
        const newPaid = invoice.paidAmount + paymentData.amount;
        const newBalance = Math.max(0, invoice.grandTotal - newPaid);
        const newStatus = newBalance === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';

        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaid,
            balanceDue: newBalance,
            paymentStatus: newStatus
          }
        });
      }

      return payment;
    });
  }
};
