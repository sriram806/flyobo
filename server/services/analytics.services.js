export const generateLast12MonthsData = async (model, options = {}) => {
  const { filter = {}, dateField = "createdAt", months = 12 } = options;

  const now = new Date();

  const monthPromises = Array.from({ length: months }, (_, i) => {
    // Go back i months from *current* month
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(dt.getFullYear(), dt.getMonth(), 1);

    // If it's the current month, end = today+1
    const endOfMonth =
      i === 0
        ? new Date()
        : new Date(dt.getFullYear(), dt.getMonth() + 1, 1);

    return model
      .countDocuments({
        ...filter,
        [dateField]: { $gte: startOfMonth, $lt: endOfMonth },
      })
      .then((count) => ({
        month: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`,
        count,
      }));
  });

  let results = await Promise.all(monthPromises);

  // Reverse so oldest → newest
  results = results.reverse();

  // Add growth, cumulative, trend
  let cumulative = 0;
  results = results.map((data, i, arr) => {
    cumulative += data.count;

    const prevCount = i > 0 ? arr[i - 1].count : 0;
    const growth = prevCount === 0 ? 100 : ((data.count - prevCount) / prevCount) * 100;

    let trend = "no-change";
    if (data.count > prevCount) trend = "up";
    else if (data.count < prevCount) trend = "down";

    return {
      ...data,
      growth: Number(growth.toFixed(2)),
      cumulative,
      trend,
    };
  });

  return { last12Months: results };
};
