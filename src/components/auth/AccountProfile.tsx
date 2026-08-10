"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  CLIENT_PORTAL_COMPANY_EDIT,
  CLIENT_PORTAL_USER_EDIT_EMAIL_PHONE,
  type ClientPortalCompanyEditData,
  type ClientPortalCompanyEditVariables,
  type ClientPortalUserEditEmailPhoneData,
  type ClientPortalUserEditEmailPhoneVariables,
} from "@/graphql/auth/mutations";
import { useAuth } from "@/lib/auth/AuthContext";
import { AccountTickets } from "./AccountTickets";
import { buttonClassName, fieldClassName } from "./AuthCard";

export function AccountProfile() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { user, loading, logout, refetch } = useAuth();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [companyCodeStatus, setCompanyCodeStatus] = useState<
    "idle" | "saved" | "error"
  >("idle");
  const [companyCodeError, setCompanyCodeError] = useState("");
  const [editContact, { loading: saving }] = useMutation<
    ClientPortalUserEditEmailPhoneData,
    ClientPortalUserEditEmailPhoneVariables
  >(CLIENT_PORTAL_USER_EDIT_EMAIL_PHONE);
  const [editCompany, { loading: savingCompanyCode }] = useMutation<
    ClientPortalCompanyEditData,
    ClientPortalCompanyEditVariables
  >(CLIENT_PORTAL_COMPANY_EDIT);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return <p className="mx-auto max-w-3xl px-6 py-20">{t("loading")}</p>;
  }

  if (!user) {
    return null;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const companyName =
    user.companyName ??
    (typeof user.propertiesData?.companyName === "string"
      ? user.propertiesData.companyName
      : undefined);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") ?? "").trim();
    const nextPhone = String(form.get("phone") ?? "").trim();

    if (!nextEmail && !nextPhone) {
      setStatus("error");
      return;
    }

    setStatus("idle");

    try {
      await editContact({
        variables: {
          email: nextEmail || undefined,
          phone: nextPhone || undefined,
        },
      });
      await refetch();
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  async function handleCompanyCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get("companyCode") ?? "").trim();

    if (!code) {
      setCompanyCodeStatus("error");
      return;
    }

    setCompanyCodeStatus("idle");
    setCompanyCodeError("");

    try {
      await editCompany({
        variables: {
          code,
        },
      });
      await refetch();
      setCompanyCodeStatus("saved");
    } catch (err) {
      setCompanyCodeError(err instanceof Error ? err.message : "");
      setCompanyCodeStatus("error");
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wider text-accent-700">
          {t("account")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-neutral-800">
          {name || user.username || user.email}
        </h1>
        <form
          onSubmit={handleContactSubmit}
          className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-5"
        >
          <h2 className="text-lg font-semibold text-neutral-800">
            {t("contactInformation")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-neutral-500">
            {t("contactInformationDescription")}
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-neutral-700">
              {t("email")}
              <input
                name="email"
                type="email"
                defaultValue={user.email ?? ""}
                onChange={() => setStatus("idle")}
                autoComplete="email"
                maxLength={254}
                className={fieldClassName}
              />
            </label>
            <label className="text-sm font-medium text-neutral-700">
              {t("phone")}
              <input
                name="phone"
                type="tel"
                defaultValue={user.phone ?? ""}
                onChange={() => setStatus("idle")}
                autoComplete="tel"
                maxLength={32}
                className={fieldClassName}
              />
            </label>
          </div>
          {status === "saved" && (
            <p role="status" className="mt-4 text-sm text-emerald-700">
              {t("contactSaved")}
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {t("contactSaveError")}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className={`${buttonClassName} mt-5 sm:w-auto`}
          >
            {saving ? t("submitting") : t("saveContact")}
          </button>
        </form>
        {user.company && (
          <form
            onSubmit={handleCompanyCodeSubmit}
            className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-5"
          >
            <h2 className="text-lg font-semibold text-neutral-800">
              {t("companyCode")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              {t("companyCodeDescription")}
            </p>
            <div className="mt-5">
              <label className="text-sm font-medium text-neutral-700">
                {t("companyCode")}
                <input
                  key={user.company?.code ?? "company-code"}
                  name="companyCode"
                  defaultValue={user.company?.code ?? ""}
                  onChange={() => setCompanyCodeStatus("idle")}
                  required
                  maxLength={20}
                  className={fieldClassName}
                />
              </label>
            </div>
            {companyCodeStatus === "saved" && (
              <p role="status" className="mt-4 text-sm text-emerald-700">
                {t("companyCodeSaved")}
              </p>
            )}
            {companyCodeStatus === "error" && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {companyCodeError || t("companyCodeSaveError")}
              </p>
            )}
            <button
              type="submit"
              disabled={savingCompanyCode}
              className={`${buttonClassName} mt-5 sm:w-auto`}
            >
              {savingCompanyCode ? t("submitting") : t("saveCompanyCode")}
            </button>
          </form>
        )}
        <AccountTickets />
        <dl className="mt-6 divide-y divide-neutral-100">
          {companyName && (
            <div className="grid gap-1 py-4 sm:grid-cols-3">
              <dt className="text-sm text-neutral-500">{t("company")}</dt>
              <dd className="text-sm text-neutral-800 sm:col-span-2">
                {companyName}
              </dd>
            </div>
          )}
          <div className="grid gap-1 py-4 sm:grid-cols-3">
            <dt className="text-sm text-neutral-500">{t("verification")}</dt>
            <dd className="text-sm text-neutral-800 sm:col-span-2">
              {user.isVerified ? t("verified") : t("notVerified")}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          {t("logout")}
        </button>
      </div>
    </section>
  );
}
