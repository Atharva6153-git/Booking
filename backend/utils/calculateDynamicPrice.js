const calculateDynamicPrice = (basePrice, dateStr, startTime) => {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;

  const hour = parseInt(startTime.split(':')[0], 10);
  const isEveningPeak = hour >= 18 && hour < 21;

  let multiplier = 1;

  if (isWeekend && isEveningPeak) {
    multiplier = 1.3;
  } else if (isWeekend) {
    multiplier = 1.2;
  } else if (isEveningPeak) {
    multiplier = 1.15;
  }

  const finalPrice = Math.round(basePrice * multiplier);

  return { finalPrice, multiplier, isPeak: multiplier > 1 };
};

module.exports = calculateDynamicPrice;