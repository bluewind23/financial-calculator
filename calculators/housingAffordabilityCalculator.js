// calculators/housingAffordabilityCalculator.js
class HousingAffordabilityCalculator {
    calculateAffordability(monthlyIncome, existingDebt, ownFunds, interestRate, loanTerm, dsrLimit, ltvLimit, additionalCosts) {
        
        // 1. DSR 기준 월 상환 가능액 계산
        const maxMonthlyPaymentByDSR = (monthlyIncome * (dsrLimit / 100)) - existingDebt;
        if (maxMonthlyPaymentByDSR <= 0) {
            // 소득 대비 기존 부채가 너무 많아 추가 대출 불가
            return {
                maxLoanAmount: 0,
                totalBudget: ownFunds,
                affordablePrice: ownFunds / (1 + additionalCosts / 100),
                monthlyPayment: existingDebt
            };
        }

        // 2. DSR 기준 최대 대출 가능 금액 계산
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;
        let dsrLoanLimit;
        if (monthlyRate === 0) {
            dsrLoanLimit = maxMonthlyPaymentByDSR * numPayments;
        } else {
            dsrLoanLimit = maxMonthlyPaymentByDSR *
                (Math.pow(1 + monthlyRate, numPayments) - 1) /
                (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
        }

        // 3. LTV와 DSR을 모두 만족하는 주택 가격 및 대출 한도 찾기 (방정식 풀이)
        // AffordablePrice = (LoanAmount + OwnFunds) / (1 + AdditionalCosts/100)
        // LoanAmount = min(DSR_Limit, LTV_Limit)
        // LTV_Limit = AffordablePrice * (LTV/100)
        // 이 방정식을 LoanAmount에 대해 풀면 아래와 같음
        let finalLoanAmount = 0;
        const ltvRatio = ltvLimit / 100;
        const costRatio = 1 + (additionalCosts / 100);

        // 분모가 0이 되는 경우 방지
        if (costRatio - ltvRatio <= 0) {
            // LTV가 100%를 넘고 부대비용이 없는 극단적인 경우, DSR 한도까지 모두 대출 가능
             finalLoanAmount = dsrLoanLimit;
        } else {
             const ltvPriceLimitLoan = (ownFunds * ltvRatio) / (costRatio - ltvRatio);
             finalLoanAmount = Math.min(dsrLoanLimit, ltvPriceLimitLoan);
        }

        // 4. 최종 결과 계산
        const totalBudget = finalLoanAmount + ownFunds;
        const affordablePrice = totalBudget / costRatio;
        
        // 최종 대출금액에 대한 월 상환액 재계산
        let finalMonthlyPayment;
        if (monthlyRate === 0) {
            finalMonthlyPayment = finalLoanAmount / numPayments;
        } else {
            finalMonthlyPayment = finalLoanAmount *
                (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                (Math.pow(1 + monthlyRate, numPayments) - 1);
        }


        return {
            maxLoanAmount: finalLoanAmount,
            totalBudget: totalBudget,
            affordablePrice: affordablePrice,
            monthlyPayment: finalMonthlyPayment + existingDebt
        };
    }
}
window.HousingAffordabilityCalculator = HousingAffordabilityCalculator; // 클래스를 window 객체에 할당