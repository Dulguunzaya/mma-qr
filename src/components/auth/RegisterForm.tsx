"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  CLIENT_PORTAL_COMPANY_EDIT,
  CLIENT_PORTAL_USER_EDIT_DETAILS,
  CLIENT_PORTAL_USER_LOGIN_WITH_CREDENTIALS,
  CLIENT_PORTAL_USER_LOGIN_WITH_OTP,
  CLIENT_PORTAL_USER_REGISTER,
  CLIENT_PORTAL_USER_REQUEST_OTP,
  CLIENT_PORTAL_USER_VERIFY,
  type ClientPortalCompanyEditData,
  type ClientPortalCompanyEditVariables,
  type ClientPortalUserEditDetailsData,
  type ClientPortalUserEditDetailsVariables,
  type ClientPortalUserLoginWithCredentialsData,
  type ClientPortalUserLoginWithCredentialsVariables,
  type ClientPortalUserLoginWithOTPData,
  type ClientPortalUserLoginWithOTPVariables,
  type ClientPortalUserRegisterData,
  type ClientPortalUserRegisterVariables,
  type ClientPortalUserRequestOTPData,
  type ClientPortalUserRequestOTPVariables,
  type ClientPortalUserVerifyData,
  type ClientPortalUserVerifyVariables,
  type CPUserType,
} from "@/graphql/auth/mutations";
import {
  AuthCard,
  buttonClassName,
  fieldClassName,
} from "./AuthCard";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [userType, setUserType] = useState<CPUserType>("customer");
  const [registeredUser, setRegisteredUser] = useState<{
    userId: string;
    email: string;
    flow: "register" | "login";
    firstName?: string;
    lastName?: string;
    companyName?: string;
    phone?: string;
    password?: string;
  } | null>(null);
  const [register, registerState] = useMutation<
    ClientPortalUserRegisterData,
    ClientPortalUserRegisterVariables
  >(CLIENT_PORTAL_USER_REGISTER);
  const [requestOTP, requestOTPState] = useMutation<
    ClientPortalUserRequestOTPData,
    ClientPortalUserRequestOTPVariables
  >(CLIENT_PORTAL_USER_REQUEST_OTP);
  const [verifyUser, verifyState] = useMutation<
    ClientPortalUserVerifyData,
    ClientPortalUserVerifyVariables
  >(CLIENT_PORTAL_USER_VERIFY);
  const [editDetails] = useMutation<
    ClientPortalUserEditDetailsData,
    ClientPortalUserEditDetailsVariables
  >(CLIENT_PORTAL_USER_EDIT_DETAILS);
  const [editCompany] = useMutation<
    ClientPortalCompanyEditData,
    ClientPortalCompanyEditVariables
  >(CLIENT_PORTAL_COMPANY_EDIT);
  const [loginWithCredentials] = useMutation<
    ClientPortalUserLoginWithCredentialsData,
    ClientPortalUserLoginWithCredentialsVariables
  >(CLIENT_PORTAL_USER_LOGIN_WITH_CREDENTIALS);
  const [loginWithOTP, loginWithOTPState] = useMutation<
    ClientPortalUserLoginWithOTPData,
    ClientPortalUserLoginWithOTPVariables
  >(CLIENT_PORTAL_USER_LOGIN_WITH_OTP);

  async function saveRegisteredDetails(details: {
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    phone?: string;
  }) {
    await editDetails({
      variables: {
        firstName: details.firstName,
        lastName: details.lastName,
        companyName: details.companyName,
      },
    });

    if (details.companyName) {
      const companyResult = await editCompany({
        variables: {
          primaryName: details.companyName,
          emails: [details.email],
          phones: details.phone ? [details.phone] : undefined,
        },
      });
      const companyId = companyResult.data?.clientPortalCompanyEdit?._id;

      if (!companyId) {
        throw new Error("Company registration failed");
      }
    }
  }

  async function handleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const companyName = String(form.get("companyName") ?? "").trim();

    if (userType === "company" && !companyName) {
      setError(t("genericError"));
      return;
    }

    try {
      const password = String(form.get("password"));
      const phone = String(form.get("phone") ?? "").trim();
      const firstName = String(form.get("firstName") ?? "").trim();
      const lastName = String(form.get("lastName") ?? "").trim();
      const result = await register({
        variables: {
          email,
          password,
          userType,
          phone: userType === "company" ? phone : undefined,
          username: userType === "company" ? companyName : undefined,
          propertiesData:
            userType === "company" ? { companyName } : undefined,
        },
      });
      const user = result.data?.clientPortalUserRegister;

      if (!user) {
        return;
      }

      if (user.isVerified) {
        const loginResult = await loginWithCredentials({
          variables: { email, password },
        });
        const loginResponse =
          loginResult.data?.clientPortalUserLoginWithCredentials;

        await login(
          typeof loginResponse === "object" ? loginResponse : undefined,
        );
        await saveRegisteredDetails({
          email,
          firstName: userType === "customer" ? firstName : undefined,
          lastName: userType === "customer" ? lastName : undefined,
          companyName: userType === "company" ? companyName : undefined,
          phone: userType === "company" ? phone : undefined,
        });
        router.push("/");
        return;
      }

      setRegisteredUser({
        userId: user._id,
        email,
        flow: "register",
        firstName: userType === "customer" ? firstName : undefined,
        lastName: userType === "customer" ? lastName : undefined,
        companyName: userType === "company" ? companyName : undefined,
        phone: userType === "company" ? phone : undefined,
        password,
      });
      await requestOTP({ variables: { identifier: email } });
      setCodeSent(true);
    } catch (err) {
      if (err instanceof Error && /already exists/i.test(err.message)) {
        try {
          await requestOTP({ variables: { identifier: email } });
          setRegisteredUser({ userId: "", email, flow: "login" });
          setCodeSent(true);
          return;
        } catch {
          // Passwordless login is disabled; ask them to sign in instead.
        }
      }
      setError(
        err instanceof Error && /already exists/i.test(err.message)
          ? t("accountExists")
          : t("genericError"),
      );
    }
  }

  async function handleVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!registeredUser) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const code = String(form.get("code")).trim();

    try {
      if (registeredUser.flow === "login") {
        const loginResult = await loginWithOTP({
          variables: { identifier: registeredUser.email, otp: code },
        });
        const loginResponse = loginResult.data?.clientPortalUserLoginWithOTP;

        await login(
          typeof loginResponse === "object" ? loginResponse : undefined,
        );
        router.push("/");
        return;
      }

      await verifyUser({
        variables: {
          userId: registeredUser.userId,
          email: registeredUser.email,
          code,
        },
      });

      if (registeredUser.password) {
        const loginResult = await loginWithCredentials({
          variables: {
            email: registeredUser.email,
            password: registeredUser.password,
          },
        });
        const loginResponse =
          loginResult.data?.clientPortalUserLoginWithCredentials;

        await login(
          typeof loginResponse === "object" ? loginResponse : undefined,
        );
      } else {
        await login();
      }

      await saveRegisteredDetails({
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        companyName: registeredUser.companyName,
        phone: registeredUser.phone,
      });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error &&
          /already verified|already exists/i.test(err.message)
          ? t("accountExists")
          : t("verifyError"),
      );
    }
  }

  async function handleResendCode() {
    if (!registeredUser) {
      return;
    }

    setError("");
    setCodeSent(false);

    try {
      await requestOTP({
        variables: { identifier: registeredUser.email },
      });
      setCodeSent(true);
    } catch {
      setError(t("genericError"));
    }
  }

  return (
    <AuthCard
      title={registeredUser ? t("verifyTitle") : t("registerTitle")}
      description={
        registeredUser ? t("verifyDescription") : t("registerDescription")
      }
    >
      {registeredUser ? (
        <form onSubmit={handleVerification} className="space-y-5">
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
          {error && <p className="text-sm text-red-700">{error}</p>}
          {codeSent && (
            <p className="text-sm text-green-700">{t("codeSent")}</p>
          )}
          <p className="text-xs leading-5 text-neutral-500">
            {t("checkSpam")}
          </p>
          <button
            disabled={verifyState.loading || loginWithOTPState.loading}
            className={buttonClassName}
          >
            {verifyState.loading || loginWithOTPState.loading
              ? t("submitting")
              : t("verify")}
          </button>
          <button
            type="button"
            disabled={requestOTPState.loading}
            onClick={handleResendCode}
            className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
          >
            {requestOTPState.loading ? t("submitting") : t("resendCode")}
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleRegistration} className="space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-md bg-neutral-100 p-1">
              {(["customer", "company"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setUserType(type);
                    setError("");
                  }}
                  aria-pressed={userType === type}
                  className={
                    userType === type
                      ? "rounded-md bg-white px-3 py-2 text-sm font-semibold text-primary-900 shadow-sm"
                      : "rounded-md px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-800"
                  }
                >
                  {type === "customer"
                    ? t("accountTypeCustomer")
                    : t("accountTypeCompany")}
                </button>
              ))}
            </div>
            {userType === "company" ? (
              <>
                <label className="block text-sm font-medium text-neutral-700">
                  {t("companyName")}
                  <input
                    name="companyName"
                    autoComplete="organization"
                    required
                    maxLength={200}
                    className={fieldClassName}
                  />
                </label>
                <label className="block text-sm font-medium text-neutral-700">
                  {t("phone")}
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={32}
                    className={fieldClassName}
                  />
                </label>
              </>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-neutral-700">
                  {t("firstName")}
                  <input
                    name="firstName"
                    autoComplete="given-name"
                    required
                    maxLength={100}
                    className={fieldClassName}
                  />
                </label>
                <label className="block text-sm font-medium text-neutral-700">
                  {t("lastName")}
                  <input
                    name="lastName"
                    autoComplete="family-name"
                    required
                    maxLength={100}
                    className={fieldClassName}
                  />
                </label>
              </div>
            )}
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
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                className={fieldClassName}
              />
            </label>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              disabled={registerState.loading || requestOTPState.loading}
              className={buttonClassName}
            >
              {registerState.loading || requestOTPState.loading
                ? t("submitting")
                : t("register")}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-neutral-500">
            {t("hasAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {t("login")}
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
