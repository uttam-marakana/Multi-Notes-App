const PIN_HASH_PREFIX = "v1";
const PIN_HASH_ITERATIONS = 120000;
const PIN_SALT_BYTES = 16;
const PIN_KEY_LENGTH = 256;

function legacyHashPIN(pin) {
  const salt = "noteflow_salt_2024";
  let hash = 0;
  const combined = salt + pin;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0xffffffff;
  }
  for (let round = 0; round < 10; round++) {
    hash = ((hash << 7) - hash + round) & 0xffffffff;
  }
  return hash.toString(36);
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export async function hashPIN(pin) {
  if (!/^\d{4}$/.test(String(pin))) {
    throw new Error("PIN must be exactly 4 digits");
  }

  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure PIN hashing is unavailable in this browser");
  }

  const salt = crypto.getRandomValues(new Uint8Array(PIN_SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(pin)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PIN_HASH_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    PIN_KEY_LENGTH,
  );

  return `${PIN_HASH_PREFIX}:${PIN_HASH_ITERATIONS}:${bytesToBase64(salt)}:${bytesToBase64(new Uint8Array(derivedBits))}`;
}

async function verifyModernPIN(enteredPin, storedHash) {
  const [version, iterationsRaw, saltRaw, hashRaw] = String(storedHash).split(":");
  if (version !== PIN_HASH_PREFIX || !iterationsRaw || !saltRaw || !hashRaw) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) {
    return false;
  }

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(enteredPin)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: base64ToBytes(saltRaw),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    PIN_KEY_LENGTH,
  );

  return constantTimeEqual(
    new Uint8Array(derivedBits),
    base64ToBytes(hashRaw),
  );
}

export async function verifyPIN(enteredPin, storedHash) {
  if (!/^\d{4}$/.test(String(enteredPin)) || !storedHash) return false;

  if (String(storedHash).startsWith(`${PIN_HASH_PREFIX}:`)) {
    return verifyModernPIN(enteredPin, storedHash);
  }

  // Backward compatibility for existing boards/notes. A successful legacy
  // verification should be followed by a PIN update to migrate the record.
  return legacyHashPIN(String(enteredPin)) === storedHash;
}

export async function verifyProtectedPIN(enteredPin, storedHash, fallbackHash) {
  if (!enteredPin) return false;
  if (storedHash && (await verifyPIN(enteredPin, storedHash))) return true;
  if (fallbackHash && (await verifyPIN(enteredPin, fallbackHash))) return true;
  return false;
}

const PROTECTED_ACCESS_KEY = "noteflow-protected-access";
const PROTECTED_ACCESS_TTL = 5 * 60 * 1000;

function readProtectedAccess() {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(PROTECTED_ACCESS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const now = Date.now();

    for (const type of Object.keys(parsed)) {
      for (const id of Object.keys(parsed[type] || {})) {
        if (!parsed[type][id] || parsed[type][id] <= now) {
          delete parsed[type][id];
        }
      }
      if (Object.keys(parsed[type] || {}).length === 0) delete parsed[type];
    }

    return parsed;
  } catch {
    return {};
  }
}

function writeProtectedAccess(accessMap) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PROTECTED_ACCESS_KEY, JSON.stringify(accessMap));
}

export function hasProtectedAccess(type, id) {
  if (!type || !id) return false;
  return Boolean(readProtectedAccess()?.[type]?.[id]);
}

export function grantProtectedAccess(type, id) {
  if (!type || !id) return;
  const accessMap = readProtectedAccess();
  accessMap[type] = {
    ...(accessMap[type] || {}),
    [id]: Date.now() + PROTECTED_ACCESS_TTL,
  };
  writeProtectedAccess(accessMap);
}

export function revokeProtectedAccess(type, id) {
  if (!type || !id) return;
  const accessMap = readProtectedAccess();
  if (!accessMap[type]) return;

  delete accessMap[type][id];
  if (Object.keys(accessMap[type]).length === 0) delete accessMap[type];
  writeProtectedAccess(accessMap);
}



const RICH_TEXT_ALLOWED_TAGS = new Set([
  "P", "BR", "STRONG", "B", "EM", "I", "U", "S", "DEL", "H1", "H2", "H3",
  "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE", "A", "HR", "LABEL", "INPUT",
]);
const RICH_TEXT_ALLOWED_ATTRS = new Set(["href", "target", "rel", "type", "checked", "class"]);

export function sanitizeRichText(value = "") {
  const raw = String(value ?? "");
  if (!raw || typeof DOMParser === "undefined") return raw;
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "text/html");

  [...doc.body.querySelectorAll("*")].forEach((element) => {
    if (!RICH_TEXT_ALLOWED_TAGS.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (!RICH_TEXT_ALLOWED_ATTRS.has(name)) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === "A") {
      const href = element.getAttribute("href") || "";
      if (!/^https?:\/\//i.test(href)) element.removeAttribute("href");
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }

    if (element.tagName === "INPUT") {
      if (element.getAttribute("type") !== "checkbox") {
        element.remove();
      } else {
        element.setAttribute("disabled", "disabled");
      }
    }
  });

  return doc.body.innerHTML;
}

export function richTextToPlainText(value = "") {
  const raw = String(value ?? "");
  if (!raw) return "";
  if (typeof DOMParser === "undefined") return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const doc = new DOMParser().parseFromString(sanitizeRichText(raw), "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

function toDateObject(date) {
  if (!date) return null;

  if (date instanceof Date) {
    return date;
  }

  if (typeof date?.toDate === "function") {
    return date.toDate();
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const getPriorityColor = (priority, priorityColors) => {
  return priorityColors[priority] || priorityColors.low;
};

export const getPriorityLabel = (priority) => {
  const labels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return labels[priority] || "Low";
};

export const formatDate = (date) => {
  const d = toDateObject(date);
  if (!d) return "";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  const d = toDateObject(date);
  if (!d) return "";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const truncateText = (text, length = 50) => {
  return text?.length > length ? text?.substring(0, length) + "..." : text;
};

export const isFileTypeAllowed = (fileType) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];
  return allowedTypes.includes(fileType);
};

export const getFileIcon = (fileType) => {
  if (!fileType) return "📎";
  if (fileType.startsWith("image/")) return "🖼️";
  if (fileType === "application/pdf") return "📄";
  return "📎";
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
