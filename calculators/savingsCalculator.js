// calculators/savingsCalculator.js
class SavingsCalculator {
    calculateDeposit(principal, rate, months) {
        const monthlyRate = rate / 100 / 12;
        const interest = principal * monthlyRate * months;
        const tax = interest * 0.154; // 15.4% tax (소득세 14% + 지방소득세 1.4%)
        const afterTaxInterest = interest - tax;
        const total = principal + afterTaxInterest;

        return {
            principal,
            interest,
            afterTaxInterest,
            total
        };
    }

    calculateInstallment(monthlyAmount, rate, months) {
        const monthlyRate = rate / 100 / 12;
        const principal = monthlyAmount * months;

        let totalInterest = 0;
        for (let i = 1; i <= months; i++) {
            totalInterest += monthlyAmount * monthlyRate * (months - i + 1);
        }

        const tax = totalInterest * 0.154; // 15.4% tax
        const afterTaxInterest = totalInterest - tax;
        const total = principal + afterTaxInterest;

        return {
            principal,
            interest: totalInterest,
            afterTaxInterest,
            total
        };
    }
}
window.SavingsCalculator = SavingsCalculator; // 클래스를 window 객체에 할당