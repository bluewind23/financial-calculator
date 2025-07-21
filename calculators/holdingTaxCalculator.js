// calculators/holdingTaxCalculator.js

class HoldingTaxCalculator {
    calculateHoldingTax(propertyValue, propertyType, age, homesCount) {
        if (propertyValue === null || isNaN(propertyValue) || propertyValue <= 0) {
            console.error("보유세 계산: 유효하지 않은 부동산 가격 (propertyValue:", propertyValue, ")");
            return {
                propertyTax: 0,
                comprehensiveTax: 0,
                totalTax: 0
            };
        }

        const numHomes = parseInt(homesCount) || 1;
        const propertyAge = parseInt(age) || 0;

        // 재산세 계산 (2024년 기준)
        let propertyTax = this.calculatePropertyTax(propertyValue, propertyType, propertyAge, numHomes);
        
        // 종합부동산세 계산 (2024년 기준)
        let comprehensiveTax = this.calculateComprehensiveTax(propertyValue, propertyType, numHomes);

        const totalTax = propertyTax + comprehensiveTax;

        return {
            propertyTax,
            comprehensiveTax,
            totalTax
        };
    }

    calculatePropertyTax(propertyValue, propertyType, age, homesCount) {
        let baseRate = 0;
        let deductionRate = 0;

        switch (propertyType) {
            case 'house':
                // 주택 재산세율 (2024년 기준) - 공시가격 기준
                if (propertyValue <= 60000000) { // 6천만원 이하
                    baseRate = 0.001; // 0.1%
                } else if (propertyValue <= 150000000) { // 1.5억 이하
                    baseRate = 0.0015; // 0.15%
                } else if (propertyValue <= 300000000) { // 3억 이하
                    baseRate = 0.0025; // 0.25%
                } else {
                    baseRate = 0.004; // 0.4%
                }

                // 1세대 1주택 감면 (공시가격 6억 이하, 85㎡ 이하 등 조건 만족 시)
                if (homesCount === 1 && propertyValue <= 600000000) {
                    // 1세대 1주택 50% 감면 적용 가능 (간단화)
                    baseRate *= 0.5;
                }

                // 주택 연수별 감가상각 공제 (건물분에만 적용)
                if (age >= 10) {
                    deductionRate = Math.min(0.2, age * 0.01); // 최대 20% 공제
                }

                // 다주택자 중과세 (조정대상지역 등 고려)
                if (homesCount >= 3) {
                    baseRate *= 2.0; // 3주택 이상 100% 가산
                } else if (homesCount === 2) {
                    baseRate *= 1.5; // 2주택 50% 가산
                }
                break;

            case 'land':
                // 토지 재산세율
                if (propertyValue <= 50000000) {
                    baseRate = 0.002; // 0.2%
                } else if (propertyValue <= 100000000) {
                    baseRate = 0.003; // 0.3%
                } else {
                    baseRate = 0.005; // 0.5%
                }
                break;

            case 'building':
                // 건물 재산세율
                baseRate = 0.0025; // 0.25%
                
                // 건물 연수별 감가상각
                if (age >= 5) {
                    deductionRate = Math.min(0.15, age * 0.015); // 최대 15% 공제
                }
                break;
        }

        const taxableValue = propertyValue * (1 - deductionRate);
        return taxableValue * baseRate;
    }

    calculateComprehensiveTax(propertyValue, propertyType, homesCount) {
        if (propertyType !== 'house') {
            return 0; // 종부세는 주택만 해당
        }

        // 종합부동산세 과세표준 (2024년 기준)
        // 주택분 공제액: 1주택 12억, 2주택 이상 6억
        const deductionAmount = homesCount === 1 ? 1200000000 : 600000000;
        const taxableValue = Math.max(0, propertyValue - deductionAmount);

        if (taxableValue === 0) {
            return 0;
        }

        let comprehensiveTax = 0;

        if (homesCount === 1) {
            // 1주택자 종부세율 (일반세율)
            if (taxableValue <= 300000000) {
                comprehensiveTax = taxableValue * 0.005; // 0.5%
            } else if (taxableValue <= 600000000) {
                comprehensiveTax = 300000000 * 0.005 + (taxableValue - 300000000) * 0.007; // 0.7%
            } else {
                comprehensiveTax = 300000000 * 0.005 + 300000000 * 0.007 + (taxableValue - 600000000) * 0.01; // 1.0%
            }
        } else {
            // 다주택자 종부세율 (중과세율 적용)
            if (taxableValue <= 300000000) {
                comprehensiveTax = taxableValue * 0.012; // 1.2%
            } else if (taxableValue <= 600000000) {
                comprehensiveTax = 300000000 * 0.012 + (taxableValue - 300000000) * 0.016; // 1.6%
            } else if (taxableValue <= 1200000000) {
                comprehensiveTax = 300000000 * 0.012 + 300000000 * 0.016 + (taxableValue - 600000000) * 0.025; // 2.5%
            } else {
                comprehensiveTax = 300000000 * 0.012 + 300000000 * 0.016 + 600000000 * 0.025 + (taxableValue - 1200000000) * 0.03; // 3.0%
            }
        }

        return comprehensiveTax;
    }
}

window.HoldingTaxCalculator = HoldingTaxCalculator;