/**
 * Wallex registration, login, claim automation for pump challenge
 * 
 * @repository https://github.com/NabiKAZ/wallex-pump-bot
 * @telegram https://t.me/BotSorati
 * @author NabiKAZ <https://x.com/NabiKAZ>
 * @license GPL-3.0
 * @created 2025
 * 
 * Copyright (C) 2025 NabiKAZ
 * Licensed under GNU General Public License v3.0
 * See: https://www.gnu.org/licenses/gpl-3.0.html
 */

import axios from 'axios';
import fs from 'fs/promises';
import readline from 'readline';
import { exec } from 'child_process';
import util from 'util';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Table from 'cli-table3';
import chalk from 'chalk';
import accounts from './accounts.mjs';
import config from './config.mjs';

// Prize data by date and digit match
const prizeData = {
    '2025-07-14': [
        { digits: 3, winners: 5906, totalPrize: 100000000 },
        { digits: 4, winners: 623, totalPrize: 200000000 },
        { digits: 5, winners: 46, totalPrize: 200000000 },
        { digits: 6, winners: 3, totalPrize: 200000000 },
        { digits: 7, winners: 0, totalPrize: 200000000 },
        { digits: 8, winners: 0, totalPrize: 1000000000 }
    ],
    '2025-07-15': [
        { digits: 3, winners: 8463, totalPrize: 100000000 },
        { digits: 4, winners: 1238, totalPrize: 200000000 },
        { digits: 5, winners: 111, totalPrize: 200000000 },
        { digits: 6, winners: 5, totalPrize: 200000000 },
        { digits: 7, winners: 0, totalPrize: 200000000 },
        { digits: 8, winners: 0, totalPrize: 1000000000 }
    ],
    '2025-07-16': [
        { digits: 3, winners: 13863, totalPrize: 100000000 },
        { digits: 4, winners: 2114, totalPrize: 200000000 },
        { digits: 5, winners: 240, totalPrize: 200000000 },
        { digits: 6, winners: 12, totalPrize: 200000000 },
        { digits: 7, winners: 0, totalPrize: 200000000 },
        { digits: 8, winners: 0, totalPrize: 1000000000 }
    ],
    '2025-07-17': [
        { digits: 3, winners: 12979, totalPrize: 100000000 },
        { digits: 4, winners: 1750, totalPrize: 200000000 },
        { digits: 5, winners: 166, totalPrize: 200000000 },
        { digits: 6, winners: 8, totalPrize: 200000000 },
        { digits: 7, winners: 0, totalPrize: 200000000 },
        { digits: 8, winners: 0, totalPrize: 1000000000 }
    ],
    '2025-07-18': [
        { digits: 3, winners: 20733, totalPrize: 100000000 },
        { digits: 4, winners: 3553, totalPrize: 200000000 },
        { digits: 5, winners: 239, totalPrize: 200000000 },
        { digits: 6, winners: 7, totalPrize: 200000000 },
        { digits: 7, winners: 1, totalPrize: 200000000 },
        { digits: 8, winners: 0, totalPrize: 1000000000 }
    ],
    '2025-07-19': [
        { digits: 3, winners: 17063, totalPrize: 100000000 },
        { digits: 4, winners: 1898, totalPrize: 200000000 },
        { digits: 5, winners: 161, totalPrize: 200000000 },
        { digits: 6, winners: 4, totalPrize: 200000000 },
        { digits: 7, winners: 0, totalPrize: 200000000 },
        { digits: 8, winners: 0, totalPrize: 1000000000 }
    ],
    '2025-07-20': [
        { digits: 3, winners: 15340, totalPrize: 100000000 },
        { digits: 4, winners: 1992, totalPrize: 200000000 },
        { digits: 5, winners: 161, totalPrize: 200000000 },
        { digits: 6, winners: 8, totalPrize: 200000000 },
        { digits: 7, winners: 1, totalPrize: 200000000 },
        { digits: 8, winners: 0, totalPrize: 1000000000 }
    ],
    '2025-07-21': [
        { digits: 3, winners: 13709, totalPrize: 100000000 },
        { digits: 4, winners: 1679, totalPrize: 200000000 },
        { digits: 5, winners: 140, totalPrize: 200000000 },
        { digits: 6, winners: 3, totalPrize: 200000000 },
        { digits: 7, winners: 1, totalPrize: 200000000 },
        { digits: 8, winners: 0, totalPrize: 1000000000 }
    ]
};

