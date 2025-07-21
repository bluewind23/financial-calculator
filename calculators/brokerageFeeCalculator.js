// calculators/brokerageFeeCalculator.js
class BrokerageFeeCalculator {
    calculateSaleFee(amount, propertyType) {
        let maxRate;
        let maxFee;

        if (propertyType === 'residential') {
            if (amount < 50000000) {
                maxRate = 0.006;
                maxFee = 250000;
            } else if (amount < 200000000) {
                maxRate = 0.005;
                maxFee = 800000;
            } else if (amount < 900000000) {
                maxRate = 0.004;
                maxFee = 3600000;
            } else {
                maxRate = 0.009;
                maxFee = Infinity;
            }
        } else if (propertyType === 'officetel') {
            maxRate = 0.005;
            maxFee = Infinity;
        } else { // commercial, land
            maxRate = 0.009;
            maxFee = Infinity;
        }

        let fee = amount * maxRate;
        if (maxFee !== Infinity) {
            fee = Math.min(fee, maxFee);
        }

        return {
            rate: maxRate,
            fee
        };
    }

    calculateRentalFee(amount, propertyType) {
        let maxRate;
        let maxFee;

        if (propertyType === 'residential') {
            if (amount < 50000000) {
                maxRate = 0.005;
                maxFee = 200000;
            } else if (amount < 100000000) {
                maxRate = 0.004;
                maxFee = 300000;
            } else if (amount < 300000000) {
                maxRate = 0.003;
                maxFee = 600000;
            } else {
                maxRate = 0.008;
                maxFee = Infinity;
            }
        } else if (propertyType === 'officetel') {
            maxRate = 0.004;
            maxFee = Infinity;
        } else { // commercial, land
            maxRate = 0.009;
            maxFee = Infinity;
        }

        let fee = amount * maxRate;
        if (maxFee !== Infinity) {
            fee = Math.min(fee, maxFee);
        }

        return {
            rate: maxRate,
            fee
        };
    }
}
window.BrokerageFeeCalculator = BrokerageFeeCalculator; // 클래스를 window 객체에 할당