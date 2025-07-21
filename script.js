// script.js

// Google Analytics 4 Event Tracking
// GA4 이벤트 추적 함수
const trackEvent = (eventName, parameters = {}) => {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, {
            ...parameters,
            page_title: document.title,
            page_location: window.location.href
        });
    }
};

// 계산기 사용 추적
const trackCalculatorUsage = (calculatorType, action = 'calculate') => {
    trackEvent('calculator_usage', {
        calculator_type: calculatorType,
        action: action,
        timestamp: new Date().toISOString()
    });
};

// 페이지 뷰 추적
const trackPageView = (pageTitle) => {
    trackEvent('page_view', {
        page_title: pageTitle || document.title,
        page_location: window.location.href
    });
};

// 다운로드 추적
const trackDownload = (fileType, calculatorType) => {
    trackEvent('file_download', {
        file_type: fileType,
        calculator_type: calculatorType,
        download_method: 'button_click'
    });
};

if (hexHash === ADMIN_HASH) {
    sessionStorage.setItem('isAdminAuthenticated', 'true'); // 인증서 발급 코드 추가!
    window.location.href = 'dashboard_sec_a4b1c2.html';
}

// Utility Functions
const formatNumber = (number) => {
    if (typeof number !== 'number' || isNaN(number)) {
        return '';
    }
    return new Intl.NumberFormat('ko-KR').format(Math.round(number)); // 최종 결과에서 반올림
};

const parseNumber = (value) => {
    if (!value || value.trim() === '') return 0;
    const cleaned = String(value).replace(/,/g, ''); // 문자열로 변환하여 오류 방지
    // 정수만 처리하도록 parseInt 사용, 소수점 입력 방지
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
};


const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

// Calculator Management
// Calculator Management
class CalculatorManager {
    constructor() {
        this.activeCalculator = 'loan';
        this.init();
    }

    init() {
        this.setupCalculatorNavigation();
        this.setupModalControls();
        this.setupModeButtons();
        this.setupInputFormatting(); // 이 함수가 중요하게 변경됩니다.
        this.setupMobileMenu();
        this.setupScrollAnimations();
        this.setupGuideTabs();
        this.setupRealEstateTaxModes();
    }

    setupCalculatorNavigation() {
        const calculatorCards = document.querySelectorAll('.calculator-card');

        calculatorCards.forEach(card => {
            card.addEventListener('click', () => {
                const calculatorType = card.dataset.calculator;

                calculatorCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                this.activeCalculator = calculatorType;

                // GA4 이벤트 추적 - 계산기 열기
                trackCalculatorUsage(calculatorType, 'open');

                this.openModal(calculatorType);
            });
        });
    }

    openModal(calculatorType) {
        let modalId;
        switch (calculatorType) {
            case 'loan':
                modalId = 'loanModal';
                break;
            case 'realestate':
                modalId = 'realestateModal';
                break;
            case 'savings':
                modalId = 'savingsModal';
                break;
            case 'brokerage':
                modalId = 'brokerageModal';
                break;
            case 'loan-limit':
                modalId = 'loanLimitModal';
                break;
            case 'affordability':
                modalId = 'affordabilityModal';
                break;
            case 'lease-conversion':
                modalId = 'leaseConversionModal';
                break;
            case 'prepayment-fee':
                modalId = 'prepaymentFeeModal';
                break;
            case 'holding-tax':
                modalId = 'holdingTaxModal';
                break;
            default:
                return;
        }

        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // 모달이 열릴 때 첫 번째 입력 필드에 포커스
            const firstInput = modal.querySelector('input[type="text"].input-field');
            if (firstInput) {
                const rawVal = firstInput.getAttribute('data-raw-value') || '';
                firstInput.value = rawVal;
                firstInput.focus();
                firstInput.setSelectionRange(rawVal.length, rawVal.length);
            }

            // 부동산 세금 계산기인 경우, 초기 상태를 '취득세'와 '간편식'으로 설정
            if (calculatorType === 'realestate') {
                const acquisitionBtn = modal.querySelector('.calculation-mode .mode-btn[data-mode="acquisition"]');
                if (acquisitionBtn && !acquisitionBtn.classList.contains('active')) {
                    acquisitionBtn.click(); // 취득세 버튼 클릭하여 상태 업데이트
                }
                const detailModeToggle = modal.querySelector('#detailModeToggle');
                if (detailModeToggle && detailModeToggle.checked) {
                    detailModeToggle.checked = false; // 간편식으로 설정
                    const event = new Event('change');
                    detailModeToggle.dispatchEvent(event); // 변경 이벤트 발생
                }
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';

            const resultPanel = modal.querySelector('.result-panel');
            const exportBtn = modal.querySelector('.export-btn');
            if (resultPanel) resultPanel.style.display = 'none';
            if (exportBtn) exportBtn.style.display = 'none';

            // 모달 닫을 때 입력 필드를 포맷된 상태로 되돌립니다.
            const inputsInModal = modal.querySelectorAll('input[type="text"].input-field');
            inputsInModal.forEach(input => {
                const rawVal = input.getAttribute('data-raw-value');
                if (rawVal !== null && rawVal.trim() !== '') { // null 체크 추가
                    input.value = formatNumber(parseNumber(rawVal));
                } else {
                    input.value = '';
                }
            });
        }
    }