// Function to calculate individual prize amount for a winner
function calculatePrizeAmount(prizeValue, date) {
    // If prize value is a number (like "3", "4", etc.), calculate based on prize data
    const digits = parseInt(prizeValue);
    if (!isNaN(digits) && prizeData[date]) {
        const prizeInfo = prizeData[date].find(p => p.digits === digits);
        if (prizeInfo && prizeInfo.winners > 0) {
            return Math.floor(prizeInfo.totalPrize / prizeInfo.winners);
        }
    }
    // Return 0 if no data found or can't calculate
    return 0;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .usage('\nWallex registration, login, claim automation for pump challenge')
    .usage('Project: https://github.com/NabiKAZ/wallex-pump-bot')
    .usage('Telegram: https://t.me/BotSorati')
    .usage('Author: https://x.com/NabiKAZ\n')
    .usage('Usage: node $0 -a <action> [-d <date>] [-p <phone>]')
    .option('a', {
        alias: 'action',
        describe: 'Action to perform: signup, login, info, claim, or winners',
        type: 'string',
        demandOption: true,
        choices: ['signup', 'login', 'info', 'claim', 'winners']
    })
    .option('d', {
        alias: 'date',
        describe: 'Date filter for old tickets (YYYY-MM-DD format)',
        type: 'string'
    })
    .option('p', {
        alias: 'phone',
        describe: 'Phone number to filter specific account',
        type: 'string'
    })
    .help('h')
    .alias('h', 'help')
    .help()
    .wrap(null)
    .argv;

// Debug mode flag
const DEBUG = config.debug;

// Token management functions
async function saveToken(phone, token) {
    try {
        let tokens = {};
        try {
            const data = await fs.readFile('tokens.json', 'utf8');
            tokens = JSON.parse(data);
        } catch (error) {
            // فایل وجود نداره یا خالیه، اشکالی نداره
        }

        tokens[phone] = {
            token,
            timestamp: Date.now()
        };

        await fs.writeFile('tokens.json', JSON.stringify(tokens, null, 2));
    } catch (error) {
        console.error('Failed to save token:', error);
    }
}

async function loadToken(phone) {
    try {
        const data = await fs.readFile('tokens.json', 'utf8');
        const tokens = JSON.parse(data);

        if (!tokens[phone]) {
            return null;
        }

        // اگر توکن بیشتر از مقدار تعریف شده در config قدیمی بود، نامعتبر در نظر میگیریم
        const isExpired = (Date.now() - tokens[phone].timestamp) > config.tokenExpireDays * 24 * 60 * 60 * 1000;
        if (isExpired) {
            // توکن منقضی شده رو حذف میکنیم
            delete tokens[phone];
            await fs.writeFile('tokens.json', JSON.stringify(tokens, null, 2));
            return null;
        }

        return tokens[phone].token;
    } catch (error) {
        return null;
    }
}

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Function to show captcha image in browser
async function showCaptchaImage(imageData) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Captcha Image</title>
            <style>
                body { 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0; 
                    background: #f0f0f0;
                }
                img { 
                    border: 2px solid #333;
                    box-shadow: 0 0 10px rgba(0,0,0,0.2);
                }
            </style>
        </head>
        <body>
            <img src="${imageData}" alt="Captcha">
        </body>
        </html>
    `;

    await fs.writeFile('captcha.html', html);
    exec('start captcha.html'); // برای ویندوز
}

// Create axios instance with common configs
const api = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'User-Agent': config.userAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fa-IR,fa;q=0.9,en-GB;q=0.8,en;q=0.7,en-US;q=0.6',
        'Content-Type': 'application/json',
        'platform': 'web',
        'Origin': 'https://wallex.ir',
        'Referer': 'https://wallex.ir/',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
    }
});

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to get captcha
async function getCaptcha() {
    try {
        const response = await api.get('/v1/captcha');
        if (DEBUG) console.log('Captcha Response:', util.inspect({
            status: response.status,
            data: response.data
        }, { depth: null, colors: true }));
        return response.data.result;
    } catch (error) {
        if (DEBUG) console.log('Captcha Error Response:', util.inspect({
            status: error.response?.status,
            data: error.response?.data || error.message
        }, { depth: null, colors: true }));
        console.error('Failed to get captcha:', error.response?.data || error.message);
        return null;
    }
}

// Function to request login/registration
async function requestAuth(phone, inviteCode, password) {
    let attempts = 0;
    const maxAttempts = 3;  // حداکثر تعداد تلاش

    while (attempts < maxAttempts) {
        try {
            // First get captcha
            const captcha = await getCaptcha();
            if (!captcha) {
                console.error('Failed to get captcha');
                return null;
            }

            // نمایش تصویر کپچا در مرورگر
            await showCaptchaImage(captcha.img);
            console.log('Captcha image opened in your browser...');

            // Get captcha value from user
            const captchaValue = await question('Please enter the captcha value: ');

            // پاک کردن فایل HTML موقت
            await fs.unlink('captcha.html').catch(() => { });

            const response = await api.post('/v3/auth/login', {
                mobile_number: phone,
                invite_code: inviteCode,
                device_name: 'web',
                captcha: `${captchaValue}|${captcha.key}`,
                type: 'ShCaptcha'
            });

            if (DEBUG) console.log('Auth Response:', util.inspect({
                status: response.status,
                data: response.data
            }, { depth: null, colors: true }));

            const flow = response.data.result.login.flow;
            const requestId = response.data.result.login.request_id;

            // requestId و flow رو برمیگردونیم
            return { requestId, flow };
        } catch (error) {
            if (DEBUG) console.log('Auth Error Response:', util.inspect({
                status: error.response?.status,
                data: error.response?.data || error.message
            }, { depth: null, colors: true }));
            if (error.response?.data?.code === 422 && error.response?.data?.result?.captcha_value) {
                console.log('Invalid captcha, please try again...');
                attempts++;
                if (attempts === maxAttempts) {
                    console.error('Maximum captcha attempts reached');
                    return null;
                }
                await delay(1000); // کمی صبر کنیم قبل از تلاش مجدد
                continue;
            }
            console.error('Auth request failed:', error.response?.data || error.message);
            return null;
        }
    }
    return null;
}

// Function to verify OTP
async function verifyOTP(requestId) {
    let attempts = 0;
    const maxAttempts = 3;  // حداکثر تعداد تلاش

    while (attempts < maxAttempts) {
        try {
            // Get OTP from user
            const otpCode = await question('Please enter the OTP code received on your phone: ');

            const response = await api.post('/v3/auth/verify', {
                code: otpCode,
                request_id: requestId
            });

            if (DEBUG) console.log('OTP Verify Response:', util.inspect({
                status: response.status,
                data: response.data
            }, { depth: null, colors: true }));

            if (response.data.success) {
                // توکن فقط در حالت لاگین از این متد برمیگرده
                return response.data.result?.token || true;
            }

            console.log('Invalid OTP code, please try again...');
            attempts++;
            if (attempts === maxAttempts) {
                console.error('Maximum OTP attempts reached');
                return false;
            }
            await delay(1000); // کمی صبر کنیم قبل از تلاش مجدد
            continue;

        } catch (error) {
            if (DEBUG) console.log('OTP Error Response:', util.inspect({
                status: error.response?.status,
                data: error.response?.data || error.message
            }, { depth: null, colors: true }));
            if (error.response?.data?.code === 422) {
                console.log('Invalid OTP code or session expired, please try again...');
                attempts++;
                if (attempts === maxAttempts) {
                    console.error('Maximum OTP attempts reached');
                    return false;
                }
                await delay(1000);
                continue;
            }
            console.error('OTP verification failed:', error.response?.data || error.message);
            return false;
        }
    }
    return false;
}

// Function to verify password
async function verifyPassword(requestId, password) {
    try {
        const response = await api.post('/v3/auth/verify-password', {
            password: password,
            request_id: requestId,
            // is_legal: false
            // ...(flow === 'signup' && { is_legal: false }) // فقط در حالت ثبت نام این فیلد رو میفرستیم
        });

        if (DEBUG) console.log('Password Verify Response:', util.inspect({
            status: response.status,
            data: response.data
        }, { depth: null, colors: true }));

        if (response.data.success) {
            // توکن فقط در حالت عضویت از این متد برمیگرده
            return response.data.result?.token || true;
        }
        return null;

    } catch (error) {
        if (DEBUG) console.log('Password Error Response:', util.inspect({
            status: error.response?.status,
            data: error.response?.data || error.message
        }, { depth: null, colors: true }));
        console.error('Password verification failed:', error.response?.data || error.message);
        return null;
    }
}

// Function to get account profile
async function getProfile(token) {
    try {
        const response = await api.get('/v1/account/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (DEBUG) console.log('Profile Response:', util.inspect({
            status: response.status,
            data: response.data
        }, { depth: null, colors: true }));
        return response.data.result;
    } catch (error) {
        if (DEBUG) console.log('Profile Error Response:', util.inspect({
            status: error.response?.status,
            data: error.response?.data || error.message
        }, { depth: null, colors: true }));
        console.error('Failed to get profile:', error.response?.data || error.message);
        return null;
    }
}

// Function to get tickets information
async function getTickets(token, dateFilter = null) {
    try {
        const response = await api.get('/v1/7billion-campaign/my-tickets', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (DEBUG) console.log('Tickets Response:', util.inspect({
            status: response.status,
            data: response.data
        }, { depth: null, colors: true }));

        if (response.data.success) {
            const result = response.data.result;

            // تشخیص پویای انواع تیکت‌ها
            const ticketTypes = Object.keys(result).filter(key =>
                typeof result[key] === 'object' &&
                result[key] !== null &&
                'total' in result[key] &&
                'count' in result[key]
            );

            // محاسبه مجموع کل تیکت‌ها
            const totalTickets = ticketTypes.reduce((sum, type) => sum + (result[type]?.count || 0), 0);

            // انتخاب منبع تیکت‌ها بر اساس وجود dateFilter
            let ticketsData = [];
            if (dateFilter) {
                // اگر تاریخ داده شده، از هر دو منبع tickets و old_tickets جستجو کن
                const currentTickets = (result.tickets || []).filter(ticket => ticket.date === dateFilter);
                const oldTickets = (result.old_tickets || []).filter(ticket => ticket.date === dateFilter);
                ticketsData = [...currentTickets, ...oldTickets];
            } else {
                // در غیر این صورت همه تیکت‌ها را از هر دو منبع برگردان
                ticketsData = [...(result.tickets || []), ...(result.old_tickets || [])];
            }

            // بررسی تیکت‌های برنده از همه بخش‌ها (برای Winners column)
            const allTicketsData = [...(result.tickets || []), ...(result.old_tickets || [])];
            const winnerTickets = allTicketsData
            .filter(ticket => ticket.winner)
            .map(ticket => ({
                number: ticket.ticket_number,
                won: ticket.winner.won,
                type: ticket.type,
                date: ticket.date
            }));

            // همچنین بررسی winner_tickets اگر موجود باشد
            if (result.winner_tickets && Array.isArray(result.winner_tickets)) {
                result.winner_tickets.forEach(wt => {
                    if (!winnerTickets.find(w => w.number === wt.ticket_number)) {
                        winnerTickets.push({
                            number: wt.ticket_number,
                            won: wt.won,
                            type: 'unknown', // نوع تیکت در winner_tickets مشخص نیست
                            date: wt.date
                        });
                    }
                });
            }

            // ایجاد آبجکت نتیجه با همه انواع تیکت‌ها
            const ticketCounts = {};
            ticketTypes.forEach(type => {
                ticketCounts[type] = `${result[type]?.count || 0}/${result[type]?.total || 0}`;
            });

            return {
                totalTickets,
                ...ticketCounts,
                tickets: ticketsData.map(t => ({
                    number: t.ticket_number,
                    type: t.type,
                    isWinner: !!t.winner,
                    date: t.date
                })),
                winnerTickets
            };
        }
        return null;
    } catch (error) {
        if (DEBUG) console.log('Tickets Error Response:', util.inspect({
            status: error.response?.status,
            data: error.response?.data || error.message
        }, { depth: null, colors: true }));
        console.error('Failed to get tickets:', error.response?.data || error.message);
        return null;
    }
}

// Function to get referral claim info
async function getReferralClaimInfo(token) {
    try {
        const response = await api.get('/v1/7billion-campaign/claim', {
            params: { type: 'referral' },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (DEBUG) console.log('Referral Claim Response:', util.inspect({
            status: response.status,
            data: response.data
        }, { depth: null, colors: true }));

        if (response.data.success) {
            return response.data.result.referral?.claim || 0;
        }
        return 0;
    } catch (error) {
        if (DEBUG) console.log('Referral Claim Error Response:', util.inspect({
            status: error.response?.status,
            data: error.response?.data || error.message
        }, { depth: null, colors: true }));
        console.error('Failed to get referral claim info:', error.response?.data || error.message);
        return 0;
    }
}

// Helper function to check if a ticket ratio is complete (e.g. "1/1" or "3/3")
function isComplete(ratio) {
    if (!ratio || ratio === 'N/A') return false;
    const [current, total] = ratio.split('/').map(Number);
    return current === total && total > 0;
}

// Helper function to colorize ticket counts
function colorizeTicketCount(count) {
    if (!count || count === 'N/A') return count;
    return isComplete(count) ? chalk.green(count) : chalk.yellow(count);
}

// Helper function to colorize referral claims
function colorizeReferralInfo(info) {
    if (!info || info === 'N/A') return info;
    const match = info.match(/^(.+) \((\d+)\)$/);
    if (!match) return info;
    const [, ratio, claims] = match;
    const claimsStr = Number(claims) === 0 ? chalk.green('0') : chalk.yellow(claims);
    return `${colorizeTicketCount(ratio)} (${claimsStr})`;
}

// Function to display all account profiles in a table
async function displayAllProfiles() {
    // فیلتر کردن اکانت‌ها بر اساس شماره تلفن
    let filteredAccounts = accounts;
    if (argv.phone) {
        filteredAccounts = accounts.filter(account => account.phone === argv.phone);
        if (filteredAccounts.length === 0) {
            console.log(`${chalk.red('No account found with phone number:')} ${argv.phone}`);
            return;
        }
        console.log(`${chalk.cyan('Filtering for phone:')} ${argv.phone}`);
    }

    // ابتدا همه انواع تیکت‌ها رو پیدا میکنیم
    let ticketTypes = new Set();

    // بررسی اولیه برای پیدا کردن همه انواع تیکت‌ها
    for (const account of filteredAccounts) {
        const token = await loadToken(account.phone);
        if (token) {
            const tickets = await getTickets(token, argv.date);
            if (tickets) {
                Object.keys(tickets).forEach(key => {
                    if (key !== 'totalTickets' && key !== 'tickets' && key !== 'winnerTickets') {
                        ticketTypes.add(key);
                    }
                });
            }
        }
    }

    // تبدیل به آرایه و مرتب سازی
    ticketTypes = Array.from(ticketTypes).sort();

    // اطمینان از اینکه referral آخرین نوع تیکت باشد
    if (ticketTypes.includes('referral')) {
        ticketTypes = ticketTypes.filter(t => t !== 'referral').concat(['referral']);
    }

    // ساخت ستون‌های جدول
    const tableHead = [
        'Phone',
        'invite_code',
        'Total',
        ...ticketTypes,
        'Tickets'
    ];

    const table = new Table({
        head: tableHead,
        style: {
            head: ['cyan'],
            border: ['grey']
        },
        wordWrap: true,
        wrapOnWordBoundary: false
    });

    // متغیر برای ذخیره دیتای تیکت‌ها
    let accountsTicketsData = {};

    for (const account of filteredAccounts) {
        console.log(`\nChecking profile for ${account.phone}...`);
        const token = await loadToken(account.phone);
        if (!token) {
            table.push([account.phone, 'N/A', 'N/A', ...Array(ticketTypes.length + 1).fill('N/A')]);
            continue;
        }

        const profile = await getProfile(token);
        if (!profile) {
            table.push([account.phone, 'N/A', 'N/A', ...Array(ticketTypes.length + 1).fill('N/A')]);
            continue;
        }

        // دریافت اطلاعات تیکت‌ها
        const tickets = await getTickets(token, argv.date);
        
        // ذخیره دیتای تیکت‌ها برای استفاده بعدی
        accountsTicketsData[account.phone] = tickets;

        // دریافت اطلاعات دقیق‌تر referral
        const referralClaims = await getReferralClaimInfo(token);

        // ذخیره فایل JSON برای هر پروفایل
        const data = {
            profile,
            tickets: tickets || null,
            referralClaims,
            timestamp: new Date().toISOString()
        };

        // برای نمایش تیکت‌ها با رنگ‌های متفاوت
        const formatTickets = (tickets) => {
            if (!tickets || !tickets.tickets) return 'N/A';
            return tickets.tickets.map(t => {
                const prefix = t.isWinner ? '🏆' : '🎫';
                return `${prefix} ${t.number} (${t.type})`;
            }).join('\n');
        };

        // محاسبه تعداد کل تیکت‌های دریافت شده
        const calculateTotalTickets = (tickets) => {
            if (!tickets || !tickets.tickets) return 'N/A';
            // تعداد تیکت‌های دریافت شده از آرایه tickets
            const totalCount = tickets.tickets.length;
            // کل تیکت‌های ممکن (مجموع اعداد سمت راست نسبت‌ها)
            let maxTotal = 0;
            ticketTypes.forEach(type => {
                if (tickets[type]) {
                    const [, max] = tickets[type].split('/').map(Number);
                    // برای رفرال، ماکزیمم هم 3 برابر میشه
                    maxTotal += (type === 'referral') ? max * 3 : max;
                }
            });

            const ratio = `${totalCount}/${maxTotal}`;
            return colorizeTicketCount(ratio);
        };

        // برای نمایش تیکت‌های برنده
        const formatWinners = (tickets) => {
            if (!tickets || !tickets.winnerTickets || tickets.winnerTickets.length === 0) return 'N/A';
            return tickets.winnerTickets.map(w => {
                return `🏆 ${w.number} (${w.won})\n${w.date || 'N/A'}`;
            }).join('\n\n');
        };

        // ساخت آرایه مقادیر برای جدول
        const rowData = [
            account.phone,
            profile.invite_code || 'N/A',
            calculateTotalTickets(tickets),
            ...ticketTypes.map(type => {
                if (type === 'referral' && tickets && tickets[type]) {
                    // نمایش اطلاعات referral به همراه تعداد قابل دریافت
                    return colorizeReferralInfo(`${tickets[type]} (${referralClaims || 0})`);
                }
                return tickets ? colorizeTicketCount(tickets[type] || '0/0') : 'N/A';
            }),
            formatTickets(tickets)
        ];

        table.push(rowData);
    }

    // جمع‌آوری اطلاعات همه تیکت‌ها و تیکت‌های ناقص
    let allTickets = [];
    let incompleteTickets = {};
    let allWinnerTickets = [];

    table.forEach(row => {
        if (row[0] === 'Total') return; // ردیف مجموع رو نادیده میگیریم

        // بررسی ستون آخر برای تیکت‌ها
        const ticketsColumn = row[row.length - 1]; // ستون Tickets
        if (ticketsColumn && ticketsColumn !== 'N/A') {
            allTickets = allTickets.concat(ticketsColumn.split('\n'));
            
            // بررسی تیکت‌های برنده
            const winnerTickets = ticketsColumn.split('\n').filter(ticket => ticket.includes('🏆'));
            winnerTickets.forEach(ticket => {
                // استخراج شماره تیکت و نوع
                const match = ticket.match(/🏆 (\d+) \((\w+)\)/);
                if (match) {
                    const [, ticketNumber, ticketType] = match;
                    const phone = row[0];
                    
                    // پیدا کردن تاریخ تیکت از دیتای اصلی
                    let ticketDate = 'N/A'; // پیش‌فرض
                    let prizeAmount = ticketType; // پیش‌فرض
                    
                    if (accountsTicketsData[phone] && accountsTicketsData[phone].tickets) {
                        const foundTicket = accountsTicketsData[phone].tickets.find(t => 
                            t.number === ticketNumber && t.type === ticketType
                        );
                        if (foundTicket && foundTicket.date) {
                            ticketDate = foundTicket.date;
                        }
                    }
                    
                    // همچنین بررسی winnerTickets برای پیدا کردن مقدار جایزه
                    if (accountsTicketsData[phone] && accountsTicketsData[phone].winnerTickets) {
                        const winnerTicket = accountsTicketsData[phone].winnerTickets.find(w => 
                            w.number === ticketNumber
                        );
                        if (winnerTicket && winnerTicket.won) {
                            prizeAmount = winnerTicket.won;
                        }
                    }
                    
                    allWinnerTickets.push({
                        number: ticketNumber,
                        type: ticketType,
                        phone: phone,
                        date: ticketDate,
                        won: prizeAmount
                    });
                }
            });
        }
        // بررسی تیکت‌های ناقص (به جز trade)
        ticketTypes.forEach((type, index) => {
            if (type === 'trade') return; // trade رو نادیده میگیریم
            const cell = row[index + 3]; // شروع از ستون بعد از Total
            if (cell && cell !== 'N/A') {
                if (type === 'referral') {
                    // برای رفرال فقط عدد داخل پرانتز رو چک میکنیم
                    const cellText = typeof cell === 'string' ? cell : cell.toString();
                    // حذف کدهای رنگ و استخراج عدد داخل پرانتز
                    const cleanText = cellText.replace(/\x1b\[[0-9;]*m/g, '');
                    const claimMatch = cleanText.match(/\((\d+)\)$/);
                    if (claimMatch && parseInt(claimMatch[1]) > 0) {
                        if (!incompleteTickets[row[0]]) {
                            incompleteTickets[row[0]] = [];
                        }
                        incompleteTickets[row[0]].push(`${type}: ${claimMatch[1]} available to claim`);
                    }
                } else {
                    // برای بقیه تیپ‌ها فقط 0/1 رو چک میکنیم
                    const cellText = typeof cell === 'string' ? cell : cell.toString();
                    // حذف کدهای رنگ و چک کردن 0/1
                    const cleanText = cellText.replace(/\x1b\[[0-9;]*m/g, '');
                    if (cleanText === '0/1') {
                        if (!incompleteTickets[row[0]]) {
                            incompleteTickets[row[0]] = [];
                        }
                        incompleteTickets[row[0]].push(`${type}: 1 ticket needed`);
                    }
                }
            }
        });
    });

    console.log('\nAccount Profiles:');
    console.log(table.toString());

    // نمایش تعداد کل تیکت‌ها و تیکت‌های قابل دریافت
    console.log('\nSummary:');

    console.log(`Total Tickets: ${chalk.cyan(allTickets.length)}`);

    // محاسبه تعداد کل تیکت‌های قابل دریافت
    let totalTicketsToGet = 0;
    Object.values(incompleteTickets).forEach(ticketList => {
        ticketList.forEach(ticket => {
            if (ticket.includes('available to claim')) {
                // برای referral tickets - عدد داخل پرانتز
                const match = ticket.match(/(\d+) available to claim/);
                if (match) totalTicketsToGet += parseInt(match[1]);
            } else if (ticket.includes('ticket needed')) {
                // برای تیکت‌های 0/1 - هر کدوم یک تیکت
                totalTicketsToGet += 1;
            }
        });
    });

    if (totalTicketsToGet > 0) {
        console.log(`Tickets Available to Claim: ${chalk.yellow(totalTicketsToGet)}`);
    }

    // نمایش تیکت‌های برنده
    if (allWinnerTickets.length > 0) {
        console.log('\nWinner Details:');
        allWinnerTickets.forEach(winner => {
            console.log(`  🏆 ${winner.number} (${winner.won}) - ${winner.phone} - ${winner.date}`);
        });
    }
}

// Main function to process accounts
async function processAccounts() {
    // فیلتر کردن اکانت‌ها بر اساس شماره تلفن
    let accountsToProcess = accounts;
    if (argv.phone) {
        accountsToProcess = accounts.filter(account => account.phone === argv.phone);
        if (accountsToProcess.length === 0) {
            console.log(`${chalk.red('No account found with phone number:')} ${argv.phone}`);
            return;
        }
        console.log(`${chalk.cyan('Processing only phone:')} ${argv.phone}`);
    }

    for (const account of accountsToProcess) {
        console.log(`\nProcessing account ${account.phone}`);
        let token = null; // تعریف متغیر token در اینجا

        // چک کردن توکن ذخیره شده
        const savedToken = await loadToken(account.phone);
        if (savedToken) {
            console.log('Found saved token, verifying...');
            const profile = await getProfile(savedToken);
            if (profile) {
                console.log('Saved token is valid, skipping authentication...');
                token = savedToken;
                continue;
            } else {
                console.log('Saved token is invalid, proceeding with authentication...');
            }
        }

        // Try to authenticate if no valid token found
        console.log('No valid token found, starting authentication process...');

        // Step 1: Request authentication
        const authResult = await requestAuth(account.phone, account.inviteCode, account.password);
        if (!authResult) {
            console.log('Failed to start authentication process');
            continue;
        }

        if (authResult.flow === 'signup') {
            // در حالت ثبت نام: اول OTP بعد پسورد
            const otpResult = await verifyOTP(authResult.requestId);
            if (!otpResult) {
                console.log('Failed to verify OTP');
                continue;
            }

            token = await verifyPassword(authResult.requestId, account.password);
            if (!token) {
                console.log('Failed to verify password');
                continue;
            }
        } else {
            // در حالت لاگین: اول پسورد بعد OTP
            const passwordResult = await verifyPassword(authResult.requestId, account.password);
            if (!passwordResult) {
                console.log('Failed to verify password');
                continue;
            }

            token = await verifyOTP(authResult.requestId);
            if (!token) {
                console.log('Failed to verify OTP');
                continue;
            }
        }

        if (!token) {
            console.log('Authentication failed');
            continue;
        }

        console.log('Successfully logged in!');

        // Save token to file
        await saveToken(account.phone, token);
        console.log('Token saved to file');

        // Get profile information
        const profile = await getProfile(token);
        if (!profile) {
            console.log('Failed to get profile information');
            continue;
        }

        console.log('Profile information retrieved successfully');
    }
}

// Function to claim a ticket
async function claimTicket(token, type, ticketNumber) {
    try {
        // تولید یک عدد تصادفی 8 رقمی اگر شماره تیکت خالی باشد
        const finalTicketNumber = ticketNumber || String(Math.floor(10000000 + Math.random() * 90000000));

        const response = await api.post('/v1/7billion-campaign', {
            type,
            ticket_number: finalTicketNumber
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (DEBUG) console.log('Claim Ticket Response:', util.inspect({
            status: response.status,
            data: response.data
        }, { depth: null, colors: true }));

        if (response.data.success) {
            console.log(chalk.gray(`Message: ${response.data.message}`));
            if (response.data.result?.ticket_number) {
                console.log(chalk.gray(`Ticket Number: ${response.data.result.ticket_number}`));
            }
        }

        return response.data.success;
    } catch (error) {
        if (DEBUG) console.log('Claim Ticket Error Response:', util.inspect({
            status: error.response?.status,
            data: error.response?.data || error.message
        }, { depth: null, colors: true }));
        console.error('Failed to claim ticket:', error.response?.data?.message || error.message);
        return false;
    }
}

// Function to display all winners report
async function displayWinnersReport() {
    // فیلتر کردن اکانت‌ها بر اساس شماره تلفن
    let filteredAccounts = accounts;
    if (argv.phone) {
        filteredAccounts = accounts.filter(account => account.phone === argv.phone);
        if (filteredAccounts.length === 0) {
            console.log(`${chalk.red('No account found with phone number:')} ${argv.phone}`);
            return;
        }
        console.log(`${chalk.cyan('Winners report for phone:')} ${argv.phone}`);
    }

    console.log(`${chalk.cyan('🏆 Winners Report - All Days 🏆')}\n`);

    // جمع‌آوری همه برنده‌ها از همه اکانت‌ها
    let allWinners = [];
    let totalWinAmount = 0;
    let winnersByDate = {};
    let winnersByType = {};
    let winnersByPhone = {};
    let accountProfiles = {}; // ذخیره profile همه اکانت‌ها
    let accountTickets = {}; // ذخیره تیکت‌های همه اکانت‌ها

    for (const account of filteredAccounts) {
        console.log(`Checking winners for ${account.phone}...`);
        const token = await loadToken(account.phone);
        if (!token) {
            console.log(`  No valid token for ${account.phone}, skipping...`);
            // حداقل شماره تلفن رو ذخیره می‌کنیم
            accountProfiles[account.phone] = { invite_code: 'N/A' };
            accountTickets[account.phone] = { tickets: [] }; // تیکت خالی
            continue;
        }

        const profile = await getProfile(token);
        if (!profile) {
            console.log(`  Failed to get profile for ${account.phone}, skipping...`);
            accountProfiles[account.phone] = { invite_code: 'N/A' };
            accountTickets[account.phone] = { tickets: [] }; // تیکت خالی
            continue;
        }

        // ذخیره profile این اکانت
        accountProfiles[account.phone] = profile;

        // دریافت همه تیکت‌ها (بدون فیلتر تاریخ)
        const tickets = await getTickets(token);
        if (!tickets) {
            console.log(`  Failed to get tickets for ${account.phone}, skipping...`);
            accountTickets[account.phone] = { tickets: [] }; // تیکت خالی
            continue;
        }

        // ذخیره تیکت‌های این اکانت (حالا شامل همه تیکت‌های current و old می‌شود)
        accountTickets[account.phone] = tickets;

        if (!tickets.winnerTickets || tickets.winnerTickets.length === 0) {
            console.log(`  No winners found for ${account.phone}`);
            continue;
        }

        console.log(`  Found ${tickets.winnerTickets.length} winner ticket(s) for ${account.phone}`);

        // پردازش تیکت‌های برنده
        tickets.winnerTickets.forEach(winner => {
            const winnerData = {
                phone: account.phone,
                inviteCode: profile.invite_code || 'N/A',
                ticketNumber: winner.number,
                type: winner.type,
                date: winner.date,
                prize: winner.won,
                timestamp: new Date().toISOString()
            };

            allWinners.push(winnerData);

            // محاسبه مجموع جوایز (اگر عددی باشد)
            const prizeAmount = parseFloat(winner.won);
            if (!isNaN(prizeAmount)) {
                totalWinAmount += prizeAmount;
            }

            // گروه‌بندی بر اساس تاریخ
            if (!winnersByDate[winner.date]) {
                winnersByDate[winner.date] = [];
            }
            winnersByDate[winner.date].push(winnerData);

            // گروه‌بندی بر اساس نوع
            if (!winnersByType[winner.type]) {
                winnersByType[winner.type] = [];
            }
            winnersByType[winner.type].push(winnerData);

            // گروه‌بندی بر اساس شماره تلفن
            if (!winnersByPhone[account.phone]) {
                winnersByPhone[account.phone] = [];
            }
            winnersByPhone[account.phone].push(winnerData);
        });
    }

    if (allWinners.length === 0) {
        console.log(`\n${chalk.yellow('No winners found in any account!')}`);
        return;
    }

    // جدول برنده‌ها بر اساس تاریخ
    console.log(`${chalk.green('📅 Winners by Date:')}`);
    const dateTable = new Table({
        head: ['Date', 'Phone', 'Invite Code', 'Ticket #', 'Type', 'Prize', 'Amount'],
        style: {
            head: ['cyan'],
            border: ['grey']
        }
    });

    // مرتب سازی بر اساس تاریخ (جدیدترین اول)
    const sortedDates = Object.keys(winnersByDate).sort((a, b) => new Date(b) - new Date(a));
    
    sortedDates.forEach(date => {
        winnersByDate[date].forEach((winner, index) => {
            const prizeAmount = calculatePrizeAmount(winner.prize, winner.date);
            const formattedAmount = prizeAmount > 0 ? prizeAmount.toLocaleString() : 'N/A';
            
            dateTable.push([
                index === 0 ? chalk.yellow(date) : '', // فقط اولین ردیف تاریخ رو نشون بده
                winner.phone,
                winner.inviteCode,
                winner.ticketNumber,
                winner.type,
                chalk.green(winner.prize),
                chalk.cyan(formattedAmount)
            ]);
        });
    });

    console.log(dateTable.toString());

    // آمار بر اساس شماره تلفن (شامل همه اکانت‌ها)
    console.log(`\n${chalk.green('📱 Winners by Phone Number:')}`);
    
    // ایجاد آمار برای همه اکانت‌ها (برنده و غیر برنده)
    const phoneStats = filteredAccounts.map(account => {
        const winners = winnersByPhone[account.phone] || [];
        const count = winners.length;
        const prizeDetail = count > 0 ? winners.map(w => w.prize).join('+') : 'N/A';
        const totalAmount = winners.reduce((sum, w) => {
            const amount = calculatePrizeAmount(w.prize, w.date);
            return sum + amount;
        }, 0);
        // تعداد کل تیکت‌ها (برنده و غیر برنده)
        const totalTickets = accountTickets[account.phone]?.tickets?.length || 0;
        // استفاده از profile ذخیره شده
        const inviteCode = accountProfiles[account.phone]?.invite_code || 'N/A';
        return { phone: account.phone, inviteCode, totalTickets, count, prizeDetail, totalAmount };
    }).sort((a, b) => b.count - a.count);

    const phoneTable = new Table({
        head: ['Phone', 'Invite Code', 'Total Tickets', 'Winners Count', 'Prize', 'Total Amount'],
        style: {
            head: ['cyan'],
            border: ['grey']
        }
    });

    phoneStats.forEach(stat => {
        const formattedAmount = stat.totalAmount > 0 ? stat.totalAmount.toLocaleString() : 'N/A';
        const countColor = stat.count > 0 ? chalk.cyan(stat.count) : chalk.gray(stat.count);
        const prizeColor = stat.prizeDetail !== 'N/A' ? chalk.green(stat.prizeDetail) : chalk.gray(stat.prizeDetail);
        const amountColor = stat.totalAmount > 0 ? chalk.cyan(formattedAmount) : chalk.gray(formattedAmount);
        const ticketsColor = stat.totalTickets > 0 ? chalk.yellow(stat.totalTickets) : chalk.gray(stat.totalTickets);
        
        phoneTable.push([
            stat.phone,
            stat.inviteCode,
            ticketsColor,
            countColor,
            prizeColor,
            amountColor
        ]);
    });

    console.log(phoneTable.toString());

    // نمایش آمار کلی در پایان
    console.log(`\n${chalk.green('📊 Overall Statistics:')}`);
    
    // آمار اکانت‌ها
    console.log(`Total Accounts: ${chalk.cyan(filteredAccounts.length)}`);
    console.log(`Total Winning Accounts: ${chalk.cyan(Object.keys(winnersByPhone).length)}`);
    
    // آمار تیکت‌ها
    const totalAllTickets = Object.values(accountTickets).reduce((sum, tickets) => {
        return sum + (tickets?.tickets?.length || 0);
    }, 0);
    console.log(`Total Tickets: ${chalk.cyan(totalAllTickets)}`);
    console.log(`Total Winning Tickets: ${chalk.cyan(allWinners.length)}`);
    
    // آمار جوایز
    const totalPrizeAmount = allWinners.reduce((sum, winner) => {
        const amount = calculatePrizeAmount(winner.prize, winner.date);
        return sum + amount;
    }, 0);
    console.log(`Total Prize Amount: ${chalk.cyan(totalPrizeAmount.toLocaleString())} Toman\n`);

}

// Function to process tickets claiming
async function processTicketsClaiming() {
    // فیلتر کردن اکانت‌ها بر اساس شماره تلفن
    let accountsToProcess = accounts;
    if (argv.phone) {
        accountsToProcess = accounts.filter(account => account.phone === argv.phone);
        if (accountsToProcess.length === 0) {
            console.log(`${chalk.red('No account found with phone number:')} ${argv.phone}`);
            return;
        }
        console.log(`${chalk.cyan('Processing claims for phone:')} ${argv.phone}`);
    }

    for (const account of accountsToProcess) {
        console.log(`\nProcessing account ${account.phone}...`);
        const token = await loadToken(account.phone);
        if (!token) {
            console.log('No valid token found, skipping...');
            continue;
        }

        // دریافت اطلاعات تیکت‌ها
        const tickets = await getTickets(token);
        if (!tickets) {
            console.log('Failed to get tickets info, skipping...');
            continue;
        }

        // بررسی تیکت‌های ناتمام
        const ticketTypes = Object.keys(tickets).filter(key =>
            key !== 'totalTickets' &&
            key !== 'tickets' &&
            key !== 'winnerTickets' &&
            tickets[key]
        );

        let claimedCount = 0;
        let totalToClaim = 0;

        for (const type of ticketTypes) {
            if (typeof tickets[type] !== 'string') continue; // Skip if not a string ratio
            
            const [current, total] = tickets[type].split('/').map(Number);
            const remaining = total - current;
            totalToClaim += remaining;

            if (remaining > 0) {
                console.log(`\nProcessing ${type} tickets (${current}/${total})...`);

                if (type === 'referral') {
                    // برای referral باید تعداد قابل دریافت رو چک کنیم
                    const claimableCount = await getReferralClaimInfo(token);
                    if (claimableCount > 0) {
                        console.log(`Found ${claimableCount} claimable referral tickets!`);
                        for (let i = 0; i < claimableCount; i++) {
                            process.stdout.write(`Claiming referral ticket ${i + 1}/${claimableCount}... `);
                            const success = await claimTicket(token, type, '');
                            if (success) {
                                process.stdout.write(chalk.green('✓\n'));
                                claimedCount++;
                            } else {
                                process.stdout.write(chalk.red('✗\n'));
                            }
                            await delay(1000); // کمی صبر می‌کنیم بین هر درخواست
                        }
                    } else {
                        console.log('No claimable referral tickets available.');
                    }
                } else {
                    // برای بقیه تیکت‌ها یک بار تلاش می‌کنیم
                    process.stdout.write(`Claiming ${type} ticket... `);
                    const success = await claimTicket(token, type, '');
                    if (success) {
                        process.stdout.write(chalk.green('✓\n'));
                        claimedCount++;
                    } else {
                        process.stdout.write(chalk.red('✗\n'));
                    }
                    await delay(1000);
                }
            }
        }

        console.log(`\nSummary for ${account.phone}:`);
        console.log(`Total tickets to claim: ${totalToClaim}`);
        console.log(`Successfully claimed: ${chalk.green(claimedCount)}`);
        if (totalToClaim - claimedCount > 0) {
            console.log(`Failed to claim: ${chalk.red(totalToClaim - claimedCount)}`);
        }

        // کمی صبر می‌کنیم قبل از رفتن به اکانت بعدی
        if (totalToClaim > 0) await delay(2000);
    }
}

// Handle different actions
async function main() {
    try {
        switch (argv.action) {
            case 'signup':
            case 'login':
                await processAccounts();
                break;

            case 'info':
                await displayAllProfiles();
                break;

            case 'claim':
                await processTicketsClaiming();
                break;

            case 'winners':
                await displayWinnersReport();
                break;
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        // Close readline interface
        rl.close();
    }
}

// Execute main function
main();
