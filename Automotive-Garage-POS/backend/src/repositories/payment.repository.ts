import prisma from '../database/prisma';

export const paymentRepository = {
  findAll: async () => {
    return prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            customer: true,
            vehicle: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });
  },

  findById: async (id: string) => {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            customer: true,
            vehicle: true
          }
        }
      }
    });
  },

  findByInvoiceId: async (invoiceId: string) => {
    return prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: 'desc' }
    });
  },

  create: async (data: {
    invoiceId: string;
    amount: number;
    paymentDate?: Date;
    paymentMethod: string;
    referenceNumber?: string;
    receivedBy: string;
    notes?: string;
  }) => {
    return prisma.$transaction(async tx => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          paymentDate: data.paymentDate || new Date(),
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber,
          receivedBy: data.receivedBy,
          notes: data.notes
        }
      });

      const invoice = await tx.invoice.findUnique({
        where: { id: data.invoiceId }
      });

      if (invoice) {
        const newPaid = invoice.paidAmount + data.amount;
        const newBalance = Math.max(0, invoice.grandTotal - newPaid);
        const newStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';

        await tx.invoice.update({
          where: { id: data.invoiceId },
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
