const dns = require("dns");
const nodemailer = require("nodemailer");

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (_) {
  /* older Node */
}

const canSendMail = () =>
  Boolean(
    String(process.env.EMAIL_USER || "").trim() &&
      String(process.env.EMAIL_PASS || "").trim()
  );

const normalizeRecipient = (to) => {
  if (!to || typeof to !== "string") return null;
  const t = to.trim();
  return t.length ? t : null;
};

const buildFromAddress = () => {
  const user = String(process.env.EMAIL_USER || "").trim();
  const name = String(process.env.EMAIL_FROM_NAME || "Crick App").trim();
  if (!user) return null;
  return name ? `"${name.replace(/"/g, "")}" <${user}>` : user;
};

/**
 * Tries Gmail-compatible SMTP on 465 then 587 (STARTTLS).
 * Render and similar hosts often fail on IPv6:465; ipv4first + family:4 + port fallback helps.
 */
const smtpVariants = () => {
  const host = String(process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const auth = {
    user: String(process.env.EMAIL_USER || "").trim(),
    pass: String(process.env.EMAIL_PASS || "").trim(),
  };
  const base = {
    host,
    family: 4,
    auth,
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 20_000,
  };

  const a = { ...base, port: 465, secure: true };
  const b = { ...base, port: 587, secure: false, requireTLS: true };

  const preferred = Number(process.env.SMTP_PORT);
  if (preferred === 587) return [b, a];
  if (preferred === 465) return [a, b];
  return [a, b];
};

/**
 * @param {{ to: string, subject: string, html?: string, text?: string, from?: string }} opts
 */
async function sendMailRobust(opts) {
  const to = normalizeRecipient(opts.to);
  if (!to) {
    const e = new Error("No recipient email address.");
    e.code = "NO_RECIPIENT";
    throw e;
  }
  if (!canSendMail()) {
    const e = new Error("EMAIL_USER and EMAIL_PASS are not set.");
    e.code = "NO_CREDENTIALS";
    throw e;
  }

  const from = opts.from || buildFromAddress();
  const mail = {
    from,
    to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  };

  const variants = smtpVariants();
  let lastErr;

  for (const cfg of variants) {
    try {
      const transporter = nodemailer.createTransport(cfg);
      await transporter.sendMail(mail);
      return { ok: true, port: cfg.port };
    } catch (err) {
      lastErr = err;
      console.warn(`[mail] SMTP send failed (port ${cfg.port}): ${err.message}`);
    }
  }

  throw lastErr;
}

module.exports = {
  canSendMail,
  normalizeRecipient,
  sendMailRobust,
  buildFromAddress,
};
