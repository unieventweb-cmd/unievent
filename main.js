/**
 * UniEvents PK - Main JavaScript Logic Ledger
 * Year: 2026
 * Core Modules: Multi-lingual Runtime System, Dynamic State Calculations, Validations
 */

(function () {

// Global App State
const state = {
    currentLang: 'en',
    currentRole: 'student'
};

const AUTH_STORAGE_KEY = 'unievents-auth';
const BOOKINGS_STORAGE_KEY = 'unievents-bookings';

function getStoredUser() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function isUserLoggedIn() {
    const user = getStoredUser();
    return Boolean(user && user.isLoggedIn);
}

function saveUser(user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...user, isLoggedIn: true }));
    return true;
}

function logoutUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

function postAuthUrl() {
    const next = new URLSearchParams(window.location.search).get('next') || '';
    return /^book-ticket\.html\?event=[0-9a-f-]+$/i.test(next) ? next : 'book-ticket.html';
}

function getBookings() {
    try {
        const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
}

function saveBookings(bookings) {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
}

function addBooking(booking) {
    if (!isUserLoggedIn()) return { success: false, message: 'Please login before booking.' };

    const bookings = getBookings();
    const newBooking = {
        id: Date.now(),
        bookedByEmail: getStoredUser()?.email || '',
        bookedByName: getStoredUser()?.name || 'Student',
        bookedAt: new Date().toISOString(),
        ...booking
    };

    bookings.push(newBooking);
    saveBookings(bookings);
    return { success: true, booking: newBooking };
}

function clearBookings() {
    saveBookings([]);
}

// Global Translation Dictionaries
const translations = {
    en: {
        logo: "UniEvents PK", navHome: "Home", navBrowse: "Browse Events", navHow: "How It Works", navAbout: "About",
        pageTitleTerms: "Terms & Conditions", pageSubtitleTerms: "Rules and regulations for hosting and attending university events in Pakistan.",
        pageTitleContact: "Get in Touch", pageSubtitleContact: "Have questions about event verification, ticketing queries, or society partnership? We are here to help.",
        pageTitleHow: "How the Platform Works", pageSubtitleHow: "Connecting Pakistan's top university societies and students seamlessly.",
        pageTitleBooking: "Book Your Pass", pageSubtitleBooking: "Fill in your academic credentials to reserve your checkout ticket securely.",
        
        // Contact Page
        infoSupportTitle: "STUDENT SUPPORT", infoSupportDesc: "For ticket issuance errors or registration bugs.",
        infoVerifyTitle: "SOCIETY VERIFICATION", infoVerifyDesc: "Submit official university NOC or administration portal queries.",
        lblFormName: "Full Name", lblFormEmail: "Official/Student Email", lblFormUni: "University / Institute", lblFormMsg: "Your Message",
        btnSubmit: "Send Message",

        // Booking Page
        lblTier: "Select Ticket Type", tierRegular: "Regular Pass", tierRegularDesc: "Standard access to all tracks", tierPremium: "Premium Pass", tierPremiumDesc: "Front row seat + certificate",
        lblFormCnic: "CNIC / Passport Number", lblFormRoll: "Student Roll / Registration ID", lblFormUniName: "University / Institute Name",
        lblPayment: "Select Payment Method", btnCheckout: "Proceed to Checkout",
        sumTitle: "Order Summary", sumBase: "Base Ticket Fee", sumTax: "Service Tax (0%)", sumTotal: "Total Amount:", 
        sumNote: "* Note: Your ticket includes a custom digital QR asset which will be verified alongside your official University ID at the gate entry checkpost.",

        // How it works
        tabStudent: "For Students", tabOrganizer: "For Organizers",
        studentSteps: [
            { num: "01", title: "Find Your Event", desc: "Filter events by your city, favorite category, or search directly for specific university expos." },
            { num: "02", title: "Get Your Ticket", desc: "Register instantly for free events or secure access via Easypaisa/JazzCash for premium entry passes." },
            { num: "03", title: "Scan & Enter", desc: "Present your digital ticket QR stub at the university gate security counter for rapid digital check-in." }
        ],
        organizerSteps: [
            { num: "01", title: "Submit Event Details", desc: "Fill out the registration layout form, upload the campus poster, and specify tier pricing fields." },
            { num: "02", title: "Verification Verification", desc: "Our desk reviews the alignment data against HEC regulations and verifies the management NOC paper." },
            { num: "03", title: "Live Tracking & Sales", desc: "Your portal goes live to millions of students. Monitor ticket logs and track metrics instantly." }
        ],

        // Footers
        footerTerms: "Terms & Privacy", footerTagline: "Pakistan's campus events, all in one place.", footerExplore: "Explore", footerCompany: "Company",
        footerRights: "© 2026 UniEvents PK. All rights reserved.", dir: "ltr"
    },
    ur: {
        logo: "یونی ایونٹس PK", navHome: "ہوم", navBrowse: "ایونٹس دیکھیں", navHow: "طریقہ کار", navAbout: "ہمارے بارے میں",
        pageTitleTerms: "شرائط و ضوابط", pageSubtitleTerms: "پاکستان میں یونیورسٹی ایونٹس منعقد کرنے اور ان میں شرکت کے قوانین۔",
        pageTitleContact: "رابطہ کریں", pageSubtitleContact: "ایونٹ کی تصدیق، ٹکٹنگ کے مسائل یا سوسائٹی پارٹنرشپ کے بارے میں کوئی بھی سوال ہو؟ ہم مدد کے لیے تیار ہیں۔",
        pageTitleHow: "پلیٹ فارم کیسے کام کرتا ہے؟", pageSubtitleHow: "پاکستان کی بہترین یونیورسٹی سوسائٹیز اور طلباء کو ایک جگہ جوڑنا۔",
        pageTitleBooking: "ٹکٹ بک کریں", pageSubtitleBooking: "اپنی سیکیورٹی رجسٹریشن اور ٹکٹ حاصل کرنے کے لیے تعلیمی اسناد درج کریں۔",
        
        // Contact Page
        infoSupportTitle: "اسٹوڈنٹ سپورٹ", infoSupportDesc: "ٹکٹ کے مسائل یا رجسٹریشن کے دوران آنے والے بگز کے لیے۔",
        infoVerifyTitle: "سوسائٹی ویریفیکیشن", infoVerifyDesc: "یونیورسٹی کا آفیشل NOC یا ایڈمنسٹریشن پورٹل کے سوالات جمع کریں۔",
        lblFormName: "پورا نام", lblFormEmail: "آفیشل / اسٹوڈنٹ ای میل", lblFormUni: "یونیورسٹی / ادارہ", lblFormMsg: "آپ کا پیغام",
        btnSubmit: "پیغام بھیجیں",

        // Booking Page
        lblTier: "ٹکٹ کی قسم منتخب کریں", tierRegular: "ریگولر پاس", tierRegularDesc: "تمام سیشنز تک عام رسائی", tierPremium: "پریمیئم پاس", tierPremiumDesc: "اگلی نشستیں + سرٹیفکیٹ",
        lblFormCnic: "شناختی کارڈ نمبر (CNIC)", lblFormRoll: "رول نمبر / رجسٹریشن آئی ڈی", lblFormUniName: "یونیورسٹی یا ادارے کا نام",
        lblPayment: "طریقہ ادائیگی منتخب کریں", btnCheckout: "چیک آؤٹ پر جائیں",
        sumTitle: "آرڈر کی تفصیلات", sumBase: "ٹکٹ فیس", sumTax: "سروس ٹیکس (0%)", sumTotal: "کل رقم:", 
        sumNote: "* نوٹ: آپ کے ٹکٹ میں ایک مخصوص ڈیجیٹل QR کوڈ شامل ہے، جس کی تصدیق گیٹ اینٹری پر آپ کے آفیشل یونیورسٹی کارڈ کے ساتھ کی جائے گی۔",

        // How it works
        tabStudent: "طلباء کے لیے", tabOrganizer: "آرگنائزرز کے لیے",
        studentSteps: [
            { num: "01", title: "ایونٹ تلاش کریں", desc: "اپنے شہر، پسندیدہ کیٹیگری کے مطابق ایونٹس فلٹر کریں یا مخصوص یونیورسٹی ایکسپو براہ راست سرچ کریں۔" },
            { num: "02", title: "ٹکٹ حاصل کریں", desc: "مفت ایونٹس کے لیے فوری رجسٹر ہوں یا پیڈ پاسز کے لیے ایزی پیسہ/جاز کیش کے ذریعے ادائیگی کریں۔" },
            { num: "03", title: "اسکین کریں اور شامل ہوں", desc: "یونیورسٹی گیٹ پر سیکیورٹی کاؤنٹر پر اپنا ڈیجیٹل QR ٹکٹ دکھائیں اور فوری انٹری حاصل کریں۔" }
        ],
        organizerSteps: [
            { num: "01", title: "تفصیلات جمع کریں", desc: "رجسٹریشن فارم پُر کریں، کیمپس پوسٹر اپ لوڈ کریں اور ٹکٹ کی قیمتیں متعین کریں۔" },
            { num: "02", title: "تصدیقی عمل", desc: "ہماری ٹیم HEC قوانین کے مطابق آپ کے اپ لوڈ کردہ مواد اور یونیورسٹی NOC کی تصدیق کرے گی۔" },
            { num: "03", title: "لائیو ٹریکنگ", desc: "آپ کا ایونٹ پورٹل لائیو ہو جائے گا۔ ٹکٹ سیلز لاگز اور اسٹوڈنٹ ڈیٹا کو ریئل ٹائم مانیٹر کریں۔" }
        ],

        // Footers
        footerTerms: "شرائط و پرائیویسی", footerTagline: "پاکستان کے کیمپس ایونٹس، سب ایک ہی جگہ پر۔", footerExplore: "دیکھیں", footerCompany: "کمپنی",
        footerRights: "© 2026 یونی ایونٹس PK۔ جملہ حقوق محفوظ ہیں۔", dir: "rtl"
    }
};

// 1. Language Swapping Engine
function switchLanguage(lang) {
    state.currentLang = lang;
    const data = translations[lang];
    const htmlTag = document.documentElement || document.getElementById('main-html');
    
    // Translate data attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key] !== undefined) el.innerText = data[key];
    });

    // Handle Layout Alignment Attributes
    if (htmlTag) htmlTag.setAttribute('dir', data.dir);
    
    const nav = document.querySelector('header nav');

    if (lang === 'ur') {
        document.body.classList.add('urdu-font');
        if (nav) nav.classList.add('flex-row-reverse');
        applyTextAlignment('right');
    } else {
        document.body.classList.remove('urdu-font');
        if (nav) nav.classList.remove('flex-row-reverse');
        applyTextAlignment('left');
    }

    // Dynamic Module Triggers
    if (document.getElementById('steps-container')) {
        renderHowItWorksSteps();
    }
}

