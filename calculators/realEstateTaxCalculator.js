class RealEstateTaxCalculator {

    /**
     * 취득세 전체 계산을 담당하는 메인 함수
     */
    calculateAcquisitionTax(price, propertyType, homeCount, acquisitionMethod = 'purchase', adjustmentArea = 'no', exclusiveArea = 0) {
        if (price === null || isNaN(price) || price <= 0) {
            console.error("취득세 계산: 유효하지 않은 부동산 가격 (price:", price, ")");
            return { totalTax: 0 };
        }

        let taxDetails;

        // 취득 방법에 따라 적절한 헬퍼 함수를 호출하여 세율 정보를 가져옵니다.
        switch (acquisitionMethod) {
            case 'purchase':
                taxDetails = this._getPurchaseTaxDetails(price, propertyType, homeCount, adjustmentArea, exclusiveArea);
                break;
            case 'gift':
                taxDetails = this._getGiftTaxDetails();
                break;
            case 'inheritance':
                taxDetails = this._getInheritanceTaxDetails(propertyType);
                break;
            case 'original':
                taxDetails = this._getOriginalAcquisitionTaxDetails();
                break;
            default:
                taxDetails = { baseRate: 0, localEducationTaxRate: 0, ruralSpecialTaxRate: 0 };
                break;
        }

        // 가져온 세율 정보를 바탕으로 최종 세금을 계산합니다.
        const acquisitionTax = price * taxDetails.baseRate;
        const localEducationTax = price * taxDetails.localEducationTaxRate;
        const ruralSpecialTax = price * taxDetails.ruralSpecialTaxRate;
        const totalTax = acquisitionTax + localEducationTax + ruralSpecialTax;

        return {
            acquisitionTax,
            acquisitionTaxRate: taxDetails.baseRate,
            localEducationTax,
            ruralSpecialTax,
            totalTax
        };
    }

    /**
     * [헬퍼 함수] 주택 매매/교환 시 취득세율 계산 로직
     * @private
     */
    _getPurchaseTaxDetails(price, propertyType, homeCount, adjustmentArea, exclusiveArea) {
        const numHomes = parseInt(homeCount, 10) || 1;
        let baseRate = 0;
        let localEducationTaxRate = 0.2; // 기본 0.2%
        let ruralSpecialTaxRate = 0;

        switch (propertyType) {
            case 'house':
                // 주택 취득세율 (2024년 기준) - 복잡한 로직을 별도 함수로 분리
                return this._getHousePurchaseTaxDetails(price, numHomes, adjustmentArea, exclusiveArea);
            case 'farmland':
                baseRate = 0.03; // 농지 3%
                ruralSpecialTaxRate = 0.002; // 농특세 0.2%
                break;
            case 'land':
            case 'other':
            default:
                baseRate = 0.04; // 토지 및 기타 4%
                break;
        }

        // 지방교육세는 (기본세율/2) * 20% 이므로, 4% 세율의 지방교육세는 0.4%가 됩니다.
        // 여기서는 계산의 편의를 위해 통용되는 비율을 적용했습니다. 실제 법규는 더 복잡할 수 있습니다.
        localEducationTaxRate = baseRate * 0.1;

        return { baseRate, localEducationTaxRate, ruralSpecialTaxRate };
    }

    /**
     * [헬퍼 함수] 주택 매매 시의 복잡한 세율 계산 로직
     * @private
     */
    _getHousePurchaseTaxDetails(price, numHomes, adjustmentArea, exclusiveArea) {
        let baseRate = 0;
        let localEducationTaxRate = 0; // 주택은 지방교육세 계산이 다름

        if (price <= 600000000) { // 6억 이하
            baseRate = (numHomes > 1 && adjustmentArea === 'yes') ? 0.08 : 0.01; // 조정대상 2주택 이상은 8%
        } else if (price <= 900000000) { // 6억 초과 9억 이하
            if (numHomes === 1) {
                baseRate = (price * 2 / 300000000 - 3) / 100; // 복잡한 누진세율
            } else {
                baseRate = (adjustmentArea === 'yes') ? 0.08 : 0.03;
            }
        } else { // 9억 초과
            baseRate = (numHomes > 1 && adjustmentArea === 'yes') ? 0.12 : 0.03;
        }

        // 주택 유상거래 취득세의 지방교육세율 (취득세액의 10%)
        // 85m^2 이하 주택은 농특세 비과세
        const ruralSpecialTaxRate = (exclusiveArea > 85) ? price * 0.002 : 0;
        localEducationTaxRate = baseRate * 0.1;

        return { baseRate, localEducationTaxRate, ruralSpecialTaxRate };
    }

    /**
     * [헬퍼 함수] 증여 시 취득세율 계산 로직
     * @private
     */
    _getGiftTaxDetails() {
        // 조정대상지역 3억 이상 주택 증여 시 12% 중과세 등 복잡한 조건 추가 가능
        return {
            baseRate: 0.035,
            localEducationTaxRate: 0.003, // 세율의 20%
            ruralSpecialTaxRate: 0,
        };
    }

    /**
     * [헬퍼 함수] 상속 시 취득세율 계산 로직
     * @private
     */
    _getInheritanceTaxDetails(propertyType) {
        if (propertyType === 'farmland') {
            return { baseRate: 0.023, localEducationTaxRate: 0.0016, ruralSpecialTaxRate: 0.002 };
        }
        return { baseRate: 0.028, localEducationTaxRate: 0.0016, ruralSpecialTaxRate: 0 };
    }

    /**
     * [헬퍼 함수] 원시취득 시 취득세율 계산 로직
     * @private
     */
    _getOriginalAcquisitionTaxDetails() {
        return {
            baseRate: 0.028,
            localEducationTaxRate: 0.0016, // (표준세율-2%)*20%
            ruralSpecialTaxRate: 0
        };
    }


    // 간편 양도소득세 계산 (양도차익만 고려, 단순 세율)
    calculateTransferTaxSimple(salePrice, purchasePrice) {
        if (salePrice === null || isNaN(salePrice) || salePrice <= 0 || purchasePrice === null || isNaN(purchasePrice) || purchasePrice < 0) {
            console.error("간편 양도소득세 계산: 유효하지 않은 가격 (salePrice:", salePrice, ", purchasePrice:", purchasePrice, ")");
            return {
                transferTax: 0,
                totalTax: 0,
                capitalGain: 0,
                taxRate: 0,
                longTermDeduction: 0
            };
        }

        const capitalGain = salePrice - purchasePrice;
        if (capitalGain <= 0) {
            return {
                transferTax: 0,
                totalTax: 0,
                capitalGain: capitalGain,
                taxRate: 0,
                longTermDeduction: 0
            };
        }

        let taxRate = 0.1; // 간편식 기본 10% 세율 예시 (실제로는 구간별 복잡)

        const transferTax = capitalGain * taxRate;
        const localIncomeTax = transferTax * 0.1; // 지방소득세 10%
        const totalTax = transferTax + localIncomeTax;

        return {
            transferTax,
            totalTax,
            capitalGain,
            taxRate,
            longTermDeduction: 0
        };
    }

    // 양도소득세 상세 계산 (knowingasset.com 참고)
    calculateTransferTaxDetailed(salePrice, purchasePrice, acquisitionDateStr, transferDateStr, expense, multipleHomes, adjustmentArea, ownershipRatio = 100) {
        if (salePrice === null || isNaN(salePrice) || salePrice <= 0 || purchasePrice === null || isNaN(purchasePrice) || purchasePrice < 0) {
            console.error("상세 양도소득세 계산: 유효하지 않은 가격 (salePrice:", salePrice, ", purchasePrice:", purchasePrice, ")");
            return {
                transferTax: 0,
                totalTax: 0,
                capitalGain: 0,
                longTermDeduction: 0,
                taxRate: 0
            };
        }
        if (!acquisitionDateStr || !transferDateStr) {
            console.error("상세 양도소득세 계산: 취득일 또는 양도일이 누락되었습니다.");
            return {
                transferTax: 0,
                totalTax: 0,
                capitalGain: 0,
                longTermDeduction: 0,
                taxRate: 0
            };
        }

        const acquisitionDate = new Date(acquisitionDateStr);
        const transferDate = new Date(transferDateStr);

        if (isNaN(acquisitionDate.getTime()) || isNaN(transferDate.getTime())) {
            console.error("상세 양도소득세 계산: 유효하지 않은 날짜 형식.");
            return {
                transferTax: 0,
                totalTax: 0,
                capitalGain: 0,
                longTermDeduction: 0,
                taxRate: 0
            };
        }
        if (transferDate < acquisitionDate) {
            console.error("상세 양도소득세 계산: 양도일이 취득일보다 빠를 수 없습니다.");
            return {
                transferTax: 0,
                totalTax: 0,
                capitalGain: 0,
                longTermDeduction: 0,
                taxRate: 0
            };
        }

        const capitalGainRaw = salePrice - purchasePrice;
        const actualExpense = expense === null || isNaN(expense) ? 0 : expense; // null이나 NaN이면 0으로 처리
        const capitalGain = capitalGainRaw - actualExpense; // 양도차익 = 양도가액 - 취득가액 - 필요경비

        if (capitalGain <= 0) {
            return {
                transferTax: 0,
                totalTax: 0,
                capitalGain: capitalGain,
                longTermDeduction: 0,
                taxRate: 0
            };
        }

        // 보유 기간 계산 (초일산입 원칙 적용)
        // 취득일의 다음날부터 양도일까지 계산
        const adjustedAcquisitionDate = new Date(acquisitionDate);
        adjustedAcquisitionDate.setDate(adjustedAcquisitionDate.getDate() + 1); // 초일산입

        const diffInMs = transferDate.getTime() - adjustedAcquisitionDate.getTime();
        const daysInYear = 365.25; // 윤년 고려
        let holdingYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * daysInYear));
        holdingYears = Math.max(0, holdingYears); // 음수가 되지 않도록 최소 0년

        let longTermDeductionRate = 0;
        // 장기보유특별공제 (보유기간 3년 이상, 1년당 2% ~ 최대 30%)
        // 1세대 1주택 비과세 요건 충족 시 (거주 기간 2년 이상 등) 최대 80% 공제 가능 (여기서는 일반 자산 기준 단순화)
        if (holdingYears >= 3) {
            longTermDeductionRate = Math.min(0.30, holdingYears * 0.02); // 1년당 2%, 최대 30%
        }
        const longTermDeduction = capitalGain * longTermDeductionRate;

        const taxableIncome = capitalGain - longTermDeduction - 2500000; // 양도소득기본공제 250만원
        if (taxableIncome <= 0) {
            return {
                transferTax: 0,
                totalTax: 0,
                capitalGain: capitalGain,
                longTermDeduction: longTermDeduction,
                taxRate: 0
            };
        }

        // 세율 적용 (2024년 기준 국세청 양도소득세율)
        let taxRate = 0;
        let progressiveTax = 0; // 누진공제액

        // 단기 보유 자산 세율
        if (holdingYears < 1) { // 1년 미만
            taxRate = 0.70; // 70%
        } else if (holdingYears < 2) { // 1년 이상 2년 미만
            taxRate = 0.60; // 60%
        } else {
            // 일반 누진세율 (2024년 기준)
            if (taxableIncome <= 14000000) {
                taxRate = 0.06;
                progressiveTax = 0;
            } else if (taxableIncome <= 50000000) {
                taxRate = 0.15;
                progressiveTax = 1260000;
            } else if (taxableIncome <= 88000000) {
                taxRate = 0.24;
                progressiveTax = 5760000;
            } else if (taxableIncome <= 150000000) {
                taxRate = 0.35;
                progressiveTax = 15440000;
            } else if (taxableIncome <= 300000000) {
                taxRate = 0.38;
                progressiveTax = 19940000;
            } else if (taxableIncome <= 500000000) {
                taxRate = 0.40;
                progressiveTax = 25940000;
            } else if (taxableIncome <= 1000000000) {
                taxRate = 0.42;
                progressiveTax = 35940000;
            } else {
                taxRate = 0.45;
                progressiveTax = 65940000;
            }

            // 조정대상지역 다주택자 중과세 (2024년 기준)
            if (adjustmentArea === 'yes' && multipleHomes > 1) {
                if (holdingYears >= 2) { // 2년 이상 보유시
                    if (multipleHomes === 2) {
                        taxRate += 0.20; // 2주택자 20%p 가산
                    } else if (multipleHomes >= 3) {
                        taxRate += 0.30; // 3주택 이상 30%p 가산
                    }
                }
                taxRate = Math.min(taxRate, 0.75); // 세율 상한 75%
            }
        }

        const transferTax = taxableIncome * taxRate - progressiveTax; // 양도소득세 (누진공제 적용)
        const localIncomeTax = transferTax * 0.1; // 지방소득세 10%

        // 공동명의시 지분율 적용
        const ownershipRatioDecimal = Math.max(0.01, Math.min(1, (ownershipRatio || 100) / 100)); // 1%~100% 범위로 제한
        const finalTransferTax = transferTax * ownershipRatioDecimal;
        const finalLocalIncomeTax = localIncomeTax * ownershipRatioDecimal;
        const totalTax = finalTransferTax + finalLocalIncomeTax;

        return {
            transferTax: finalTransferTax,
            totalTax,
            capitalGain,
            longTermDeduction,
            taxRate,
            ownershipRatio: ownershipRatio || 100
        };
    }
}
window.RealEstateTaxCalculator = RealEstateTaxCalculator;