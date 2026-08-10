"use client";

import Image from "next/image";
import { CheckCircle2, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TicketBookingPayload } from "./TicketBookingCard";

type CompanyBillingRequestProps = {
  booking: TicketBookingPayload;
  locale: string;
};

const ORGANIZATION_EMAIL = "info@marketing.org.mn";

function getLabels(locale: string) {
  const mn = locale === "mn";

  return mn
    ? {
        documentTitle: "Нэхэмжлэхийн хүсэлт",
        issuerName: "Монголын Маркетингийн Холбоо",
        issuerLabel: "Нэхэмжлэгч байгууллага",
        address: "#505, Bluesky Tower, Улаанбаатар, Монгол",
        billingDetails: "Нэхэмжлэлийн мэдээлэл",
        companyId: "Төлөгч байгууллагын регистр / TIN",
        invoiceNumber: "Нэхэмжлэхийн дугаар",
        requestNumber: "Хүсэлтийн дугаар",
        issuedAt: "Нэхэмжилсэн огноо",
        status: "Төлбөр төлөгдсөн эсэх",
        pending: "Үгүй — хүлээгдэж байна",
        paid: "Тийм — баталгаажсан",
        qrTitle: "Төлбөрийн QR код",
        qrHint: "QPay дэмждэг банкны апп-аар уншуулна уу",
        lineItems: "Нэхэмжлэлийн задаргаа",
        number: "№",
        item: "Үйлчилгээ",
        unitPrice: "Нэгж үнэ",
        quantity: "Тоо",
        total: "Нийт үнэ",
        ticket: "Арга хэмжээний тасалбар",
        subtotal: "Нийт дүн",
        payable: "Төлөх дүн",
        transactionNote: "Гүйлгээний мэдээлэл",
        transactionHint:
          "QR код нь энэ нэхэмжлэхийн хүсэлттэй холбогдсон. Веб дээр шууд төлбөр хийх шаардлагагүй.",
        bankDetails: "Төлбөр төлөх дансны мэдээлэл",
        bankAccountName: "Хүлээн авах дансны нэр: Монголын Маркетингийн Холбоо НҮТББ",
        bankAccountNumber: "TDB: 350004000404352171",
        bankTransferNote:
          "Гүйлгээний утга: Байгууллагын нэр, регистрийн дугаар, тасалбарын тоо ширхэг бичиж дансанд шилжүүлнэ үү.",
        contact: "Холбоо барих",
      }
    : {
        documentTitle: "Billing request",
        issuerName: "Mongolian Marketing Association",
        issuerLabel: "Issuing organization",
        address: "#505, Bluesky Tower, Ulaanbaatar, Mongolia",
        billingDetails: "Billing information",
        companyId: "Payer company registration / TIN",
        invoiceNumber: "Invoice number",
        requestNumber: "Request number",
        issuedAt: "Issued at",
        status: "Payment status",
        pending: "No — pending",
        paid: "Yes — confirmed",
        qrTitle: "Payment QR code",
        qrHint: "Scan with a banking app that supports QPay",
        lineItems: "Billing details",
        number: "No.",
        item: "Service",
        unitPrice: "Unit price",
        quantity: "Qty",
        total: "Total",
        ticket: "Event ticket",
        subtotal: "Subtotal",
        payable: "Amount due",
        transactionNote: "Payment information",
        transactionHint:
          "This QR code is linked to the billing request. No immediate web payment is required.",
        bankDetails: "Bank transfer details",
        bankAccountName: "Beneficiary: Mongolian Marketing Association NGO",
        bankAccountNumber: "TDB: 350004000404352171",
        bankTransferNote:
          "Transfer description: company name, registration number and ticket quantity. Please transfer to the account above.",
        contact: "Contact",
      };
}

function formatAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "mn" ? "mn-MN" : "en-US", {
    style: "currency",
    currency: "MNT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatIssuedAt(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "mn" ? "mn-MN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

export function printCompanyBillingRequest(
  booking: TicketBookingPayload,
  locale: string,
): boolean {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;
  const targetWindow = printWindow;

  const labels = getLabels(locale);
  const invoiceNumber = booking.system.payment.invoiceNumber ?? "—";
  const requestNumber =
    booking.system.dealNumber ?? booking.system.reservationId;
  const companyId = booking.booking.companyRegistrationNumber ?? "—";
  const issuedAt = formatIssuedAt(booking.system.bookingTime, locale);
  const unitPrice = formatAmount(booking.system.pricing.unitPrice, locale);
  const total = formatAmount(booking.system.pricing.subtotal, locale);
  const status =
    booking.system.status === "paid" ? labels.paid : labels.pending;
  const logoUrl = new URL(
    "/images/mma-logo.avif",
    window.location.origin,
  ).toString();
  const qrImage = booking.system.payment.qrImageSrc;

  const html = `<!doctype html>
    <html lang="${locale === "mn" ? "mn" : "en"}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(labels.documentTitle)} — ${escapeHtml(invoiceNumber)}</title>
        <style>
          @page { size: A4; margin: 14mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #163248; font-family: Arial, sans-serif; background: #fff; }
          main { width: 100%; margin: 0 auto; }
          header { display: flex; align-items: flex-start; justify-content: space-between; gap: 28px; padding-bottom: 20px; border-bottom: 3px solid #214f6c; }
          .logo { width: 205px; height: auto; }
          .heading { text-align: right; }
          h1 { margin: 0; font-size: 25px; letter-spacing: .02em; text-transform: uppercase; }
          .heading p { max-width: 280px; margin: 8px 0 0; color: #60717d; font-size: 11px; line-height: 1.5; }
          h2 { margin: 24px 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: .08em; }
          .details { display: grid; grid-template-columns: minmax(0, 1fr) 205px; gap: 22px; align-items: stretch; }
          .info { border: 1px solid #dce4e8; border-radius: 8px; overflow: hidden; }
          .row { display: grid; grid-template-columns: 47% 53%; border-bottom: 1px solid #e4eaed; }
          .row:last-child { border-bottom: 0; }
          .row span { padding: 9px 11px; font-size: 10.5px; line-height: 1.35; }
          .row span:first-child { color: #667784; background: #f5f8f9; font-weight: 600; }
          .row span:last-child { text-align: right; font-weight: 700; overflow-wrap: anywhere; }
          .qr { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #dce4e8; border-radius: 8px; padding: 13px; text-align: center; page-break-inside: avoid; }
          .qr img { width: 145px; height: 145px; object-fit: contain; }
          .qr strong { margin-top: 8px; font-size: 11px; }
          .qr p { margin: 4px 0 0; color: #667784; font-size: 9px; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th { padding: 9px 8px; background: #e9eff2; color: #29485b; font-size: 9.5px; text-align: left; }
          td { padding: 11px 8px; border: 1px solid #dce4e8; border-top: 0; font-size: 10px; vertical-align: top; }
          th:first-child, td:first-child { width: 7%; text-align: center; }
          th:nth-child(2), td:nth-child(2) { width: 43%; }
          th:nth-child(3), td:nth-child(3) { width: 18%; text-align: right; }
          th:nth-child(4), td:nth-child(4) { width: 10%; text-align: center; }
          th:last-child, td:last-child { width: 22%; text-align: right; }
          .item-title { font-weight: 700; }
          .item-subtitle { display: block; margin-top: 3px; color: #6a7a85; font-size: 9px; }
          .bottom { display: grid; grid-template-columns: minmax(0, 1fr) 245px; gap: 24px; margin-top: 20px; align-items: start; }
          .note { padding: 13px; border-radius: 8px; background: #f5f8f9; font-size: 9.5px; line-height: 1.55; color: #5b6d79; }
          .note strong { display: block; margin-bottom: 4px; color: #29485b; }
          .note .bank { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #c8d3d9; }
          .note .bank span { display: block; margin-top: 2px; }
          .summary { border-top: 2px solid #214f6c; }
          .summary-row { display: flex; justify-content: space-between; gap: 20px; padding: 9px 0; border-bottom: 1px solid #dce4e8; font-size: 10.5px; }
          .summary-row.total { font-size: 13px; font-weight: 800; }
          footer { display: flex; justify-content: space-between; gap: 20px; margin-top: 28px; padding-top: 12px; border-top: 1px solid #dce4e8; color: #667784; font-size: 9px; }
        </style>
      </head>
      <body>
        <main>
          <header>
            <img class="logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(labels.issuerName)}" />
            <div class="heading">
              <h1>${escapeHtml(labels.documentTitle)}</h1>
              <p>${escapeHtml(labels.address)}<br />${escapeHtml(ORGANIZATION_EMAIL)}</p>
            </div>
          </header>

          <h2>${escapeHtml(labels.billingDetails)}</h2>
          <section class="details">
            <div class="info">
              <div class="row"><span>${escapeHtml(labels.issuerLabel)}</span><span>${escapeHtml(labels.issuerName)}</span></div>
              <div class="row"><span>${escapeHtml(labels.companyId)}</span><span>${escapeHtml(companyId)}</span></div>
              <div class="row"><span>${escapeHtml(labels.invoiceNumber)}</span><span>${escapeHtml(invoiceNumber)}</span></div>
              <div class="row"><span>${escapeHtml(labels.requestNumber)}</span><span>${escapeHtml(requestNumber)}</span></div>
              <div class="row"><span>${escapeHtml(labels.issuedAt)}</span><span>${escapeHtml(issuedAt)}</span></div>
              <div class="row"><span>${escapeHtml(labels.status)}</span><span>${escapeHtml(status)}</span></div>
            </div>
            <div class="qr">
              <img src="${escapeHtml(qrImage)}" alt="QPay QR" />
              <strong>${escapeHtml(labels.qrTitle)}</strong>
              <p>${escapeHtml(labels.qrHint)}</p>
            </div>
          </section>

          <h2>${escapeHtml(labels.lineItems)}</h2>
          <table>
            <thead><tr><th>${escapeHtml(labels.number)}</th><th>${escapeHtml(labels.item)}</th><th>${escapeHtml(labels.unitPrice)}</th><th>${escapeHtml(labels.quantity)}</th><th>${escapeHtml(labels.total)}</th></tr></thead>
            <tbody><tr><td>1</td><td><span class="item-title">${escapeHtml(booking.system.event.title)}</span><span class="item-subtitle">${escapeHtml(labels.ticket)}</span></td><td>${escapeHtml(unitPrice)}</td><td>${booking.system.pricing.quantity}</td><td>${escapeHtml(total)}</td></tr></tbody>
          </table>

          <section class="bottom">
            <div class="note"><strong>${escapeHtml(labels.transactionNote)}</strong>${escapeHtml(labels.transactionHint)}<div class="bank"><strong>${escapeHtml(labels.bankDetails)}</strong><span>${escapeHtml(labels.bankAccountName)}</span><span>${escapeHtml(labels.bankAccountNumber)}</span><span>${escapeHtml(labels.bankTransferNote)}</span></div></div>
            <div class="summary">
              <div class="summary-row"><span>${escapeHtml(labels.subtotal)}</span><strong>${escapeHtml(total)}</strong></div>
              <div class="summary-row total"><span>${escapeHtml(labels.payable)}</span><span>${escapeHtml(total)}</span></div>
            </div>
          </section>

          <footer><span>${escapeHtml(labels.contact)}: ${escapeHtml(ORGANIZATION_EMAIL)}</span><span>${escapeHtml(invoiceNumber)}</span></footer>
        </main>
      </body>
    </html>`;
  targetWindow.document.open();
  targetWindow.document.write(html);
  targetWindow.document.close();
  targetWindow.opener = null;

  async function openPrintDialog() {
    const imageLoads = Array.from(targetWindow.document.images).map(
      (image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
    );

    await Promise.race([
      Promise.all(imageLoads),
      new Promise<void>((resolve) =>
        window.setTimeout(() => resolve(), 3_000),
      ),
    ]);
    await targetWindow.document.fonts.ready;
    await new Promise<void>((resolve) => {
      targetWindow.requestAnimationFrame(() => {
        targetWindow.requestAnimationFrame(() => resolve());
      });
    });

    if (!targetWindow.closed) {
      targetWindow.focus();
      targetWindow.print();
    }
  }

  void openPrintDialog();

  return true;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] border-b border-neutral-200 last:border-b-0">
      <dt className="bg-neutral-100/70 px-3 py-2.5 text-xs font-semibold leading-5 text-neutral-500 sm:px-4">
        {label}
      </dt>
      <dd className="break-words px-3 py-2.5 text-right text-xs font-semibold leading-5 text-primary-900 sm:px-4">
        {value}
      </dd>
    </div>
  );
}

