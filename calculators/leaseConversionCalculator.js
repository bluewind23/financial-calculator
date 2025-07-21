// calculators/leaseConversionCalculator.js
class LeaseConversionCalculator {
    calculateConversionRate(deposit, monthlyRent, jeonseAmount, interestRate) {
        const priceDifference = jeonseAmount - deposit;

        if (priceDifference <= 0 || monthlyRent <= 0) {
            return {
                conversionRate: 0,
                betterChoice: '전세가 유리',
                yearlyDifference: Math.abs(monthlyRent * 12 - (jeonseAmount - deposit) * (interestRate / 100))
            };
        }

        const yearlyRent = monthlyRent * 12;
        const conversionRate = (yearlyRent / priceDifference) * 100;

        const marketCost = priceDifference * (interestRate / 100);
        const rentCost = yearlyRent;

        let betterChoice, yearlyDifference;

        if (rentCost < marketCost) {
            betterChoice = '월세가 유리';
            yearlyDifference = marketCost - rentCost;
        } else if (rentCost > marketCost) {
            betterChoice = '전세가 유리';
            yearlyDifference = rentCost - marketCost;
        } else {
            betterChoice = '비슷합니다';
            yearlyDifference = 0;
        }

        return {
            conversionRate,
            betterChoice,
            yearlyDifference
        };
    }
}
window.LeaseConversionCalculator = LeaseConversionCalculator; // 클래스를 window 객체에 할당