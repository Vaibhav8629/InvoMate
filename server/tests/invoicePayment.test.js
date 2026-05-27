const assert = require("assert");
const {
  resolveInvoicePaymentDetails,
  getInvoicePaymentLabel,
} = require("../utils/invoicePayment");

const createdPaid = resolveInvoicePaymentDetails({ paymentStatus: "PAID", paymode: "Cash" });
assert.deepStrictEqual(createdPaid, {
  paymentStatus: "PAID",
  paymode: "Cash",
});

const createdPending = resolveInvoicePaymentDetails({ paymentStatus: "PENDING", paymode: "Cash" });
assert.deepStrictEqual(createdPending, {
  paymentStatus: "PENDING",
  paymode: null,
});

const pendingEdit = resolveInvoicePaymentDetails({ existingInvoice: { paymentStatus: "PENDING", paymode: null } });
assert.deepStrictEqual(pendingEdit, {
  paymentStatus: "PENDING",
  paymode: null,
});

assert.strictEqual(getInvoicePaymentLabel({ paymentStatus: "PENDING" }), "PENDING");
assert.strictEqual(getInvoicePaymentLabel({ paymode: "Online" }), "Online");
assert.strictEqual(getInvoicePaymentLabel({}), "PAID");

console.log("invoicePayment tests passed");