    setupModalControls() {
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                const modalId = closeBtn.dataset.modal;
                this.closeModal(modalId);
            });
        });

        document.querySelectorAll('.calculator-modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                // 모달 배경을 클릭했을 때만 닫기 (모달 내부 콘텐츠 클릭은 제외)
                if (e.target === modal && !modal.querySelector('.modal-content').contains(e.target)) {
                    this.closeModal(modal.id);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.calculator-modal.active');
                if (activeModal) {
                    this.closeModal(activeModal.id);
                }
            }
        });
    }

    setupModeButtons() {
        const modeButtons = document.querySelectorAll('.mode-btn');

        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const parentModalBody = btn.closest('.modal-body');
                if (!parentModalBody) return;

                const siblingButtons = parentModalBody.querySelectorAll('.mode-btn');

                siblingButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 부동산 세금 계산기의 경우, 모드 변경 시 상세 모드 UI 업데이트는 setupRealEstateTaxModes에서 처리됨
            });
        });
    }

    setupInputFormatting() {
        const textInputs = document.querySelectorAll('input[type="text"].input-field');

        textInputs.forEach(input => {
            // 초기값 포맷팅
            const initialRawValue = input.value.replace(/[^\d.]/g, ''); // 초기값에서도 소수점 허용 가능하게
            input.setAttribute('data-raw-value', initialRawValue);
            input.value = formatNumber(parseFloat(initialRawValue));

            // 실시간 콤마(,) 포맷팅을 위한 input 이벤트 리스너
            input.addEventListener('input', (e) => {
                const target = e.target;
                const originalValue = target.value;
                const cursorPosition = target.selectionStart;

                let cleanRegex;

                // ★ 수정된 핵심 로직 ★
                // input의 id에 'Rate'가 포함되어 있으면 소수점을 허용, 아니면 정수만 허용
                if (target.id.includes('Rate')) {
                    cleanRegex = /[^\d.]/g; // 숫자와 점(.)만 허용
                } else {
                    cleanRegex = /[^\d]/g;  // 숫자만 허용
                }

                let rawValue = originalValue.replace(cleanRegex, '');

                // 소수점 허용 필드의 경우, 점이 여러 개 찍히지 않도록 처리
                if (target.id.includes('Rate')) {
                    const parts = rawValue.split('.');
                    if (parts.length > 2) {
                        rawValue = parts[0] + '.' + parts.slice(1).join('');
                    }
                }

                target.setAttribute('data-raw-value', rawValue);

                if (rawValue === '') {
                    target.value = '';
                    return;
                }

                // 정수 부분만 콤마 포맷팅
                const parts = rawValue.split('.');
                const integerPart = parts[0];
                const decimalPart = parts[1];
                let formattedValue = new Intl.NumberFormat('ko-KR').format(parseInt(integerPart, 10) || 0);
                if (decimalPart !== undefined) {
                    formattedValue += '.' + decimalPart;
                }

                if (target.value !== formattedValue) {
                    const originalLength = originalValue.length;
                    const newLength = formattedValue.length;
                    const newCursorPosition = cursorPosition + (newLength - originalLength);

                    target.value = formattedValue;
                    requestAnimationFrame(() => {
                        target.setSelectionRange(newCursorPosition, newCursorPosition);
                    });
                }
            });

            // 포커스를 잃었을 때 최종 포맷팅
            input.addEventListener('blur', (e) => {
                const rawValue = e.target.getAttribute('data-raw-value') || '';
                if (rawValue) {
                    // 이자율 필드는 소수점까지 표시, 나머지는 정수로 반올림
                    if (e.target.id.includes('Rate')) {
                        e.target.value = rawValue; // 포맷팅 없이 순수 숫자(소수점 포함)로 표시할 수도 있음
                    } else {
                        const numValue = parseNumber(rawValue);
                        e.target.value = formatNumber(numValue);
                    }
                } else {
                    e.target.value = '';
                }
            });

            // 포커스를 얻었을 때 순수 숫자 값 표시
            input.addEventListener('focus', (e) => {
                const rawValue = e.target.getAttribute('data-raw-value') || '';
                e.target.value = rawValue;
                requestAnimationFrame(() => {
                    e.target.setSelectionRange(rawValue.length, rawValue.length);
                });
            });
        });
    }

    setupGuideTabs() {
        const guideTabs = document.querySelectorAll('.guide-tab');
        const guidePanels = document.querySelectorAll('.guide-panel');

        guideTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const guideType = tab.dataset.guide;

                guideTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                guidePanels.forEach(p => p.classList.remove('active'));
                const targetPanel = document.getElementById(`${guideType}-guide`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                    }
                });
            });
        }
    }

    setupScrollAnimations() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.calculator-card, .why-item, .hero-content');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    setupRealEstateTaxModes() {
        const realEstateModal = document.getElementById('realestateModal');
        if (!realEstateModal) return;

        const modeButtons = realEstateModal.querySelectorAll('.calculation-mode .mode-btn');
        const detailModeToggle = document.getElementById('detailModeToggle');

        const acquisitionOnlyElements = realEstateModal.querySelectorAll('[data-acquisition-only]');
        const transferDetailedInputs = realEstateModal.querySelector('.transfer-tax-detailed-inputs');
        const transferResultDetails = realEstateModal.querySelectorAll('.transfer-tax-result-detail');
        const realestateTaxDetailMode = document.getElementById('realestateTaxDetailMode');


        const updateUI = () => {
            const activeMode = realEstateModal.querySelector('.calculation-mode .mode-btn.active').dataset.mode;
            const isDetailed = detailModeToggle ? detailModeToggle.checked : false;

            if (activeMode === 'acquisition') {
                acquisitionOnlyElements.forEach(el => el.style.display = 'flex');
                realestateTaxDetailMode.style.display = 'none';
                transferDetailedInputs.style.display = 'none';
                transferResultDetails.forEach(el => el.style.display = 'none');

                realEstateModal.querySelector('#modalRealEstateResult .result-item:nth-child(1) .result-label').textContent = '취득세';
                realEstateModal.querySelector('#modalRealEstateResult .result-item:nth-child(2) .result-label').textContent = '등록세';
                realEstateModal.querySelector('#modalRealEstateResult .result-item:nth-child(2)').style.display = 'flex';
                realEstateModal.querySelector('#modalRealEstateResult .result-item:nth-child(3) .result-label').textContent = '총 세금';

            } else if (activeMode === 'transfer') {
                acquisitionOnlyElements.forEach(el => el.style.display = 'none');
                realestateTaxDetailMode.style.display = 'flex';

                if (isDetailed) {
                    transferDetailedInputs.style.display = 'block';
                    transferResultDetails.forEach(el => el.style.display = 'flex');
                } else { // simple
                    transferDetailedInputs.style.display = 'none';
                    transferResultDetails.forEach(el => el.style.display = 'none');
                }

                realEstateModal.querySelector('#modalRealEstateResult .result-item:nth-child(1) .result-label').textContent = '양도소득세';
                realEstateModal.querySelector('#modalRealEstateResult .result-item:nth-child(2) .result-label').textContent = '총 세금';
                realEstateModal.querySelector('#modalRealEstateResult .result-item:nth-child(2)').style.display = 'flex';
                realEstateModal.querySelector('#modalRealEstateResult .result-item:nth-child(3) .result-label').textContent = '적용 세율';
            }
            realEstateModal.querySelector('.result-panel').style.display = 'none';
            realEstateModal.querySelector('.export-btn').style.display = 'none';
        };

        updateUI();

        modeButtons.forEach(btn => {
            btn.addEventListener('click', updateUI);
        });

        // 토글 스위치 이벤트 리스너
        if (detailModeToggle) {
            detailModeToggle.addEventListener('change', updateUI);
        }
    }
}

// Calculator Classes are loaded from individual files in calculators/ folder

// Global Calculator Instances
let loanCalc;
let realEstateCalc;
let savingsCalc;
let brokerageCalc;
let loanLimitCalc;
let affordabilityCalc;
let leaseCalc;
let holdingTaxCalc;
let prepaymentFeeCalc;


