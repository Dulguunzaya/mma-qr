"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  BMC_ORDER_INVOICE_CREATE,
  BMC_ORDER_INVOICE_CHECK,
  BMC_ORDER_PUBLIC_PAYMENT_METHODS,
  type BmcOrderInvoiceCreateData,
  type BmcOrderInvoiceCreateVariables,
  type BmcOrderInvoiceCheckData,
  type BmcOrderInvoiceCheckVariables,
  type BmcOrderPublicPaymentMethodsData,
  type BmcOrderPublicPaymentMethodsVariables,
} from "@/graphql/bms/payment";
import {
  CP_COMPANY_BILLING_DEAL_ADD,
  CP_COMPANY_BILLING_DEAL_CHANGE_STAGE,
  CP_SALES_STAGES,
  SALES_DEAL_INVOICE_CONTENT_TYPE,
  type CpCompanyBillingDealAddData,
  type CpCompanyBillingDealAddVariables,
  type CpCompanyBillingDealChangeStageData,
  type CpCompanyBillingDealChangeStageVariables,
  type CpSalesStagesData,
  type CpSalesStagesVariables,
  type SalesStage,
} from "@/graphql/sales/companyBilling";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/auth/AuthContext";
import CompanyBillingRequest from "./CompanyBillingRequest";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

const fieldClassName =
  "mt-2 h-11 w-full rounded-md border border-neutral-300 bg-white px-3.5 text-sm text-primary-900 shadow-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100";

const textAreaClassName =
  "mt-2 min-h-24 w-full resize-y rounded-md border border-neutral-300 bg-white px-3.5 py-3 text-sm text-primary-900 shadow-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100";

const MAX_TICKETS_PER_BOOKING = 10;

function formatMnt(value: number): string {
  const roundedValue = Math.round(value);
  const digits = String(Math.abs(roundedValue)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );

  return `${roundedValue < 0 ? "-" : ""}₮${digits}`;
}

const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONGOLIAN_MONTHS = [
  "нэгдүгээр",
  "хоёрдугаар",
  "гуравдугаар",
  "дөрөвдүгээр",
  "тавдугаар",
  "зургаадугаар",
  "долоодугаар",
  "наймдугаар",
  "есдүгээр",
  "аравдугаар",
  "арван нэгдүгээр",
  "арван хоёрдугаар",
];

function formatEventDate(value: string | undefined, locale: string): string {
  if (!value) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (
    !Number.isInteger(year) ||
    monthIndex < 0 ||
    monthIndex > 11 ||
    day < 1 ||
    day > 31
  ) {
    return value;
  }

  return locale === "mn"
    ? `${year} оны ${MONGOLIAN_MONTHS[monthIndex]} сарын ${day}`
    : `${ENGLISH_MONTHS[monthIndex]} ${day}, ${year}`;
}

function getIsoDateKey(value: string | undefined): string | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function getUlaanbaatarDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

function hasEventDatePassed(
  eventDate: string | undefined,
  now = new Date(),
): boolean {
  const eventDateKey = getIsoDateKey(eventDate);
  return eventDateKey !== null && eventDateKey < getUlaanbaatarDateKey(now);
}

export interface TicketBookingPayload {
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  booking: {
    billingType: "personal" | "company";
    companyRegistrationNumber?: string;
    quantity: number;
    specialRequirements?: string;
    paymentMethod: "qpay";
    termsAccepted: true;
    marketingConsent: boolean;
  };
  system: {
    event: {
      slug: string;
      title: string;
      date: string;
      time: string;
      venue: string;
    };
    pricing: {
      currency: "MNT";
      unitPrice: number;
      quantity: number;
      subtotal: number;
    };
    reservationId: string;
    orderIds: string[];
    dealId?: string;
    dealNumber?: string;
    pendingStageId?: string;
    paidStageId?: string;
    status: "pending_payment" | "paid";
    bookingTime: string;
    payment: {
      contentType: typeof SALES_DEAL_INVOICE_CONTENT_TYPE;
      invoiceId: string;
      invoiceNumber?: string;
      methodId: string;
      methodKind: string;
      qrImageSrc: string;
    };
  };
}

function normalizeCompanyRegistrationNumber(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

function isValidCompanyRegistrationNumber(value: string): boolean {
  return /^(?:\d{7}|\d{11}|\d{12}|\d{14}|[А-ЯЁӨҮ]{2}\d{8})$/u.test(
    normalizeCompanyRegistrationNumber(value),
  );
}

interface TicketBookingCardProps {
  companyBillingPipelineId: string;
  productId: string | undefined;
  eventDate?: string;
  eventLocation?: string;
  eventTime?: string;
  eventTitle: string;
  maxQuantity: number;
  personalBillingPipelineId: string;
  eventSlug: string;
  locale: string;
  termsLabel?: string;
  unitPrice: number | null;
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-primary-900">
      {label}
      {required && (
        <span className="ml-1 text-red-600" aria-hidden="true">
          *
        </span>
      )}
      {children}
    </label>
  );
}

