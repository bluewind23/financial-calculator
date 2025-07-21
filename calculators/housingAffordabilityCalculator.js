// calculators/housingAffordabilityCalculator.js
class HousingAffordabilityCalculator {
    calculateAffordability(monthlyIncome, downPayment, interestRate, loanTerm) {
        const maxPaymentRatio = 0.3; // 월 소득의 30%
        const maxMonthlyPayment = monthlyIncome * maxPaymentRatio;

        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;

        let maxLoanAmount;
        if (monthlyRate === 0) {
            maxLoanAmount = maxMonthlyPayment * numPayments;
        } else {
            maxLoanAmount = maxMonthlyPayment *
                (Math.pow(1 + monthlyRate, numPayments) - 1) /
                (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
        }

        const totalPurchasePrice = maxLoanAmount + downPayment;

        return {
            maxLoanAmount,
            totalPurchasePrice,
            monthlyPayment: maxMonthlyPayment
        };
    }
}
window.HousingAffordabilityCalculator = HousingAffordabilityCalculator; // 클래스를 window 객체에 할당