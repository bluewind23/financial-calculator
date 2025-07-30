// calculators/loanLimitCalculator.js
class LoanLimitCalculator {

    _calculateMonthlyPayment(principal, interestRate, loanTerm) {
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;
        if (monthlyRate === 0) return principal / numPayments;
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    calculateDSRLimit(monthlyIncome, existingDebt, loanTerm = 30, interestRate = 4.0, dsrLimitRate = 40) {
        const maxDSRRatio = dsrLimitRate / 100;
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

    calculateLTVLimit(propertyValue, ltvLimitRate = 70) {
        return propertyValue * (ltvLimitRate / 100);
    }

    calculateFinalLimit(dsrLimit, ltvLimit) {
        return Math.min(dsrLimit, ltvLimit);
    }

    // 주택담보대출 한도 계산
    calculateMortgageLimit(monthlyIncome, existingDebt, propertyValue, interestRate, loanTerm, dsrLimitRate, ltvLimitRate) {
        const dsrLimit = this.calculateDSRLimit(monthlyIncome, existingDebt, loanTerm, interestRate, dsrLimitRate);
        const ltvLimit = this.calculateLTVLimit(propertyValue, ltvLimitRate);
        const finalLimit = this.calculateFinalLimit(dsrLimit, ltvLimit);
        const monthlyPayment = this._calculateMonthlyPayment(finalLimit, interestRate, loanTerm);

        return {
            dsrLimit,
            ltvLimit,
            finalLimit,
            monthlyPayment
        };
    }

    // 신용대출 한도 계산
    calculateCreditLimit(monthlyIncome, existingDebt, interestRate, loanTerm, dsrLimitRate) {
        const dsrLimit = this.calculateDSRLimit(monthlyIncome, existingDebt, loanTerm, interestRate, dsrLimitRate);
        const finalLimit = dsrLimit; // 신용대출은 DSR 한도가 최종 한도
        const monthlyPayment = this._calculateMonthlyPayment(finalLimit, interestRate, loanTerm);

        return {
            dsrLimit,
            ltvLimit: 0, // LTV는 해당 없음
            finalLimit,
            monthlyPayment
        };
    }
}
window.LoanLimitCalculator = LoanLimitCalculator; // 클래스를 window 객체에 할당