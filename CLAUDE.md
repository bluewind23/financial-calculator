# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive Korean financial calculator web application built with vanilla HTML, CSS, and JavaScript. The application provides 9 specialized financial calculators with a focus on Korean real estate, loans, and tax calculations. All calculations are performed client-side for privacy and security.

## Development Commands

### Local Development
```bash
# Serve locally with Python
python -m http.server 8000

# Or with Node.js
npx serve .

# Or with live-reload
npx live-server

# Access at: http://localhost:8000
```

### Testing
- Test all 9 calculators with edge cases (0, negative, very large values)
- Verify responsive design on mobile devices (breakpoints: 768px, 480px)
- Check input field formatting and value persistence on blur events
- Test export functionality for all calculators

## Project Architecture

### File Structure
```
money_Calculator/
├── index.html              # Main page with calculator grid
├── about.html              # Company information page
├── guides.html             # User guides with Google AdSense
├── styles.css              # Main stylesheet (3000+ lines)
├── script.js               # Core calculator logic and UI (5000+ lines)
├── calculators/            # Individual calculator modules
│   ├── loanCalculator.js
│   ├── realEstateTaxCalculator.js
│   ├── savingsCalculator.js
│   ├── brokerageFeeCalculator.js
│   ├── loanLimitCalculator.js
│   ├── housingAffordabilityCalculator.js
│   ├── leaseConversionCalculator.js
│   ├── prepaymentFeeCalculator.js
│   └── holdingTaxCalculator.js
└── [individual calculator pages]
```

### Core Components

#### CalculatorManager Class (`script.js:68-85`)
Central controller managing calculator states, modal interactions, and UI events:
- `setupCalculatorNavigation()`: Handles calculator card clicks and modal opening
- `setupModalControls()`: Modal open/close functionality
- `setupInputFormatting()`: Critical input field formatting system
- `setupRealEstateTaxModes()`: Special handling for real estate tax sub-modes

#### Input Formatting System (`script.js:186-242`)
**CRITICAL**: This system has historically had issues with values disappearing. Key components:
- `parseNumber()`: Converts formatted strings to numbers, returns 0 for empty values
- `formatNumber()`: Formats numbers with Korean locale (ko-KR)
- `setupInputFormatting()`: Manages input field behavior with data-raw-value attribute
- Percentage fields are handled differently (no comma formatting)

#### Calculator Modules (`calculators/`)
Each calculator is a separate class with standardized methods:
- Equal payment/principal calculations for loans
- Progressive tax rate calculations for real estate
- Compound interest calculations for savings
- Fee calculations based on Korean regulations

### UI/UX Architecture

#### Modal System
- Dynamic modal content based on calculator type
- Result panels hidden until calculation
- Export buttons appear after successful calculation
- Proper focus management and keyboard accessibility

#### Responsive Design System
- CSS Grid: 4 columns → 2 columns (768px) → 1 column (480px)
- Font scaling: 60px → 36px → 28px for hero text
- Touch-friendly button sizes on mobile (min 44px)
- Hamburger menu for mobile navigation

#### Google Analytics Integration
- GA4 event tracking for calculator usage
- Custom events: calculator_usage, file_download, page_view
- Conversion tracking for high-value calculator interactions

## Critical Implementation Details

### Input Field Value Persistence
**Known Issue**: Values can disappear when users click outside input fields
**Root Cause**: Blur event handler formatting conflicts
**Solution**: 
1. Always check `parseNumber()` returns 0 (not null) for empty values
2. Use data-raw-value attribute to store unformatted values
3. Test with actual user interactions, not just programmatic input

### Number Formatting Rules
- Korean locale (ko-KR) for all number formatting
- Percentage fields: No comma formatting, decimal values allowed
- Currency fields: Comma separated thousands, no decimal places
- Interest rates: Up to 2 decimal places

### Real Estate Tax Calculator Modes
Complex multi-mode calculator with different UI states:
1. **Acquisition Tax Mode**: Simple price input
2. **Transfer Tax Simple Mode**: Price and holding period
3. **Transfer Tax Detailed Mode**: Full form with dates, expenses, ownership ratio

### Export Functionality
- Text file generation using Blob API
- Korean formatted output with proper line breaks
- Timestamp and input/output data included
- UTF-8 encoding for Korean characters

## Common Issues & Solutions

### Issue: Calculator Results Not Showing
- Check console for validation errors
- Verify all required fields have values
- Ensure parseNumber() isn't returning null

### Issue: Mobile Layout Broken
- Check viewport meta tag settings
- Verify media queries are properly cascading
- Test with actual devices, not just browser DevTools

### Issue: Export File Not Downloading
- Check browser console for security errors
- Verify Blob API support
- Test download attribute compatibility

## Korean Financial Regulations

### Tax Rates (2024)
- Acquisition tax: 1-4% based on property value and ownership
- Transfer tax: 6-45% progressive rates
- Local education tax: 10% of acquisition tax
- Brokerage fees: 0.4-0.9% based on transaction type

### Loan Regulations
- DSR (Debt Service Ratio): 40% limit for most borrowers
- LTV (Loan to Value): 70% maximum for apartments
- Prepayment fees: Typically 1.5% of prepaid amount

## Testing Checklist

1. **Input Validation**
   - ✅ Empty fields return 0, not null
   - ✅ Negative values handled appropriately
   - ✅ Very large numbers format correctly
   - ✅ Percentage inputs accept decimals

2. **Calculator Accuracy**
   - ✅ Loan calculations match Korean bank standards
   - ✅ Tax calculations follow current regulations
   - ✅ Compound interest calculations are precise

3. **UI/UX Testing**
   - ✅ All modals open and close properly
   - ✅ Results display with proper formatting
   - ✅ Export functionality works on all browsers
   - ✅ Mobile responsive design functions correctly

4. **Cross-Browser Testing**
   - ✅ Chrome 90+
   - ✅ Safari 14+
   - ✅ Firefox 88+
   - ✅ Samsung Internet

## Performance Considerations

- Minimize DOM queries by caching selectors
- Use event delegation for dynamic content
- Lazy load calculator modules when needed
- Optimize large number calculations with memoization
- Consider Web Workers for complex calculations

## Security Notes

- All calculations are client-side only
- No API calls or data transmission
- Input sanitization prevents XSS attacks
- No storage of personal financial data
- Google Analytics configured for privacy compliance