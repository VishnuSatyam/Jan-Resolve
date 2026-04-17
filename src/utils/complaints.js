export const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export function formatComplaintDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-GB");
}

export function getComplaintImageUrl(complaint) {
  const imagePath = complaint?.attachments?.[0]?.url;

  if (!imagePath) {
    return "";
  }

  return imagePath.startsWith("http") ? imagePath : `${apiBaseUrl}${imagePath}`;
}
