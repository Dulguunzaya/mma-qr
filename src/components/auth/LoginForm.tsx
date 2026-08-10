"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import {
  CLIENT_PORTAL_USER_LOGIN_WITH_CREDENTIALS,
  type ClientPortalUserLoginWithCredentialsData,
  type ClientPortalUserLoginWithCredentialsVariables,
} from "@/graphql/auth/mutations";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  AuthCard,
  buttonClassName,
  fieldClassName,
} from "./AuthCard";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const [loginWithCredentials, credentialsState] = useMutation<
    ClientPortalUserLoginWithCredentialsData,
    ClientPortalUserLoginWithCredentialsVariables
  >(CLIENT_PORTAL_USER_LOGIN_WITH_CREDENTIALS);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const result = await loginWithCredentials({
        variables: {
          email: String(form.get("email")).trim(),
          password: String(form.get("password")),
        },
      });
      const response = result.data?.clientPortalUserLoginWithCredentials;

      if (response) {
        await login();
        router.push("/");
      }
    } catch {
      setError(t("genericError"));
    }
  }

  return (
    <AuthCard title={t("loginTitle")} description={t("loginDescription")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-medium text-neutral-700">
          {t("email")}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className={fieldClassName}
          />
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          {t("password")}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            className={fieldClassName}
          />
        </label>
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          disabled={credentialsState.loading}
          className={buttonClassName}
        >
          {credentialsState.loading ? t("submitting") : t("login")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          {t("register")}
        </Link>
      </p>
    </AuthCard>
  );
}