// Support utility to align page wrappers
function applyTextAlignment(dir) {
    const targets = ['terms-content', 'contact-form', 'info-panel', 'booking-form', 'summary-panel'];
    targets.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.textAlign = dir;
    });
}

// 2. Dynamic Component: How It Works Engine
function renderHowItWorksSteps() {
    const container = document.getElementById('steps-container');
    if (!container) return;

    container.innerHTML = "";
    const key = state.currentRole === 'student' ? 'studentSteps' : 'organizerSteps';
    const steps = translations[state.currentLang][key];

    steps.forEach((step, idx) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = `flex gap-6 items-start ${idx !== steps.length - 1 ? 'border-b border-slate-100 pb-6 mb-6' : ''}`;
        
        stepDiv.innerHTML = `
            <div class="mono text-2xl font-bold text-blue-600 bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">${step.num}</div>
            <div class="min-w-0">
                <h3 class="text-base font-bold text-slate-900 mb-1">${step.title}</h3>
                <p class="text-sm text-slate-500 leading-relaxed">${step.desc}</p>
            </div>
        `;
        container.appendChild(stepDiv);
    });

    // Flip dynamic elements alignment based on localized direction logic
    if (state.currentLang === 'ur') {
        container.querySelectorAll('.flex').forEach(el => el.classList.add('flex-row-reverse'));
    } else {
        container.querySelectorAll('.flex').forEach(el => el.classList.remove('flex-row-reverse'));
    }
}