// Global Calculation Functions - Window 객체에 할당하여 HTML onclick에서 접근 가능하도록 함
window.calculateModalLoan = function () {
    trackCalculatorUsage('loan', 'calculate');
    if (!loanCalc) { console.error("LoanCalculator is not initialized."); return; }

    const amount = parseNumber(document.getElementById('modalLoanAmount').value);
    const rate = parseFloat(document.getElementById('modalInterestRate').getAttribute('data-raw-value')); // 금리는 소수점 허용
    const years = parseNumber(document.getElementById('modalLoanTerm').value);

    if (amount <= 0 || rate < 0 || years <= 0) {
        alert('대출금액, 연이율, 대출기간을 올바르게 입력해주세요.');
        return;
    }

    const activeMode = document.querySelector('#loanModal .mode-btn.active').dataset.mode;

    let result;
    if (activeMode === 'equal-payment') {
        result = loanCalc.calculateEqualPayment(amount, rate, years);
    } else {
        result = loanCalc.calculateEqualPrincipal(amount, rate, years);
    }

    window.currentLoanResult = { amount, rate, years, mode: activeMode, ...result };

    // 수정된 결과 표시
    document.getElementById('modalMonthlyPayment').textContent = formatNumber(result.monthlyPayment) + '원';
    document.getElementById('modalFirstPrincipal').textContent = formatNumber(result.firstMonthPrincipal) + '원';
    document.getElementById('modalFirstInterest').textContent = formatNumber(result.firstMonthInterest) + '원';
    document.getElementById('modalTotalInterest').textContent = formatNumber(result.totalInterest) + '원';

    const resultPanel = document.getElementById('modalLoanResult');
    const exportBtn = document.querySelector('#loanModal .export-btn');
    resultPanel.style.display = 'block';
    exportBtn.style.display = 'inline-flex';
}

window.calculateModalRealEstate = function () {
    // GA4 이벤트 추적
    trackCalculatorUsage('realestate', 'calculate');
    // realEstateCalc가 undefined가 아님을 보장
    if (!realEstateCalc) { console.error("RealEstateTaxCalculator is not initialized."); return; }

    const realEstateModal = document.getElementById('realestateModal');
    const activeMode = realEstateModal.querySelector('.calculation-mode .mode-btn.active').dataset.mode;
    const detailModeToggle = document.getElementById('detailModeToggle');
    const isDetailed = detailModeToggle ? detailModeToggle.checked : false;

    const price = parseNumber(realEstateModal.querySelector('#modalPropertyPrice').value);
    const propertyType = realEstateModal.querySelector('#modalPropertyType').value;

    // 모든 변수를 여기서 초기화
    let purchasePrice = 0;
    let holdingPeriod = 0;
    let acquisitionDate = '';
    let transferDate = '';
    let expense = 0;
    let multipleHomes = 1;
    let adjustmentArea = 'no';
    let result;

    if (activeMode === 'acquisition') {
        const homeCount = realEstateModal.querySelector('#modalIsFirstHome').value;
        const acquisitionMethod = realEstateModal.querySelector('#modalAcquisitionMethod').value || 'purchase';
        const adjustmentArea = realEstateModal.querySelector('#modalAcquisitionAdjustmentArea').value || 'no';
        const exclusiveArea = parseInt(realEstateModal.querySelector('#modalExclusiveArea').value) || 0;

        if (price <= 0) {
            alert('부동산 가격을 올바르게 입력해주세요.');
            return;
        }

        result = realEstateCalc.calculateAcquisitionTax(price, propertyType, homeCount, acquisitionMethod, adjustmentArea, exclusiveArea);

        // 취득세 상세 결과 표시
        document.getElementById('modalAcquisitionTaxRate').textContent = (result.acquisitionTaxRate * 100).toFixed(1) + '%';
        document.getElementById('modalAcquisitionTax').textContent = formatNumber(result.acquisitionTax) + '원';
        document.getElementById('modalLocalEducationTax').textContent = formatNumber(result.localEducationTax) + '원';
        document.getElementById('modalRuralSpecialTax').textContent = formatNumber(result.ruralSpecialTax) + '원';
        document.getElementById('modalTotalTax').textContent = formatNumber(result.totalTax) + '원';

        // 취득세 결과 세부 항목 표시
        document.querySelectorAll('.acquisition-tax-result-detail').forEach(el => el.style.display = 'flex');
        document.querySelectorAll('.transfer-tax-result-detail').forEach(el => el.style.display = 'none');
        document.querySelector('#modalRealEstateResult .result-item:nth-child(3) .result-label').textContent = '총 세금';
        document.querySelector('#modalRealEstateResult .result-item:nth-child(2)').style.display = 'flex';

    } else if (activeMode === 'transfer') {
        purchasePrice = parseNumber(realEstateModal.querySelector('#modalPurchasePrice').value);
        holdingPeriod = parseNumber(realEstateModal.querySelector('#modalHoldingPeriod').value); // 사용자가 입력한 보유기간
        acquisitionDate = realEstateModal.querySelector('#modalAcquisitionDate').value;
        transferDate = realEstateModal.querySelector('#modalTransferDate').value;
        expense = parseNumber(realEstateModal.querySelector('#modalExpense').value);
        multipleHomes = parseNumber(realEstateModal.querySelector('#modalMultipleHomes').value);
        adjustmentArea = realEstateModal.querySelector('#modalAdjustmentArea').value;

        // 양도가액 유효성 검사
        if (price <= 0) {
            alert('부동산 가격(양도가액)을 올바르게 입력해주세요.');
            return;
        }
        // 취득가액 유효성 검사
        if (purchasePrice < 0) {
            alert('취득가액을 올바르게 입력해주세요.');
            return;
        }
        // 필요경비 유효성 검사 (음수 방지)
        if (expense < 0) {
            alert('필요 경비를 올바르게 입력해주세요.');
            return;
        }
        // 보유 주택 수 유효성 검사 (음수, NaN 방지)
        if (isDetailed) {
            if (multipleHomes < 1) {
                alert('보유 주택 수를 올바르게 입력해주세요.');
                return;
            }
        }



        if (!isDetailed) {
            result = realEstateCalc.calculateTransferTaxSimple(price, purchasePrice);

            // 간편식 양도소득세 결과 표시
            document.getElementById('modalTotalTax').textContent = formatNumber(result.totalTax) + '원';

            // 취득세 항목은 숨기고 양도소득세 기본 항목만 표시
            document.querySelectorAll('.acquisition-tax-result-detail').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.transfer-tax-result-detail').forEach(el => el.style.display = 'none');


        } else { // detailed
            // 상세 계산 모드에서는 취득일/양도일이 필수
            if (!acquisitionDate || !transferDate) {
                alert('양도소득세 상세 계산을 위해 취득일과 양도일을 입력해주세요.');
                return;
            }
            // Date 객체 생성 시 유효성 검사 및 날짜 순서 검사
            const acqDateObj = new Date(acquisitionDate);
            const tranDateObj = new Date(transferDate);

            if (isNaN(acqDateObj.getTime())) {
                alert('유효하지 않은 취득일 형식입니다.');
                return;
            }
            if (isNaN(tranDateObj.getTime())) {
                alert('유효하지 않은 양도일 형식입니다.');
                return;
            }
            if (tranDateObj < acqDateObj) {
                alert('양도일은 취득일보다 빠를 수 없습니다.');
                return;
            }

            const ownershipRatio = parseNumber(realEstateModal.querySelector('#modalOwnershipRatio').value) || 100;

            result = realEstateCalc.calculateTransferTaxDetailed(
                price,
                purchasePrice,
                acquisitionDate, // string 그대로 전달하여 계산기 클래스에서 Date 객체로 변환
                transferDate,    // string 그대로 전달
                expense || 0, // 필요 경비 (없으면 0)
                multipleHomes || 1, // 보유 주택 수 (없으면 1채)
                adjustmentArea, // 조정대상지역 여부
                ownershipRatio // 지분율 (공동명의시)
            );

            // 양도소득세 결과 표시
            document.getElementById('modalTotalTax').textContent = formatNumber(result.totalTax) + '원';
            document.getElementById('modalCapitalGain').textContent = formatNumber(result.capitalGain) + '원';
            document.getElementById('modalLongTermDeduction').textContent = formatNumber(result.longTermDeduction) + '원';
            document.getElementById('modalTransferTaxRate').textContent = (result.taxRate * 100).toFixed(1) + '%';

            // 양도소득세 결과 세부 항목 표시
            document.querySelectorAll('.acquisition-tax-result-detail').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.transfer-tax-result-detail').forEach(el => el.style.display = 'flex');
        }
    }

    // 결과 저장 객체에 상세 필드 추가
    window.currentRealEstateResult = {
        price,
        propertyType,
        mode: activeMode,
        subMode: isDetailed ? 'detailed' : 'simple',
        purchasePrice: purchasePrice,
        holdingPeriod: holdingPeriod, // 입력된 보유기간 값 (날짜로 계산된 것과 다를 수 있음)
        acquisitionDate: acquisitionDate,
        transferDate: transferDate,
        expense: expense,
        multipleHomes: multipleHomes,
        adjustmentArea: adjustmentArea,
        ...result
    };

    const resultPanel = document.getElementById('modalRealEstateResult');
    const exportBtn = document.querySelector('#realestateModal .export-btn');
    resultPanel.style.display = 'block';
    exportBtn.style.display = 'inline-flex';
}

