"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ConflictError: () => ConflictError,
  ForbiddenError: () => ForbiddenError,
  InventoryError: () => InventoryError,
  NotFoundError: () => NotFoundError,
  PaymentError: () => PaymentError,
  SupacommerceError: () => SupacommerceError,
  UnauthorizedError: () => UnauthorizedError,
  ValidationError: () => ValidationError,
  addMoney: () => addMoney,
  buildPaginatedResult: () => buildPaginatedResult,
  err: () => err,
  formatCurrency: () => formatCurrency,
  fromMinorUnit: () => fromMinorUnit,
  generateId: () => generateId,
  isErr: () => isErr,
  isFuture: () => isFuture,
  isOk: () => isOk,
  isPast: () => isPast,
  nowISO: () => nowISO,
  ok: () => ok,
  subtractMoney: () => subtractMoney,
  toMinorUnit: () => toMinorUnit,
  unwrap: () => unwrap
});
module.exports = __toCommonJS(index_exports);
var SupacommerceError = class extends Error {
  statusCode;
  code;
  constructor(message, statusCode, code) {
    super(message);
    this.name = "SupacommerceError";
    this.statusCode = statusCode;
    this.code = code;
  }
};
var NotFoundError = class extends SupacommerceError {
  constructor(resource, id) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      "NOT_FOUND"
    );
    this.name = "NotFoundError";
  }
};
var ValidationError = class extends SupacommerceError {
  fields;
  constructor(message, fields) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.fields = fields;
  }
};
var UnauthorizedError = class extends SupacommerceError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
};
var ForbiddenError = class extends SupacommerceError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
};
var ConflictError = class extends SupacommerceError {
  constructor(message) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
};
var InventoryError = class extends SupacommerceError {
  constructor(message) {
    super(message, 422, "INVENTORY_ERROR");
    this.name = "InventoryError";
  }
};
var PaymentError = class extends SupacommerceError {
  constructor(message) {
    super(message, 402, "PAYMENT_ERROR");
    this.name = "PaymentError";
  }
};
function ok(value) {
  return { ok: true, value };
}
function err(error) {
  return { ok: false, error };
}
function isOk(result) {
  return result.ok;
}
function isErr(result) {
  return !result.ok;
}
function unwrap(result) {
  if (result.ok) return result.value;
  throw result.error;
}
var ZERO_DECIMAL_CURRENCIES = /* @__PURE__ */ new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF"
]);
function toMinorUnit(amount, currencyCode) {
  if (ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}
function fromMinorUnit(amount, currencyCode) {
  if (ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase())) {
    return amount;
  }
  return amount / 100;
}
function formatCurrency(amount, currencyCode, locale = "en-US") {
  const decimal = fromMinorUnit(amount, currencyCode);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode.toUpperCase()
  }).format(decimal);
}
function addMoney(a, b) {
  return a + b;
}
function subtractMoney(a, b) {
  return a - b;
}
function buildPaginatedResult(data, count, params) {
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  return {
    data,
    count,
    limit,
    offset,
    hasMore: offset + data.length < count
  };
}
var CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
function generateId(prefix) {
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `${prefix}_${id}`;
}
function nowISO() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function isPast(dateString) {
  return new Date(dateString) < /* @__PURE__ */ new Date();
}
function isFuture(dateString) {
  return new Date(dateString) > /* @__PURE__ */ new Date();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConflictError,
  ForbiddenError,
  InventoryError,
  NotFoundError,
  PaymentError,
  SupacommerceError,
  UnauthorizedError,
  ValidationError,
  addMoney,
  buildPaginatedResult,
  err,
  formatCurrency,
  fromMinorUnit,
  generateId,
  isErr,
  isFuture,
  isOk,
  isPast,
  nowISO,
  ok,
  subtractMoney,
  toMinorUnit,
  unwrap
});
//# sourceMappingURL=index.cjs.map