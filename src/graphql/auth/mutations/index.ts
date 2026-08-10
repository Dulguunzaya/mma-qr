import { gql } from "@apollo/client";
import type {
  CPUser,
  SocialAuthProvider,
} from "@/graphql/auth/queries";

export type CPUserType = "customer" | "company";

export const CLIENT_PORTAL_USER_REGISTER = gql`
  mutation ClientPortalUserRegister(
    $phone: String
    $email: String
    $username: String
    $password: String
    $firstName: String
    $lastName: String
    $userType: CPUserType
    $code: String
    $propertiesData: JSON
  ) {
    clientPortalUserRegister(
      phone: $phone
      email: $email
      username: $username
      password: $password
      firstName: $firstName
      lastName: $lastName
      userType: $userType
      code: $code
      propertiesData: $propertiesData
    ) {
      _id
      email
      phone
      username
      firstName
      lastName
      isVerified
      isEmailVerified
      isPhoneVerified
      createdAt
    }
  }
`;

export type ClientPortalUserRegisterVariables = {
  phone?: string;
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  userType?: CPUserType;
  code?: string;
  propertiesData?: Record<string, unknown>;
};

export type ClientPortalUserRegisterData = {
  clientPortalUserRegister: CPUser;
};

export const CLIENT_PORTAL_USER_REGISTER_WITH_SOCIAL = gql`
  mutation ClientPortalUserRegisterWithSocial(
    $provider: SocialAuthProvider!
    $token: String!
  ) {
    clientPortalUserRegisterWithSocial(provider: $provider, token: $token) {
      _id
      email
      phone
      username
      firstName
      lastName
      socialAuthProviders
      isVerified
      isEmailVerified
      isPhoneVerified
      createdAt
    }
  }
`;

export type ClientPortalUserRegisterWithSocialVariables = {
  provider: SocialAuthProvider;
  token: string;
};

export type ClientPortalUserRegisterWithSocialData = {
  clientPortalUserRegisterWithSocial: {
    _id: string;
    email?: string;
    phone?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    socialAuthProviders?: SocialAuthProvider[];
    isVerified?: boolean;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    createdAt?: string;
  };
};

export const CLIENT_PORTAL_USER_LOGIN_WITH_CREDENTIALS = gql`
  mutation ClientPortalUserLoginWithCredentials(
    $email: String
    $phone: String
    $password: String
  ) {
    clientPortalUserLoginWithCredentials(
      email: $email
      phone: $phone
      password: $password
    )
  }
`;

export type ClientPortalUserLoginWithCredentialsVariables = {
  email?: string;
  phone?: string;
  password?: string;
};

export type ClientPortalUserLoginWithCredentialsData = {
  clientPortalUserLoginWithCredentials:
    | "Success"
    | {
        success: true;
        token: string;
        refreshToken: string;
      };
};

export const CLIENT_PORTAL_USER_REQUEST_OTP = gql`
  mutation ClientPortalUserRequestOTP($identifier: String!) {
    clientPortalUserRequestOTP(identifier: $identifier)
  }
`;

export type ClientPortalUserRequestOTPVariables = {
  identifier: string;
};

export type ClientPortalUserRequestOTPData = {
  clientPortalUserRequestOTP: string;
};

export const CLIENT_PORTAL_USER_LOGIN_WITH_OTP = gql`
  mutation ClientPortalUserLoginWithOTP(
    $identifier: String!
    $otp: String!
  ) {
    clientPortalUserLoginWithOTP(identifier: $identifier, otp: $otp)
  }
`;

export type ClientPortalUserLoginWithOTPVariables = {
  identifier: string;
  otp: string;
};

export type ClientPortalUserLoginWithOTPData = {
  clientPortalUserLoginWithOTP:
    | "Success"
    | {
        success: true;
        token: string;
        refreshToken: string;
      };
};

export const CLIENT_PORTAL_USER_LOGIN_WITH_SOCIAL = gql`
  mutation ClientPortalUserLoginWithSocial(
    $provider: SocialAuthProvider!
    $token: String!
  ) {
    clientPortalUserLoginWithSocial(provider: $provider, token: $token)
  }
`;