window.calculateModalSavings = function () {
    // GA4 이벤트 추적
    trackCalculatorUsage('savings', 'calculate');
    if (!savingsCalc) {
        alert('예적금 계산기가 초기화되지 않았습니다.');
        return;
    }

    const amount = parseNumber(document.getElementById('modalSavingsAmount').value);
    const rate = parseNumber(document.getElementById('modalSavingsRate').value);
    const months = parseNumber(document.getElementById('modalSavingsTerm').value);

    if (amount === null || isNaN(amount) || amount <= 0 || isNaN(rate) || rate < 0 || isNaN(months) || months <= 0) {
        alert('납입금액, 연이율, 기간을 올바르게 입력해주세요.');
        return;
    }

    const activeMode = document.querySelector('#savingsModal .mode-btn.active').dataset.mode;

    let result;
    if (activeMode === 'deposit') {
        result = savingsCalc.calculateDeposit(amount, rate, months);
    } else {
        result = savingsCalc.calculateInstallment(amount, rate, months);
    }

    window.currentSavingsResult = { amount, rate, months, mode: activeMode, ...result };

    document.getElementById('modalSavingsPrincipal').textContent = formatNumber(result.principal) + '원';
    document.getElementById('modalSavingsInterest').textContent = formatNumber(result.afterTaxInterest) + '원';
    document.getElementById('modalSavingsTotal').textContent = formatNumber(result.total) + '원';

    const resultPanel = document.getElementById('modalSavingsResult');
    const exportBtn = document.querySelector('#savingsModal .export-btn');
    resultPanel.style.display = 'block';
    exportBtn.style.display = 'inline-flex';
}

window.calculateModalBrokerage = function () {
    // GA4 이벤트 추적
    trackCalculatorUsage('brokerage', 'calculate');
    if (!brokerageCalc) {
        alert('중개수수료 계산기가 초기화되지 않았습니다.');
        return;
    }

    const amount = parseNumber(document.getElementById('modalBrokerageAmount').value);
    const propertyType = document.getElementById('modalBrokerageType').value;
    const customRate = parseNumber(document.getElementById('modalBrokerageCustomRate').value);

    if (amount <= 0) {
        alert('거래금액을 올바르게 입력해주세요.');
        return;
    }

    const activeMode = document.querySelector('#brokerageModal .mode-btn.active').dataset.mode;

    let result;

    // 사용자가 수수료율을 직접 입력한 경우
    if (customRate > 0) {
        const feeRate = customRate / 100;
        const calculatedFee = Math.round(amount * feeRate);
        result = {
            fee: calculatedFee,
            rate: feeRate
        };
    } else {
        // 기존 계산기 사용
        if (brokerageCalc) {
            if (activeMode === 'sale') {
                result = brokerageCalc.calculateSaleFee(amount, propertyType);
            } else {
                result = brokerageCalc.calculateRentalFee(amount, propertyType);
            }
        } else {
            // 기본 수수료율 적용 (0.4%)
            const feeRate = 0.004;
            const calculatedFee = Math.round(amount * feeRate);
            result = {
                fee: calculatedFee,
                rate: feeRate
            };
        }
    }

    window.currentBrokerageResult = { amount, propertyType, mode: activeMode, customRate, ...result };

    document.getElementById('modalBrokerageRate').textContent = (result.rate * 100).toFixed(2) + '%';
    document.getElementById('modalBrokerageFee').textContent = formatNumber(result.fee) + '원';

    const resultPanel = document.getElementById('modalBrokerageResult');
    const exportBtn = document.querySelector('#brokerageModal .export-btn');
    resultPanel.style.display = 'block';
    exportBtn.style.display = 'inline-flex';
}

window.calculateModalLoanLimit = function () {
    // GA4 이벤트 추적
    trackCalculatorUsage('loan-limit', 'calculate');
    if (!loanLimitCalc) {
        alert('대출한도 계산기가 초기화되지 않았습니다.');
        return;
    }

    const monthlyIncome = parseNumber(document.getElementById('modalMonthlyIncome').value);
    const existingDebt = parseNumber(document.getElementById('modalExistingDebt').value); // null 가능성 있음
    const propertyValue = parseNumber(document.getElementById('modalPropertyValue').value);

    if (monthlyIncome === null || isNaN(monthlyIncome) || monthlyIncome <= 0 || propertyValue === null || isNaN(propertyValue) || propertyValue <= 0) {
        alert('월 소득과 담보가치를 올바르게 입력해주세요.');
        return;
    }
    if (existingDebt !== null && isNaN(existingDebt) || existingDebt < 0) {
        alert('기존 부채를 올바르게 입력해주세요.');
        return;
    }


    const dsrLimit = loanLimitCalc.calculateDSRLimit(monthlyIncome, (existingDebt || 0) / 12); // existingDebt가 null이면 0으로 처리
    const ltvLimit = loanLimitCalc.calculateLTVLimit(propertyValue);
    const finalLimit = loanLimitCalc.calculateFinalLimit(dsrLimit, ltvLimit);

    window.currentLoanLimitResult = { monthlyIncome, existingDebt, propertyValue, dsrLimit, ltvLimit, finalLimit };

    document.getElementById('modalDsrLimit').textContent = formatNumber(dsrLimit) + '원';
    document.getElementById('modalLtvLimit').textContent = formatNumber(ltvLimit) + '원';
    document.getElementById('modalFinalLimit').textContent = formatNumber(finalLimit) + '원';

    const resultPanel = document.getElementById('modalLoanLimitResult');
    const exportBtn = document.querySelector('#loanLimitModal .export-btn');
    resultPanel.style.display = 'block';
    exportBtn.style.display = 'inline-flex';
}

