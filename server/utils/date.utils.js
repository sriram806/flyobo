export const getDurationDays = (duration = "") => {
  // Accept numbers or strings like '3D', '3 D', '3', or '3 days'
  if (duration == null) return 1;
  if (typeof duration === "number") {
    return Number.isFinite(duration) ? Math.max(1, Math.floor(duration)) : 1;
  }
  if (typeof duration === "string") {
    const d = duration.trim();
    // try explicit N D pattern
    const match = d.match(/(\d+)\s*D/i);
    if (match) return Number(match[1]);
    // try any leading number
    const numMatch = d.match(/(\d+)/);
    if (numMatch) return Number(numMatch[1]);
    // fallback to parseFloat
    const parsed = Number(d);
    if (!isNaN(parsed) && isFinite(parsed)) return Math.max(1, Math.floor(parsed));
  }
  return 1;
};

export const calculateEndDate = (startDate, durationDays) => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + durationDays - 1);
  return end;
};
