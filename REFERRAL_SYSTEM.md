# Flyobo Travel Referral System

## Overview
The Flyobo Travel Referral System is a comprehensive rewards program that encourages users to invite friends and family to join the platform. When referred users make bookings, the referrer earns rewards that can be redeemed for discounts or cash.

## Key Features

### 1. User Module
- **Unique Referral Code**: Each user receives a unique referral code upon registration
- **Referral Dashboard**: Users can view their referral stats, rewards, and transaction history
- **Reward Wallet**: Accumulate referral rewards in a wallet balance
- **Multiple Sharing Options**: Share referral links via WhatsApp, Email, or Social Media

### 2. Referral System Logic
- **Automatic Tracking**: System automatically tracks referrals when users sign up with a referral code
- **Reward Processing**: Rewards are automatically processed when referred users complete their first booking
- **Reward Validation**: Prevents duplicate or fraudulent rewards
- **Status Management**: Track referral status (Pending, Converted, Inactive)

### 3. Admin Panel
- **Referral Management**: View and manage all referral activities
- **Reward Approval**: Approve, reject, or mark rewards as paid
- **Analytics Dashboard**: Visual analytics for referral performance
- **Payout Reports**: Generate reports for reward payouts
- **Data Export**: Export referral data in various formats

### 4. Booking Integration
- **Automatic Reward Processing**: Rewards are automatically credited when bookings are completed
- **Payment Verification**: Rewards only processed after payment confirmation
- **First Booking Only**: Rewards only given for the first booking of referred users

### 5. Reward and Wallet Management
- **Flexible Redemption**: Redeem rewards for discounts on future bookings
- **Minimum Thresholds**: Configurable minimum redemption amounts
- **Reward History**: Complete transaction history for all reward activities
- **Expiry Management**: Track reward expiry dates

### 6. Notification System
- **Email Notifications**: Automated emails for referral milestones, rewards, and payouts
- **In-App Notifications**: Real-time notifications within the application
- **Milestone Alerts**: Notifications for achieving referral milestones
- **Tier Upgrades**: Notifications for referral tier upgrades

### 7. Advanced Features
- **Tier System**: Bronze, Silver, Gold, Platinum, and Diamond tiers with increasing benefits
- **Milestone Rewards**: Special rewards for achieving referral milestones
- **Conversion Analytics**: Track referral conversion rates and performance
- **Social Sharing Tracking**: Track sharing activities across different platforms

## Technical Implementation

### Database Models
1. **User Model Enhancements**:
   - Added referral code generation
   - Implemented referral tracking fields
   - Added reward wallet and history
   - Integrated tier system and milestones

2. **Booking Model**:
   - Added referral code tracking
   - Integrated with reward processing

### API Endpoints

#### User Routes
- `GET /api/v1/user/referral-info` - Get referral information
- `POST /api/v1/user/redeem-rewards` - Redeem referral rewards
- `GET /api/v1/user/referral-leaderboard` - Get referral leaderboard

#### Admin Routes
- `GET /api/v1/user/admin/referral-stats` - Get referral statistics
- `GET /api/v1/user/admin/recent-referrals` - Get recent referrals
- `GET /api/v1/user/admin/referral-users` - Get referral users
- `GET /api/v1/user/admin/referral-analytics` - Get referral analytics
- `POST /api/v1/user/admin/referral-user-action` - Perform referral user actions

#### Referral Admin Routes
- `GET /api/v1/referral-admin/pending-rewards` - Get pending referral rewards
- `POST /api/v1/referral-admin/approve-reward` - Approve referral reward
- `POST /api/v1/referral-admin/mark-paid` - Mark referral reward as paid
- `GET /api/v1/referral-admin/payout-report` - Get referral payout report
- `GET /api/v1/referral-admin/export` - Export referral data

#### Booking Routes
- `PUT /api/v1/bookings/admin/:bookingId` - Update booking status (triggers referral reward processing)

### Services
1. **Referral Service**: Handles all referral logic and reward processing
2. **Notification Service**: Manages all referral-related notifications
3. **Booking Service**: Integrates referral rewards with booking completion

### Reward Calculation
- **Standard Referral**: 10% of booking amount or ₹100, whichever is higher
- **Signup Bonus**: ₹50 for users who join via referral
- **Milestone Rewards**: Special rewards for achieving referral milestones
- **Tier Benefits**: Increased rewards based on referral tier

## Configuration
The referral system can be configured through the admin panel with options for:
- Reward amounts and percentages
- Minimum booking values for eligibility
- Payout thresholds and processing times
- Fraud prevention settings
- Social sharing options

## Security Features
- **Self-Referral Prevention**: Prevents users from referring themselves
- **Duplicate Detection**: Prevents duplicate referral claims
- **Fraud Detection**: Monitors for suspicious referral activities
- **Role-Based Access**: Admin-only access to management features

## Future Enhancements
- Multi-level referral bonuses (Level 1, Level 2)
- Automated payouts via payment gateways
- Real-time referral tracking dashboard
- Gamification with badges and leaderboards
- Mobile app integration for referrals