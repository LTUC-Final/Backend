const { parsePhoneNumberFromString } = require("libphonenumber-js");

function normalizeJordan(n) {
  const digits = String(n || "").replace(/\D/g, "");
  if (/^0?7\d{8}$/.test(digits)) {
    const local = digits.length === 10 ? digits.slice(1) : digits;
    return `+962${local}`;
  }
  return null;
}

function parseToE164(country_code, national_number) {
  const cc = String(country_code || "").toUpperCase();

  if (cc === "JO") {
    const jo = normalizeJordan(national_number);
    if (jo) return jo;
  }

  try {
    const p = parsePhoneNumberFromString(national_number, cc);
    if (p && p.isValid()) return p.number;
  } catch (_) {}

  if (process.env.DEV_RELAX_PHONE === "1") {
    const justDigits = String(national_number || "").replace(/\D/g, "");
    if (justDigits.length >= 8) return `+${justDigits}`;
  }

  return null;
}

module.exports = { parseToE164 };
