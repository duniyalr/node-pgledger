import {
  Options as SequelizeOptions,
  QueryOptions as SequelizeQueryOptions,
} from "sequelize";
import { PglAccount } from "./models";

export type PglId = string;
export type Sql = string;
export type PglDbOpts = Omit<SequelizeOptions, "dialect">;
export type PglSqlQueryParams = [Sql, SequelizeQueryOptions];

export type PglInitOpts = {};

export type PglDbAccount = {
  id: string;
  name: string;
  balance: string;
  version: string;
  allow_negative_balance: boolean;
  allow_positive_balance: boolean;
  created_at: Date;
  updated_at: Date;
};

export type PglDbTransfer = {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: string;
  created_at: Date;
  event_at: Date;
  metadata: Record<string, unknown>;
};

export type PglCreateAccountOpts = {
  name: string;
  currency: string;
  allowNegativeBalances?: boolean;
  allowPositiveBalances?: boolean;
};

export type PglCreateTransferOpts = {
  accountId1: PglId | PglAccount;
  accountId2: PglId | PglAccount;
  amount: string;
  eventAt?: Date;
  metadata?: Record<string, unknown>;
};

export type PglTransferQueryOpts = {
  fromAccountId?: PglId | PglAccount;
  toAccountId?: PglId | PglAccount;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  skip?: number;
  order?: "ASC" | "DSC";
};
