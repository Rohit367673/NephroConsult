# 💰 NephroConsult Production Pricing System

## Overview
Dynamic pricing system that adjusts consultation fees based on the user's country income level, ensuring affordability while maximizing revenue potential.

## 🌍 Country-Based Pricing Tiers

### Tier 1: Low-Income Countries (1.0x Base Rate)
**Countries**: India, Pakistan, Bangladesh, Nepal, Sri Lanka, Myanmar, Cambodia, Laos, Afghanistan, Bhutan
- **Multiplier**: 1.0x (Base rate)
- **Currency**: Primarily INR

### Tier 2: Middle-Income Countries (1.8x Base Rate)  
**Countries**: Brazil, Thailand, Turkey, Mexico, Argentina, Chile, Colombia, Peru, Malaysia, Indonesia, Philippines, Vietnam, Egypt, Morocco, Poland, Czech Republic, etc.
- **Multiplier**: 1.8x (+80% increase)
- **Currency**: USD/EUR/GBP equivalent

### Tier 3: High-Income Countries (3.3x Base Rate)
**Countries**: USA, Canada, UK, Germany, France, Australia, Japan, Switzerland, Norway, Sweden, etc.
- **Multiplier**: 3.3x (+230% increase)  
- **Currency**: USD/EUR/GBP

## 💵 Base Prices (India - INR)

| Consultation Type | Base Price (INR) | Duration |
|-------------------|------------------|----------|
| Initial Consultation | ₹1,000 | 45 min |
| Follow-up Consultation | ₹700 | 30 min |
| Urgent Consultation | ₹2,000 | 45 min |

## 🌎 Regional Pricing Examples

### India/Pakistan (Base Rate)
- Initial: ₹1,000 (~$12)
- Follow-up: ₹700 (~$8.50)  
- Urgent: ₹2,000 (~$24)

### Middle-Income (Brazil, Thailand) - 1.8x
- Initial: ₹1,800 (~$22)
- Follow-up: ₹1,260 (~$15)
- Urgent: ₹3,600 (~$43)

### High-Income (USA, EU) - 3.3x  
- Initial: ₹3,300 ($39)
- Follow-up: ₹2,310 ($28)
- Urgent: ₹6,600 ($79)

### Premium Markets (Adjusted for local rates)
- **USA**: $49/$39/$99 (optimized for US market)
- **EU**: €42/€33/€85 (optimized for EU market) 
- **UK**: £35/£28/£70 (optimized for UK market)

## 🔧 Technical Implementation

### Currency Support
- **INR** (₹) - Primary for Indian subcontinent
- **USD** ($) - Americas, international default
- **EUR** (€) - European Union  
- **GBP** (£) - United Kingdom

### Exchange Rates (Built-in)
```javascript
const exchangeRates = {
  'INR': 1,
  'USD': 0.012, // 1 INR = $0.012 (1 USD = ₹83)
  'EUR': 0.011, // 1 INR = €0.011
  'GBP': 0.0095 // 1 INR = £0.0095
};
```

### Country Detection
- Auto-detects via user's timezone
- Fallback to IP-based detection
- Manual override available

## 📊 Revenue Impact Analysis

### Expected Revenue Distribution
- **Tier 1 (40% users)**: Base revenue
- **Tier 2 (35% users)**: +80% revenue per consultation  
- **Tier 3 (25% users)**: +230% revenue per consultation

### Projected Monthly Revenue (100 consultations)
- **Before**: ₹1,00,000 (~$1,200)
- **After**: ₹1,95,000 (~$2,350) 
- **Increase**: +95% revenue growth

## 🎯 Strategic Benefits

### 1. **Accessibility**
- Maintains affordability in developing markets
- Ensures healthcare access regardless of economic status

### 2. **Revenue Optimization**  
- Captures higher value in premium markets
- Aligns pricing with local purchasing power

### 3. **Competitive Positioning**
- Competitive rates in all markets
- Premium positioning in high-income countries

### 4. **Scalability**
- Easy to add new countries/tiers
- Flexible exchange rate updates
- Regional customization possible

## 🔄 Dynamic Adjustments

### Seasonal Pricing (Future)
- Holiday surcharges for urgent consultations
- Off-peak discounts for regular consultations

### Volume Discounts (Future)
- Family packages across countries
- Corporate healthcare partnerships

### Market-Specific Optimization
- USA: Insurance-friendly pricing ($49/$39/$99)
- EU: GDPR-compliant with local rates
- Gulf: Premium positioning for medical tourism

## 📈 Implementation Status

✅ **Completed**:
- Core pricing engine
- Country detection system
- Currency conversion
- UI price display
- Payment integration

🔄 **Next Phase**:
- A/B testing different multipliers
- Regional marketing campaigns  
- Insurance integration (US/EU)
- Subscription models for follow-ups

---

*This pricing system ensures global accessibility while maximizing revenue potential through intelligent geographic pricing.*
