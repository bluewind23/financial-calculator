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

// Utility Functions
const formatNumber = (number) => {
    // toLocaleString을 사용하기 전에 숫자인지 확인합니다.
    if (typeof number !== 'number' || isNaN(number)) {
        return ''; // 숫자가 아니면 빈 문자열 반환
    }
    return new Intl.NumberFormat('ko-KR').format(number);
};

const parseNumber = (value) => {
    if (!value || value.trim() === '') return 0;  // null → 0으로 처리
    const cleaned = value.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
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
class CalculatorManager {
    constructor() {
        this.activeCalculator = 'loan';
        this.init();
    }

    init() {
        this.setupCalculatorNavigation();
        this.setupModalControls();
        this.setupModeButtons();
        this.setupInputFormatting();
        this.setupMobileMenu();
        this.setupScrollAnimations();
        this.setupGuideTabs();
        this.setupRealEstateTaxModes(); // 새로 추가된 부동산 세금 계산기 모드 설정
        this.setupSearch(); // 검색 기능 설정
    }

    setupCalculatorNavigation() {
        const calculatorCards = document.querySelectorAll('.calculator-card');
        const popularTools = document.querySelectorAll('.popular-tool');

        // 기존 계산기 카드 이벤트 - 모달 대신 직접 페이지 이동
        calculatorCards.forEach(card => {
            card.addEventListener('click', () => {
                const calculatorType = card.dataset.calculator;

                // GA4 이벤트 추적 - 계산기 페이지 이동
                trackCalculatorUsage(calculatorType, 'navigate');

                // href 속성이 있으면 자연스럽게 페이지 이동 허용
                // preventDefault 없이 기본 동작 허용
            });
        });

        // 인기 도구 이벤트 - 모달 대신 직접 페이지 이동
        popularTools.forEach(tool => {
            tool.addEventListener('click', () => {
                const calculatorType = tool.dataset.calculator;

                // GA4 이벤트 추적 - 인기 도구에서 계산기 페이지 이동
                trackCalculatorUsage(calculatorType, 'popular-tool');

                // href 속성이 있으면 자연스럽게 페이지 이동 허용
                // preventDefault 없이 기본 동작 허용
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
            // Check if this is a percentage/rate field by ID or class
            const isPercentageField = input.id.includes('Rate') || input.id.includes('rate') || 
                                    input.id.includes('Interest') || input.id.includes('interest') ||
                                    input.classList.contains('rate-field') || 
                                    input.classList.contains('percentage-field');

            if (input.value) {
                const initialNum = parseNumber(input.value);
                if (initialNum !== null) {
                    input.setAttribute('data-raw-value', initialNum.toString());
                    // Don't format percentage fields with commas
                    input.value = isPercentageField ? initialNum.toString() : formatNumber(initialNum);
                } else {
                    input.setAttribute('data-raw-value', '');
                    input.value = '';
                }
            } else {
                input.setAttribute('data-raw-value', '');
            }

            input.addEventListener('input', (e) => {
                let currentValue = e.target.value;
                const cursorPosition = e.target.selectionStart;
                
                // 콤마 제거하여 순수 숫자만 추출
                currentValue = currentValue.replace(/,/g, '');

                let cleanValue = currentValue.replace(/[^\d.]/g, ''); // 숫자와 소수점만 허용

                const parts = cleanValue.split('.');
                if (parts.length > 2) {
                    cleanValue = parts[0] + '.' + parts.slice(1).join('');
                }

                // Limit decimal places to 2 for percentage fields
                if (isPercentageField && parts.length === 2 && parts[1].length > 2) {
                    cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
                }

                // 음수 입력 방지 (주로 금액 입력 필드에 해당)
                // 첫 글자가 '-'인 경우, 제거
                if (cleanValue.startsWith('-')) {
                    cleanValue = cleanValue.substring(1);
                }

                // Apply formatting based on field type
                let formattedValue;
                if (isPercentageField) {
                    // For percentage fields, don't add commas, just use the clean value
                    formattedValue = cleanValue;
                } else {
                    // For amount fields, apply comma formatting
                    formattedValue = formatNumber(parseNumber(cleanValue));
                }
                
                e.target.value = formattedValue;
                e.target.setAttribute('data-raw-value', cleanValue);
                
                // Cursor position restoration (only for non-percentage fields with commas)
                if (!isPercentageField && formattedValue.includes(',')) {
                    const commasBeforeCursor = (formattedValue.substring(0, cursorPosition).match(/,/g) || []).length;
                    const newCursorPosition = cursorPosition + commasBeforeCursor;
                    
                    setTimeout(() => {
                        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
                    }, 0);
                }
            });

            // script.js 파일의 setupInputFormatting 함수 내 blur 이벤트 리스너
            input.addEventListener('blur', (e) => {
                const rawValue = e.target.getAttribute('data-raw-value') || '';

                // 비어있는 값이면 필드를 확실하게 비워줍니다.
                if (rawValue.trim() === '') {
                    e.target.value = '';
                } else {
                    // 값이 있을 때만 포맷팅을 적용합니다.
                    const numValue = parseNumber(rawValue);
                    if (isPercentageField) {
                        // For percentage fields, show the actual decimal value
                        e.target.value = numValue.toString();
                    } else {
                        // For amount fields, apply comma formatting
                        e.target.value = formatNumber(numValue);
                    }
                }
            });
            input.addEventListener('focus', (e) => {
                // 포커스할 때는 이미 포맷된 값을 유지
                // 커서를 끝으로 이동
                const currentValue = e.target.value;
                e.target.setSelectionRange(currentValue.length, currentValue.length);
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

    setupSearch() {
        const searchInput = document.getElementById('calculatorSearch');
        const searchClear = document.getElementById('searchClear');
        const searchSuggestions = document.getElementById('searchSuggestions');
        
        if (!searchInput || !searchSuggestions) return;

        // 계산기 데이터
        this.calculators = [
            {
                id: 'loan',
                title: '대출 이자 계산기',
                description: '원리금균등/원금균등 상환방식별 월 상환액과 총 이자를 계산',
                keywords: ['대출', '이자', '월상환액', '원리금균등', '원금균등', '상환', '금리'],
                icon: 'fas fa-home',
                tags: ['원리금균등', '원금균등', '중도상환']
            },
            {
                id: 'realestate',
                title: '부동산 세금 계산기',
                description: '취득세, 양도소득세, 보유세 등 부동산 관련 세금을 정확하게 계산',
                keywords: ['부동산', '세금', '취득세', '양도소득세', '보유세', '등록세'],
                icon: 'fas fa-building',
                tags: ['취득세', '양도소득세', '보유세']
            },
            {
                id: 'savings',
                title: '예적금 계산기',
                description: '예금, 적금의 만기 수령액과 세후 이자를 정확하게 계산',
                keywords: ['예금', '적금', '저축', '만기', '복리', '단리', '이자'],
                icon: 'fas fa-piggy-bank',
                tags: ['단리/복리', '세후계산', '만기예상']
            },
            {
                id: 'brokerage',
                title: '중개수수료 계산기',
                description: '매매, 임대 시 부동산 중개수수료와 관련 비용을 계산',
                keywords: ['중개수수료', '부동산', '매매', '임대', '수수료', '거래'],
                icon: 'fas fa-handshake',
                tags: ['매매수수료', '임대수수료', '상한선']
            },
            {
                id: 'loan-limit',
                title: '대출한도 계산기',
                description: '소득과 부채를 고려한 최대 대출 가능 금액을 계산',
                keywords: ['대출한도', 'DSR', 'LTV', '소득', '부채', '한도'],
                icon: 'fas fa-chart-bar',
                tags: ['DSR계산', 'LTV계산', '소득기반']
            },
            {
                id: 'affordability',
                title: '주택구매력 계산기',
                description: '소득을 기준으로 구매 가능한 주택 가격대를 계산',
                keywords: ['주택구매력', '주택', '구매', '소득', '가격대', '구매력'],
                icon: 'fas fa-house-user',
                tags: ['소득기반', '구매력분석', '가격대']
            },
            {
                id: 'lease-conversion',
                title: '전월세 전환율 계산기',
                description: '전세와 월세 간의 합리적인 전환율을 계산',
                keywords: ['전월세', '전세', '월세', '전환율', '임대', '보증금'],
                icon: 'fas fa-exchange-alt',
                tags: ['전환율', '보증금', '월세']
            },
            {
                id: 'holding-tax',
                title: '보유세 계산기',
                description: '재산세, 종합부동산세 등 부동산 보유에 따른 세금을 계산',
                keywords: ['보유세', '재산세', '종합부동산세', '종부세', '부동산'],
                icon: 'fas fa-building-columns',
                tags: ['재산세', '종부세', '보유세']
            },
            {
                id: 'prepayment-fee',
                title: '중도상환 수수료 계산기',
                description: '대출 중도상환 시 발생하는 수수료와 이자 절약액을 계산',
                keywords: ['중도상환', '수수료', '대출', '상환', '이자절약'],
                icon: 'fas fa-calculator',
                tags: ['중도상환', '수수료', '이자절약']
            }
        ];

        let currentHighlight = -1;

        // 검색어 입력 이벤트
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length > 0) {
                searchClear.style.display = 'flex';
                this.showSuggestions(query, searchSuggestions);
            } else {
                searchClear.style.display = 'none';
                this.hideSuggestions(searchSuggestions);
            }
            currentHighlight = -1;
        });

        // 검색창 포커스 이벤트
        searchInput.addEventListener('focus', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.showSuggestions(query, searchSuggestions);
            }
        });

        // 키보드 네비게이션
        searchInput.addEventListener('keydown', (e) => {
            const suggestions = searchSuggestions.querySelectorAll('.suggestion-item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                currentHighlight = Math.min(currentHighlight + 1, suggestions.length - 1);
                this.updateHighlight(suggestions, currentHighlight);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                currentHighlight = Math.max(currentHighlight - 1, -1);
                this.updateHighlight(suggestions, currentHighlight);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentHighlight >= 0 && suggestions[currentHighlight]) {
                    suggestions[currentHighlight].click();
                }
            } else if (e.key === 'Escape') {
                this.hideSuggestions(searchSuggestions);
                currentHighlight = -1;
            }
        });

        // 검색어 지우기 버튼
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            searchClear.style.display = 'none';
            this.hideSuggestions(searchSuggestions);
            currentHighlight = -1;
        });

        // 외부 클릭 시 자동완성 숨기기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                this.hideSuggestions(searchSuggestions);
                currentHighlight = -1;
            }
        });
    }

    showSuggestions(query, container) {
        const results = this.searchCalculators(query);
        
        if (results.length === 0) {
            container.classList.remove('active');
            return;
        }

        const html = results.map(calc => `
            <div class="suggestion-item" data-calculator="${calc.id}">
                <div class="suggestion-icon">
                    <i class="${calc.icon}"></i>
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${this.highlightText(calc.title, query)}</div>
                    <div class="suggestion-description">${this.highlightText(calc.description, query)}</div>
                    <div class="suggestion-tags">
                        ${calc.tags.map(tag => `<span class="suggestion-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
        container.classList.add('active');

        // 검색 결과 클릭 이벤트
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const calculatorId = item.dataset.calculator;
                
                // GA4 이벤트 추적
                trackCalculatorUsage(calculatorId, 'search');
                
                // 모달 대신 해당 페이지로 직접 이동
                const pageUrl = this.getCalculatorPageUrl(calculatorId);
                if (pageUrl) {
                    window.location.href = pageUrl;
                }
                
                this.hideSuggestions(container);
                
                // 검색창 초기화
                const searchInput = document.getElementById('calculatorSearch');
                const searchClear = document.getElementById('searchClear');
                searchInput.value = '';
                searchClear.style.display = 'none';
            });
        });
    }

    hideSuggestions(container) {
        container.classList.remove('active');
    }

    // 계산기 ID를 페이지 URL로 변환하는 함수
    getCalculatorPageUrl(calculatorId) {
        const urlMap = {
            'loan': 'loan-calculator.html',
            'realestate': 'realestate-tax.html',
            'savings': 'savings-calculator.html',
            'brokerage': 'brokerage-calculator.html',
            'loan-limit': 'loan-limit.html',
            'affordability': 'affordability-calculator.html',
            'lease-conversion': 'jeonse-calculator.html',
            'prepayment-fee': 'prepayment-calculator.html',
            'holding-tax': 'investment-calculator.html'
        };
        return urlMap[calculatorId] || null;
    }

    searchCalculators(query) {
        const lowerQuery = query.toLowerCase();
        
        return this.calculators.filter(calc => {
            // 제목, 설명, 키워드에서 검색
            const titleMatch = calc.title.toLowerCase().includes(lowerQuery);
            const descMatch = calc.description.toLowerCase().includes(lowerQuery);
            const keywordMatch = calc.keywords.some(keyword => 
                keyword.toLowerCase().includes(lowerQuery)
            );
            
            return titleMatch || descMatch || keywordMatch;
        }).sort((a, b) => {
            // 제목 매치를 우선순위로 정렬
            const aTitle = a.title.toLowerCase().includes(lowerQuery);
            const bTitle = b.title.toLowerCase().includes(lowerQuery);
            
            if (aTitle && !bTitle) return -1;
            if (!aTitle && bTitle) return 1;
            return 0;
        });
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    updateHighlight(suggestions, index) {
        suggestions.forEach((item, i) => {
            if (i === index) {
                item.classList.add('highlighted');
            } else {
                item.classList.remove('highlighted');
            }
        });
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
    // GA4 이벤트 추적
    trackCalculatorUsage('loan', 'calculate');
    // loanCalc가 undefined가 아님을 보장
    if (!loanCalc) { console.error("LoanCalculator is not initialized."); return; }

    const amount = parseNumber(document.getElementById('modalLoanAmount').value);
    const rate = parseNumber(document.getElementById('modalInterestRate').value);
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

    document.getElementById('modalMonthlyPayment').textContent = formatNumber(result.monthlyPayment) + '원';
    document.getElementById('modalTotalPayment').textContent = formatNumber(result.totalPayment) + '원';
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

// PDF 및 이미지 다운로드 함수들 (개선된 버전)
window.downloadResultAsPDF = function (elementId, filename) {
    // GA4 이벤트 추적
    const calculatorType = filename.split('_')[0];
    trackDownload('pdf', calculatorType);

    const element = document.getElementById(elementId);
    if (!element) {
        alert('결과 영역을 찾을 수 없습니다.');
        return;
    }

    // 로딩 표시
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="margin-bottom: 10px;">PDF 생성 중...</div>
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
        </div>
        <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    `;
    document.body.appendChild(loadingDiv);

    html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
    }).then(canvas => {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // 여백을 고려한 사용 가능한 크기
            const margin = 10;
            const availableWidth = pdfWidth - (2 * margin);
            const availableHeight = pdfHeight - (2 * margin);

            // 비율 유지하면서 크기 조정
            const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight) * 72 / 96;
            const scaledWidth = imgWidth * ratio;
            const scaledHeight = imgHeight * ratio;

            // 중앙 정렬
            const x = (pdfWidth - scaledWidth) / 2;
            const y = (pdfHeight - scaledHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
            pdf.save(`${filename || '계산결과'}.pdf`);

            document.body.removeChild(loadingDiv);
        } catch (error) {
            console.error('PDF 생성 오류:', error);
            alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            document.body.removeChild(loadingDiv);
        }
    }).catch(error => {
        console.error('캔버스 생성 오류:', error);
        alert('이미지 캡처 중 오류가 발생했습니다. 다시 시도해주세요.');
        document.body.removeChild(loadingDiv);
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

    // 로딩 표시
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="margin-bottom: 10px;">이미지 생성 중...</div>
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
        </div>
        <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    `;
    document.body.appendChild(loadingDiv);

    html2canvas(element, {
        scale: 3, // 더 높은 해상도
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
    }).then(canvas => {
        try {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `${filename || '계산결과'}_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                document.body.removeChild(loadingDiv);
            }, 'image/png', 1.0);
        } catch (error) {
            console.error('이미지 다운로드 오류:', error);
            alert('이미지 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
            document.body.removeChild(loadingDiv);
        }
    }).catch(error => {
        console.error('캔버스 생성 오류:', error);
        alert('이미지 캡처 중 오류가 발생했습니다. 다시 시도해주세요.');
        document.body.removeChild(loadingDiv);
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
    // Calculator 인스턴스 생성 (window 객체에서 가져옴 - 개별 페이지용)
    if (window.LoanCalculator) {
        loanCalc = new window.LoanCalculator();
    }
    if (window.RealEstateTaxCalculator) {
        realEstateCalc = new window.RealEstateTaxCalculator();
    }

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

    // 관리자 페이지 접근은 직접 URL로만 가능

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
    showDownloadOptions('modalLoanResult', '대출이자계산기');
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
    showDownloadOptions('modalSavingsResult', '예적금계산기');
}

window.exportBrokerageResult = function () {
    const result = window.currentBrokerageResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    showDownloadOptions('modalBrokerageResult', '중개수수료계산기');
}

window.exportLoanLimitResult = function () {
    const result = window.currentLoanLimitResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    showDownloadOptions('modalLoanLimitResult', '대출한도계산기');
}

window.exportAffordabilityResult = function () {
    const result = window.currentAffordabilityResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    showDownloadOptions('modalAffordabilityResult', '주택구매력계산기');
}

window.exportLeaseConversionResult = function () {
    const result = window.currentLeaseConversionResult;
    if (!result) { alert('계산 결과가 없습니다. 먼저 계산을 실행해주세요.'); return; }
    showDownloadOptions('modalLeaseConversionResult', '전월세전환율계산기');
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

// 다운로드 옵션 모달 표시
function showDownloadOptions(resultPanelId, calculatorName) {
    const modal = document.createElement('div');
    modal.className = 'calculator-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>결과 저장 옵션</h3>
                <span class="close-download-modal" style="cursor: pointer; font-size: 24px;">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button class="btn btn-primary" onclick="downloadAsImage('${resultPanelId}', '${calculatorName}')">
                        <i class="fas fa-image"></i>
                        이미지로 저장 (PNG)
                    </button>
                    <button class="btn btn-secondary" onclick="downloadAsPDF('${resultPanelId}', '${calculatorName}')">
                        <i class="fas fa-file-pdf"></i>
                        PDF로 저장
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // 모달 닫기 이벤트
    const closeBtn = modal.querySelector('.close-download-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        }
    });
}


// Ad Modal Function - 제거됨 (구글 AdSense로 대체)
// 이전에 사용하던 광고 모달 기능은 구글 AdSense로 대체되어 더 이상 사용하지 않습니다.

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

// 보유세 결과 내보내기 - HTML에서 이미 showDownloadOptions 사용중이므로 수정 없음

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

// 계산기 데이터 구조 (확장 가능한 설계)
const CALCULATOR_DATABASE = {
    'loan': {
        name: '대출이자계산기',
        description: '원리금균등/원금균등 상환',
        icon: 'fas fa-home',
        url: 'loan-calculator.html',
        category: 'loan',
        gradient: 'var(--gradient-primary)',
        keywords: ['대출', '이자', '상환', '원리금']
    },
    'realestate-tax': {
        name: '부동산세금계산기',
        description: '취득세/양도소득세 계산',
        icon: 'fas fa-building',
        url: 'realestate-tax.html',
        category: 'tax',
        gradient: 'var(--gradient-secondary)',
        keywords: ['부동산', '세금', '취득세', '양도소득세']
    },
    'savings': {
        name: '예적금계산기',
        description: '예금/적금 만기 수령액',
        icon: 'fas fa-piggy-bank',
        url: 'savings-calculator.html',
        category: 'savings',
        gradient: 'var(--gradient-success)',
        keywords: ['예금', '적금', '이자', '복리']
    },
    'brokerage': {
        name: '중개수수료계산기',
        description: '부동산 중개 수수료',
        icon: 'fas fa-handshake',
        url: 'brokerage-calculator.html',
        category: 'realestate',
        gradient: 'var(--gradient-warning)',
        keywords: ['중개수수료', '부동산', '수수료']
    },
    'loan-limit': {
        name: '대출한도계산기',
        description: 'DSR/LTV 기준 한도',
        icon: 'fas fa-chart-bar',
        url: 'loan-limit.html',
        category: 'loan',
        gradient: 'var(--gradient-primary)',
        keywords: ['대출한도', 'DSR', 'LTV']
    },
    'affordability': {
        name: '주택구매력계산기',
        description: '구매 가능 금액',
        icon: 'fas fa-house-user',
        url: 'affordability-calculator.html',
        category: 'realestate',
        gradient: 'var(--gradient-secondary)',
        keywords: ['주택', '구매력', '구매가능금액']
    },
    'jeonse': {
        name: '전월세계산기',
        description: '전세/월세 전환율',
        icon: 'fas fa-exchange-alt',
        url: 'jeonse-calculator.html',
        category: 'realestate',
        gradient: 'var(--gradient-info)',
        keywords: ['전세', '월세', '전환율']
    },
    'prepayment': {
        name: '중도상환계산기',
        description: '수수료와 절약 효과',
        icon: 'fas fa-money-bill-wave',
        url: 'prepayment-calculator.html',
        category: 'loan',
        gradient: 'var(--gradient-success)',
        keywords: ['중도상환', '수수료', '이자절약']
    },
    'investment': {
        name: '투자수익계산기',
        description: '수익률과 손익 분석',
        icon: 'fas fa-chart-line',
        url: 'investment-calculator.html',
        category: 'investment',
        gradient: 'var(--gradient-warning)',
        keywords: ['투자', '수익률', '복리', '손익']
    }
};

// 랜덤 추천 계산기 시스템
class RecommendedCalculators {
    constructor() {
        this.calculators = CALCULATOR_DATABASE;
    }

    // 현재 페이지를 제외한 랜덤 계산기 추천
    getRandomRecommendations(currentCalculatorId, count = 3) {
        const availableCalculators = Object.keys(this.calculators)
            .filter(id => id !== currentCalculatorId)
            .map(id => ({ id, ...this.calculators[id] }));

        return this.shuffleArray(availableCalculators).slice(0, count);
    }

    // 카테고리별 추천 (같은 카테고리 우선, 부족하면 다른 카테고리에서 보충)
    getCategoryBasedRecommendations(currentCalculatorId, count = 3) {
        const currentCalculator = this.calculators[currentCalculatorId];
        if (!currentCalculator) return this.getRandomRecommendations(currentCalculatorId, count);

        const sameCategory = Object.keys(this.calculators)
            .filter(id => id !== currentCalculatorId && 
                    this.calculators[id].category === currentCalculator.category)
            .map(id => ({ id, ...this.calculators[id] }));

        const otherCategory = Object.keys(this.calculators)
            .filter(id => id !== currentCalculatorId && 
                    this.calculators[id].category !== currentCalculator.category)
            .map(id => ({ id, ...this.calculators[id] }));

        const recommendations = [
            ...this.shuffleArray(sameCategory),
            ...this.shuffleArray(otherCategory)
        ].slice(0, count);

        return recommendations;
    }

    // 배열 셔플 함수 (Fisher-Yates 알고리즘)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // HTML 생성 함수
    generateRecommendedHTML(recommendations) {
        return recommendations.map(calc => `
            <a href="${calc.url}" class="recommended-item">
                <div class="icon-wrapper" style="background: ${calc.gradient};">
                    <i class="${calc.icon}"></i>
                </div>
                <div class="title">${calc.name}</div>
                <div class="description">${calc.description}</div>
            </a>
        `).join('');
    }

    // 페이지에 추천 계산기 렌더링
    renderRecommendations(currentCalculatorId, containerId = 'recommended-grid', strategy = 'random') {
        const container = document.querySelector(`#${containerId}, .recommended-grid`);
        if (!container) return;

        const recommendations = strategy === 'category' 
            ? this.getCategoryBasedRecommendations(currentCalculatorId)
            : this.getRandomRecommendations(currentCalculatorId);

        container.innerHTML = this.generateRecommendedHTML(recommendations);

        // 사용량 추적
        if (typeof trackEvent === 'function') {
            trackEvent('recommended_calculators_shown', {
                current_calculator: currentCalculatorId,
                recommended_calculators: recommendations.map(r => r.id),
                strategy: strategy
            });
        }
    }
}

// 전역 인스턴스 생성
window.recommendedCalculators = new RecommendedCalculators();

// Export Functions for Multiple Formats
function exportToTxt(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportToPDF(content, filename) {
    // jsPDF 라이브러리가 로드되었는지 확인
    if (typeof window.jsPDF === 'undefined') {
        alert('PDF 라이브러리를 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    try {
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        
        // 한글 폰트 설정 (기본 폰트로 대체)
        doc.setFont('helvetica');
        doc.setFontSize(12);
        
        // 내용을 여러 줄로 분할
        const lines = content.split('\n');
        let yPosition = 20;
        
        lines.forEach(line => {
            if (yPosition > 270) { // 페이지 끝에 도달하면 새 페이지 추가
                doc.addPage();
                yPosition = 20;
            }
            
            // 한글이 포함된 경우 영문으로 변환하거나 기본 처리
            const processedLine = line.replace(/[가-힣]/g, '?'); // 임시 처리
            doc.text(processedLine, 20, yPosition);
            yPosition += 7;
        });
        
        doc.save(filename + '.pdf');
    } catch (error) {
        console.error('PDF 생성 오류:', error);
        alert('PDF 저장 중 오류가 발생했습니다. 텍스트 파일로 저장됩니다.');
        exportToTxt(content, filename);
    }
}

function exportToImage(elementId, filename) {
    // html2canvas 라이브러리가 로드되었는지 확인
    if (typeof window.html2canvas === 'undefined') {
        alert('이미지 라이브러리를 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
        alert('저장할 결과가 없습니다.');
        return;
    }

    // 임시로 배경색 설정
    const originalStyle = element.style.cssText;
    element.style.backgroundColor = 'white';
    element.style.padding = '20px';

    html2canvas(element, {
        backgroundColor: 'white',
        scale: 2,
        useCORS: true
    }).then(canvas => {
        // 원래 스타일 복구
        element.style.cssText = originalStyle;
        
        // 이미지 다운로드
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = canvas.toDataURL();
        link.click();
    }).catch(error => {
        console.error('이미지 생성 오류:', error);
        alert('이미지 저장 중 오류가 발생했습니다.');
        // 원래 스타일 복구
        element.style.cssText = originalStyle;
    });
}

// 다운로드 옵션 모달 표시
function showDownloadOptions(resultElementId, calculatorName, content) {
    const modal = document.createElement('div');
    modal.id = 'downloadModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); display: flex; justify-content: center; 
        align-items: center; z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); min-width: 300px;">
            <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">결과 저장</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button onclick="downloadAsText()" style="padding: 12px 20px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    📄 텍스트 파일로 저장
                </button>
                <button onclick="downloadAsPDF()" style="padding: 12px 20px; border: none; background: #ef4444; color: white; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    📑 PDF 파일로 저장
                </button>
                <button onclick="downloadAsImage()" style="padding: 12px 20px; border: none; background: #10b981; color: white; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    🖼️ 이미지로 저장
                </button>
                <button onclick="closeDownloadModal()" style="padding: 12px 20px; border: 1px solid #d1d5db; background: white; color: #666; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 10px;">
                    취소
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 전역 함수들 정의
    window.downloadAsText = () => {
        exportToTxt(content, calculatorName + '_결과');
        closeDownloadModal();
        if (typeof trackDownload === 'function') trackDownload('txt', calculatorName);
    };
    
    window.downloadAsPDF = () => {
        exportToPDF(content, calculatorName + '_결과');
        closeDownloadModal();
        if (typeof trackDownload === 'function') trackDownload('pdf', calculatorName);
    };
    
    window.downloadAsImage = () => {
        exportToImage(resultElementId, calculatorName + '_결과');
        closeDownloadModal();
        if (typeof trackDownload === 'function') trackDownload('png', calculatorName);
    };
    
    window.closeDownloadModal = () => {
        const modal = document.getElementById('downloadModal');
        if (modal) modal.remove();
        // 전역 함수들 정리
        delete window.downloadAsText;
        delete window.downloadAsPDF;
        delete window.downloadAsImage;
        delete window.closeDownloadModal;
    };
    
    // ESC 키로 모달 닫기
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeDownloadModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    // 배경 클릭으로 모달 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeDownloadModal();
    });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatNumber,
        parseNumber,
        RecommendedCalculators,
        CALCULATOR_DATABASE,
        exportToTxt,
        exportToPDF,
        exportToImage,
        showDownloadOptions
    };
}