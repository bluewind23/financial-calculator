// calculators/brokerageFeeCalculator.js
class BrokerageFeeCalculator {

    // 내부 헬퍼 함수: 최종 결과 객체 생성
    _createResult(rate, fee) {
        const calculatedFee = Math.round(fee);
        const vat = Math.round(calculatedFee * 0.1);
        return {
            rate: rate,
            fee: calculatedFee,
            vat: vat,
            total: calculatedFee + vat
        };
    }

    calculateSaleFee(amount, propertyType) {
        let maxRate;
        let maxFee;

        if (propertyType === 'apartment' || propertyType === 'house' || propertyType === 'residential') { // 주거용 통합
            if (amount < 50000000) {
                maxRate = 0.006;
                maxFee = 250000;
            } else if (amount < 200000000) {
                maxRate = 0.005;
                maxFee = 800000;
            } else if (amount < 900000000) {
                maxRate = 0.004;
                // 한도액 없음
            } else if (amount < 1200000000) {
                 maxRate = 0.005;
            } else if (amount < 1500000000) {
                 maxRate = 0.006;
            } else {
                maxRate = 0.007;
            }
        } else if (propertyType === 'officetel') {
            maxRate = 0.004; // 매매/교환 0.5%, 임대차 0.4% (주거용)
        } else { // commercial, land
            maxRate = 0.009;
        }

        let fee = amount * maxRate;
        if (maxFee) {
            fee = Math.min(fee, maxFee);
        }
        
        return this._createResult(maxRate * 100, fee);
    }

    calculateRentalFee(amount, propertyType) {
        let maxRate;
        let maxFee;

        if (propertyType === 'apartment' || propertyType === 'house' || propertyType === 'residential') { // 주거용 통합
            if (amount < 50000000) {
                maxRate = 0.005;
                maxFee = 200000;
            } else if (amount < 100000000) {
                maxRate = 0.004;
                maxFee = 300000;
            } else if (amount < 600000000) {
                maxRate = 0.003;
                 // 한도액 없음
            } else if (amount < 1200000000) {
                maxRate = 0.004;
            } else if (amount < 1500000000) {
                maxRate = 0.005;
            } else {
                maxRate = 0.006;
            }
        } else if (propertyType === 'officetel') {
            maxRate = 0.004;
        } else { // commercial, land
            maxRate = 0.009;
        }

        let fee = amount * maxRate;
        if (maxFee) {
            fee = Math.min(fee, maxFee);
        }

        return this._createResult(maxRate * 100, fee);
    }

    // HTML에서 호출하는 임대료 계산 함수
    calculateLeaseFee(deposit, monthlyRent, propertyType) {
        let transactionAmount = deposit + (monthlyRent * 100);
        // 환산보증금이 5천만원 미만일 경우, '보증금 + (월세 * 70)'으로 다시 계산
        if (transactionAmount < 50000000) {
            transactionAmount = deposit + (monthlyRent * 70);
        }
        return this.calculateRentalFee(transactionAmount, propertyType);
    }

    // HTML에서 호출하는 협의 요율 계산 함수
    calculateCustomFee(amount, customRate) {
        const fee = amount * (customRate / 100);
        return this._createResult(customRate, fee);
    }
}
window.BrokerageFeeCalculator = BrokerageFeeCalculator;