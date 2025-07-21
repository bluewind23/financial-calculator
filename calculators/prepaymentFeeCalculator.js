// calculators/prepaymentFeeCalculator.js

class PrepaymentFeeCalculator {
    calculatePrepaymentFee(loanAmount, remainingAmount, interestRate, remainingPeriod, prepaymentFeeRate, prepaymentAmount) {
        // 입력값 유효성 검사
        if (remainingAmount <= 0 || interestRate <= 0 || remainingPeriod <= 0 || prepaymentAmount <= 0) {
            console.error("중도상환 수수료 계산: 유효하지 않은 입력값");
            return {
                prepaymentFee: 0,
                savedInterest: 0,
                netSavings: 0,
                breakEvenMonths: 0
            };
        }

        // 월 이자율
        const monthlyRate = (interestRate / 100) / 12;
        
        // 중도상환수수료 계산
        const prepaymentFee = prepaymentAmount * (prepaymentFeeRate / 100);

        // 현재 월 상환액 계산 (원리금균등상환 방식)
        const monthlyPayment = this.calculateMonthlyPayment(remainingAmount, monthlyRate, remainingPeriod);
        
        // 중도상환 후 잔여원금
        const newRemainingAmount = Math.max(0, remainingAmount - prepaymentAmount);
        
        // 중도상환 전 총 이자 (잔여기간 동안)
        const totalInterestBefore = (monthlyPayment * remainingPeriod) - remainingAmount;
        
        // 중도상환 후 총 이자
        let totalInterestAfter = 0;
        if (newRemainingAmount > 0) {
            const newMonthlyPayment = this.calculateMonthlyPayment(newRemainingAmount, monthlyRate, remainingPeriod);
            totalInterestAfter = (newMonthlyPayment * remainingPeriod) - newRemainingAmount;
        }

        // 절약되는 이자
        const savedInterest = Math.max(0, totalInterestBefore - totalInterestAfter);
        
        // 실제 절약액 (절약이자 - 중도상환수수료)
        const netSavings = savedInterest - prepaymentFee;
        
        // 손익분기점 계산 (개월)
        let breakEvenMonths = 0;
        if (netSavings > 0 && monthlyPayment > 0) {
            // 월별 이자 절약액 계산
            const monthlySavings = savedInterest / remainingPeriod;
            if (monthlySavings > 0) {
                breakEvenMonths = Math.ceil(prepaymentFee / monthlySavings);
            }
        }

        return {
            prepaymentFee: Math.round(prepaymentFee),
            savedInterest: Math.round(savedInterest),
            netSavings: Math.round(netSavings),
            breakEvenMonths: breakEvenMonths
        };
    }

    // 원리금균등상환 월 상환액 계산
    calculateMonthlyPayment(principal, monthlyRate, months) {
        if (monthlyRate === 0) {
            return principal / months;
        }
        
        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
        
        return payment;
    }

    // 대출 상환 스케줄 계산 (상세 분석용)
    calculateAmortizationSchedule(principal, monthlyRate, months, prepaymentAmount = 0, prepaymentMonth = 0) {
        const schedule = [];
        let remainingBalance = principal;
        const monthlyPayment = this.calculateMonthlyPayment(principal, monthlyRate, months);

        for (let month = 1; month <= months; month++) {
            if (remainingBalance <= 0) break;

            const interestPayment = remainingBalance * monthlyRate;
            let principalPayment = monthlyPayment - interestPayment;
            
            // 중도상환 적용
            if (month === prepaymentMonth && prepaymentAmount > 0) {
                principalPayment += prepaymentAmount;
            }

            // 잔여원금이 월 원금상환액보다 적은 경우
            if (principalPayment > remainingBalance) {
                principalPayment = remainingBalance;
            }

            remainingBalance -= principalPayment;

            schedule.push({
                month: month,
                payment: principalPayment + interestPayment,
                principal: principalPayment,
                interest: interestPayment,
                balance: Math.max(0, remainingBalance)
            });
        }

        return schedule;
    }
}

window.PrepaymentFeeCalculator = PrepaymentFeeCalculator;