# CLAUDE.md

This file provides guidance to Claude Code when working with this Korean financial calculator web application.

## Project Overview

This is a comprehensive financial calculator web application built with vanilla HTML, CSS, and JavaScript. The application provides Korean users with various financial calculators including loan interest, real estate taxes, savings calculations, and more. All calculations are performed client-side for privacy and security.

## Development Commands

### Local Development
```bash
# Serve locally (any local server)
python -m http.server 8000
# or
npx serve .
# Access at: http://localhost:8000
```

### Testing
- Test all calculators with various input values
- Verify responsive design on mobile devices
- Check input field formatting and persistence

## Project Architecture

### File Structure
- **index.html**: Main page with calculator grid and hero section
- **about.html**: About page with company information and service features
- **guides.html**: User guide page with detailed calculator instructions and ads
- **styles.css**: Main stylesheet with custom properties and responsive design
- **script.js**: Core JavaScript containing all calculator logic and UI management

### Key Technologies
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Custom Properties
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Inter font family from Google Fonts
- **Monetization**: Google AdSense integration (guides page only)

## Core Components

### Calculator System (`script.js`)
The application features a modal-based calculator system with these key functions:

#### Input Formatting System (`lines 186-242`)
- **setupInputFormatting()**: Handles number formatting with Korean locale (ko-KR)
- **parseNumber()**: Converts formatted strings to numbers, returns 0 for empty values
- **formatNumber()**: Formats numbers with thousands separators
- **Critical Issue**: Input fields can lose values on blur events - carefully test when modifying

#### Calculator Types
1. **Loan Interest Calculator**: 원리금균등/원금균등 repayment methods
2. **Real Estate Tax Calculator**: 취득세, 등록세, 양도소득세
3. **Savings Calculator**: 예금/적금 with compound interest
4. **Brokerage Fee Calculator**: Real estate transaction fees
5. **Loan Limit Calculator**: DSR/LTV based calculations
6. **Home Affordability Calculator**: Purchase power based on income
7. **Jeonse Conversion Calculator**: 전월세 conversion rates

#### Export Functionality
- **exportToTxt()**: Generates downloadable .txt files with calculation results
- Uses Blob API for file creation
- Results formatted in Korean with proper currency formatting

### UI/UX Features

#### Responsive Design (`styles.css`)
- **CSS Grid Layout**: Calculator grid adapts from 4 columns to 1 on mobile
- **CSS Custom Properties**: Consistent spacing, colors, and typography
- **Media Queries**: Optimized for tablets (768px) and mobile (480px)

#### Modal System
- **Modal Management**: Dynamic content loading based on calculator type
- **Event Delegation**: Efficient event handling for dynamic content
- **Accessibility**: Proper focus management and keyboard navigation

#### Advertisement Integration (`guides.html`)
- **Ad Modal**: Timed advertisement display with session management
- **LocalStorage**: Prevents repeated ad displays within same session
- **Ad Placements**: Strategic banner and sidebar ad positions

### Styling System (`styles.css`)

#### Color Scheme
- **Primary Blue**: #3b82f6 (used in buttons, accents)
- **Dark Blue**: #1e40af (used in footer gradient)
- **Text Colors**: #1f2937 (primary), #6b7280 (secondary)
- **Success/Error**: #10b981, #ef4444

#### Component Architecture
- **Modular CSS**: Each component has isolated styles
- **BEM-like Naming**: Consistent class naming conventions
- **CSS Custom Properties**: Centralized design tokens

## Critical Implementation Details

### Input Field Bug Prevention
**IMPORTANT**: The application has historically had issues with input values disappearing when users click outside input fields. When modifying input handling:

1. Always test the `parseNumber()` function behavior
2. Verify blur event handlers don't reset values unexpectedly
3. Test with actual user interaction (not just programmatic input)
4. Pay special attention to the 대출금액 (loan amount) field

### Number Formatting
- Uses Korean locale (ko-KR) for number formatting
- Handles both integers and decimals
- Supports percentage inputs for interest rates
- Currency values displayed with ₩ symbol

### Modal Calculator Logic
Each calculator follows this pattern:
1. Parse input values using `parseNumber()`
2. Validate inputs (check for null/zero values)
3. Perform calculations using financial formulas
4. Display results with proper formatting
5. Enable export functionality

## Common Issues & Solutions

### Input Field Value Persistence
**Problem**: Numbers disappear when leaving input fields
**Solution**: Ensure parseNumber() returns 0 instead of null for empty values, and blur handlers check `value >= 0` rather than `value > 0`

### Mobile Responsiveness
**Problem**: Layout issues on small screens
**Solution**: Use CSS Grid with proper breakpoints and flexible font sizing

### Calculator Accuracy
**Problem**: Floating point precision errors
**Solution**: Use proper rounding for financial calculations (typically 2 decimal places)

## File-Specific Notes

### `script.js` Key Functions
- `parseNumber(value)`: Core number parsing (lines 6-11)
- `formatNumber(value)`: Number formatting with commas
- `setupInputFormatting(input)`: Input field behavior setup (lines 186-242)
- `calculateLoanInterest()`: Main loan calculation function
- `exportToTxt(content, filename)`: File export functionality

### `styles.css` Important Sections
- CSS Custom Properties (lines 1-50): Core design tokens
- Calculator Grid (lines 200-300): Main layout system
- Modal Styles (lines 800-1000): Calculator modal appearance
- Responsive Breakpoints (lines 1500+): Mobile adaptations

### `index.html` Structure
- Hero section with main title and CTA
- Calculator grid (4x2 layout, responsive)
- "Why Choose Us" section with benefits
- Modal containers for each calculator

## Testing Checklist

When making changes, always test:
1. ✅ All calculator types produce correct results
2. ✅ Input formatting works correctly (commas, percentages)
3. ✅ Values persist when clicking outside input fields
4. ✅ Export functionality generates proper .txt files
5. ✅ Responsive design works on mobile devices
6. ✅ Modal opening/closing functions properly
7. ✅ Ad system works correctly (guides page only)

## Korean Localization

The application is designed specifically for Korean users:
- All UI text in Korean
- Korean Won (₩) currency formatting
- Korean number formatting (ko-KR locale)
- Real estate and financial terms specific to Korea
- Tax rates and regulations based on Korean law

## Security Considerations

- All calculations performed client-side
- No personal data transmitted to servers
- Input sanitization to prevent XSS
- Secure file handling for exports
- Ad integration follows privacy best practices

## Performance Optimizations

- Lazy loading of calculator logic
- Efficient event delegation
- Minimal DOM manipulations
- Optimized CSS with modern features
- Font loading optimization

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features used
- CSS Grid and Flexbox for layouts
- Progressive enhancement approach