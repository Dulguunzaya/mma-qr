import { gql } from "@apollo/client";

/**
 * The payment service stores contentType verbatim. Keep invoice creation and
 * lookup on this single application-level identifier.
 */
export const BMC_ORDER_INVOICE_CONTENT_TYPE = "bms:order";

export type PaymentMethod = {
  _id: string;
  name: string;
  kind: string;
  status?: "active" | "inactive";
  config?: unknown;
  sendEmailOnPayment?: boolean;
  createdAt?: string;
};

export type InvoiceTransaction = {
  _id: string;
  invoiceId?: string;
  paymentId?: string;
  paymentKind?: string;
  amount?: number;
  status?: string;
  response?: unknown;
  createdAt?: string;
};

export type BmcOrderInvoice = {
  _id: string;
  invoiceNumber?: string;
  amount?: number;
  currency?: string;
  status?: string;
  description?: string;
  contentType?: string;
  contentTypeId?: string;
  paymentIds?: string[];
  createdAt?: string;
  transactions?: InvoiceTransaction[];
};

export type InvoiceInput = {
  amount: number;
  currency?: string;
  phone?: string;
  email?: string;
  description?: string;
  customerId?: string;
  customerType?: string;
  contentType?: string;
  contentTypeId?: string;
  redirectUri?: string;
  paymentIds?: string[];
  data?: unknown;
  warningText?: string;
  callback?: string;
};

export type PaymentInput = {
  name: string;
  kind: string;
  status?: "active" | "inactive";
  config?: unknown;
  sendEmailOnPayment?: boolean;
};

export const BMC_ORDER_INVOICES = gql`
  query BmcOrderInvoices($orderId: String!) {
    invoiceDetailByContent(
      contentType: "bms:order"
      contentTypeId: $orderId
    ) {
      _id
      invoiceNumber
      amount
      currency
      status
      description
      paymentIds
      createdAt
      transactions {
        _id
        paymentKind
        amount
        status
        createdAt
      }
    }
  }
`;

export type BmcOrderInvoicesVariables = {
  orderId: string;
};

export type BmcOrderInvoicesData = {
  invoiceDetailByContent: BmcOrderInvoice[];
};

/**
 * Looks up invoices attached to a sales-pipeline deal. The content type must
 * stay in sync with SALES_DEAL_INVOICE_CONTENT_TYPE in
 * @/graphql/sales/companyBilling.
 */
export const SALES_DEAL_INVOICES = gql`
  query SalesDealInvoices($dealId: String!) {
    cpInvoices(contentType: "sales:deal", contentTypeId: $dealId) {
      list {
        _id
        invoiceNumber
        amount
        currency
        status
        createdAt
        transactions {
          _id
          paymentId
          paymentKind
          amount
          status
          response
          createdAt
        }
      }
      totalCount
    }
  }
`;

export type SalesDealInvoicesVariables = {
  dealId: string;
};

export type SalesDealInvoicesData = {
  cpInvoices: {
    list: BmcOrderInvoice[];
    totalCount?: number;
  };
};

export const BMC_ORDER_PAYMENT_METHODS = gql`
  query BmcOrderPaymentMethods($status: String) {
    payments(status: $status) {
      _id
      name
      kind
      status
      config
      sendEmailOnPayment
      createdAt
    }
  }
`;

export type BmcOrderPaymentMethodsVariables = {
  status?: string;
};

export type BmcOrderPaymentMethodsData = {
  payments: PaymentMethod[];
};

export const BMC_ORDER_PUBLIC_PAYMENT_METHODS = gql`
  query BmcOrderPublicPaymentMethods($currency: String) {
    paymentsPublic(currency: $currency) {
      _id
      name
      kind
    }
  }
`;

export type BmcOrderPublicPaymentMethodsVariables = {
  currency?: string;
};

export type BmcOrderPublicPaymentMethodsData = {
  paymentsPublic: PaymentMethod[];
};

export const BMC_ORDER_INVOICE_CREATE = gql`
  mutation BmcOrderInvoiceCreate($input: InvoiceInput!) {
    cpInvoiceCreate(input: $input) {
      _id
      invoiceNumber
      amount
      currency
      status
      contentType
      contentTypeId
      paymentIds
      createdAt
      transactions {
        _id
        invoiceId
        paymentId
        paymentKind
        amount
        status
        response
        createdAt
      }
    }
  }
`;

