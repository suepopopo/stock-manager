// 入力値がドメインルール上不正な場合のエラー。HTTP層で400に変換する。
export class DomainValidationError extends Error {}
