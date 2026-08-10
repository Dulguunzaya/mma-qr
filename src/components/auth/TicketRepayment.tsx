"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  BMC_ORDER_INVOICE_CHECK,
  BMC_ORDER_INVOICE_CREATE,
  BMC_ORDER_PUBLIC_PAYMENT_METHODS,
  SALES_DEAL_INVOICES,
  type BmcOrderInvoiceCheckData,
  type BmcOrderInvoiceCheckVariables,
  type BmcOrderInvoiceCreateData,
  type BmcOrderInvoiceCreateVariables,
  type BmcOrderPublicPaymentMethodsData,
  type BmcOrderPublicPaymentMethodsVariables,
  type SalesDealInvoicesData,
  type SalesDealInvoicesVariables,
} from "@/graphql/bms/payment";
import {
  CP_COMPANY_BILLING_DEAL_CHANGE_STAGE,
  CP_SALES_STAGES,
  SALES_DEAL_INVOICE_CONTENT_TYPE,
  type CpCompanyBillingDealChangeStageData,
  type CpCompanyBillingDealChangeStageVariables,
  type CpSalesStagesData,
  type CpSalesStagesVariables,
  type MyTicketDeal,
  type SalesStage,
} from "@/graphql/sales/companyBilling";
import { useAuth } from "@/lib/auth/AuthContext";

const PAID_STAGE_CODE_FALLBACKS = [
  "checking",
  "personalpaid",
  "paid",
  "confirmed",
];

const REUSABLE_INVOICE_MAX_AGE_MS = 10 * 60 * 1000;

type DealInvoice = {
  _id: string;
  status?: string;
  createdAt?: string;
  transactions?: { paymentId?: string; response?: unknown }[];
};

function findReusableInvoice(
  invoices: DealInvoice[],
  paymentId: string,
): { _id: string; qrImageSrc: string } | undefined {
  const freshPending = invoices
    .filter((invoice) => {
      if (invoice.status?.toLowerCase() !== "pending") return false;
      const createdAt = invoice.createdAt ? Date.parse(invoice.createdAt) : NaN;
      return (
        Number.isFinite(createdAt) &&
        Date.now() - createdAt < REUSABLE_INVOICE_MAX_AGE_MS
      );
    })
    .sort(
      (a, b) => Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? ""),
    );

  for (const invoice of freshPending) {
    const transaction =
      invoice.transactions?.find(
        (candidate) => candidate.paymentId === paymentId,
      ) ?? invoice.transactions?.[0];
    const qrImageSrc = getQpayQrImageSrc(transaction?.response);
    if (qrImageSrc) return { _id: invoice._id, qrImageSrc };
  }

  return undefined;
}

function formatMnt(value: number): string {
  const roundedValue = Math.round(value);
  const digits = String(Math.abs(roundedValue)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );

  return `${roundedValue < 0 ? "-" : ""}₮${digits}`;
}

