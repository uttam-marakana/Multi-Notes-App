export function hashPIN(pin) {
  // Simple hash function for PIN (in production, use bcrypt on backend)
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

export function verifyPIN(enteredPin, storedHash) {
  return hashPIN(enteredPin) === storedHash;
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
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
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
  if (fileType.startsWith("image/")) return "🖼️";
  if (fileType === "application/pdf") return "📄";
  return "📎";
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};
