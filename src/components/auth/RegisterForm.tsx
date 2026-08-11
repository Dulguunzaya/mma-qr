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
import { cn } from "@/lib/utils";

type RegistrationField =
  | "companyName"
  | "phone"
  | "firstName"
  | "lastName"
  | "email"
  | "password";

type RegistrationFieldErrors = Partial<Record<RegistrationField, string>>;

const PASSWORD_REQUIREMENTS = [
  {
    key: "passwordMinLength",
    test: (password: string) => password.length >= 8,
  },
  {
    key: "passwordUppercase",
    test: (password: string) => /[A-ZА-ЯЁӨҮ]/.test(password),
  },
  {
    key: "passwordLowercase",
    test: (password: string) => /[a-zа-яёөү]/.test(password),
  },
  {
    key: "passwordNumber",
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    key: "passwordSpecialCharacter",
    test: (password: string) => /[^\p{L}\p{N}\s]/u.test(password),
  },
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getServerMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "";
  }

  return error.message
    .replace(/^(ApolloError|GraphQL error):\s*/i, "")
    .trim()
    .slice(0, 240);
}

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<RegistrationFieldErrors>({});
  const [password, setPassword] = useState("");
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

  const passwordRequirements = PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    met: requirement.test(password),
  }));

  function clearFieldError(field: RegistrationField) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setError("");
  }

  function getRegistrationError(error: unknown): {
    field?: RegistrationField;
    message: string;
  } {
    const serverMessage = getServerMessage(error);

    if (/already exists|already registered|duplicate/i.test(serverMessage)) {
      return { message: t("accountExists") };
    }

    if (
      /e-?mail/i.test(serverMessage) &&
      /invalid|required|valid/i.test(serverMessage)
    ) {
      return { field: "email", message: t("emailInvalid") };
    }

    if (
      /phone/i.test(serverMessage) &&
      /invalid|required|valid/i.test(serverMessage)
    ) {
      return { field: "phone", message: t("phoneInvalid") };
    }

    if (/password/i.test(serverMessage)) {
      return {
        field: "password",
        message: t("passwordRequirementsError"),
      };
    }

    if (/network|failed to fetch|load failed|connection/i.test(serverMessage)) {
      return { message: t("registrationNetworkError") };
    }

    return {
      message: serverMessage
        ? t("registrationErrorWithReason", { reason: serverMessage })
        : t("registrationUnknownError"),
    };
  }

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
    const submittedPassword = String(form.get("password"));
    const phone = String(form.get("phone") ?? "").trim();
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const nextFieldErrors: RegistrationFieldErrors = {};

    setPassword(submittedPassword);

    if (userType === "company") {
      if (!companyName) {
        nextFieldErrors.companyName = t("companyNameRequired");
      }

      const phoneDigitCount = phone.replace(/\D/g, "").length;
      if (!phone) {
        nextFieldErrors.phone = t("phoneRequired");
      } else if (phoneDigitCount < 8 || phoneDigitCount > 15) {
        nextFieldErrors.phone = t("phoneInvalid");
      }
    } else {
      if (!firstName) {
        nextFieldErrors.firstName = t("firstNameRequired");
      }
      if (!lastName) {
        nextFieldErrors.lastName = t("lastNameRequired");
      }
    }

    if (!email) {
      nextFieldErrors.email = t("emailRequired");
    } else if (!EMAIL_PATTERN.test(email)) {
      nextFieldErrors.email = t("emailInvalid");
    }

    if (!submittedPassword) {
      nextFieldErrors.password = t("passwordRequired");
    } else {
      const missingRequirements = PASSWORD_REQUIREMENTS.filter(
        (requirement) => !requirement.test(submittedPassword),
      ).map((requirement) => t(requirement.key));

      if (missingRequirements.length > 0) {
        nextFieldErrors.password = t("passwordRequirementsMissing", {
          requirements: missingRequirements.join(", "),
        });
      }
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    try {
      const result = await register({
        variables: {
          email,
          password: submittedPassword,
          userType,
          phone: userType === "company" ? phone : undefined,
          username: userType === "company" ? companyName : undefined,
          propertiesData:
            userType === "company" ? { companyName } : undefined,
        },
      });
      const user = result.data?.clientPortalUserRegister;

      if (!user) {
        setError(t("registrationNoResponse"));
        return;
      }

      if (user.isVerified) {
        const loginResult = await loginWithCredentials({
          variables: { email, password: submittedPassword },
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
        password: submittedPassword,
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
      const registrationError = getRegistrationError(err);
      if (registrationError.field) {
        setFieldErrors((current) => ({
          ...current,
          [registrationError.field as RegistrationField]:
            registrationError.message,
        }));
      } else {
        setError(registrationError.message);
      }
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

    if (!code) {
      setError(t("verificationCodeRequired"));
      return;
    }

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
    } catch (err) {
      const serverMessage = getServerMessage(err);
      setError(
        /network|failed to fetch|load failed|connection/i.test(serverMessage)
          ? t("registrationNetworkError")
          : serverMessage
            ? t("resendCodeErrorWithReason", { reason: serverMessage })
            : t("resendCodeError"),
      );
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
        <form
          onSubmit={handleVerification}
          className="space-y-5"
          noValidate
        >
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
          {error && (
            <p className="text-sm leading-6 text-red-700" role="alert">
              {error}
            </p>
          )}
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
          <form
            onSubmit={handleRegistration}
            className="space-y-5"
            noValidate
          >
            <div className="grid grid-cols-2 gap-2 rounded-md bg-neutral-100 p-1">
              {(["customer", "company"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setUserType(type);
                    setError("");
                    setFieldErrors({});
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
                    aria-invalid={Boolean(fieldErrors.companyName)}
                    aria-describedby={
                      fieldErrors.companyName ? "company-name-error" : undefined
                    }
                    onChange={() => clearFieldError("companyName")}
                    className={cn(
                      fieldClassName,
                      fieldErrors.companyName &&
                        "border-red-500 focus:border-red-500 focus:ring-red-100",
                    )}
                  />
                  {fieldErrors.companyName && (
                    <span
                      id="company-name-error"
                      className="mt-1.5 block text-xs font-normal text-red-700"
                      role="alert"
                    >
                      {fieldErrors.companyName}
                    </span>
                  )}
                </label>
                <label className="block text-sm font-medium text-neutral-700">
                  {t("phone")}
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={32}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={
                      fieldErrors.phone ? "phone-error" : undefined
                    }
                    onChange={() => clearFieldError("phone")}
                    className={cn(
                      fieldClassName,
                      fieldErrors.phone &&
                        "border-red-500 focus:border-red-500 focus:ring-red-100",
                    )}
                  />
                  {fieldErrors.phone && (
                    <span
                      id="phone-error"
                      className="mt-1.5 block text-xs font-normal text-red-700"
                      role="alert"
                    >
                      {fieldErrors.phone}
                    </span>
                  )}
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
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    aria-describedby={
                      fieldErrors.firstName ? "first-name-error" : undefined
                    }
                    onChange={() => clearFieldError("firstName")}
                    className={cn(
                      fieldClassName,
                      fieldErrors.firstName &&
                        "border-red-500 focus:border-red-500 focus:ring-red-100",
                    )}
                  />
                  {fieldErrors.firstName && (
                    <span
                      id="first-name-error"
                      className="mt-1.5 block text-xs font-normal text-red-700"
                      role="alert"
                    >
                      {fieldErrors.firstName}
                    </span>
                  )}
                </label>
                <label className="block text-sm font-medium text-neutral-700">
                  {t("lastName")}
                  <input
                    name="lastName"
                    autoComplete="family-name"
                    required
                    maxLength={100}
                    aria-invalid={Boolean(fieldErrors.lastName)}
                    aria-describedby={
                      fieldErrors.lastName ? "last-name-error" : undefined
                    }
                    onChange={() => clearFieldError("lastName")}
                    className={cn(
                      fieldClassName,
                      fieldErrors.lastName &&
                        "border-red-500 focus:border-red-500 focus:ring-red-100",
                    )}
                  />
                  {fieldErrors.lastName && (
                    <span
                      id="last-name-error"
                      className="mt-1.5 block text-xs font-normal text-red-700"
                      role="alert"
                    >
                      {fieldErrors.lastName}
                    </span>
                  )}
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
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                onChange={() => clearFieldError("email")}
                className={cn(
                  fieldClassName,
                  fieldErrors.email &&
                    "border-red-500 focus:border-red-500 focus:ring-red-100",
                )}
              />
              {fieldErrors.email && (
                <span
                  id="email-error"
                  className="mt-1.5 block text-xs font-normal text-red-700"
                  role="alert"
                >
                  {fieldErrors.email}
                </span>
              )}
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
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password
                    ? "password-requirements password-error"
                    : "password-requirements"
                }
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                }}
                className={cn(
                  fieldClassName,
                  fieldErrors.password &&
                    "border-red-500 focus:border-red-500 focus:ring-red-100",
                )}
              />
              {fieldErrors.password && (
                <span
                  id="password-error"
                  className="mt-1.5 block text-xs font-normal leading-5 text-red-700"
                  role="alert"
                >
                  {fieldErrors.password}
                </span>
              )}
            </label>
            <div
              id="password-requirements"
              className="rounded-md bg-neutral-50 px-3 py-2.5"
            >
              <p className="text-xs font-medium text-neutral-700">
                {t("passwordRequirementsTitle")}
              </p>
              <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                {passwordRequirements.map((requirement) => (
                  <li
                    key={requirement.key}
                    className={cn(
                      "flex gap-1.5",
                      requirement.met
                        ? "text-green-700"
                        : password
                          ? "text-red-700"
                          : "text-neutral-500",
                    )}
                  >
                    <span aria-hidden="true">
                      {requirement.met ? "✓" : "•"}
                    </span>
                    {t(requirement.key)}
                  </li>
                ))}
              </ul>
            </div>
            {error && (
              <p className="text-sm leading-6 text-red-700" role="alert">
                {error}
              </p>
            )}
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