export type BmcOrderInvoiceCreateVariables = {
  input: InvoiceInput;
};

export type BmcOrderInvoiceCreateData = {
  cpInvoiceCreate: BmcOrderInvoice;
};

export const BMC_ORDER_GENERATE_INVOICE_URL = gql`
  mutation BmcOrderGenerateInvoiceUrl($input: InvoiceInput!) {
    generateInvoiceUrl(input: $input)
  }
`;

export type BmcOrderGenerateInvoiceUrlVariables = {
  input: InvoiceInput;
};

export type BmcOrderGenerateInvoiceUrlData = {
  generateInvoiceUrl: string;
};

export type PaymentTransactionInput = {
  invoiceId: string;
  paymentId: string;
  amount: number;
  details?: Record<string, unknown>;
};

export type PaymentTransaction = {
  _id: string;
  invoiceId: string;
  paymentId: string;
  paymentKind: string;
  status: string;
  response?: unknown;
};

export const BMC_ORDER_PAYMENT_TRANSACTION_ADD = gql`
  mutation BmcOrderPaymentTransactionAdd(
    $input: PaymentTransactionInput!
  ) {
    paymentTransactionsAdd(input: $input) {
      _id
      invoiceId
      paymentId
      paymentKind
      status
      response
    }
  }
`;

export type BmcOrderPaymentTransactionAddVariables = {
  input: PaymentTransactionInput;
};

export type BmcOrderPaymentTransactionAddData = {
  paymentTransactionsAdd: PaymentTransaction;
};

export const BMC_ORDER_INVOICE_UPDATE = gql`
  mutation BmcOrderInvoiceUpdate(
    $invoiceId: String!
    $input: InvoiceInput!
  ) {
    invoiceUpdate(_id: $invoiceId, input: $input) {
      _id
      invoiceNumber
      amount
      currency
      status
      contentType
      contentTypeId
      paymentIds
    }
  }
`;

export type BmcOrderInvoiceUpdateVariables = {
  invoiceId: string;
  input: InvoiceInput;
};

export type BmcOrderInvoiceUpdateData = {
  invoiceUpdate: BmcOrderInvoice;
};

export const BMC_ORDER_INVOICE_CHECK = gql`
  mutation BmcOrderInvoiceCheck($invoiceId: String!) {
    cpInvoicesCheck(_id: $invoiceId)
  }
`;

export type BmcOrderInvoiceCheckVariables = {
  invoiceId: string;
};

export type BmcOrderInvoiceCheckData = {
  cpInvoicesCheck: string;
};

export const BMC_ORDER_INVOICES_REMOVE = gql`
  mutation BmcOrderInvoicesRemove($invoiceIds: [String]!) {
    invoicesRemove(_ids: $invoiceIds)
  }
`;

export type BmcOrderInvoicesRemoveVariables = {
  invoiceIds: string[];
};

export type BmcOrderInvoicesRemoveData = {
  invoicesRemove: string;
};

export const BMC_ORDER_PAYMENT_ADD = gql`
  mutation BmcOrderPaymentAdd($input: PaymentInput!) {
    paymentAdd(input: $input) {
      _id
      name
      kind
      status
      config
    }
  }
`;

export type BmcOrderPaymentAddVariables = {
  input: PaymentInput;
};

export type BmcOrderPaymentAddData = {
  paymentAdd: PaymentMethod;
};

export const BMC_ORDER_PAYMENT_EDIT = gql`
  mutation BmcOrderPaymentEdit(
    $paymentId: String!
    $input: PaymentInput!
  ) {
    paymentEdit(_id: $paymentId, input: $input) {
      _id
      name
      kind
      status
      config
    }
  }
`;

export type BmcOrderPaymentEditVariables = {
  paymentId: string;
  input: PaymentInput;
};

export type BmcOrderPaymentEditData = {
  paymentEdit: PaymentMethod;
};

export const BMC_ORDER_PAYMENT_REMOVE = gql`
  mutation BmcOrderPaymentRemove($paymentIds: [String!]!) {
    paymentRemove(_ids: $paymentIds)
  }
`;

export type BmcOrderPaymentRemoveVariables = {
  paymentIds: string[];
};

export type BmcOrderPaymentRemoveData = {
  paymentRemove: string;
};
