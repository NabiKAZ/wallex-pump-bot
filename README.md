# Wallex Pump Bot 🚀

Wallex registration, login, claim automation for pump challenge.

![GitHub stars](https://img.shields.io/github/stars/NabiKAZ/wallex-pump-bot?style=social)
![GitHub forks](https://img.shields.io/github/forks/NabiKAZ/wallex-pump-bot?style=social)
![GitHub issues](https://img.shields.io/github/issues/NabiKAZ/wallex-pump-bot)
![License](https://img.shields.io/github/license/NabiKAZ/wallex-pump-bot)

> ⭐ **Like this project? Give it a star!** ⭐  
> 💝 **Want to support? Consider a donation!** 💝

## 📸 Screenshots

### Account Information Display
![Account Info](https://github.com/user-attachments/assets/13e564fb-619b-4cbb-a664-15bdf9a188ec)

### Ticket Claiming Process
![Ticket Claiming](https://github.com/user-attachments/assets/b12deb60-cd96-4a43-a022-ae26ebbbd0d6)

## 📋 Features

- 🔐 **Account Registration**: Automated signup with captcha handling
- 🔑 **Login Management**: Secure token-based authentication
- 📊 **Profile Information**: Display account details and statistics
- 🎫 **Ticket Claiming**: Automated ticket claiming for pump challenges
- 📱 **Phone Filtering**: Filter operations by specific phone numbers
- 🕒 **Date Filtering**: Filter tickets by specific dates
- 💾 **Token Management**: Automatic token saving and loading
- 🎨 **Colorized Output**: Beautiful console output with colors and tables

## � Quick Start

1. **Clone and install**:
```bash
git clone https://github.com/NabiKAZ/wallex-pump-bot.git
cd wallex-pump-bot
npm install
```

2. **Configure your accounts** in `accounts.mjs`

3. **Start using**:
```bash
# Register new account
node bot.mjs -a signup

# Check account info
node bot.mjs -a info

# Claim tickets
node bot.mjs -a claim
```

## �🛠️ Installation

1. **Clone the repository**:
```bash
git clone https://github.com/NabiKAZ/wallex-pump-bot.git
cd wallex-pump-bot
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure accounts**:
Edit `accounts.mjs` file and add your account information:
```javascript
export default [
    { phone: '09123456789', password: 'YOUR_PASSWORD', inviteCode: 'YOUR_INVITE_CODE' },
    // Add more accounts as needed
];
```

## 🚀 Usage

### Basic Commands

#### Registration (Signup)
```bash
node bot.mjs -a signup
```

#### Login
```bash
node bot.mjs -a login
```

#### Show Account Information
```bash
node bot.mjs -a info
```

#### Claim Tickets
```bash
node bot.mjs -a claim
```

### Advanced Options

#### Filter by Phone Number
```bash
node bot.mjs -a info -p 09123456789
```

#### Filter by Date
```bash
node bot.mjs -a claim -d 2025-01-19
```

#### Combined Filters
```bash
node bot.mjs -a info -p 09123456789 -d 2025-01-19
```

### Command Line Options

| Option | Alias | Description | Required | Choices |
|--------|-------|-------------|----------|---------|
| `--action` | `-a` | Action to perform | ✅ | `signup`, `login`, `info`, `claim` |
| `--phone` | `-p` | Filter by phone number | ❌ | Any phone number |
| `--date` | `-d` | Filter by date (YYYY-MM-DD) | ❌ | Date in YYYY-MM-DD format |
| `--help` | `-h` | Show help | ❌ | - |

## 📁 File Structure

```
wallex-pump-bot/
├── bot.mjs           # Main bot application
├── accounts.mjs      # Account credentials configuration
├── config.mjs        # Global configuration settings
├── tokens.json       # Saved authentication tokens
├── package.json      # Project dependencies and scripts
├── package-lock.json # Dependency lock file
├── LICENSE           # GPL-3.0 License
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## ⚙️ Configuration

### `config.mjs`
```javascript
export default {
    apiBaseUrl: 'https://api.wallex.ir',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    tokenExpireDays: 30, // Token expiration in days
    maxAttempts: 3,      // Maximum attempts for captcha/OTP
    debug: false         // Debug mode flag
};
```

### `accounts.mjs`
```javascript
export default [
    { 
        phone: '09123456789', 
        password: 'YOUR_SECURE_PASSWORD', 
        inviteCode: 'YOUR_INVITE_CODE' 
    },
    // Add more accounts...
];
```

## 🎯 Examples

### 1. Register New Account
```bash
node bot.mjs -a signup
```
This will:
- Show captcha image in browser
- Request OTP input
- Complete registration process
- Save authentication token

### 2. Check All Accounts Info
```bash
node bot.mjs -a info
```
Output example:
```
┌─────────────────┬──────────┬──────────┬──────────┬─────────────┐
│ Phone           │ Pump     │ First    │ Second   │ Referral    │
├─────────────────┼──────────┼──────────┼──────────┼─────────────┤
│ 09123456789     │ 5/5      │ 3/3      │ 2/2      │ 10/10 (0)   │
└─────────────────┴──────────┴──────────┴──────────┴─────────────┘
```

### 3. Claim Tickets for Specific Phone
```bash
node bot.mjs -a claim -p 09123456789
```

### 4. Check Old Tickets
```bash
node bot.mjs -a info -d 2025-01-18
```

## 🔐 Security Features

- **Token Management**: Secure token storage and automatic refresh
- **Captcha Handling**: Automated captcha display and input
- **Rate Limiting**: Built-in delays to prevent API abuse
- **Error Handling**: Comprehensive error handling with retry logic
- **Debug Mode**: Optional debug output for troubleshooting

## 🎨 Output Features

- **Colorized Console**: Beautiful colored output using chalk
- **Table Display**: Organized data display using cli-table3
- **Progress Indicators**: Clear status messages with timestamps
- **Error Messages**: Informative error messages with suggestions

## 🛡️ Error Handling

The bot includes comprehensive error handling for:
- Network connectivity issues
- Invalid credentials
- Captcha failures
- Token expiration
- API rate limiting
- Invalid phone numbers
- Missing configuration

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## � Support the Project

If you find this project helpful, please consider:

### ⭐ Star the Repository
Give this project a star on GitHub to show your support!

[![Star this repo](https://img.shields.io/github/stars/NabiKAZ/wallex-pump-bot?style=for-the-badge&logo=github&logoColor=white&labelColor=black&color=yellow)](https://github.com/NabiKAZ/wallex-pump-bot)

### 💰 Donate

Support the development of this project:

#### TON Wallet
```
nabikaz.ton
```

#### Other Cryptocurrencies
- **Bitcoin**: Coming soon
- **Ethereum**: Coming soon
- **USDT**: Coming soon

### 🔄 Share
Help others discover this project by sharing it with your friends and community!

## �👨‍💻 Author

**NabiKAZ**
- 🐦 Twitter: [@NabiKAZ](https://x.com/NabiKAZ)
- 📱 Telegram: [@BotSorati](https://t.me/BotSorati)
- 🌐 GitHub: [NabiKAZ](https://github.com/NabiKAZ)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Disclaimer

This bot is for educational purposes only. Use it responsibly and in accordance with Wallex's terms of service. The authors are not responsible for any misuse or damage caused by this software.

## 🐛 Troubleshooting

### Common Issues

1. **Captcha not showing**: Make sure you have a default browser installed
2. **Token expired**: Run login command again to refresh token
3. **Network errors**: Check your internet connection and API availability
4. **Invalid credentials**: Verify your phone number and password in accounts.mjs

### Debug Mode

Enable debug mode in `config.mjs` to see detailed logs:
```javascript
export default {
    // ... other settings
    debug: true
};
```

## 📊 Dependencies

- **axios**: HTTP client for API requests
- **chalk**: Terminal string styling
- **cli-table3**: Beautiful tables for console output
- **yargs**: Command line argument parsing

## 🔄 Changelog

### v1.0.0
- Initial release
- Basic registration and login functionality
- Ticket claiming automation
- Phone and date filtering
- Token management system
