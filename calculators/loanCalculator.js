// calculators/loanCalculator.js
class LoanCalculator {
    calculateEqualPayment(principal, rate, years) {
        const monthlyRate = rate / 100 / 12;
        const numPayments = years * 12;

        if (monthlyRate === 0) {
            return {
                monthlyPayment: principal / numPayments,
                totalPayment: principal,
                totalInterest: 0
            };
        }

        const monthlyPayment = principal *
            (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1);

        const totalPayment = monthlyPayment * numPayments;
        const totalInterest = totalPayment - principal;

        return {
            monthlyPayment,
            totalPayment,
            totalInterest
        };
    }

    calculateEqualPrincipal(principal, rate, years) {
        const monthlyRate = rate / 100 / 12;
        const numPayments = years * 12;
        const principalPayment = principal / numPayments;

        let totalPayment = 0;
        let remainingPrincipal = principal;

        for (let i = 0; i < numPayments; i++) {
            const interestPayment = remainingPrincipal * monthlyRate;
            totalPayment += principalPayment + interestPayment;
            remainingPrincipal -= principalPayment;
        }

        const totalInterest = totalPayment - principal;
        const firstMonthPayment = principalPayment + (principal * monthlyRate);

        return {
            monthlyPayment: firstMonthPayment, // First month payment (highest)
            totalPayment,
            totalInterest
        };
    }
}
window.LoanCalculator = LoanCalculator; // 클래스를 window 객체에 할당