import { PglDbAccount, PglDbTransfer, PglId } from "./types";

export class PglAccount {
  public readonly id: PglId;
  public readonly name: string;
  public readonly balance: string;
  public readonly version: string;
  public readonly allowNegativeBalance: boolean;
  public readonly allowPositiveBalance: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(row: PglDbAccount) {
    this.id = row.id;
    this.name = row.name;
    this.balance = row.balance;
    this.version = row.version;
    this.allowNegativeBalance = row.allow_negative_balance;
    this.allowPositiveBalance = row.allow_positive_balance;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }
}

export class PglTransfer {
  public readonly id: PglId;
  public readonly fromAccountId: PglId;
  public readonly toAccountId: PglId;
  public readonly amount: string;
  public readonly createdAt: Date;
  public readonly eventAt: Date;
  public readonly metadata?: Record<string, unknown>;

  constructor(row: PglDbTransfer) {
    this.id = row.id;
    this.fromAccountId = row.from_accound_id;
    this.toAccountId = row.to_account_id;
    this.amount = row.amount;
    this.createdAt = row.created_at;
    this.eventAt = row.event_at;
  }
}
