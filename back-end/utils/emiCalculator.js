/**
 * EMI Calculation Utilities
 * Uses standard reducing balance EMI formula: E = P × r × (1+r)^n / ((1+r)^n - 1)
 */

function calculateEMI(principal, annualRate, tenureMonths) {
  if (annualRate === 0) return Math.round((principal / tenureMonths) * 100) / 100;
  const r = annualRate / 100 / 12; // monthly rate
  const n = tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi * 100) / 100;
}

function generateEMISchedule(principal, annualRate, tenureMonths, startDate, frequency = 'monthly', customDays = null) {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const r = annualRate / 100 / 12;
  let balance = principal;
  const schedule = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const interestComponent = Math.round(balance * r * 100) / 100;
    let principalComponent = Math.round((emi - interestComponent) * 100) / 100;

    // Last EMI adjustment
    if (i === tenureMonths) {
      principalComponent = Math.round(balance * 100) / 100;
    }

    const dueDate = getNextDueDate(startDate, i, frequency, customDays);

    schedule.push({
      emiNumber: i,
      dueDate,
      emiAmount: i === tenureMonths ? Math.round((principalComponent + interestComponent) * 100) / 100 : emi,
      principalComponent,
      interestComponent,
      status: 'upcoming',
    });

    balance -= principalComponent;
    if (balance < 0) balance = 0;
  }

  return schedule;
}

function getNextDueDate(startDate, period, frequency, customDays) {
  const date = new Date(startDate);
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + period * 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + period * 14);
      break;
    case 'custom':
      date.setDate(date.getDate() + period * (customDays || 30));
      break;
    case 'monthly':
    default:
      date.setMonth(date.getMonth() + period);
      break;
  }
  return date;
}

function calculatePenalty(emiAmount, penaltyType, penaltyValue, overdueDays) {
  if (overdueDays <= 0) return 0;
  if (penaltyType === 'flat') return penaltyValue;
  // percentage: apply per month overdue (prorated)
  const monthsOverdue = Math.ceil(overdueDays / 30);
  return Math.round(emiAmount * (penaltyValue / 100) * monthsOverdue * 100) / 100;
}

function generateLoanNumber() {
  const prefix = 'LN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

module.exports = { calculateEMI, generateEMISchedule, calculatePenalty, generateLoanNumber };
