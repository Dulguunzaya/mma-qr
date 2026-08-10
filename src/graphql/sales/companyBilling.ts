import { gql } from "@apollo/client";

export const SALES_DEAL_INVOICE_CONTENT_TYPE = "sales:deal";

export type SalesStage = {
  _id: string;
  name: string;
  code?: string;
  status?: string;
  pipelineId: string;
};

export const CP_SALES_STAGES = gql`
  query CpSalesStages($pipelineId: String!) {
    cpSalesStages(pipelineId: $pipelineId, isAll: true) {
      _id
      name
      code
      status
      pipelineId
    }
  }
`;

export type CpSalesStagesVariables = {
  pipelineId: string;
};

export type CpSalesStagesData = {
  cpSalesStages: SalesStage[];
};

export type DealProductData = {
  productId: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency: "MNT";
  tickUsed: true;
};

export const CP_COMPANY_BILLING_DEAL_ADD = gql`
  mutation CpCompanyBillingDealAdd(
    $name: String!
    $stageId: String!
    $customerIds: [String]
    $companyIds: [String]
    $description: String
    $productsData: JSON
    $extraData: JSON
  ) {
    cpDealsAdd(
      name: $name
      stageId: $stageId
      customerIds: $customerIds
      companyIds: $companyIds
      description: $description
      productsData: $productsData
      extraData: $extraData
    ) {
      _id
      name
      number
      stageId
      productsData
      extraData
    }
  }
`;

export type CpCompanyBillingDealAddVariables = {
  name: string;
  stageId: string;
  customerIds?: string[];
  companyIds?: string[];
  description?: string;
  productsData: DealProductData[];
  extraData: Record<string, unknown>;
};

export type CompanyBillingDeal = {
  _id: string;
  name?: string;
  number?: string;
  stageId?: string;
  productsData?: DealProductData[];
  extraData?: Record<string, unknown>;
};

export type CpCompanyBillingDealAddData = {
  cpDealsAdd: CompanyBillingDeal;
};

export const CP_COMPANY_BILLING_DEAL_CHANGE_STAGE = gql`
  mutation CpCompanyBillingDealChangeStage(
    $itemId: String!
    $destinationStageId: String!
    $sourceStageId: String
  ) {
    cpDealsChange(
      itemId: $itemId
      destinationStageId: $destinationStageId
      sourceStageId: $sourceStageId
    ) {
      _id
      stageId
    }
  }
`;

export type CpCompanyBillingDealChangeStageVariables = {
  itemId: string;
  destinationStageId: string;
  sourceStageId?: string;
};

export type CpCompanyBillingDealChangeStageData = {
  cpDealsChange: Pick<CompanyBillingDeal, "_id" | "stageId">;
};

export type MyTicketDeal = {
  _id: string;
  name?: string;
  number?: string;
  createdAt?: string;
  productsData?: DealProductData[];
  extraData?: Record<string, unknown>;
  stage?: Pick<SalesStage, "_id" | "name" | "code" | "status" | "pipelineId">;
};

export const CP_MY_TICKET_DEALS = gql`
  query CpMyTicketDeals(
    $customerIds: [String]
    $companyIds: [String]
    $limit: Int
  ) {
    cpDeals(customerIds: $customerIds, companyIds: $companyIds, limit: $limit) {
      list {
        _id
        name
        number
        createdAt
        productsData
        extraData
        stage {
          _id
          name
          code
          status
          pipelineId
        }
      }
      totalCount
    }
  }
`;

export type CpMyTicketDealsVariables = {
  customerIds?: string[];
  companyIds?: string[];
  limit?: number;
};

export type CpMyTicketDealsData = {
  cpDeals: {
    list: MyTicketDeal[];
    totalCount?: number;
  };
};
