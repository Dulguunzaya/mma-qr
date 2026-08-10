"use client";

import { useTranslations } from "next-intl";
import { useLeadForm } from "@/hooks/useLeadForm";

const INTEREST_KEYS = [
  "interestMembership",
  "interestEvents",
  "interestEducation",
  "interestSponsorship",
] as const;

export default function LeadForm() {
  const t = useTranslations("form");
  const { handleSubmit, isSubmitting, status } = useLeadForm();

  const inputClass =
    "h-11 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus:border-primary-500";
  const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-primary-200 bg-primary-50 p-6 text-sm font-medium text-primary-700"
      >
        {t("success")}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            {t("firstName")} *
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            maxLength={100}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>
            {t("lastName")} *
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            maxLength={100}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {t("email")} *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            {t("phone")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={32}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="organization" className={labelClass}>
            {t("organization")}
          </label>
          <input
            id="organization"
            name="organization"
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="interest" className={labelClass}>
            {t("interest")}
          </label>
          <select id="interest" name="interest" className={inputClass}>
            {INTEREST_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(key)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="message" className={labelClass}>
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus:border-primary-500"
        />
      </div>

      {status === "error" && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {t("error")}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary-600 px-8 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
