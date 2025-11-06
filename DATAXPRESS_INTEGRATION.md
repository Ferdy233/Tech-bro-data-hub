# DataXpress API Integration

## Overview
The buy-data page now integrates with DataXpress API using a hybrid payment model. Users pay through the platform's wallet system, and the platform handles the DataXpress payment on their behalf. This provides seamless integration while maintaining control over the payment flow.

## Features
- **Hybrid Payment Model**: Users pay via wallet, platform pays DataXpress
- **Real API Integration**: Direct connection to DataXpress API
- **Live Pricing**: Dynamic pricing based on current API rates
- **Wallet Integration**: Deducts cost from user's wallet balance
- **Transaction Tracking**: All purchases are recorded with detailed information
- **Instant Delivery**: Data bundles are delivered immediately after successful payment
- **Phone Validation**: Validates Ghana phone number formats
- **Error Handling**: Comprehensive error handling with user-friendly messages

## API Endpoints

### 1. Data Purchase API
**Endpoint**: `/api/data/purchase`
**Method**: POST

**Request Body**:
```json
{
  "phone": "0551234567",
  "volumeInMB": 1000,
  "networkType": "mtn",
  "userEmail": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transaction": {...},
    "newBalance": 95.60,
    "cost": 4.40,
    "reference": "DATA_1758980548_abc123"
  }
}
```

### 2. Pricing API
**Endpoint**: `/api/data/pricing`
**Method**: POST

**Request Body**:
```json
{
  "volumeInMB": 1000,
  "networkType": "mtn"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cost": 4.40,
    "volumeInMB": 1000,
    "networkType": "mtn"
  }
}
```

## Supported Networks
- **MTN**: `mtn`
- **Telecel**: `telecel`
- **AirtelTigo**: `airteltigo`

## Data Bundle Pricing (All Networks)
| Bundle | Volume | API Price | Description |
|--------|--------|-----------|-------------|
| 1GB | 1,000 MB | ₵4.40 | Standard 1GB data bundle (Popular) |
| 2GB | 2,000 MB | ₵9.00 | Standard 2GB data bundle |
| 3GB | 3,000 MB | ₵13.00 | Standard 3GB data bundle |
| 4GB | 4,000 MB | ₵18.00 | Standard 4GB data bundle |
| 5GB | 5,000 MB | ₵22.00 | Standard 5GB data bundle (Popular) |
| 6GB | 6,000 MB | ₵26.00 | Standard 6GB data bundle |
| 8GB | 8,000 MB | ₵35.00 | Standard 8GB data bundle |
| 10GB | 10,000 MB | ₵42.00 | Standard 10GB data bundle (Popular) |
| 15GB | 15,000 MB | ₵61.00 | Standard 15GB data bundle |
| 20GB | 20,000 MB | ₵81.00 | Standard 20GB data bundle |
| 25GB | 25,000 MB | ₵100.00 | Standard 25GB data bundle |
| 30GB | 30,000 MB | ₵125.00 | Standard 30GB data bundle |
| 40GB | 40,000 MB | ₵160.00 | Standard 40GB data bundle |
| 50GB | 50,000 MB | ₵205.00 | Standard 50GB data bundle |

## Environment Variables
```env
DATAXPRESS_API_KEY=dx_TXtQWOEvsC6yZVVXp2IxohvlhpIpeoGk_1758980548
DATAXPRESS_BASE_URL=https://www.dataxpress.shop
```

## User Flow (Hybrid Payment Model)
1. User loads wallet via Paystack payment
2. User selects network (MTN, Telecel, or AirtelTigo)
3. User selects data bundle size
4. User enters valid Ghana phone number
5. System validates phone number format
6. System checks user's wallet balance
7. System gets real-time pricing from DataXpress
8. If sufficient balance, purchase is processed:
   - Platform pays DataXpress directly
   - DataXpress delivers bundle to phone
   - Platform deducts cost from user's wallet
9. Transaction is recorded with detailed information
10. User receives confirmation and delivery notification

## Error Handling
- **Insufficient Balance**: User needs to top up wallet
- **Invalid Phone Number**: Phone number format validation
- **Network Error**: Retry mechanism for API failures
- **Authentication**: User must be logged in to purchase

## Security
- API key stored in environment variables
- User authentication required
- Input validation and sanitization
- Secure API communication over HTTPS

## Testing
The integration can be tested by:
1. Logging in to the platform
2. Ensuring sufficient wallet balance
3. Selecting a network and data bundle
4. Entering a valid phone number
5. Completing the purchase

## Support
For API issues or questions, refer to the DataXpress developer documentation or contact their support team.
