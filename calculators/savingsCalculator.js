// calculators/savingsCalculator.js
class SavingsCalculator {

    calculateDeposit(principal, rate, months, interestType, taxRate) {
        const annualRate = rate / 100;
        let totalInterest = 0;

        if (interestType === 'simple') {
            // 단리 계산
            totalInterest = principal * annualRate * (months / 12);
        } else {
            // 복리 계산 (연 복리 기준)
            const years = months / 12;
            totalInterest = principal * (Math.pow(1 + annualRate, years) - 1);
        }
        
        const tax = totalInterest * (taxRate / 100);
        const afterTaxInterest = totalInterest - tax;
        const total = principal + afterTaxInterest;

        return {
            totalPrincipal: principal,
            beforeTaxInterest: totalInterest,
            afterTaxInterest: afterTaxInterest,
            maturityAmount: total
        };
    }

    calculateSavings(monthlyAmount, rate, months, interestType, taxRate) {
        const principal = monthlyAmount * months;
        const annualRate = rate / 100;
        const monthlyRate = annualRate / 12;
        
        let totalInterest = 0;
        let futureValue = 0;

        if (interestType === 'simple') {
            // 단리 계산 (월 단위)
            let totalPrincipalForInterest = 0;
            for (let i = 0; i < months; i++) {
                totalPrincipalForInterest += monthlyAmount * (months - i);
            }
            totalInterest = totalPrincipalForInterest * monthlyRate;
            futureValue = principal + totalInterest;

        } else {
            // 복리 계산 (월 복리)
            futureValue = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
            totalInterest = futureValue - principal;
        }

        const tax = totalInterest * (taxRate / 100);
        const afterTaxInterest = totalInterest - tax;
        const total = principal + afterTaxInterest;

        return {
            totalPrincipal: principal,
            beforeTaxInterest: totalInterest,
            afterTaxInterest: afterTaxInterest,
            maturityAmount: total
        };
    }
}
window.SavingsCalculator = SavingsCalculator; // 클래스를 window 객체에 할당