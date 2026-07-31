import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../domain/errors.js";
import type { CreditCard, CreditCardRepository, NewCreditCard } from "./ports.js";
import { registerCreditCard } from "./registerCreditCard.js";

function createFakeRepository(): CreditCardRepository {
  let nextId = 1;
  return {
    async findAll() {
      return [];
    },
    async create(input: NewCreditCard): Promise<CreditCard> {
      return {
        id: nextId++,
        ...input,
        cardLast4: input.cardLast4 ?? null,
        canceledDate: input.canceledDate ?? null,
        annualFeeAmount: input.annualFeeAmount ?? null,
        annualFeePaymentDay: input.annualFeePaymentDay ?? null,
        memo: input.memo ?? null,
      };
    },
    async update() {
      throw new Error("not used in this test");
    },
    async remove() {
      throw new Error("not used in this test");
    },
  };
}

const validInput: NewCreditCard = {
  accountKey: "main",
  brandKey: "visa",
  cardName: "楽天ゴールドカード",
  displayName: "楽天ゴールド(h)",
  holderName: "山田太郎",
  status: "契約中",
  joinedDate: "2020-01-01",
  annualFeeFlag: false,
};

describe("registerCreditCard", () => {
  it("有効な入力なら登録できる", async () => {
    const repository = createFakeRepository();
    const created = await registerCreditCard(repository, validInput);
    expect(created.id).toBe(1);
    expect(created.cardName).toBe("楽天ゴールドカード");
  });

  it("accountKeyがconfig/accounts.tsに存在しなければエラー", async () => {
    const repository = createFakeRepository();
    await expect(
      registerCreditCard(repository, { ...validInput, accountKey: "unknown" }),
    ).rejects.toThrow(DomainValidationError);
  });

  it("brandKeyがconfig/creditCardBrands.tsに存在しなければエラー", async () => {
    const repository = createFakeRepository();
    await expect(
      registerCreditCard(repository, { ...validInput, brandKey: "unknown" }),
    ).rejects.toThrow(DomainValidationError);
  });

  it("statusが契約中／解約済以外ならエラー", async () => {
    const repository = createFakeRepository();
    await expect(
      registerCreditCard(repository, {
        ...validInput,
        status: "不正" as NewCreditCard["status"],
      }),
    ).rejects.toThrow(DomainValidationError);
  });
});
