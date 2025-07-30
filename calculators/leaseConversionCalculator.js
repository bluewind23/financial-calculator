// calculators/leaseConversionCalculator.js
class LeaseConversionCalculator {
    
    // 전세 → 월세 변환
    jeonseToMonthly(jeonseAmount, conversionRate, contractPeriod, savingsRate) {
        const monthlyRent = (jeonseAmount * (conversionRate / 100)) / 12;
        const opportunityCost = (jeonseAmount * (savingsRate / 100)) / 12 * contractPeriod; // 전세금 예치시 기대수익
        const totalRent = monthlyRent * contractPeriod;
        
        // 월세가 더 유리하다고 가정 (기회비용이 총 월세보다 크면)
        const recommendation = opportunityCost > totalRent ? '월세가 유리' : '전세가 유리';

        return {
            monthlyRent: monthlyRent,
            opportunityCost: opportunityCost,
            totalCost: totalRent,
            recommendation: recommendation
        };
    }

    // 월세 → 전세 변환
    monthlyToJeonse(monthlyDeposit, monthlyRent, conversionRate, contractPeriod, savingsRate) {
        const equivalentJeonse = monthlyDeposit + (monthlyRent * 12) / (conversionRate / 100);
        const totalMonthlyPayment = monthlyRent * contractPeriod;
        const opportunityCost = (equivalentJeonse * (savingsRate / 100) / 12) * contractPeriod;

        // 전세가 더 유리하다고 가정 (기회비용이 총 월세보다 작으면)
         const recommendation = opportunityCost < totalMonthlyPayment ? '전세가 유리' : '월세가 유리';
        
        return {
            jeonseAmount: equivalentJeonse,
            opportunityCost: opportunityCost,
            totalCost: totalMonthlyPayment,
            recommendation: recommendation
        };
    }
}
window.LeaseConversionCalculator = LeaseConversionCalculator; // 클래스를 window 객체에 할당