export type ClientPortalUserLoginWithSocialVariables = {
  provider: SocialAuthProvider;
  token: string;
};

export type ClientPortalUserLoginWithSocialData = {
  clientPortalUserLoginWithSocial: string;
};

export const CLIENT_PORTAL_USER_VERIFY = gql`
  mutation ClientPortalUserVerify(
    $userId: String
    $code: String!
    $email: String
    $phone: String
  ) {
    clientPortalUserVerify(
      userId: $userId
      code: $code
      email: $email
      phone: $phone
    ) {
      _id
      email
      isVerified
      isEmailVerified
      isPhoneVerified
    }
  }
`;

export type ClientPortalUserVerifyVariables = {
  userId?: string;
  code: string;
  email?: string;
  phone?: string;
};

export type ClientPortalUserVerifyData = {
  clientPortalUserVerify: CPUser;
};

export const CLIENT_PORTAL_USER_FORGOT_PASSWORD = gql`
  mutation ClientPortalUserForgotPassword($identifier: String!) {
    clientPortalUserForgotPassword(identifier: $identifier)
  }
`;

export type ClientPortalUserForgotPasswordVariables = {
  identifier: string;
};

export type ClientPortalUserForgotPasswordData = {
  clientPortalUserForgotPassword: string;
};

export const CLIENT_PORTAL_USER_RESET_PASSWORD = gql`
  mutation clientPortalUserResetPassword(
    $identifier: String!
    $code: String!
    $newPassword: String!
  ) {
    clientPortalUserResetPassword(
      identifier: $identifier
      code: $code
      newPassword: $newPassword
    )
  }
`;

export type ClientPortalUserResetPasswordVariables = {
  identifier: string;
  code: string;
  newPassword: string;
};

export type ClientPortalUserResetPasswordData = {
  clientPortalUserResetPassword: string;
};

export const CLIENT_PORTAL_LOGOUT = gql`
  mutation ClientPortalLogout {
    clientPortalLogout
  }
`;

export type ClientPortalLogoutData = {
  clientPortalLogout: string;
};

export const CLIENT_PORTAL_USER_EDIT_EMAIL_PHONE = gql`
  mutation ClientPortalUserEditEmailPhone($email: String, $phone: String) {
    clientPortalUserEdit(email: $email, phone: $phone) {
      _id
      email
      phone
      updatedAt
    }
  }
`;

export type ClientPortalUserEditEmailPhoneVariables = {
  email?: string;
  phone?: string;
};

export type ClientPortalUserEditEmailPhoneData = {
  clientPortalUserEdit: Pick<CPUser, "_id" | "email" | "phone" | "updatedAt">;
};

export const CLIENT_PORTAL_USER_EDIT_DETAILS = gql`
  mutation ClientPortalUserEditDetails(
    $firstName: String
    $lastName: String
    $companyName: String
    $companyRegistrationNumber: String
  ) {
    clientPortalUserEdit(
      firstName: $firstName
      lastName: $lastName
      companyName: $companyName
      companyRegistrationNumber: $companyRegistrationNumber
    ) {
      _id
      firstName
      lastName
      companyName
      companyRegistrationNumber
      erxesCompanyId
      updatedAt
    }
  }
`;

export type ClientPortalUserEditDetailsVariables = {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
};

export type ClientPortalUserEditDetailsData = {
  clientPortalUserEdit: Pick<
    CPUser,
    | "_id"
    | "firstName"
    | "lastName"
    | "companyName"
    | "companyRegistrationNumber"
    | "erxesCompanyId"
    | "updatedAt"
  >;
};

export const CLIENT_PORTAL_COMPANY_EDIT = gql`
  mutation ClientPortalCompanyEdit(
    $primaryName: String
    $code: String
    $emails: [String]
    $phones: [String]
  ) {
    clientPortalCompanyEdit(
      primaryName: $primaryName
      code: $code
      emails: $emails
      phones: $phones
    ) {
      _id
      primaryName
      code
    }
  }
`;

