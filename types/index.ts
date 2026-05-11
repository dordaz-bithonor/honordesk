export type ClientStatusDto = "ACTIVE" | "INACTIVE" | "ONBOARDING";

export type ServiceTypeDto = "SPA" | "PAY_IN_OUT" | "EMPRESAS" | "NOMINA";

export type ClientTaskCountsDto = {
  urgent: number;
  pending: number;
  done: number;
};

export type ClientServiceDto = {
  id: string;
  service: ServiceTypeDto;
  startDate: string;
  contractRef: string | null;
};

export type ClientListItemDto = {
  id: string;
  name: string;
  country: string;
  status: ClientStatusDto;
  createdAt: string;
  updatedAt: string;
  services?: ClientServiceDto[];
  taskCounts?: ClientTaskCountsDto;
};
