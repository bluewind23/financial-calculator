// calculators/loanCalculator.js
class LoanCalculator {
    calculateEqualPayment(principal, rate, years) {
        const monthlyRate = rate / 100 / 12;
        const numPayments = years * 12;

        if (monthlyRate === 0) {
            const monthlyPayment = principal / numPayments;
            return {
                monthlyPayment: monthlyPayment,
                totalPayment: principal,
                totalInterest: 0,
                firstMonthPrincipal: monthlyPayment,
                firstMonthInterest: 0,
            };
        }

        const monthlyPayment = principal *
            (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1);

        const totalPayment = monthlyPayment * numPayments;
        const totalInterest = totalPayment - principal;

        // 첫 달 이자 및 원금 계산
        const firstMonthInterest = principal * monthlyRate;
        const firstMonthPrincipal = monthlyPayment - firstMonthInterest;

        return {
            monthlyPayment,
            totalPayment,
            totalInterest,
            firstMonthPrincipal,
            firstMonthInterest
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

        // 첫 달 이자 및 원금 계산
        const firstMonthInterest = principal * monthlyRate;
        const firstMonthPayment = principalPayment + firstMonthInterest;

        return {
            monthlyPayment: firstMonthPayment, // 첫 달 상환액 (가장 높음)
            totalPayment,
            totalInterest,
            firstMonthPrincipal: principalPayment, // 원금균등은 매달 원금이 동일
            firstMonthInterest: firstMonthInterest,
        };
    }
}
window.LoanCalculator = LoanCalculator;