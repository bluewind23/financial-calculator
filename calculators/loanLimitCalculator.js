// calculators/loanLimitCalculator.js
class LoanLimitCalculator {
    calculateDSRLimit(monthlyIncome, existingDebt, loanTerm = 30, interestRate = 4.0) {
        const maxDSRRatio = 0.4; // 40% DSR 규제
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;

        const availablePayment = (monthlyIncome * maxDSRRatio) - existingDebt;

        if (availablePayment <= 0) return 0;

        if (monthlyRate === 0) {
            return availablePayment * numPayments;
        }

        const maxLoan = availablePayment *
            (Math.pow(1 + monthlyRate, numPayments) - 1) /
            (monthlyRate * Math.pow(1 + monthlyRate, numPayments));

        return maxLoan;
    }

    calculateLTVLimit(propertyValue, ltvRatio = 0.7) {
        return propertyValue * ltvRatio;
    }

    calculateFinalLimit(dsrLimit, ltvLimit) {
        return Math.min(dsrLimit, ltvLimit);
    }
}
window.LoanLimitCalculator = LoanLimitCalculator; // 클래스를 window 객체에 할당