function getQpayQrImageSrc(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;

  const qrData = Reflect.get(response, "qrData");
  if (typeof qrData !== "string") return null;

  const source = qrData.trim();
  if (source.length > 2_000_000) return null;

  if (/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=\s]+$/i.test(source)) {
    return source;
  }

  try {
    const url = new URL(source);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function findPaidStage(
  stages: SalesStage[] | undefined,
  pendingCode: string | undefined,
): SalesStage | undefined {
  const normalizedPending = (pendingCode ?? "").trim().toLowerCase();
  const candidates = normalizedPending
    ? [
        normalizedPending.replace("pending", "paid"),
        ...PAID_STAGE_CODE_FALLBACKS,
      ]
    : PAID_STAGE_CODE_FALLBACKS;

  for (const code of candidates) {
    const stage = stages?.find(
      (candidate) => (candidate.code ?? "").trim().toLowerCase() === code,
    );
    if (stage) return stage;
  }

  return undefined;
}

type ActivePayment = {
  invoiceId: string;
  qrImageSrc: string;
};

interface TicketRepaymentProps {
  deal: MyTicketDeal;
  amount?: number;
  quantity: number;
  title: string;
  slug?: string;
  onPaid: () => void;
}

export function TicketRepayment({
  deal,
  amount,
  quantity,
  title,
  slug,
  onPaid,
}: TicketRepaymentProps) {
  const t = useTranslations("auth");
  const bookingT = useTranslations("ticketBooking");
  const locale = useLocale();
  const { user } = useAuth();
  const [phase, setPhase] = useState<"idle" | "preparing" | "paying" | "paid">(
    "idle",
  );
  const [payment, setPayment] = useState<ActivePayment | null>(null);
  const [error, setError] = useState("");
  const onPaidRef = useRef(onPaid);

  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  const pipelineId = deal.stage?.pipelineId;
  const { data: stagesData, loading: stagesLoading } = useQuery<
    CpSalesStagesData,
    CpSalesStagesVariables
  >(CP_SALES_STAGES, {
    variables: { pipelineId: pipelineId ?? "" },
    skip: !pipelineId,
  });
  const { data: paymentMethodsData, loading: paymentMethodsLoading } = useQuery<
    BmcOrderPublicPaymentMethodsData,
    BmcOrderPublicPaymentMethodsVariables
  >(BMC_ORDER_PUBLIC_PAYMENT_METHODS, {
    variables: { currency: "MNT" },
    skip: amount === undefined,
  });
  const { refetch: refetchDealInvoices } = useQuery<
    SalesDealInvoicesData,
    SalesDealInvoicesVariables
  >(SALES_DEAL_INVOICES, {
    variables: { dealId: deal._id },
    skip: true,
  });
  const [createInvoice] = useMutation<
    BmcOrderInvoiceCreateData,
    BmcOrderInvoiceCreateVariables
  >(BMC_ORDER_INVOICE_CREATE);
  const [checkInvoice] = useMutation<
    BmcOrderInvoiceCheckData,
    BmcOrderInvoiceCheckVariables
  >(BMC_ORDER_INVOICE_CHECK);
  const [changeDealStage] = useMutation<
    CpCompanyBillingDealChangeStageData,
    CpCompanyBillingDealChangeStageVariables
  >(CP_COMPANY_BILLING_DEAL_CHANGE_STAGE);

  const qpayMethod = paymentMethodsData?.paymentsPublic.find(
    (method) => method.kind.toLowerCase() === "qpayquickqr",
  );
  const isPersonalBilling = deal.extraData?.billingType === "personal";
  const paidStage = findPaidStage(stagesData?.cpSalesStages, deal.stage?.code);
  const configured = Boolean(
    user &&
      amount !== undefined &&
      qpayMethod &&
      (isPersonalBilling || (paidStage && deal.stage?._id)),
  );
  const isReady = configured && !stagesLoading && !paymentMethodsLoading;

  useEffect(() => {
    if (phase !== "paying" && phase !== "paid") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPhase("idle");
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "paying" || !payment) return;

    const activePayment = payment;
    const sourceStageId = deal.stage?._id;
    const destinationStageId = paidStage?._id;
    let cancelled = false;
    let invoicePaid = false;
    let timeoutId: number | undefined;
    const stopCheckingAt = Date.now() + 15 * 60 * 1000;

    async function verifyPayment() {
      try {
        if (!invoicePaid) {
          const invoiceResult = await checkInvoice({
            variables: { invoiceId: activePayment.invoiceId },
          });
          invoicePaid =
            invoiceResult.data?.cpInvoicesCheck.toLowerCase() === "paid";
        }

        if (invoicePaid) {
          if (!isPersonalBilling) {
            if (!sourceStageId || !destinationStageId) {
              throw new Error("Billing stage configuration is missing");
            }

            const dealResult = await changeDealStage({
              variables: {
                itemId: deal._id,
                sourceStageId,
                destinationStageId,
              },
            });

            if (dealResult.data?.cpDealsChange.stageId !== destinationStageId) {
              throw new Error("Paid deal stage was not returned");
            }
          }

          if (!cancelled) {
            setPhase("paid");
            onPaidRef.current();
          }
          return;
        }
      } catch {
        // Payment and stage checks are retried until the time limit.
      }

      if (!cancelled && Date.now() < stopCheckingAt) {
        timeoutId = window.setTimeout(verifyPayment, 5_000);
      }
    }

    timeoutId = window.setTimeout(verifyPayment, 2_000);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [
    phase,
    payment,
    checkInvoice,
    changeDealStage,
    deal._id,
    deal.stage?._id,
    isPersonalBilling,
    paidStage?._id,
  ]);

  async function startRepayment() {
    if (!isReady || phase === "preparing") return;

    setPhase("preparing");
    setError("");

    try {
      const invoicesResult = await refetchDealInvoices({ dealId: deal._id });
      const alreadyPaid = invoicesResult.data?.cpInvoices.list?.some(
        (invoice) => invoice.status?.toLowerCase() === "paid",
      );

      if (alreadyPaid) {
        if (!isPersonalBilling) {
          const dealResult = await changeDealStage({
            variables: {
              itemId: deal._id,
              sourceStageId: deal.stage?._id,
              destinationStageId: paidStage?._id ?? "",
            },
          });

          if (dealResult.data?.cpDealsChange.stageId !== paidStage?._id) {
            throw new Error("Paid deal stage was not returned");
          }
        }

        setPhase("idle");
        onPaidRef.current();
        return;
      }

      const reusable = findReusableInvoice(
        invoicesResult.data?.cpInvoices.list ?? [],
        qpayMethod?._id ?? "",
      );

      if (reusable) {
        setPayment({ invoiceId: reusable._id, qrImageSrc: reusable.qrImageSrc });
        setPhase("paying");
        return;
      }

      const companyId =
        typeof deal.extraData?.erxesCompanyId === "string" &&
        deal.extraData.erxesCompanyId.trim()
          ? deal.extraData.erxesCompanyId.trim()
          : undefined;
      const invoiceResult = await createInvoice({
        variables: {
          input: {
            amount: amount ?? 0,
            currency: "MNT",
            phone: user?.phone ?? undefined,
            email: user?.email ?? undefined,
            description:
              deal.name ??
              `${title} — ${quantity} ticket${quantity === 1 ? "" : "s"}`,
            contentType: SALES_DEAL_INVOICE_CONTENT_TYPE,
            contentTypeId: deal._id,
            paymentIds: [qpayMethod?._id ?? ""],
            customerId: companyId ?? user?.erxesCustomerId ?? user?._id,
            customerType: companyId ? "company" : "customer",
            redirectUri: new URL(
              slug
                ? `/${encodeURIComponent(locale)}/events/${encodeURIComponent(slug)}`
                : `/${encodeURIComponent(locale)}/account`,
              window.location.origin,
            ).toString(),
            data: {
              dealId: deal._id,
              eventSlug: slug,
              quantity,
              amount,
              pendingStageId: deal.stage?._id,
              paidStageId: paidStage?._id,
            },
          },
        },
      });
      const invoice = invoiceResult.data?.cpInvoiceCreate;

      if (!invoice?._id) {
        throw new Error("Invoice was not returned");
      }

      const transaction =
        invoice.transactions?.find(
          (candidate) => candidate.paymentId === qpayMethod?._id,
        ) ?? invoice.transactions?.[0];
      const qrImageSrc = getQpayQrImageSrc(transaction?.response);

      if (!qrImageSrc) {
        throw new Error("QPay QR image was not returned");
      }

      setPayment({ invoiceId: invoice._id, qrImageSrc });
      setPhase("paying");
    } catch {
      setPhase("idle");
      setError(t("payAgainError"));
    }
  }

  return (
    <>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <button
          type="button"
          onClick={startRepayment}
          disabled={!isReady || phase === "preparing"}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary-700 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
        >
          {phase === "preparing" && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          )}
          {phase === "preparing" ? t("payAgainPreparing") : t("payAgain")}
        </button>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      {(phase === "paying" || phase === "paid") && payment && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label={t("payAgainClose")}
            onClick={() => setPhase("idle")}
            className="absolute inset-0 bg-primary-900/70 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-repayment-title"
            className="relative flex max-h-[96dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl sm:rounded-xl"
          >
            <div className="flex items-start justify-between gap-6 border-b border-neutral-200 bg-white px-5 py-4">
              <div>
                <h2
                  id="ticket-repayment-title"
                  className="text-lg font-semibold text-primary-900"
                >
                  {t("payAgainTitle")}
                </h2>
                <p className="mt-1 line-clamp-1 text-sm text-neutral-500">
                  {title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPhase("idle")}
                aria-label={t("payAgainClose")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col items-center px-5 py-8 text-center">
              {phase === "paid" ? (
                <>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-emerald-700">
                    {bookingT("paymentConfirmed")}
                  </p>
                </>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- QPay supplies a one-time data URL. */}
                  <img
                    src={payment.qrImageSrc}
                    alt={bookingT("qpayQrAlt")}
                    width={192}
                    height={192}
                    className="h-48 w-48 rounded-md border border-neutral-200 bg-white object-contain"
                  />
                  <p className="mt-4 text-sm font-semibold text-neutral-600">
                    {bookingT("qrPrepared")}
                  </p>
                  {amount !== undefined && (
                    <p className="mt-2 text-lg font-semibold text-primary-900">
                      {formatMnt(amount)}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                    {bookingT("pendingPayment")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
