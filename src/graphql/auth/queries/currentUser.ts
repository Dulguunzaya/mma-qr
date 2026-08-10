import { gql } from "@apollo/client";

export type SocialAuthProvider = "google" | "facebook" | "apple" | "twitter";

export type CPUser = {
  _id: string;
  type?: string;
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
    companyName?: string;
    companyRegistrationNumber?: string;
    propertiesData?: Record<string, unknown>;
    company?: {
      _id: string;
      primaryName?: string;
      code?: string;
    } | null;
  clientPortalId?: string;
  erxesCustomerId?: string;
  erxesCompanyId?: string;
  isVerified?: boolean;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  socialAuthProviders?: Array<{ provider: SocialAuthProvider }>;
  primaryAuthMethod?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const CLIENT_PORTAL_CURRENT_USER = gql`
  query ClientPortalCurrentUser {
    clientPortalCurrentUser {
      _id
      type
      email
      phone
      username
      firstName
      lastName
      avatar
      companyName
      companyRegistrationNumber
      propertiesData
      company {
        _id
        primaryName
        code
      }
      clientPortalId
      erxesCustomerId
      erxesCompanyId
      isVerified
      isPhoneVerified
      isEmailVerified
      socialAuthProviders {
        provider
      }
      primaryAuthMethod
      lastLoginAt
      createdAt
      updatedAt
    }
  }
`;

export type ClientPortalCurrentUserData = {
  clientPortalCurrentUser: CPUser | null;
};
