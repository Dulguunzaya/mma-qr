"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import {
  CLIENT_PORTAL_USER_REGISTER,
  type ClientPortalUserRegisterData,
  type ClientPortalUserRegisterVariables,
} from "@/graphql/auth/mutations";

type FormStatus = "idle" | "success" | "error";

function getValue(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

export function useLeadForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [register, { loading: isSubmitting }] = useMutation<
    ClientPortalUserRegisterData,
    ClientPortalUserRegisterVariables
  >(CLIENT_PORTAL_USER_REGISTER);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);

    setStatus("idle");

    try {
      const phone = getValue(form, "phone");
      await register({
        variables: {
          firstName: getValue(form, "firstName"),
          lastName: getValue(form, "lastName"),
          email: getValue(form, "email"),
          phone: phone || undefined,
          userType: "customer",
          propertiesData: {
            organization: getValue(form, "organization"),
            interest: getValue(form, "interest"),
            message: getValue(form, "message"),
            source: "website-membership-form",
          },
        },
      });
      element.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return { handleSubmit, isSubmitting, status };
}
