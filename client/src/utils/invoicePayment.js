export const getInvoicePaymentStatus = (invoice) => {
  if (invoice?.paymentStatus === "PENDING") {
    return "PENDING";
  }

  return "PAID";
};

export const getInvoicePaymentDisplay = (invoice) => {
  if (getInvoicePaymentStatus(invoice) === "PENDING") {
    return "Pending";
  }

  return invoice?.paymode || "Paid";
};