export default function CompanyBillingRequest({
  booking,
  locale,
}: CompanyBillingRequestProps) {
  const t = useTranslations("ticketBooking");
  const labels = getLabels(locale);
  const invoiceNumber = booking.system.payment.invoiceNumber ?? "—";
  const requestNumber =
    booking.system.dealNumber ?? booking.system.reservationId;
  const total = formatAmount(booking.system.pricing.subtotal, locale);
  const unitPrice = formatAmount(booking.system.pricing.unitPrice, locale);
  const status =
    booking.system.status === "paid" ? labels.paid : labels.pending;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-2xl font-semibold text-primary-900">
          {t("companyBillingReadyHeading")}
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500">
          {t("companyBillingReadyDescription")}
        </p>
      </div>

      <article className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm">
        <header className="flex flex-col gap-5 border-b-[3px] border-primary-700 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7 sm:py-6">
          <Image
            src="/images/mma-logo.avif"
            alt={labels.issuerName}
            width={424}
            height={154}
            className="h-auto w-[190px]"
          />
          <div className="sm:max-w-xs sm:text-right">
            <h4 className="text-xl font-semibold uppercase tracking-wide text-primary-900">
              {labels.documentTitle}
            </h4>
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              {labels.address}
              <br />
              {ORGANIZATION_EMAIL}
            </p>
          </div>
        </header>

        <div className="px-5 py-6 sm:px-7">
          <h5 className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-800">
            {labels.billingDetails}
          </h5>
          <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <dl className="overflow-hidden rounded-lg border border-neutral-200">
              <DetailRow label={labels.issuerLabel} value={labels.issuerName} />
              <DetailRow
                label={labels.companyId}
                value={booking.booking.companyRegistrationNumber ?? "—"}
              />
              <DetailRow label={labels.invoiceNumber} value={invoiceNumber} />
              <DetailRow label={labels.requestNumber} value={requestNumber} />
              <DetailRow
                label={labels.issuedAt}
                value={formatIssuedAt(booking.system.bookingTime, locale)}
              />
              <DetailRow label={labels.status} value={status} />
            </dl>

            <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 p-4 text-center">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- QPay supplies a one-time data URL. */}
                <img
                  src={booking.system.payment.qrImageSrc}
                  alt={t("qpayQrAlt")}
                  width={176}
                  height={176}
                  className="h-44 w-44 rounded-md bg-white object-contain"
                />
                {booking.system.status === "paid" && (
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-sm">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs font-semibold text-primary-900">
                {labels.qrTitle}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                {booking.system.status === "paid"
                  ? t("paymentConfirmed")
                  : labels.qrHint}
              </p>
            </div>
          </div>

          <h5 className="mt-7 text-xs font-semibold uppercase tracking-[0.1em] text-primary-800">
            {labels.lineItems}
          </h5>
          <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200">
            <table className="min-w-[650px] table-fixed text-xs">
              <thead className="bg-primary-50 text-primary-800">
                <tr>
                  <th className="w-[7%] px-3 py-3 text-center font-semibold">
                    {labels.number}
                  </th>
                  <th className="w-[43%] px-3 py-3 text-left font-semibold">
                    {labels.item}
                  </th>
                  <th className="w-[18%] px-3 py-3 text-right font-semibold">
                    {labels.unitPrice}
                  </th>
                  <th className="w-[10%] px-3 py-3 text-center font-semibold">
                    {labels.quantity}
                  </th>
                  <th className="w-[22%] px-3 py-3 text-right font-semibold">
                    {labels.total}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-neutral-200 text-primary-900">
                  <td className="px-3 py-4 text-center">1</td>
                  <td className="px-3 py-4">
                    <span className="block font-semibold">
                      {booking.system.event.title}
                    </span>
                    <span className="mt-1 block text-[11px] text-neutral-500">
                      {labels.ticket}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">{unitPrice}</td>
                  <td className="px-3 py-4 text-center">
                    {booking.system.pricing.quantity}
                  </td>
                  <td className="px-3 py-4 text-right font-semibold">
                    {total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_260px] sm:items-start">
            <div className="rounded-lg bg-neutral-100/70 px-4 py-3 text-xs leading-5 text-neutral-600">
              <strong className="block text-primary-900">
                {labels.transactionNote}
              </strong>
              <span className="mt-1 block">{labels.transactionHint}</span>
              <div className="mt-3 border-t border-dashed border-neutral-300 pt-3">
                <strong className="block text-primary-900">
                  {labels.bankDetails}
                </strong>
                <span className="mt-1 block">{labels.bankAccountName}</span>
                <span className="mt-1 block">{labels.bankAccountNumber}</span>
                <span className="mt-1 block">{labels.bankTransferNote}</span>
              </div>
            </div>
            <dl className="border-t-2 border-primary-700 text-sm">
              <div className="flex justify-between gap-5 border-b border-neutral-200 py-3">
                <dt className="text-neutral-500">{labels.subtotal}</dt>
                <dd className="font-semibold text-primary-900">{total}</dd>
              </div>
              <div className="flex justify-between gap-5 border-b border-neutral-200 py-3 text-base font-semibold text-primary-900">
                <dt>{labels.payable}</dt>
                <dd>{total}</dd>
              </div>
            </dl>
          </div>

          <footer className="mt-7 flex flex-col justify-between gap-2 border-t border-neutral-200 pt-4 text-xs text-neutral-500 sm:flex-row">
            <span>
              {labels.contact}: {ORGANIZATION_EMAIL}
            </span>
            <span>{invoiceNumber}</span>
          </footer>
        </div>
      </article>

      <button
        type="button"
        onClick={() => {
          if (!printCompanyBillingRequest(booking, locale)) {
            window.alert(t("printPopupBlocked"));
          }
        }}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-primary-700 bg-white px-5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        {t("printBillingRequest")}
      </button>
    </div>
  );
}