function getValue(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

function getPaymentRedirectUri(locale: string, eventSlug: string): string {
  const path = `/${encodeURIComponent(locale)}/events/${encodeURIComponent(eventSlug)}`;
  return new URL(path, window.location.origin).toString();
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

const COMPANY_PENDING_STAGE_CODES = ["companypending"];
const COMPANY_PAID_STAGE_CODES = ["checking"];
const PERSONAL_PENDING_STAGE_CODES = ["personalpending"];

function normalizeStageCode(code: string | undefined): string {
  return (code ?? "").trim().toLowerCase();
}

function findStageByCodes(
  stages: SalesStage[] | undefined,
  codes: string[],
): SalesStage | undefined {
  return stages?.find((stage) =>
    codes.includes(normalizeStageCode(stage.code)),
  );
}

export default function TicketBookingCard({
  companyBillingPipelineId,
  productId,
  eventDate,
  eventLocation,
  eventTime,
  eventTitle,
  maxQuantity,
  personalBillingPipelineId,
  eventSlug,
  locale,
  termsLabel,
  unitPrice,
}: TicketBookingCardProps) {
  const t = useTranslations("ticketBooking");
  const eventT = useTranslations("eventTicket");
  const { user, loading: authLoading } = useAuth();
  const isCompanyAccount = user?.type === "company";
  const [isOpen, setIsOpen] = useState(false);
  const [guestBillingType, setGuestBillingType] = useState<
    "personal" | "company"
  >("personal");
  const billingType: "personal" | "company" = user
    ? isCompanyAccount
      ? "company"
      : "personal"
    : guestBillingType;
  const [quantity, setQuantity] = useState(1);
  const [eventHasPassed, setEventHasPassed] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [completedBooking, setCompletedBooking] =
    useState<TicketBookingPayload | null>(null);
  const [createInvoice] = useMutation<
    BmcOrderInvoiceCreateData,
    BmcOrderInvoiceCreateVariables
  >(BMC_ORDER_INVOICE_CREATE);
  const [checkInvoice] = useMutation<
    BmcOrderInvoiceCheckData,
    BmcOrderInvoiceCheckVariables
  >(BMC_ORDER_INVOICE_CHECK);
  const [addCompanyBillingDeal] = useMutation<
    CpCompanyBillingDealAddData,
    CpCompanyBillingDealAddVariables
  >(CP_COMPANY_BILLING_DEAL_ADD);
  const [changeCompanyBillingDealStage] = useMutation<
    CpCompanyBillingDealChangeStageData,
    CpCompanyBillingDealChangeStageVariables
  >(CP_COMPANY_BILLING_DEAL_CHANGE_STAGE);
  const {
    data: salesStagesData,
    loading: salesStagesLoading,
    error: salesStagesError,
  } = useQuery<CpSalesStagesData, CpSalesStagesVariables>(CP_SALES_STAGES, {
    variables: { pipelineId: companyBillingPipelineId },
    skip: !companyBillingPipelineId || unitPrice === null,
  });
  const {
    data: personalSalesStagesData,
    loading: personalSalesStagesLoading,
    error: personalSalesStagesError,
  } = useQuery<CpSalesStagesData, CpSalesStagesVariables>(CP_SALES_STAGES, {
    variables: { pipelineId: personalBillingPipelineId },
    skip: !personalBillingPipelineId || unitPrice === null,
  });
  const {
    data: paymentMethodsData,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = useQuery<
    BmcOrderPublicPaymentMethodsData,
    BmcOrderPublicPaymentMethodsVariables
  >(BMC_ORDER_PUBLIC_PAYMENT_METHODS, {
    variables: { currency: "MNT" },
    skip: unitPrice === null,
  });

  const ticketPrice =
    typeof unitPrice === "number" && Number.isFinite(unitPrice) && unitPrice > 0
      ? unitPrice
      : null;
  const ticketLimit = Math.min(
    MAX_TICKETS_PER_BOOKING,
    Math.max(1, Math.floor(maxQuantity)),
  );
  const subtotal = ticketPrice === null ? null : ticketPrice * quantity;
  const qpayMethod = paymentMethodsData?.paymentsPublic.find(
    (payment) => payment.kind.toLowerCase() === "qpayquickqr",
  );
  const pendingCompanyBillingStage = findStageByCodes(
    salesStagesData?.cpSalesStages,
    COMPANY_PENDING_STAGE_CODES,
  );
  const paidCompanyBillingStage = findStageByCodes(
    salesStagesData?.cpSalesStages,
    COMPANY_PAID_STAGE_CODES,
  );
  const companyBillingConfigured = Boolean(
    companyBillingPipelineId &&
    pendingCompanyBillingStage &&
    paidCompanyBillingStage,
  );
  const pendingPersonalBillingStage = findStageByCodes(
    personalSalesStagesData?.cpSalesStages,
    PERSONAL_PENDING_STAGE_CODES,
  );
  const personalBillingConfigured = Boolean(
    personalBillingPipelineId && pendingPersonalBillingStage,
  );
  const contactName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      ""
    : "";
  const hasContactInformation = Boolean(user?.email && user?.phone);
  const formattedUnitPrice =
    ticketPrice === null ? null : formatMnt(ticketPrice);
  const formattedSubtotal = subtotal === null ? null : formatMnt(subtotal);
  const formattedEventDate = formatEventDate(eventDate, locale);
  // Keep checkout disabled until the browser has evaluated today's date. Event
  // pages are statically generated, so a date computed in the server HTML can
  // become stale without a new deployment.
  const bookingUnavailable = ticketPrice === null || eventHasPassed !== false;

  useEffect(() => {
    const updateEventStatus = () =>
      setEventHasPassed(hasEventDatePassed(eventDate));

    updateEventStatus();
    const intervalId = window.setInterval(updateEventStatus, 60_000);
    return () => window.clearInterval(intervalId);
  }, [eventDate]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!completedBooking || completedBooking.system.status === "paid") {
      return;
    }

    const activeBooking = completedBooking;
    const invoiceId = activeBooking.system.payment.invoiceId;
    const reservationId = activeBooking.system.reservationId;
    let cancelled = false;
    let invoicePaid = false;
    let timeoutId: number | undefined;
    const stopCheckingAt = Date.now() + 15 * 60 * 1000;

    async function verifyPayment() {
      try {
        if (!invoicePaid) {
          const invoiceResult = await checkInvoice({
            variables: { invoiceId },
          });
          const invoiceStatus =
            invoiceResult.data?.cpInvoicesCheck.toLowerCase();

          invoicePaid = invoiceStatus === "paid";
        }

        if (invoicePaid) {
          if (activeBooking.booking.billingType === "company") {
            const dealId = activeBooking.system.dealId;
            const pendingStageId = activeBooking.system.pendingStageId;
            const paidStageId = activeBooking.system.paidStageId;
            if (!dealId || !pendingStageId || !paidStageId) {
              throw new Error("Billing stage configuration is missing");
            }

            const dealResult = await changeCompanyBillingDealStage({
              variables: {
                itemId: dealId,
                sourceStageId: pendingStageId,
                destinationStageId: paidStageId,
              },
            });

            if (dealResult.data?.cpDealsChange.stageId !== paidStageId) {
              throw new Error("Paid deal stage was not returned");
            }
          }

          if (!cancelled) {
            setCompletedBooking((current) => {
              if (!current || current.system.reservationId !== reservationId) {
                return current;
              }

              return {
                ...current,
                system: { ...current.system, status: "paid" },
              };
            });
          }
          return;
        }
      } catch {
        // Payment and order status checks are retried until the time limit.
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
  }, [changeCompanyBillingDealStage, checkInvoice, completedBooking]);

  function changeQuantity(amount: number) {
    setQuantity((current) =>
      Math.min(ticketLimit, Math.max(1, current + amount)),
    );
  }

  function openBooking() {
    if (ticketPrice === null || hasEventDatePassed(eventDate)) return;

    setCompletedBooking(null);
    setGuestBillingType("personal");
    setSubmitError("");
    setIsOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !user ||
      !hasContactInformation ||
      ticketPrice === null ||
      subtotal === null ||
      hasEventDatePassed(eventDate) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > ticketLimit ||
      isSubmitting
    ) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const bookingTime = new Date().toISOString();
    const specialRequirements =
      getValue(form, "specialRequirements") || undefined;
    const companyRegistrationNumber = normalizeCompanyRegistrationNumber(
      user.company?.code ?? "",
    );

    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (!qpayMethod) {
        throw new Error("QPay payment method is not configured");
      }

      if (
        billingType === "company" &&
        !isValidCompanyRegistrationNumber(companyRegistrationNumber)
      ) {
        throw new Error("Invalid company registration number");
      }

      if (!productId) {
        throw new Error("Billing product is not configured");
      }

      if (billingType === "company" && !companyBillingConfigured) {
        throw new Error("Company billing is not configured");
      }

      if (billingType === "personal" && !personalBillingConfigured) {
        throw new Error("Personal billing is not configured");
      }

      let reservationId = "";
      let orderIds: string[] = [];
      let dealId: string | undefined;
      let dealNumber: string | undefined;
      let pendingStageId: string | undefined;
      let paidStageId: string | undefined;
      const invoiceContentType = SALES_DEAL_INVOICE_CONTENT_TYPE;
      let invoiceCustomerId = user.erxesCustomerId ?? user._id;
      let invoiceCustomerType = "customer";
      const profileCompanyName =
        user.companyName ??
        (typeof user.propertiesData?.companyName === "string"
          ? user.propertiesData.companyName
          : undefined);

      if (billingType === "company") {
        const companyId = user.erxesCompanyId ?? undefined;

        pendingStageId = pendingCompanyBillingStage?._id;
        paidStageId = paidCompanyBillingStage?._id;

        if (!pendingStageId || !paidStageId) {
          throw new Error("Company billing is not configured");
        }

        const dealResult = await addCompanyBillingDeal({
          variables: {
            name: `${eventTitle} — ${
              profileCompanyName || companyRegistrationNumber
            }`,
            stageId: pendingStageId,
            customerIds: user.erxesCustomerId
              ? [user.erxesCustomerId]
              : undefined,
            companyIds: companyId ? [companyId] : undefined,
            description: [
              profileCompanyName ? `Company: ${profileCompanyName}` : "",
              `Company registration / TIN: ${companyRegistrationNumber}`,
              specialRequirements,
            ]
              .filter(Boolean)
              .join("\n"),
            productsData: [
              {
                productId,
                quantity,
                unitPrice: ticketPrice,
                amount: subtotal,
                currency: "MNT",
                tickUsed: true,
              },
            ],
            extraData: {
              billingType: "company",
              companyName: profileCompanyName,
              companyRegistrationNumber,
              erxesCompanyId: companyId,
              eventSlug,
              eventTitle,
              quantity,
              unitPrice: ticketPrice,
              amount: subtotal,
              currency: "MNT",
              contactEmail: user.email,
              contactPhone: user.phone,
            },
          },
        });
        const deal = dealResult.data?.cpDealsAdd;

        if (!deal?._id) {
          throw new Error("Sales deal was not returned");
        }

        reservationId = deal._id;
        dealId = deal._id;
        dealNumber = deal.number;
        if (companyId) {
          invoiceCustomerId = companyId;
          invoiceCustomerType = "company";
        }
      } else {
        pendingStageId = pendingPersonalBillingStage?._id;

        if (!pendingStageId) {
          throw new Error("Personal billing is not configured");
        }

        const dealResult = await addCompanyBillingDeal({
          variables: {
            name: `${eventTitle} — ${contactName || user.email || user.phone}`,
            stageId: pendingStageId,
            customerIds: user.erxesCustomerId
              ? [user.erxesCustomerId]
              : undefined,
            description: specialRequirements,
            productsData: [
              {
                productId,
                quantity,
                unitPrice: ticketPrice,
                amount: subtotal,
                currency: "MNT",
                tickUsed: true,
              },
            ],
            extraData: {
              billingType: "personal",
              pipelineId: personalBillingPipelineId,
              eventSlug,
              eventTitle,
              quantity,
              unitPrice: ticketPrice,
              amount: subtotal,
              currency: "MNT",
              contactEmail: user.email,
              contactPhone: user.phone,
            },
          },
        });
        const deal = dealResult.data?.cpDealsAdd;

        if (!deal?._id) {
          throw new Error("Sales deal was not returned");
        }

        reservationId = deal._id;
        orderIds = [deal._id];
        dealId = deal._id;
        dealNumber = deal.number;
      }

      const invoiceResult = await createInvoice({
        variables: {
          input: {
            amount: subtotal,
            currency: "MNT",
            phone: user.phone ?? undefined,
            email: user.email ?? undefined,
            description:
              billingType === "company"
                ? `${eventTitle} — ${
                    profileCompanyName || companyRegistrationNumber
                  } — company billing`
                : `${eventTitle} — ${quantity} ticket${quantity === 1 ? "" : "s"}`,
            contentType: invoiceContentType,
            contentTypeId: reservationId,
            paymentIds: [qpayMethod._id],
            customerId: invoiceCustomerId,
            customerType: invoiceCustomerType,
            redirectUri: getPaymentRedirectUri(locale, eventSlug),
            data: {
              eventSlug,
              quantity,
              unitPrice: ticketPrice,
              billingType,
              companyName:
                billingType === "company" ? profileCompanyName : undefined,
              companyRegistrationNumber:
                billingType === "company"
                  ? companyRegistrationNumber
                  : undefined,
              productId,
              pendingStageId,
              paidStageId,
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
          (candidate) => candidate.paymentId === qpayMethod._id,
        ) ?? invoice.transactions?.[0];
      const qrImageSrc = getQpayQrImageSrc(transaction?.response);

      if (!transaction?._id || !qrImageSrc) {
        throw new Error("QPay QR image was not returned");
      }

      const payload: TicketBookingPayload = {
        customer: {
          fullName:
            contactName ||
            (billingType === "company" ? (profileCompanyName ?? "") : ""),
          email: user.email ?? "",
          phone: user.phone ?? "",
        },
        booking: {
          billingType,
          companyRegistrationNumber:
            billingType === "company" ? companyRegistrationNumber : undefined,
          quantity,
          specialRequirements,
          paymentMethod: "qpay",
          termsAccepted: true,
          marketingConsent: form.get("marketingConsent") === "on",
        },
        system: {
          event: {
            slug: eventSlug,
            title: eventTitle,
            date: eventDate ?? "",
            time: eventTime ?? "",
            venue: eventLocation ?? "",
          },
          pricing: {
            currency: "MNT",
            unitPrice: ticketPrice,
            quantity,
            subtotal,
          },
          reservationId,
          orderIds,
          dealId,
          dealNumber,
          pendingStageId,
          paidStageId,
          status: "pending_payment",
          bookingTime,
          payment: {
            contentType: invoiceContentType,
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            methodId: qpayMethod._id,
            methodKind: qpayMethod.kind,
            qrImageSrc,
          },
        },
      };

      window.dispatchEvent(
        new CustomEvent<TicketBookingPayload>("mma:ticket-booking-ready", {
          detail: payload,
        }),
      );
      setCompletedBooking(payload);
    } catch (error) {
      setSubmitError(
        error instanceof Error &&
          error.message === "QPay payment method is not configured"
          ? t("paymentConfigurationError")
          : error instanceof Error &&
              error.message === "Billing product is not configured"
            ? t("productConfigurationError")
            : error instanceof Error &&
                error.message === "Invalid company registration number"
              ? t("companyRegistrationError")
              : error instanceof Error &&
                  error.message === "Company billing is not configured"
                ? t("companyBillingConfigurationError")
                : error instanceof Error &&
                    error.message === "Personal billing is not configured"
                  ? t("personalBillingConfigurationError")
                  : t("orderError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <aside className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between bg-primary-800 px-6 py-4 text-white">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Ticket className="h-4 w-4 text-accent-300" aria-hidden="true" />
              {eventT("ticket")}
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-100">
              <span
                className={`h-2 w-2 rounded-full ${
                  bookingUnavailable ? "bg-neutral-400" : "bg-emerald-400"
                }`}
                aria-hidden="true"
              />
              {eventHasPassed === true
                ? eventT("eventEnded")
                : ticketPrice === null
                  ? eventT("pricingPending")
                  : eventT("available")}
            </span>
          </div>

          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">
              {eventT("startingFrom")}
            </p>
            {formattedUnitPrice ? (
              <div className="mt-1 flex items-end gap-2">
                <span className="text-3xl font-semibold tracking-tight text-primary-900">
                  {formattedUnitPrice}
                </span>
                <span className="pb-1 text-sm text-neutral-500">
                  {eventT("perPerson")}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-base font-semibold leading-6 text-primary-900">
                {eventT("priceUnavailable")}
              </p>
            )}

            <dl className="mt-6 space-y-4 border-y border-neutral-200 py-5">
              <div className="grid grid-cols-[20px_1fr] gap-3">
                <CalendarDays
                  className="mt-0.5 h-5 w-5 text-accent-700"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">
                    {eventT("date")}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-primary-900">
                    {formattedEventDate || eventT("dateUnavailable")}
                  </dd>
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] gap-3">
                <Clock3
                  className="mt-0.5 h-5 w-5 text-accent-700"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">
                    {eventT("time")}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-primary-900">
                    {eventTime || eventT("timeUnavailable")}
                  </dd>
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] gap-3">
                <MapPin
                  className="mt-0.5 h-5 w-5 text-accent-700"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">
                    {eventT("venue")}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-6 text-primary-900">
                    {eventLocation || eventT("locationUnavailable")}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  {eventT("quantity")}
                </p>
                <div className="mt-2 inline-flex items-center overflow-hidden rounded-md border border-neutral-300 bg-white">
                  <button
                    type="button"
                    onClick={() => changeQuantity(-1)}
                    disabled={bookingUnavailable || quantity === 1}
                    aria-label={eventT("decrease")}
                    className="flex h-10 w-10 items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="flex h-10 min-w-10 items-center justify-center border-x border-neutral-300 text-sm font-semibold text-primary-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(1)}
                    disabled={bookingUnavailable || quantity === ticketLimit}
                    aria-label={eventT("increase")}
                    className="flex h-10 w-10 items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  {eventT("subtotal")}
                </p>
                <p className="mt-2 text-lg font-semibold text-primary-900">
                  {formattedSubtotal ?? "—"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openBooking}
              disabled={bookingUnavailable}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary-700 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-800 hover:shadow-md disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 disabled:shadow-none disabled:hover:translate-y-0"
            >
              {eventHasPassed === true
                ? eventT("registrationClosed")
                : ticketPrice === null
                  ? eventT("ticketsUnavailable")
                  : eventT("buyTicket")}
              {!bookingUnavailable && <span aria-hidden="true">→</span>}
            </button>

            <div className="mt-4 flex items-start gap-2.5 rounded-md bg-neutral-100/70 px-3 py-3">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-primary-600"
                aria-hidden="true"
              />
              <p className="text-xs leading-5 text-neutral-500">
                {eventHasPassed === true
                  ? eventT("eventEndedNote")
                  : ticketPrice === null
                    ? eventT("priceUnavailableNote")
                    : eventT("checkoutNote")}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
          {eventT("support")}
        </p>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-primary-900/70 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-dialog-title"
            className="relative flex max-h-[96dvh] w-full max-w-[1040px] flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl sm:max-h-[90dvh] sm:rounded-xl"
          >
            <div className="flex items-start justify-between gap-6 border-b border-neutral-200 bg-white px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-700">
                  {t("eyebrow")}
                </p>
                <h2
                  id="ticket-dialog-title"
                  className="mt-1 text-xl font-semibold text-primary-900 sm:text-2xl"
                >
                  {completedBooking?.booking.billingType === "company"
                    ? t("companyBillingReadyTitle")
                    : completedBooking
                      ? t("readyTitle")
                      : t("title")}
                </h2>
                <p className="mt-1 line-clamp-1 text-sm text-neutral-500">
                  {eventTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t("close")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {completedBooking ? (
              <div className="overflow-y-auto px-5 py-8 sm:px-8 sm:py-10">
                {completedBooking.booking.billingType === "company" ? (
                  <CompanyBillingRequest
                    booking={completedBooking}
                    locale={locale}
                  />
                ) : (
                  <div className="mx-auto max-w-2xl text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-2xl font-semibold text-primary-900">
                      {t("readyHeading")}
                    </h3>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-500">
                      {t("readyDescription", {
                        count: completedBooking.booking.quantity,
                      })}
                    </p>

                    <div className="mt-8 grid overflow-hidden rounded-lg border border-neutral-200 bg-white text-left sm:grid-cols-[1fr_180px]">
                      <dl className="divide-y divide-neutral-200 px-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4 py-4">
                          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            {t("reservationId")}
                          </dt>
                          <dd className="text-right text-sm font-semibold text-primary-900">
                            <ul className="space-y-1">
                              {completedBooking.system.orderIds.map(
                                (orderId) => (
                                  <li key={orderId}>{orderId}</li>
                                ),
                              )}
                            </ul>
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-4">
                          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            {t("status")}
                          </dt>
                          <dd
                            className={
                              completedBooking.system.status === "paid"
                                ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                : "rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700"
                            }
                          >
                            {completedBooking.system.status === "paid"
                              ? t("paid")
                              : t("pendingPayment")}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-4">
                          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            {t("bookingTime")}
                          </dt>
                          <dd className="text-sm font-semibold text-primary-900">
                            {new Intl.DateTimeFormat(
                              locale === "mn" ? "mn-MN" : "en-US",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              },
                            ).format(
                              new Date(completedBooking.system.bookingTime),
                            )}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-4">
                          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            {eventT("subtotal")}
                          </dt>
                          <dd className="text-base font-semibold text-primary-900">
                            {formattedSubtotal}
                          </dd>
                        </div>
                      </dl>
                      <div className="flex flex-col items-center justify-center border-t border-neutral-200 bg-neutral-100/60 p-6 sm:border-l sm:border-t-0">
                        {completedBooking.system.status === "paid" ? (
                          <CheckCircle2
                            className="h-20 w-20 text-emerald-600"
                            aria-hidden="true"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- QPay supplies a one-time data URL.
                          <img
                            src={completedBooking.system.payment.qrImageSrc}
                            alt={t("qpayQrAlt")}
                            width={160}
                            height={160}
                            className="h-40 w-40 rounded-md bg-white object-contain"
                          />
                        )}
                        <p className="mt-3 text-center text-xs font-semibold text-neutral-500">
                          {completedBooking.system.status === "paid"
                            ? t("paymentConfirmed")
                            : t("qrPrepared")}
                        </p>
                      </div>
                      {completedBooking.system.status !== "paid" && (
                        <div className="border-t border-primary-100 bg-primary-50 px-5 py-4 sm:col-span-2">
                          <p className="text-center text-sm font-semibold leading-6 text-primary-800">
                            {t("qrTicketNotice")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_300px]"
              >
                <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
                  <p className="text-sm leading-6 text-neutral-500">
                    {t("requiredHint")}
                  </p>

                  <section className="mt-7">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-primary-900">
                        {t("contactSection")}
                      </h3>
                      <Link
                        href="/account"
                        className="text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
                      >
                        {t("editContact")}
                      </Link>
                    </div>
                    <div className="mt-5 rounded-lg border border-neutral-200 bg-white p-4 sm:p-5">
                      {authLoading ? (
                        <p className="text-sm text-neutral-500">
                          {t("loadingContact")}
                        </p>
                      ) : user ? (
                        <>
                          <dl className="grid gap-4 sm:grid-cols-3">
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">
                                {t("fullName")}
                              </dt>
                              <dd className="mt-1 text-sm font-semibold text-primary-900">
                                {contactName || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">
                                {t("email")}
                              </dt>
                              <dd className="mt-1 break-all text-sm font-semibold text-primary-900">
                                {user.email || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">
                                {t("phone")}
                              </dt>
                              <dd className="mt-1 text-sm font-semibold text-primary-900">
                                {user.phone || "—"}
                              </dd>
                            </div>
                            {user.company?.code && (
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">
                                  {t("companyRegistrationNumber")}
                                </dt>
                                <dd className="mt-1 text-sm font-semibold text-primary-900">
                                  {user.company.primaryName
                                    ? `${user.company.primaryName} — ${user.company.code}`
                                    : user.company.code}
                                </dd>
                              </div>
                            )}
                          </dl>
                          {!hasContactInformation && (
                            <p className="mt-4 text-sm text-amber-700">
                              {t("contactIncomplete")}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm leading-6 text-neutral-500">
                          {t("signInForContact")}
                        </p>
                      )}
                    </div>
                  </section>

                  <fieldset className="mt-9 border-t border-neutral-200 pt-8">
                    <legend className="text-lg font-semibold text-primary-900">
                      {t("ticketSection")}
                    </legend>
                    <div className="mt-5">
                      <FormField label={t("ticketCount")} required>
                        <select
                          name="quantity"
                          value={quantity}
                          onChange={(event) =>
                            setQuantity(Number(event.target.value))
                          }
                          required
                          className={fieldClassName}
                        >
                          {Array.from(
                            { length: ticketLimit },
                            (_, index) => index + 1,
                          ).map((count) => (
                            <option key={count} value={count}>
                              {count}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    <div className="mt-5">
                      <FormField label={t("specialRequirements")}>
                        <textarea
                          name="specialRequirements"
                          placeholder={t("specialRequirementsPlaceholder")}
                          maxLength={1000}
                          className={textAreaClassName}
                        />
                      </FormField>
                    </div>
                  </fieldset>

                  <fieldset className="mt-9 border-t border-neutral-200 pt-8">
                    <legend className="text-lg font-semibold text-primary-900">
                      {t("paymentSection")}
                    </legend>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:items-start">
                      <div className="grid gap-3">
                        {(!user || !isCompanyAccount) && (
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                              billingType === "personal"
                                ? "border-primary-700 bg-primary-50"
                                : "border-neutral-200 bg-white hover:border-neutral-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="billingType"
                              value="personal"
                              checked={billingType === "personal"}
                              onChange={() => setGuestBillingType("personal")}
                              className="sr-only"
                            />
                            <UserRound
                              className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                              aria-hidden="true"
                            />
                            <span>
                              <span className="block text-sm font-semibold text-primary-900">
                                {t("personalPayment")}
                              </span>
                              <span className="mt-0.5 block text-xs leading-5 text-neutral-500">
                                {t("personalPaymentDescription")}
                              </span>
                            </span>
                          </label>
                        )}
                        {(!user || isCompanyAccount) && (
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                              billingType === "company"
                                ? "border-primary-700 bg-primary-50"
                                : "border-neutral-200 bg-white hover:border-neutral-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="billingType"
                              value="company"
                              checked={billingType === "company"}
                              onChange={() => setGuestBillingType("company")}
                              className="sr-only"
                            />
                            <Building2
                              className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                              aria-hidden="true"
                            />
                            <span>
                              <span className="block text-sm font-semibold text-primary-900">
                                {t("companyBilling")}
                              </span>
                              <span className="mt-0.5 block text-xs leading-5 text-neutral-500">
                                {t("companyBillingDescription")}
                              </span>
                            </span>
                          </label>
                        )}
                        {billingType === "personal" && (
                          <div className="flex items-center gap-3 rounded-lg bg-neutral-100/70 px-3 py-2.5">
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary-700"
                              aria-hidden="true"
                            >
                              <span className="h-2.5 w-2.5 rounded-full bg-primary-700" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-primary-900">
                                {t("qpay")}
                              </span>
                              <span className="mt-0.5 block text-xs text-neutral-500">
                                {t("qpayOnly")}
                              </span>
                            </span>
                          </div>
                        )}
                        {billingType === "company" &&
                          user &&
                          !user.company?.code && (
                            <div className="rounded-lg border border-neutral-200 bg-white p-3">
                              <p className="text-xs leading-5 text-neutral-600">
                                {t("companyCodeMissing")}
                              </p>
                              <Link
                                href="/account"
                                className="mt-2 inline-flex rounded-md border border-primary-700 px-2.5 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-50"
                              >
                                {t("companyCodeMissingAction")}
                              </Link>
                            </div>
                          )}
                      </div>
                      <div className="grid gap-3">
                        {isCompanyAccount && (
                          <div className="flex items-start gap-3 rounded-lg bg-neutral-100/70 px-3 py-2.5">
                            <UserRound
                              className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                              aria-hidden="true"
                            />
                            <p className="text-xs leading-5 text-neutral-600">
                              {t("companyAccountBillingNote")}
                            </p>
                          </div>
                        )}
                        {user && !isCompanyAccount && (
                          <div className="flex items-start gap-3 rounded-lg bg-neutral-100/70 px-3 py-2.5">
                            <Building2
                              className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                              aria-hidden="true"
                            />
                            <p className="text-xs leading-5 text-neutral-600">
                              {t("personalAccountBillingNote")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="mt-9 space-y-4 border-t border-neutral-200 pt-8">
                    <legend className="sr-only">{t("consentSection")}</legend>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        name="termsAccepted"
                        type="checkbox"
                        required
                        className="mt-1 h-4 w-4 shrink-0 rounded accent-primary-700"
                      />
                      <span className="text-sm leading-6 text-neutral-600">
                        {termsLabel ?? t("terms")}
                        <span className="ml-1 text-red-600" aria-hidden="true">
                          *
                        </span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        name="marketingConsent"
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 rounded accent-primary-700"
                      />
                      <span className="text-sm leading-6 text-neutral-600">
                        {t("marketingConsent")}
                      </span>
                    </label>
                  </fieldset>
                </div>

                <div className="border-t border-neutral-200 bg-primary-50/60 p-5 sm:p-6 lg:border-l lg:border-t-0">
                  <div className="lg:sticky lg:top-0">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-primary-900">
                      {t("orderSummary")}
                    </h3>
                    <div className="mt-5 rounded-lg border border-neutral-200 bg-white p-4">
                      <p className="text-sm font-semibold leading-6 text-primary-900">
                        {eventTitle}
                      </p>
                      <dl className="mt-4 space-y-3 text-xs">
                        <div className="flex justify-between gap-3">
                          <dt className="text-neutral-500">{eventT("date")}</dt>
                          <dd className="text-right font-semibold text-primary-900">
                            {formattedEventDate || eventT("dateUnavailable")}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-neutral-500">
                            {t("billingType")}
                          </dt>
                          <dd className="text-right font-semibold text-primary-900">
                            {billingType === "company"
                              ? t("companyBilling")
                              : t("personalPayment")}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-neutral-500">{eventT("time")}</dt>
                          <dd className="text-right font-semibold text-primary-900">
                            {eventTime || eventT("timeUnavailable")}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-neutral-500">
                            {eventT("venue")}
                          </dt>
                          <dd className="text-right font-semibold text-primary-900">
                            {eventLocation || eventT("locationUnavailable")}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-neutral-500">
                            {t("ticketCount")}
                          </dt>
                          <dd className="font-semibold text-primary-900">
                            {quantity}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-neutral-200 pt-3">
                          <dt className="font-semibold text-primary-900">
                            {eventT("subtotal")}
                          </dt>
                          <dd className="text-base font-semibold text-primary-900">
                            {formattedSubtotal ?? "—"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        authLoading ||
                        paymentMethodsLoading ||
                        salesStagesLoading ||
                        personalSalesStagesLoading ||
                        !user ||
                        !hasContactInformation ||
                        (billingType === "personal" &&
                          !personalBillingConfigured) ||
                        (billingType === "company" &&
                          !companyBillingConfigured) ||
                        bookingUnavailable ||
                        !qpayMethod ||
                        isSubmitting
                      }
                      className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary-700 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {isSubmitting
                        ? t("submittingOrder")
                        : billingType === "company"
                          ? t("createBillingRequest")
                          : t("prepareBooking")}
                      <span aria-hidden="true">→</span>
                    </button>
                    {submitError && (
                      <p
                        role="alert"
                        className="mt-3 text-center text-sm text-red-600"
                      >
                        {submitError}
                      </p>
                    )}
                    {billingType === "personal" &&
                      (personalSalesStagesError ||
                        (!personalSalesStagesLoading &&
                          !personalBillingConfigured)) && (
                        <p
                          role="alert"
                          className="mt-3 text-center text-sm text-red-600"
                        >
                          {t("personalBillingConfigurationError")}
                        </p>
                      )}
                    {billingType === "company" &&
                      (salesStagesError ||
                        (!salesStagesLoading && !companyBillingConfigured)) && (
                        <p
                          role="alert"
                          className="mt-3 text-center text-sm text-red-600"
                        >
                          {t("companyBillingConfigurationError")}
                        </p>
                      )}
                    {(paymentMethodsError ||
                      (!paymentMethodsLoading && !qpayMethod)) && (
                      <p
                        role="alert"
                        className="mt-3 text-center text-sm text-red-600"
                      >
                        {t("paymentConfigurationError")}
                      </p>
                    )}
                    <p className="mt-3 text-center text-[11px] leading-5 text-neutral-500">
                      {billingType === "company"
                        ? t("companyBillingNote")
                        : t("noChargeNote")}
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