export type ClientPortalCompanyEditVariables = {
  primaryName?: string;
  code?: string;
  emails?: string[];
  phones?: string[];
};

export type ClientPortalCompanyEditData = {
  clientPortalCompanyEdit: {
    _id: string;
    primaryName?: string;
    code?: string;
  };
};

export const CLIENT_PORTAL_USER_REFRESH_TOKEN = gql`
  mutation ClientPortalUserRefreshToken($refreshToken: String!) {
    clientPortalUserRefreshToken(refreshToken: $refreshToken)
  }
`;

export type ClientPortalUserRefreshTokenVariables = {
  refreshToken: string;
};

export type ClientPortalUserRefreshTokenData = {
  clientPortalUserRefreshToken: string;
};

export const CLIENT_PORTAL_USER_LINK_SOCIAL_ACCOUNT = gql`
  mutation ClientPortalUserLinkSocialAccount(
    $provider: SocialAuthProvider!
    $token: String!
  ) {
    clientPortalUserLinkSocialAccount(provider: $provider, token: $token) {
      _id
      socialAuthProviders
    }
  }
`;

export type ClientPortalUserLinkSocialAccountVariables = {
  provider: SocialAuthProvider;
  token: string;
};

export type ClientPortalUserLinkSocialAccountData = {
  clientPortalUserLinkSocialAccount: {
    _id: string;
    socialAuthProviders?: SocialAuthProvider[];
  };
};

export const CLIENT_PORTAL_USER_UNLINK_SOCIAL_ACCOUNT = gql`
  mutation ClientPortalUserUnlinkSocialAccount($provider: SocialAuthProvider!) {
    clientPortalUserUnlinkSocialAccount(provider: $provider) {
      _id
      socialAuthProviders
    }
  }
`;

export type ClientPortalUserUnlinkSocialAccountVariables = {
  provider: SocialAuthProvider;
};

export type ClientPortalUserUnlinkSocialAccountData = {
  clientPortalUserUnlinkSocialAccount: {
    _id: string;
    socialAuthProviders?: SocialAuthProvider[];
  };
};

export const CLIENT_PORTAL_USER_REQUEST_CHANGE_EMAIL = gql`
  mutation ClientPortalUserRequestChangeEmail($newEmail: String!) {
    clientPortalUserRequestChangeEmail(newEmail: $newEmail)
  }
`;

export type ClientPortalUserRequestChangeEmailVariables = {
  newEmail: string;
};

export type ClientPortalUserRequestChangeEmailData = {
  clientPortalUserRequestChangeEmail: string;
};

export const CLIENT_PORTAL_USER_CONFIRM_CHANGE_EMAIL = gql`
  mutation ClientPortalUserConfirmChangeEmail($code: String!) {
    clientPortalUserConfirmChangeEmail(code: $code) {
      _id
      email
      isEmailVerified
    }
  }
`;

export type ClientPortalUserConfirmChangeEmailVariables = {
  code: string;
};

export type ClientPortalUserConfirmChangeEmailData = {
  clientPortalUserConfirmChangeEmail: CPUser;
};

export const CLIENT_PORTAL_USER_REQUEST_CHANGE_PHONE = gql`
  mutation ClientPortalUserRequestChangePhone($newPhone: String!) {
    clientPortalUserRequestChangePhone(newPhone: $newPhone)
  }
`;

export type ClientPortalUserRequestChangePhoneVariables = {
  newPhone: string;
};

export type ClientPortalUserRequestChangePhoneData = {
  clientPortalUserRequestChangePhone: string;
};

export const CLIENT_PORTAL_USER_CONFIRM_CHANGE_PHONE = gql`
  mutation ClientPortalUserConfirmChangePhone($code: String!) {
    clientPortalUserConfirmChangePhone(code: $code) {
      _id
      phone
      isPhoneVerified
    }
  }
`;

export type ClientPortalUserConfirmChangePhoneVariables = {
  code: string;
};

export type ClientPortalUserConfirmChangePhoneData = {
  clientPortalUserConfirmChangePhone: CPUser;
};
