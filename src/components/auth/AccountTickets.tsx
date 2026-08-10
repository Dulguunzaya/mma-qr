"use client";

import { useQuery } from "@apollo/client/react";
import { CalendarDays, Ticket } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  CP_MY_TICKET_DEALS,
  type CpMyTicketDealsData,
  type CpMyTicketDealsVariables,
  type MyTicketDeal,
} from "@/graphql/sales/companyBilling";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/auth/AuthContext";
import { TicketRepayment } from "./TicketRepayment";

const PAID_STAGE_CODES = ["confirmed", "paid"];

function formatMnt(value: number): string {
  const roundedValue = Math.round(value);
  const digits = String(Math.abs(roundedValue)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );

  return `${roundedValue < 0 ? "-" : ""}₮${digits}`;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown): number | undefined {
  const numberValue = typeof value === "string" ? Number(value) : value;
  return typeof numberValue === "number" && Number.isFinite(numberValue)
    ? numberValue
    : undefined;
}

function getTicketDetails(deal: MyTicketDeal) {
  const product = deal.productsData?.[0];
  const title = getString(deal.extraData?.eventTitle) ?? deal.name ?? "";
  const slug = getString(deal.extraData?.eventSlug);
  const quantity =
    product?.quantity ?? getNumber(deal.extraData?.quantity) ?? 1;
  const amount = product?.amount ?? getNumber(deal.extraData?.amount);
  const stageCode = deal.stage?.code;
  const isPaid = stageCode ? PAID_STAGE_CODES.includes(stageCode) : undefined;

  return { amount, isPaid, quantity, slug, title };
}

export function AccountTickets() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { user } = useAuth();
  const customerId = user?.erxesCustomerId;
  const companyId = user?.erxesCompanyId;
  const { data, loading, error, refetch } = useQuery<
    CpMyTicketDealsData,
    CpMyTicketDealsVariables
  >(CP_MY_TICKET_DEALS, {
    variables: {
      customerIds: customerId ? [customerId] : undefined,
      companyIds: companyId ? [companyId] : undefined,
      limit: 50,
    },
    skip: !customerId && !companyId,
  });

  if (!customerId && !companyId) {
    return null;
  }

  const deals = data?.cpDeals.list ?? [];
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "mn" ? "mn-MN" : "en-US",
    { dateStyle: "medium" },
  );

  return (
    <section className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-neutral-800">
        {t("myTickets")}
      </h2>
      {loading ? (
        <p className="mt-4 text-sm text-neutral-500">{t("loading")}</p>
      ) : error ? (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {t("ticketsError")}
        </p>
      ) : deals.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">{t("ticketsEmpty")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
          {deals.map((deal) => {
            const { amount, isPaid, quantity, slug, title } =
              getTicketDetails(deal);

            return (
              <li key={deal._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <Ticket
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent-700"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    {slug ? (
                      <Link
                        href={`/events/${slug}`}
                        className="block line-clamp-2 text-sm font-semibold text-primary-700 transition-colors hover:text-accent-700 sm:truncate"
                      >
                        {title}
                      </Link>
                    ) : (
                      <p className="line-clamp-2 text-sm font-semibold text-primary-900 sm:truncate">
                        {title}
                      </p>
                    )}
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                      {deal.createdAt && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          {dateFormatter.format(new Date(deal.createdAt))}
                        </span>
                      )}
                      <span>{t("ticketQuantity", { count: quantity })}</span>
                      {amount !== undefined && <span>{formatMnt(amount)}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <span
                    className={
                      isPaid === false
                        ? "inline-flex w-fit rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700"
                        : "inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                    }
                  >
                    {isPaid === undefined
                      ? (deal.stage?.name ?? "")
                      : isPaid
                        ? t("ticketPaid")
                        : t("ticketPending")}
                  </span>
                  {isPaid === false && (
                    <TicketRepayment
                      deal={deal}
                      amount={amount}
                      quantity={quantity}
                      title={title}
                      slug={slug}
                      onPaid={() => refetch()}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