window.calculateModalAffordability = function () {
    // GA4 이벤트 추적
    trackCalculatorUsage('affordability', 'calculate');
    if (!affordabilityCalc) {
        alert('주택구매력 계산기가 초기화되지 않았습니다.');
        return;
    }

    const monthlyIncome = parseNumber(document.getElementById('modalAffordabilityIncome').value);
    const downPayment = parseNumber(document.getElementById('modalDownPayment').value);
    const interestRate = parseNumber(document.getElementById('modalAffordabilityRate').value);
    const loanTerm = parseNumber(document.getElementById('modalAffordabilityTerm').value);

    if (monthlyIncome === null || isNaN(monthlyIncome) || monthlyIncome <= 0 || downPayment === null || isNaN(downPayment) || downPayment < 0 || isNaN(interestRate) || interestRate < 0 || isNaN(loanTerm) || loanTerm <= 0) {
        alert('모든 값을 올바르게 입력해주세요.');
        return;
    }

    const result = affordabilityCalc.calculateAffordability(monthlyIncome, downPayment, interestRate, loanTerm);

    window.currentAffordabilityResult = { monthlyIncome, downPayment, interestRate, loanTerm, ...result };

    document.getElementById('modalMaxLoanAmount').textContent = formatNumber(result.maxLoanAmount) + '원';
    document.getElementById('modalMaxPurchase').textContent = formatNumber(result.totalPurchasePrice) + '원';
    document.getElementById('modalMonthlyPaymentAffordability').textContent = formatNumber(result.monthlyPayment) + '원';

    const resultPanel = document.getElementById('modalAffordabilityResult');
    const exportBtn = document.querySelector('#affordabilityModal .export-btn');
    resultPanel.style.display = 'block';
    exportBtn.style.display = 'inline-flex';
}

window.calculateModalLeaseConversion = function () {
    // GA4 이벤트 추적
    trackCalculatorUsage('lease-conversion', 'calculate');
    if (!leaseCalc) {
        alert('전월세 전환율 계산기가 초기화되지 않았습니다.');
        return;
    }

    const deposit = parseNumber(document.getElementById('modalDepositAmount').value);
    const monthlyRent = parseNumber(document.getElementById('modalMonthlyRent').value);
    const jeonseAmount = parseNumber(document.getElementById('modalJeonseAmount').value);
    const interestRate = parseNumber(document.getElementById('modalLeaseInterestRate').value); // parseNumber는 null 또는 숫자 반환

    if (deposit === null || isNaN(deposit) || deposit < 0 || monthlyRent === null || isNaN(monthlyRent) || monthlyRent < 0 || jeonseAmount === null || isNaN(jeonseAmount) || jeonseAmount < 0 || isNaN(interestRate) || interestRate < 0) {
        alert('보증금, 월세, 전세금, 시중금리를 올바르게 입력해주세요.');
        return;
    }

    const result = leaseCalc.calculateConversionRate(deposit, monthlyRent, jeonseAmount, interestRate);

    window.currentLeaseConversionResult = { deposit, monthlyRent, jeonseAmount, interestRate, ...result };

    document.getElementById('modalConversionRate').textContent = result.conversionRate.toFixed(2) + '%';
    document.getElementById('modalBetterChoice').textContent = result.betterChoice;
    document.getElementById('modalYearlyDifference').textContent = formatNumber(result.yearlyDifference) + '원';

    const resultPanel = document.getElementById('modalLeaseConversionResult');
    const exportBtn = document.querySelector('#leaseConversionModal .export-btn');
    resultPanel.style.display = 'block';
    exportBtn.style.display = 'inline-flex';
}

// 중도상환 수수료 계산 함수
window.calculateModalPrepaymentFee = function () {
    // GA4 이벤트 추적
    trackCalculatorUsage('prepayment-fee', 'calculate');
    if (!prepaymentFeeCalc) {
        alert('중도상환 수수료 계산기가 초기화되지 않았습니다.');
        return;
    }

    const prepaymentModal = document.getElementById('prepaymentFeeModal');

    const loanAmount = parseNumber(prepaymentModal.querySelector('#modalLoanAmount').value);
    const remainingAmount = parseNumber(prepaymentModal.querySelector('#modalRemainingAmount').value);
    const interestRate = parseFloat(prepaymentModal.querySelector('#modalLoanInterestRate').value);
    const remainingPeriod = parseInt(prepaymentModal.querySelector('#modalRemainingPeriod').value);
    const prepaymentFeeRate = parseFloat(prepaymentModal.querySelector('#modalPrepaymentFeeRate').value) || 1.5;
    const prepaymentAmount = parseNumber(prepaymentModal.querySelector('#modalPrepaymentAmount').value);

    // 유효성 검사
    if (remainingAmount <= 0) {
        alert('잔여원금을 올바르게 입력해주세요.');
        return;
    }
    if (interestRate <= 0) {
        alert('대출금리를 올바르게 입력해주세요.');
        return;
    }
    if (remainingPeriod <= 0) {
        alert('잔여기간을 올바르게 입력해주세요.');
        return;
    }
    if (prepaymentAmount <= 0) {
        alert('상환금액을 올바르게 입력해주세요.');
        return;
    }
    if (prepaymentAmount > remainingAmount) {
        alert('상환금액이 잔여원금보다 클 수 없습니다.');
        return;
    }

    const result = prepaymentFeeCalc.calculatePrepaymentFee(
        loanAmount,
        remainingAmount,
        interestRate,
        remainingPeriod,
        prepaymentFeeRate,
        prepaymentAmount
    );

    // 결과 저장
    window.currentPrepaymentFeeResult = {
        loanAmount,
        remainingAmount,
        interestRate,
        remainingPeriod,
        prepaymentFeeRate,
        prepaymentAmount,
        ...result
    };

    // 결과 표시
    document.getElementById('modalPrepaymentFee').textContent = formatNumber(result.prepaymentFee) + '원';
    document.getElementById('modalSavedInterest').textContent = formatNumber(result.savedInterest) + '원';
    document.getElementById('modalNetSavings').textContent = formatNumber(result.netSavings) + '원';
    document.getElementById('modalBreakEvenMonth').textContent = result.breakEvenMonths + '개월';

    const resultPanel = document.getElementById('modalPrepaymentFeeResult');
    const exportBtn = document.querySelector('#prepaymentFeeModal .export-btn');
    resultPanel.style.display = 'block';
    exportBtn.style.display = 'inline-flex';
}