function switchTab(role) {
    state.currentRole = role;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'bg-white', 'text-slate-700'));
    
    const activeBtn = document.getElementById(`tab-${role}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    renderHowItWorksSteps();
}

// 3. Dynamic Calculator Module: Booking Total Engine
function updateTotal(price) {
    const baseEl = document.getElementById('summary-base');
    const totalEl = document.getElementById('summary-total');
    if (!baseEl || !totalEl) return;
    
    const formatted = parseInt(price).toLocaleString();
    baseEl.innerText = `Rs. ${formatted}`;
    totalEl.innerText = `Rs. ${formatted}`;

    // Highlight Tier Selections Border Visuals
    const regLabel = document.getElementById('tier-reg-label');
    const premLabel = document.getElementById('tier-prem-label');
    if (!regLabel || !premLabel) return;

    if (price === "1500") {
        regLabel.className = "border-2 border-blue-600 bg-blue-50/30 p-4 rounded-xl flex items-start gap-3 cursor-pointer relative";
        premLabel.className = "border border-slate-200 p-4 rounded-xl flex items-start gap-3 cursor-pointer relative hover:border-slate-300";
    } else {
        regLabel.className = "border border-slate-200 p-4 rounded-xl flex items-start gap-3 cursor-pointer relative hover:border-slate-300";
        premLabel.className = "border-2 border-blue-600 bg-blue-50/30 p-4 rounded-xl flex items-start gap-3 cursor-pointer relative";
    }
}

// 4. Initial DOM Lifecycle Loader
document.addEventListener("DOMContentLoaded", () => {
    // Bind Event Switchers to Global Window Object if elements exist
    const langSwitcher = document.getElementById('lang-switcher');
    if (langSwitcher) {
        langSwitcher.addEventListener('change', (e) => switchLanguage(e.target.value));
    }

    // Run layout steps setup if we are on the how-it-works layout view
    if (document.getElementById('steps-container')) {
        renderHowItWorksSteps();
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email')?.value?.trim() || '';
            const password = document.getElementById('password')?.value?.trim() || '';
            if (!email || !password) {
                window.alert('Please enter both email and password.');
                return;
            }
            const button = loginForm.querySelector('[type="submit"]');
            if (button) button.disabled = true;
            try {
                if (!window.UniAPI) throw new Error('Backend is not configured. Set the Supabase URL and anon key in Backend/js/config.js.');
                await window.UniAPI.signIn(email, password);
                window.location.href = postAuthUrl();
            } catch (error) {
                window.alert(error.message || 'Login failed. Please try again.');
                if (button) button.disabled = false;
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('name')?.value?.trim() || '';
            const email = document.getElementById('email')?.value?.trim() || '';
            const password = document.getElementById('password')?.value?.trim() || '';
            if (!name || !email || !password) {
                window.alert('Please fill in all fields.');
                return;
            }
            const button = registerForm.querySelector('[type="submit"]');
            if (button) button.disabled = true;
            try {
                if (!window.UniAPI) throw new Error('Backend is not configured. Set the Supabase URL and anon key in Backend/js/config.js.');
                const result = await window.UniAPI.signUp(name, email, password);
                if (!result.session) {
                    window.alert('Account created. Check your email to confirm it, then log in.');
                    window.location.href = `login.html?next=${encodeURIComponent(postAuthUrl())}`;
                    return;
                }
                window.location.href = postAuthUrl();
            } catch (error) {
                window.alert(error.message || 'Registration failed. Please try again.');
                if (button) button.disabled = false;
            }
        });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const status = document.getElementById('contact-status');
            const button = contactForm.querySelector('[type="submit"]');
            if (button) button.disabled = true;
            try {
                if (!window.UniAPI) throw new Error('Backend is not configured. Set the Supabase URL and anon key in Backend/js/config.js.');
                const values = new FormData(contactForm);
                await window.UniAPI.sendContact({
                    name: values.get('name'),
                    email: values.get('email'),
                    university: values.get('university'),
                    message: values.get('message')
                });
                contactForm.reset();
                if (status) status.textContent = 'Message sent successfully.';
            } catch (error) {
                if (status) status.textContent = error.message || 'Could not send your message.';
            } finally {
                if (button) button.disabled = false;
            }
        });
    }
});

window.UniEventsApp = {
    state,
    switchLanguage,
    renderHowItWorksSteps,
    updateTotal,
    isUserLoggedIn,
    saveUser,
    logoutUser,
    getBookings,
    addBooking,
    clearBookings
};
})();