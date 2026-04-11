export function hashPIN(pin) {
  // Improved hash function using a simple salt and multiple rounds for better security
  const salt = "noteflow_salt_2024";
  let hash = 0;
  const combined = salt + pin;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0xffffffff; // Ensure 32-bit
  }
  // Add some rounds
  for (let round = 0; round < 10; round++) {
    hash = ((hash << 7) - hash + round) & 0xffffffff;
  }
  return hash.toString(36);
}

export function verifyPIN(enteredPin, storedHash) {
  return hashPIN(enteredPin) === storedHash;
}

export function verifyProtectedPIN(enteredPin, storedHash, fallbackHash) {
  if (!enteredPin) return false;
  if (storedHash && verifyPIN(enteredPin, storedHash)) return true;
  if (fallbackHash && verifyPIN(enteredPin, fallbackHash)) return true;
  return false;
}

const PROTECTED_ACCESS_KEY = "noteflow-protected-access";

function readProtectedAccess() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = sessionStorage.getItem(PROTECTED_ACCESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeProtectedAccess(accessMap) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(PROTECTED_ACCESS_KEY, JSON.stringify(accessMap));
}

export function hasProtectedAccess(type, id) {
  if (!type || !id) return false;

  const accessMap = readProtectedAccess();
  return Boolean(accessMap?.[type]?.[id]);
}

export function grantProtectedAccess(type, id) {
  if (!type || !id) return;

  const accessMap = readProtectedAccess();
  accessMap[type] = {
    ...(accessMap[type] || {}),
    [id]: true,
  };

  writeProtectedAccess(accessMap);
}

export function revokeProtectedAccess(type, id) {
  if (!type || !id) return;

  const accessMap = readProtectedAccess();
  if (!accessMap[type]) return;

  delete accessMap[type][id];

  if (Object.keys(accessMap[type]).length === 0) {
    delete accessMap[type];
  }

  writeProtectedAccess(accessMap);
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