// PDF 및 이미지 다운로드 함수들
window.downloadResultAsPDF = function (elementId, filename) {
    // GA4 이벤트 추적
    const calculatorType = filename.split('_')[0];
    trackDownload('pdf', calculatorType);

    const element = document.getElementById(elementId);
    if (!element) {
        alert('결과 영역을 찾을 수 없습니다.');
        return;
    }

    html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const pageHeight = pdf.internal.pageSize.height;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${filename || '계산결과'}.pdf`);
    }).catch(error => {
        console.error('PDF 생성 오류:', error);
        alert('PDF 생성 중 오류가 발생했습니다.');
    });
};

window.downloadResultAsImage = function (elementId, filename) {
    // GA4 이벤트 추적
    const calculatorType = filename.split('_')[0];
    trackDownload('image', calculatorType);

    const element = document.getElementById(elementId);
    if (!element) {
        alert('결과 영역을 찾을 수 없습니다.');
        return;
    }

    html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${filename || '계산결과'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(error => {
        console.error('이미지 생성 오류:', error);
        alert('이미지 생성 중 오류가 발생했습니다.');
    });
};

// 다운로드 옵션 선택 모달 표시
window.showDownloadOptions = function (resultElementId, calculatorName) {
    const modal = document.createElement('div');
    modal.className = 'download-options-modal';
    modal.innerHTML = `
        <div class="download-modal-content">
            <h3>다운로드 형식 선택</h3>
            <div class="download-buttons">
                <button onclick="downloadResultAsPDF('${resultElementId}', '${calculatorName}_결과'); closeDownloadModal();" class="btn download-btn">
                    <i class="fas fa-file-pdf"></i> PDF로 다운로드
                </button>
                <button onclick="downloadResultAsImage('${resultElementId}', '${calculatorName}_결과'); closeDownloadModal();" class="btn download-btn">
                    <i class="fas fa-image"></i> 이미지로 다운로드
                </button>
            </div>
            <button onclick="closeDownloadModal()" class="btn cancel-btn">취소</button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
};

window.closeDownloadModal = function () {
    const modal = document.querySelector('.download-options-modal');
    if (modal) {
        modal.remove();
    }
};

// DOMContentLoaded 이벤트 리스너: 모든 HTML이 로드되고 개별 스크립트 파일이 실행된 후 호출됩니다.
document.addEventListener('DOMContentLoaded', () => {
    // Calculator 인스턴스 생성 (window 객체에서 가져옴)
    loanCalc = new window.LoanCalculator();
    realEstateCalc = new window.RealEstateTaxCalculator();

    // 다른 계산기들도 초기화 (파일이 로드되었는지 확인)
    if (window.SavingsCalculator) {
        savingsCalc = new window.SavingsCalculator();
    }
    if (window.BrokerageFeeCalculator) {
        brokerageCalc = new window.BrokerageFeeCalculator();
    }
    if (window.LoanLimitCalculator) {
        loanLimitCalc = new window.LoanLimitCalculator();
    }
    if (window.HousingAffordabilityCalculator) {
        affordabilityCalc = new window.HousingAffordabilityCalculator();
    }
    if (window.LeaseConversionCalculator) {
        leaseCalc = new window.LeaseConversionCalculator();
    }
    if (window.HoldingTaxCalculator) {
        holdingTaxCalc = new window.HoldingTaxCalculator();
    }
    if (window.PrepaymentFeeCalculator) {
        prepaymentFeeCalc = new window.PrepaymentFeeCalculator();
    }

    new CalculatorManager();

    // 페이지 로드 시 GA4 페이지 뷰 추적
    trackPageView();

    // 관리자 페이지 접근 단축키 (Ctrl+Shift+A)
    document.addEventListener('keydown', async (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            const password = prompt('관리자 비밀번호를 입력하세요:');
            if (password) {
                // 사용자가 입력한 비밀번호를 SHA-256으로 해싱하여 저장된 해시와 비교
                const ADMIN_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // 'admin123'을 해싱한 값

                try {
                    const encoder = new TextEncoder();
                    const data = encoder.encode(password);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                    if (hexHash === ADMIN_HASH) {
                        window.location.href = 'admin.html';
                    } else {
                        alert('잘못된 비밀번호입니다.');
                    }
                } catch (error) {
                    console.error('해싱 오류:', error);
                    alert('인증 중 오류가 발생했습니다. 안전하지 않은 환경(http)에서는 작동하지 않을 수 있습니다.');
                }
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const activeModal = document.querySelector('.calculator-modal.active');
            if (activeModal) {
                const calculateBtn = activeModal.querySelector('.calculate-btn');
                if (calculateBtn) {
                    if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.classList.contains('input-field')) {
                        document.activeElement.blur();
                        setTimeout(() => {
                            calculateBtn.click();
                        }, 50);
                    } else if (document.activeElement && document.activeElement.tagName === 'BUTTON' && document.activeElement.classList.contains('calculate-btn')) {
                        calculateBtn.click();
                    }
                }
            }
        }
    });

    let ticking = false;
    function updateScrollElements() {
        ticking = false;
    }

    document.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollElements);
            ticking = true;
        }
    });

    console.log('금융계산기가 성공적으로 로드되었습니다! 🎉');
});

// Export Functions
window.exportLoanResult = function () {
    const result = window.currentLoanResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    const content = `대출 이자 계산 결과\n===================\n\n계산 일시: ${new Date().toLocaleString('ko-KR')}\n\n[입력 정보]\n대출금액: ${formatNumber(result.amount)}원\n연이율: ${result.rate}%\n대출기간: ${result.years}년\n상환방식: ${result.mode === 'equal-payment' ? '원리금균등' : '원금균등'}\n\n[계산 결과]\n월 상환액: ${formatNumber(result.monthlyPayment)}원\n총 상환액: ${formatNumber(result.totalPayment)}원\n총 이자: ${formatNumber(result.totalInterest)}원\n\n* 이 결과는 참고용이며, 실제 조건은 금융기관에 따라 달라질 수 있습니다.`;
    downloadTxtFile(content, '대출이자계산결과.txt');
}

