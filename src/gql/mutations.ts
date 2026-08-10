export const REGISTER_LEAD_MUTATION = `
  mutation RegisterLead(
    $phone: String
    $email: String
    $firstName: String
    $lastName: String
    $userType: CPUserType
    $propertiesData: JSON
  ) {
    clientPortalUserRegister(
      phone: $phone
      email: $email
      firstName: $firstName
      lastName: $lastName
      userType: $userType
      propertiesData: $propertiesData
    ) {
      _id
    }
  }
`;
