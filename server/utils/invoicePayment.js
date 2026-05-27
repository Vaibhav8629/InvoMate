const resolveInvoicePaymentDetails = ({ paymentStatus, paymode, existingInvoice = null } = {}) => {
  const resolvedPaymentStatus = paymentStatus === "PENDING"
    ? "PENDING"
    : paymentStatus === "PAID"
      ? "PAID"
      : existingInvoice?.paymentStatus === "PENDING"
        ? "PENDING"
        : "PAID";

  const resolvedPaymode = resolvedPaymentStatus === "PENDING"
    ? null
    : paymode ?? existingInvoice?.paymode ?? null;

  return {
    paymentStatus: resolvedPaymentStatus,
    paymode: resolvedPaymode,
  };
};

const getInvoicePaymentLabel = (invoice) => {
  if (invoice?.paymentStatus === "PENDING") {
    return "PENDING";
  }

  return invoice?.paymode || "PAID";
};

module.exports = {
  resolveInvoicePaymentDetails,
  getInvoicePaymentLabel,
};