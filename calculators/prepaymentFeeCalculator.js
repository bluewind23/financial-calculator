// calculators/prepaymentFeeCalculator.js

class PrepaymentFeeCalculator {
    /**
     * 원리금균등상환 월 상환액 계산 헬퍼 함수
     */
    _calculateMonthlyPayment(principal, monthlyRate, months) {
        if (monthlyRate === 0) {
            return principal / months;
        }
        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
        return payment;
    }

    /**
     * 잔여 기간 동안의 총 이자 계산 헬퍼 함수
     */
    _calculateTotalInterest(remainingBalance, monthlyRate, remainingMonths) {
        if (remainingBalance <= 0) return 0;
        const monthlyPayment = this._calculateMonthlyPayment(remainingBalance, monthlyRate, remainingMonths);
        const totalPayment = monthlyPayment * remainingMonths;
        return Math.max(0, totalPayment - remainingBalance);
    }

    /**
     * 일부 중도상환 계산
     */
    calculatePartialPrepayment(remainingBalance, prepaymentAmount, interestRate, remainingMonths, feeRate, repaymentType) {
        const monthlyRate = interestRate / 100 / 12;

        // 1. 중도상환 수수료
        const prepaymentFee = prepaymentAmount * (feeRate / 100);

        // 2. 상환 전 총 잔여 이자
        const totalInterestBefore = this._calculateTotalInterest(remainingBalance, monthlyRate, remainingMonths);

        // 3. 상환 후 새 잔액 및 새 월 상환액
        const newRemainingBalance = remainingBalance - prepaymentAmount;
        const newMonthlyPayment = this._calculateMonthlyPayment(newRemainingBalance, monthlyRate, remainingMonths);

        // 4. 상환 후 총 잔여 이자
        const totalInterestAfter = this._calculateTotalInterest(newRemainingBalance, monthlyRate, remainingMonths);

        // 5. 절약 이자 및 순 절약액
        const savedInterest = totalInterestBefore - totalInterestAfter;
        const netSavings = savedInterest - prepaymentFee;

        return {
            prepaymentFee: Math.round(prepaymentFee),
            savedInterest: Math.round(savedInterest),
            netSavings: Math.round(netSavings),
            newMonthlyPayment: Math.round(newMonthlyPayment)
        };
    }

    /**
     * 전액 중도상환 계산
     */
    calculateFullPrepayment(remainingBalance, interestRate, remainingMonths, feeRate, repaymentType) {
        const monthlyRate = interestRate / 100 / 12;

        // 1. 중도상환 수수료 (전체 잔액에 대해 부과)
        const prepaymentFee = remainingBalance * (feeRate / 100);

        // 2. 절약되는 이자 (상환 전 총 잔여 이자와 동일)
        const savedInterest = this._calculateTotalInterest(remainingBalance, monthlyRate, remainingMonths);

        // 3. 순 절약액
        const netSavings = savedInterest - prepaymentFee;

        return {
            prepaymentFee: Math.round(prepaymentFee),
            savedInterest: Math.round(savedInterest),
            netSavings: Math.round(netSavings),
            newMonthlyPayment: 0 // 전액 상환했으므로 0
        };
    }
}

window.PrepaymentFeeCalculator = PrepaymentFeeCalculator;