window.exportRealEstateResult = function () {
    const result = window.currentRealEstateResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    const propertyTypeNames = { apartment: '아파트', house: '단독주택', officetel: '오피스텔', commercial: '상업시설' };
    let content = `부동산 세금 계산 결과\n===================\n\n계산 일시: ${new Date().toLocaleString('ko-KR')}\n\n[입력 정보]\n부동산 가격: ${formatNumber(result.price)}원\n부동산 유형: ${propertyTypeNames[result.propertyType]}\n계산 모드: ${result.mode === 'acquisition' ? '취득세' : '양도소득세'}\n`;

    if (result.mode === 'acquisition') {
        content += `주택 보유: ${result.isFirstHome === 'first' ? '1주택자' : '다주택자'}\n\n[계산 결과]\n취득세: ${formatNumber(result.acquisitionTax)}원\n등록세: ${formatNumber(result.registrationTax)}원\n총 세금: ${formatNumber(result.totalTax)}원\n`;
    } else if (result.mode === 'transfer') {
        content += `거래 유형: ${result.subMode === 'simple' ? '간편식' : '상세식'}\n`;
        if (result.subMode === 'detailed') {
            content += `취득가액: ${formatNumber(result.purchasePrice)}원\n`;
            // acquisitionDate와 transferDate를 기반으로 보유 기간 계산 (export 시)
            if (result.acquisitionDate && result.transferDate) {
                const acqDate = new Date(result.acquisitionDate);
                const tranDate = new Date(result.transferDate);
                // 유효한 날짜인지 다시 한번 확인
                if (!isNaN(acqDate.getTime()) && !isNaN(tranDate.getTime())) {
                    const diffTime = Math.abs(tranDate.getTime() - acqDate.getTime());
                    const daysInYear = 365.25;
                    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * daysInYear));
                    content += `취득일: ${result.acquisitionDate}\n양도일: ${result.transferDate} (보유 기간: 약 ${diffYears}년)\n`;
                } else {
                    // 날짜가 유효하지 않으면 입력된 holdingPeriod 사용
                    content += `취득일: ${result.acquisitionDate || '미입력'}\n양도일: ${result.transferDate || '미입력'}\n`;
                    if (result.holdingPeriod !== null) content += `보유 기간 (입력값): ${result.holdingPeriod}년\n`;
                }
            } else if (result.holdingPeriod !== null) { // 날짜가 없으면 기존 holdingPeriod 사용
                content += `보유 기간: ${result.holdingPeriod}년\n`;
            }
            content += `필요 경비: ${formatNumber(result.expense)}원\n`;
            content += `보유 주택 수: ${formatNumber(result.multipleHomes)}채\n`; // 숫자 포맷팅 적용
            content += `조정대상지역: ${result.adjustmentArea === 'yes' ? '맞음' : '아님'}\n`;
        }
        content += `\n[계산 결과]\n`;
        if (result.subMode === 'detailed') {
            content += `양도차익: ${formatNumber(result.capitalGain)}원\n`;
            content += `장기보유특별공제: ${formatNumber(result.longTermDeduction)}원\n`;
            content += `양도소득세: ${formatNumber(result.transferTax)}원\n`;
            content += `적용 세율: ${(result.taxRate * 100).toFixed(2)}%\n`;
            content += `총 세금 (지방소득세 포함): ${formatNumber(result.totalTax)}원\n`;
        } else {
            content += `총 양도소득세: ${formatNumber(result.totalTax)}원\n`;
        }
    }
    content += `\n* 이 결과는 참고용이며, 실제 세금은 개별 조건에 따라 달라질 수 있습니다.`;
    downloadTxtFile(content, '부동산세금계산결과.txt');
}

window.exportSavingsResult = function () {
    const result = window.currentSavingsResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    const content = `예적금 계산 결과\n===================\n\n계산 일시: ${new Date().toLocaleString('ko-KR')}\n\n[입력 정보]\n${result.mode === 'deposit' ? '예금' : '적금'} 금액: ${formatNumber(result.amount)}원\n연이율: ${result.rate}%\n기간: ${result.months}개월\n\n[계산 결과]\n원금: ${formatNumber(result.principal)}원\n세후 이자: ${formatNumber(result.afterTaxInterest)}원\n세후 수령액: ${formatNumber(result.total)}원\n\n* 이 결과는 참고용이며, 실제 이자는 은행별 조건에 따라 달라질 수 있습니다.`;
    downloadTxtFile(content, '예적금계산결과.txt');
}

window.exportBrokerageResult = function () {
    const result = window.currentBrokerageResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    const propertyTypeNames = { residential: '주거용', commercial: '상업용', land: '토지' };
    const content = `중개수수료 계산 결과\n===================\n\n계산 일시: ${new Date().toLocaleString('ko-KR')}\n\n[입력 정보]\n거래금액: ${formatNumber(result.amount)}원\n부동산 유형: ${propertyTypeNames[result.propertyType]}\n거래 유형: ${result.mode === 'sale' ? '매매' : '임대'}\n\n[계산 결과]\n중개수수료율: ${(result.rate * 100).toFixed(2)}%\n상한 수수료: ${formatNumber(result.fee)}원\n\n* 이 결과는 참고용이며, 실제 수수료는 중개사와의 협의에 따라 달라질 수 있습니다.`;
    downloadTxtFile(content, '중개수수료계산결과.txt');
}

window.exportLoanLimitResult = function () {
    const result = window.currentLoanLimitResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    const content = `대출한도 계산 결과\n===================\n\n계산 일시: ${new Date().toLocaleString('ko-KR')}\n\n[입력 정보]\n월 소득: ${formatNumber(result.monthlyIncome)}원\n기존 부채: ${formatNumber(result.existingDebt)}원\n담보 가치: ${formatNumber(result.propertyValue)}원\n\n[계산 결과]\nDSR 기준 한도: ${formatNumber(result.dsrLimit)}원\nLTV 기준 한도: ${formatNumber(result.ltvLimit)}원\n최종 대출한도: ${formatNumber(result.finalLimit)}원\n\n* 이 결과는 참고용이며, 실제 대출한도는 금융기관의 심사에 따라 달라질 수 있습니다.`;
    downloadTxtFile(content, '대출한도계산결과.txt');
}

window.exportAffordabilityResult = function () {
    const result = window.currentAffordabilityResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    const content = `주택구매력 계산 결과\n===================\n\n계산 일시: ${new Date().toLocaleString('ko-KR')}\n\n[입력 정보]\n월 소득: ${formatNumber(result.monthlyIncome)}원\n자기자금: ${formatNumber(result.downPayment)}원\n대출금리: ${result.interestRate}%\n대출기간: ${result.loanTerm}년\n\n[계산 결과]\n대출 가능액: ${formatNumber(result.maxLoanAmount)}원\n총 구매가능액: ${formatNumber(result.totalPurchasePrice)}원\n월 상환액: ${formatNumber(result.monthlyPayment)}원\n\n* 이 결과는 참고용이며, 실제 구매력은 개별 조건에 따라 달라질 수 있습니다.`;
    downloadTxtFile(content, '주택구매력계산결과.txt');
}

window.exportLeaseConversionResult = function () {
    const result = window.currentLeaseConversionResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    const content = `전월세 전환율 계산 결과\n===================\n\n계산 일시: ${new Date().toLocaleString('ko-KR')}\n\n[입력 정보]\n보증금: ${formatNumber(result.deposit)}원\n월세: ${formatNumber(result.monthlyRent)}원\n전세금: ${formatNumber(result.jeonseAmount)}원\n시중금리: ${result.interestRate}%\n\n[계산 결과]\n전환율: ${result.conversionRate.toFixed(2)}%\n유리한 선택: ${result.betterChoice}\n연간 차이: ${formatNumber(result.yearlyDifference)}원\n\n* 이 결과는 참고용이며, 실제 조건은 시장 상황에 따라 달라질 수 있습니다.`;
    downloadTxtFile(content, '전월세전환율계산결과.txt');
}

function downloadTxtFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Ad Modal Function
window.showAdModal = function () {
    const adShownKey = 'adShown_' + new Date().toDateString();
    const lastAdShown = localStorage.getItem(adShownKey);
    const currentTime = Date.now();

    if (lastAdShown && (currentTime - parseInt(localStorage.getItem('lastAdShownTimestamp') || '0') < 1800000 || lastAdShown === 'true')) {
        return;
    }

    const adModal = document.getElementById('adModal');
    const adTimer = document.getElementById('adTimer');
    const closeAdModalBtn = document.getElementById('closeAdModal');

    if (!adModal || !adTimer || !closeAdModalBtn) return;

    let timeLeft = 5;
    adModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const adModalContent = adModal.querySelector('.ad-modal-content');
    let closeXBtn = adModalContent.querySelector('.close-x-btn');
    if (!closeXBtn && adModalContent) {
        closeXBtn = document.createElement('button');
        closeXBtn.className = 'close-x-btn';
        closeXBtn.innerHTML = '&times;';
        closeXBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            color: #525252;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.3s, color 0.3s;
        `;
        adModalContent.style.position = 'relative';
        adModalContent.appendChild(closeXBtn);

        closeXBtn.addEventListener('mouseover', () => {
            closeXBtn.style.backgroundColor = 'var(--neutral-100)';
            closeXBtn.style.color = 'var(--neutral-900)';
        });

        closeXBtn.addEventListener('mouseout', () => {
            closeXBtn.style.backgroundColor = 'transparent';
            closeXBtn.style.color = 'var(--neutral-500)';
        });

        closeXBtn.addEventListener('click', closeAdModalFunction);
    }

    const countdown = setInterval(() => {
        timeLeft--;
        adTimer.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            closeAdModalBtn.style.display = 'inline-flex';
            adTimer.style.display = 'none';
        }
    }, 1000);

    function closeAdModalFunction() {
        adModal.style.display = 'none';
        document.body.style.overflow = '';
        localStorage.setItem(adShownKey, 'true');
        localStorage.setItem('lastAdShownTimestamp', currentTime.toString());
    }

    closeAdModalBtn.addEventListener('click', closeAdModalFunction);
}

// 보유세 계산 함수
window.calculateModalHoldingTax = function () {
    // GA4 이벤트 추적
    trackCalculatorUsage('holding-tax', 'calculate');
    if (!holdingTaxCalc) {
        alert('보유세 계산기가 초기화되지 않았습니다.');
        return;
    }

    const propertyValue = parseNumber(document.getElementById('modalHoldingPropertyValue').value);
    const propertyType = document.getElementById('modalHoldingPropertyType').value;
    const age = parseNumber(document.getElementById('modalHoldingAge').value) || 0;
    const homesCount = document.getElementById('modalHoldingHomesCount').value;

    if (propertyValue <= 0) {
        alert('공시가격을 올바르게 입력해주세요.');
        return;
    }

    const result = holdingTaxCalc.calculateHoldingTax(propertyValue, propertyType, age, homesCount);

    document.getElementById('modalPropertyTax').textContent = formatNumber(result.propertyTax) + '원';
    document.getElementById('modalComprehensiveTax').textContent = formatNumber(result.comprehensiveTax) + '원';
    document.getElementById('modalTotalHoldingTax').textContent = formatNumber(result.totalTax) + '원';

    const resultPanel = document.getElementById('modalHoldingTaxResult');
    resultPanel.style.display = 'block';

    // 결과를 전역에 저장 (내보내기 용)
    window.currentHoldingTaxResult = {
        propertyValue,
        propertyType,
        age,
        homesCount,
        ...result
    };
}

// 보유세 결과 내보내기
window.exportHoldingTaxResult = function () {
    if (!window.currentHoldingTaxResult) {
        alert('먼저 계산을 수행해주세요.');
        return;
    }

    const result = window.currentHoldingTaxResult;
    const propertyTypeText = result.propertyType === 'house' ? '주택' : result.propertyType === 'land' ? '토지' : '건물';

    const content = `보유세 계산 결과

공시가격: ${formatNumber(result.propertyValue)}원
부동산 유형: ${propertyTypeText}
건물 연수: ${result.age}년
보유 주택 수: ${result.homesCount}주택

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

재산세: ${formatNumber(result.propertyTax)}원
종합부동산세: ${formatNumber(result.comprehensiveTax)}원
총 보유세: ${formatNumber(result.totalTax)}원

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
계산일: ${new Date().toLocaleDateString('ko-KR')}

※ 본 계산 결과는 참고용으로 실제와 다를 수 있으며, 법적 책임을 지지 않습니다.`;

    downloadResult(content, '보유세_계산결과.txt');
}

// 피드백 모달 관련 함수들
window.openFeedbackModal = function () {
    const modal = document.getElementById('feedbackModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.closeFeedbackModal = function () {
    const modal = document.getElementById('feedbackModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // 폼 초기화
    document.getElementById('feedbackType').value = 'bug';
    document.getElementById('feedbackMessage').value = '';
    document.getElementById('feedbackEmail').value = '';
}

window.submitFeedback = function () {
    const type = document.getElementById('feedbackType').value;
    const message = document.getElementById('feedbackMessage').value.trim();
    const email = document.getElementById('feedbackEmail').value.trim();

    if (!message) {
        alert('메시지를 입력해주세요.');
        return;
    }

    // 피드백 데이터 구성
    const feedbackData = {
        type: type,
        message: message,
        email: email || '미제공',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };

    // 실제 서버로 전송하는 대신 로컬 스토리지에 저장 (데모용)
    try {
        const existingFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        existingFeedbacks.push(feedbackData);
        localStorage.setItem('feedbacks', JSON.stringify(existingFeedbacks));

        alert('피드백이 성공적으로 전송되었습니다. 소중한 의견 감사합니다!');
        closeFeedbackModal();
    } catch (error) {
        console.error('피드백 저장 오류:', error);
        alert('피드백 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// 관리자용 피드백 확인 함수
window.viewFeedbacks = function () {
    try {
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        if (feedbacks.length === 0) {
            console.log('📝 저장된 피드백이 없습니다.');
            return;
        }

        console.log('📝 피드백 목록 (' + feedbacks.length + '개):');
        console.log('=====================================');

        feedbacks.forEach((feedback, index) => {
            console.log(`\n[${index + 1}] ${feedback.type.toUpperCase()}`);
            console.log(`📅 시간: ${new Date(feedback.timestamp).toLocaleString('ko-KR')}`);
            console.log(`📧 이메일: ${feedback.email}`);
            console.log(`💬 메시지: ${feedback.message}`);
            console.log(`🌐 페이지: ${feedback.url}`);
            console.log('---');
        });

        console.log('\n💡 피드백을 다운로드하려면 downloadFeedbacks() 함수를 실행하세요.');
    } catch (error) {
        console.error('피드백 조회 오류:', error);
    }
};

// 피드백 다운로드 함수
window.downloadFeedbacks = function () {
    try {
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        if (feedbacks.length === 0) {
            alert('다운로드할 피드백이 없습니다.');
            return;
        }

        const dataStr = JSON.stringify(feedbacks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `feedbacks_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('✅ 피드백 데이터가 다운로드되었습니다.');
    } catch (error) {
        console.error('피드백 다운로드 오류:', error);
        alert('피드백 다운로드 중 오류가 발생했습니다.');
    }
};

// 피드백 삭제 함수
window.clearFeedbacks = function () {
    if (confirm('정말로 모든 피드백을 삭제하시겠습니까?')) {
        localStorage.removeItem('feedbacks');
        console.log('🗑️ 모든 피드백이 삭제되었습니다.');
    }
};

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatNumber,
        parseNumber
    };
}