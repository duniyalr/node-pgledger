import { PGLedger } from "../src/lib";
import { PglAccount, PglTransfer } from "../src/models";
import { PglId } from "../src/types";

describe("public tests", () => {
  let pgl: PGLedger;
  let accId1: PglId, accId2: PglId;

  beforeAll(async () => {
    pgl = await PGLedger.init({
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "test-pgledger",
      ssl: false,
    });

    accId1 = await pgl.createAccount("test account", "USD");
    accId2 = await pgl.createAccount("test account", "USD");
  });

  it("Check pgl instance", () => {
    expect(pgl).toBeDefined();
  });

  it("Create an account", async () => {
    const accountId = await pgl.createAccount("test account", "USD");
    expect(accountId).toEqual(expect.any(String));
  });

  it("Account lookup", async () => {
    const accountId1 = await pgl.createAccount("test account", "USD");
    const accountId2 = await pgl.createAccount("test account", "USD");
    const lookupResult = await pgl.lookup([accountId1, accountId2]);

    expect(Array.isArray(lookupResult)).toBe(true);
    expect(lookupResult.every((item) => item instanceof PglAccount)).toBe(true);
  });

  it("Create transfer", async () => {
    const accountId1 = await pgl.createAccount("test account", "USD");
    const accountId2 = await pgl.createAccount("test account", "USD");

    const t1Id = await pgl.createTransfer(accountId1, accountId2, "1000");
    expect(t1Id).toEqual(expect.any(String));
  });

  it("Create transfers", async () => {
    const accountId1 = await pgl.createAccount("test account 1", "USD");
    const accountId2 = await pgl.createAccount("test account 2", "USD");
    const accountId3 = await pgl.createAccount("test account 3", "USD");

    const tIds = await pgl.createTransfers([
      { accountId1: accountId1, accountId2: accountId2, amount: "1000" },
      { accountId1: accountId2, accountId2: accountId3, amount: "1000" },
    ]);

    expect(tIds).toEqual(expect.arrayContaining([expect.any(String)]));
  });

  it("All account transfers", async () => {
    const accountId1 = await pgl.createAccount("test account 1", "USD");
    const accountId2 = await pgl.createAccount("test account 2", "USD");
    const accountId3 = await pgl.createAccount("test account 3", "USD");

    const tIds = await pgl.createTransfers([
      { accountId1: accountId1, accountId2: accountId2, amount: "1000" },
      { accountId1: accountId2, accountId2: accountId3, amount: "1000" },
    ]);

    const allAccountTransfers = await pgl.allAccountTransfers(accountId2);

    expect(Array.isArray(allAccountTransfers)).toBe(true);
    expect(
      allAccountTransfers.every(
        (item) => item instanceof PglTransfer && tIds.includes(item.id)
      )
    ).toBe(true);
  });

  it("Lookup transfers", async () => {
    const tId = await pgl.createTransfer(accId1, accId2, "1000");
    const transfers = await pgl.lookupTransfers([tId]);

    expect(Array.isArray(transfers)).toBe(true);
    expect(transfers.every((item) => item instanceof PglTransfer)).toBe(true);
  });

  afterAll(async () => {
    await pgl.destroy();
  });
});
