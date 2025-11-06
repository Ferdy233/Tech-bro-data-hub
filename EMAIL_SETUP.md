# Email Setup Guide for Tech Bro Hub

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://dhifherdhinhald18:<db_password>@cluster0.qlpdh.mongodb.net/tech-bro

# JWT Secret (Generate a long, random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Gmail Setup Instructions

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- Go to Google Account → Security → 2-Step Verification
- Scroll down to "App passwords"
- Select "Mail" and "Other (Custom name)"
- Enter "Tech Bro Hub" as the app name
- Copy the generated 16-character password
- Use this password as `EMAIL_PASS` in your `.env.local`

### 3. Alternative Email Providers

If you prefer not to use Gmail, you can use other email providers:

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASS=your-mailgun-smtp-password
```

#### Custom SMTP
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-email-password
```

## Testing Email Functionality

1. Create the `.env.local` file with your email credentials
2. Start the development server: `npm run dev`
3. Try signing up with a real email address
4. Check your email for the verification code
5. Complete the verification process

## Troubleshooting

### Common Issues:
1. **"Email configuration not set"** - Make sure `.env.local` exists and has correct variables
2. **"Invalid login"** - Check your email credentials and app password
3. **"Connection timeout"** - Check your internet connection and firewall settings

### Gmail Specific Issues:
- Make sure 2FA is enabled
- Use App Password, not your regular password
- Check if "Less secure app access" is enabled (not recommended)

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique passwords for all services
- Regularly rotate your API keys and passwords
- Consider using environment-specific configurations for production
