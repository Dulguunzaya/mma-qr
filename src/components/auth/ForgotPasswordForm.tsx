"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  CLIENT_PORTAL_USER_FORGOT_PASSWORD,
  CLIENT_PORTAL_USER_RESET_PASSWORD,
  type ClientPortalUserForgotPasswordData,
  type ClientPortalUserForgotPasswordVariables,
  type ClientPortalUserResetPasswordData,
  type ClientPortalUserResetPasswordVariables,
} from "@/graphql/auth/mutations";
import {
  AuthCard,
  buttonClassName,
  fieldClassName,
} from "./AuthCard";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [identifier, setIdentifier] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [forgotPassword, forgotState] = useMutation<
    ClientPortalUserForgotPasswordData,
    ClientPortalUserForgotPasswordVariables
  >(CLIENT_PORTAL_USER_FORGOT_PASSWORD);
  const [resetPassword, resetState] = useMutation<
    ClientPortalUserResetPasswordData,
    ClientPortalUserResetPasswordVariables
  >(CLIENT_PORTAL_USER_RESET_PASSWORD);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const normalizedIdentifier = identifier.trim();

    try {
      if (!codeRequested) {
        await forgotPassword({
          variables: { identifier: normalizedIdentifier },
        });
        setIdentifier(normalizedIdentifier);
        setCodeRequested(true);
        return;
      }

      await resetPassword({
        variables: {
          identifier: normalizedIdentifier,
          code: String(form.get("code")).trim(),
          newPassword: String(form.get("newPassword")),
        },
      });
      setComplete(true);
    } catch {
      setError(t("genericError"));
    }
  }

  return (
    <AuthCard
      title={t("forgotTitle")}
      description={t("forgotDescription")}
    >
      {complete ? (
        <div>
          <p className="text-sm text-neutral-700">{t("passwordReset")}</p>
          <Link
            href="/login"
            className={`${buttonClassName} mt-6 block text-center`}
          >
            {t("login")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-neutral-700">
            {t("identifier")}
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              disabled={codeRequested}
              required
              maxLength={254}
              className={fieldClassName}
            />
          </label>
          {codeRequested && (
            <>
              <label className="block text-sm font-medium text-neutral-700">
                {t("verificationCode")}
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={12}
                  className={fieldClassName}
                />
              </label>
              <label className="block text-sm font-medium text-neutral-700">
                {t("newPassword")}
                <input
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  className={fieldClassName}
                />
              </label>
            </>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            disabled={forgotState.loading || resetState.loading}
            className={buttonClassName}
          >
            {forgotState.loading || resetState.loading
              ? t("submitting")
              : codeRequested
                ? t("resetPassword")
                : t("sendCode")}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
