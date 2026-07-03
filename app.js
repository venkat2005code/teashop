// ==================== APP STATE ====================
const state = {
    currentDir: 'ltr',
    activePage: 'home-1',
    userSubscription: {
        blend: 'Imperial Uji Ceremonial (Okumidori)',
        paused: false,
        frequency: 'monthly'
    },
    tastingJournal: [
        { id: 1, blend: 'Kyoto Spring Harvest', date: '2026-06-01', umami: 5, sweet: 4, astringency: 2, bitter: 2, texture: 4, notes: 'Exceptionally creamy Usucha, thick jade froth, sweet finish.' },
        { id: 2, blend: 'Fukuoka Reserve Yame', date: '2026-06-10', umami: 3, sweet: 4, astringency: 3, bitter: 2, texture: 3, notes: 'Floral bean notes, light texture, slightly nutty finish.' }
    ],
    workshops: [
        { id: 1, topic: 'Introduction to Usucha (Thin Tea)', date: 'June 20, 2026', time: '10:00 AM (JST)', attendee: 'Tasting Master', requests: 'None', status: 'Approved', kitShipped: true }
    ],
    members: [
        { id: 101, name: 'Sarah Jenkins', email: 'sarah@tea.com', tier: 'Ceremonial Scholar', deliveries: 14, status: 'Active' },
        { id: 102, name: 'Hiroshi Tanaka', email: 'hiroshi@chasen.jp', tier: 'Koicha Master', deliveries: 22, status: 'Active' },
        { id: 103, name: 'Elena Rostova', email: 'elena@zen.ru', tier: 'Usucha Novice', deliveries: 3, status: 'Paused' },
        { id: 104, name: 'Alex Wong', email: 'alex@ritual.com', tier: 'Ceremonial Scholar', deliveries: 0, status: 'Pending' }
    ],
    inventory: [
        { id: 'inv-1', name: 'Imperial Uji Matcha', category: 'Matcha', stock: 45, unit: 'Tins (30g)', threshold: 10 },
        { id: 'inv-2', name: 'Fukuoka Reserve', category: 'Matcha', stock: 32, unit: 'Tins (30g)', threshold: 10 },
        { id: 'inv-3', name: 'Organic Nishio Matcha', category: 'Matcha', stock: 8, unit: 'Tins (30g)', threshold: 10 },
        { id: 'inv-4', name: 'Golden Bamboo Scoop', category: 'Accessories', stock: 12, unit: 'Scoops', threshold: 5 },
        { id: 'inv-5', name: 'Traditional Chasen Whisk', category: 'Accessories', stock: 3, unit: 'Whisks', threshold: 8 },
        { id: 'inv-6', name: 'Handmade Chawan Bowl', category: 'Accessories', stock: 15, unit: 'Bowls', threshold: 5 }
    ]
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Sync theme icon with saved preference
    const icon = document.getElementById('theme-icon');
    const mobileThemeIcon = document.getElementById('mobile-theme-icon');
    const userThemeIcon = document.getElementById('dash-theme-icon-user');
    const adminThemeIcon = document.getElementById('dash-theme-icon-admin');
    const loginThemeIcon = document.getElementById('dash-theme-icon-login');
    const registerThemeIcon = document.getElementById('dash-theme-icon-register');
    if (localStorage.getItem('sado-theme') === 'dark') {
        if (icon) icon.setAttribute('data-lucide', 'sun');
        if (mobileThemeIcon) mobileThemeIcon.setAttribute('data-lucide', 'sun');
        if (userThemeIcon) userThemeIcon.setAttribute('data-lucide', 'sun');
        if (adminThemeIcon) adminThemeIcon.setAttribute('data-lucide', 'sun');
        if (loginThemeIcon) loginThemeIcon.setAttribute('data-lucide', 'sun');
        if (registerThemeIcon) registerThemeIcon.setAttribute('data-lucide', 'sun');
        lucide.createIcons();
    }
    
    // Setup initial state configurations
    updateSubBlendDisplay();
    renderTastingNotes();
    renderActiveBookings();
    renderAdminMembers();
    renderAdminInventory();
    renderAdminBookings();
    
    // Draw initial charts
    if(document.getElementById("user-deliveries-chart")) drawUserDeliveriesChart();
    
    // Initialize shade growth preview
    updateShadeSimulation(10);
    
    // Initialize first instrument preview quietly on startup
    showHotspotInfo('chasen', false);
    
    
    // Determine active page from URL
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    for (const [id, url] of Object.entries(pageMap)) {
        if (url === page) {
            state.activePage = id;
            updateNavHighlight(id);
            break;
        }
    }

    // LTR/RTL Listener
    const rtlBtn = document.getElementById('rtl-toggle');
    if (rtlBtn) {
        rtlBtn.addEventListener('click', toggleDirection);
    }
    const mobileRtlBtn = document.getElementById('mobile-rtl-toggle');
    if (mobileRtlBtn) {
        mobileRtlBtn.addEventListener('click', toggleDirection);
    }
});

// ==================== NAVIGATION / ROUTING ====================

const pageMap = {
    'home-1': 'index.html',
    'home-2': 'home-2.html',
    'about': 'about.html',
    'services': 'subscriptions.html',
    'contact': 'contact.html',
    'user-dashboard': 'user-dashboard.html',
    'admin-dashboard': 'admin-dashboard.html',
    'login-page': 'login.html',
    'register-page': 'register.html',
    'tea-experiences': 'services.html',
    'shop': 'shop.html',
    'blog': 'blog.html'
};

function navigateTo(pageId) {
    if (pageMap[pageId]) {
        window.location.href = pageMap[pageId];
    }
}

function updateNavHighlight(pageId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Find matching link based on pageId
    if (pageId === 'home-1' || pageId === 'home-2') {
        document.getElementById('nav-home')?.classList.add('active');
    } else if (pageId === 'about') {
        document.getElementById('nav-about')?.classList.add('active');
    } else if (pageId === 'services') {
        document.getElementById('nav-services')?.classList.add('active');
    } else if (pageId === 'contact') {
        document.getElementById('nav-contact')?.classList.add('active');
    } else if (pageId === 'user-dashboard' || pageId === 'admin-dashboard') {
        document.getElementById('nav-dashboard')?.classList.add('active');
    }
}

// ==================== MOBILE NAVIGATION TOGGLE ====================
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const menuIcon = document.getElementById('mobile-menu-icon');
    if (navMenu) {
        const isActive = navMenu.classList.toggle('active');
        if (menuIcon) {
            menuIcon.setAttribute('data-lucide', isActive ? 'x' : 'menu');
            lucide.createIcons();
        }
    }
}

// ==================== LTR/RTL DIRECTION TOGGLE ====================
function toggleDirection() {
    const html = document.documentElement;
    const rtlBtn = document.getElementById('rtl-toggle');
    const mobileRtlBtn = document.getElementById('mobile-rtl-toggle');
    const userRtlBtn = document.getElementById('user-dash-rtl-toggle');
    const adminRtlBtn = document.getElementById('admin-dash-rtl-toggle');
    const loginRtlBtn = document.getElementById('login-dash-rtl-toggle');
    const registerRtlBtn = document.getElementById('register-dash-rtl-toggle');
    
    if (html.dir === 'rtl') {
        html.dir = 'ltr';
        html.classList.remove('rtl-mode');
        state.currentDir = 'ltr';
        if (rtlBtn) rtlBtn.textContent = 'LTR';
        if (mobileRtlBtn) mobileRtlBtn.textContent = 'LTR';
        if (userRtlBtn) userRtlBtn.textContent = 'LTR';
        if (adminRtlBtn) adminRtlBtn.textContent = 'LTR';
        if (loginRtlBtn) loginRtlBtn.textContent = 'LTR';
        if (registerRtlBtn) registerRtlBtn.textContent = 'LTR';
    } else {
        html.dir = 'rtl';
        html.classList.add('rtl-mode');
        state.currentDir = 'rtl';
        if (rtlBtn) rtlBtn.textContent = 'RTL';
        if (mobileRtlBtn) mobileRtlBtn.textContent = 'RTL';
        if (userRtlBtn) userRtlBtn.textContent = 'RTL';
        if (adminRtlBtn) adminRtlBtn.textContent = 'RTL';
        if (loginRtlBtn) loginRtlBtn.textContent = 'RTL';
        if (registerRtlBtn) registerRtlBtn.textContent = 'RTL';
    }
    
    // Re-draw active charts
    redrawActiveDashboardCharts();
}

// ==================== DARK / LIGHT THEME TOGGLE ====================
function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    const mobileThemeIcon = document.getElementById('mobile-theme-icon');
    const userThemeIcon = document.getElementById('dash-theme-icon-user');
    const adminThemeIcon = document.getElementById('dash-theme-icon-admin');
    const loginThemeIcon = document.getElementById('dash-theme-icon-login');
    const registerThemeIcon = document.getElementById('dash-theme-icon-register');
    const isDark = html.getAttribute('data-theme') === 'dark';

    if (isDark) {
        // Switch to light
        html.removeAttribute('data-theme');
        if (icon) icon.setAttribute('data-lucide', 'moon');
        if (mobileThemeIcon) mobileThemeIcon.setAttribute('data-lucide', 'moon');
        if (userThemeIcon) userThemeIcon.setAttribute('data-lucide', 'moon');
        if (adminThemeIcon) adminThemeIcon.setAttribute('data-lucide', 'moon');
        if (loginThemeIcon) loginThemeIcon.setAttribute('data-lucide', 'moon');
        if (registerThemeIcon) registerThemeIcon.setAttribute('data-lucide', 'moon');
        lucide.createIcons();
        localStorage.setItem('sado-theme', 'light');
    } else {
        // Switch to dark
        html.setAttribute('data-theme', 'dark');
        if (icon) icon.setAttribute('data-lucide', 'sun');
        if (mobileThemeIcon) mobileThemeIcon.setAttribute('data-lucide', 'sun');
        if (userThemeIcon) userThemeIcon.setAttribute('data-lucide', 'sun');
        if (adminThemeIcon) adminThemeIcon.setAttribute('data-lucide', 'sun');
        if (loginThemeIcon) loginThemeIcon.setAttribute('data-lucide', 'sun');
        if (registerThemeIcon) registerThemeIcon.setAttribute('data-lucide', 'sun');
        lucide.createIcons();
        localStorage.setItem('sado-theme', 'dark');
    }
    
    // Re-draw active charts
    redrawActiveDashboardCharts();
}

function redrawActiveDashboardCharts() {
    if (state.activePage === 'user-dashboard') {
        const activeTab = document.querySelector('#user-dashboard .dash-tab-pane.active');
        if (activeTab) {
            const tabId = activeTab.id;
            if (tabId === 'user-deliveries') if(document.getElementById("user-deliveries-chart")) drawUserDeliveriesChart();
            else if (tabId === 'user-brewing') drawUserBrewingChart();
            else if (tabId === 'user-tasting') { drawSlidersRadarChart(); drawUserJournalChart(); }
            else if (tabId === 'user-workshops') drawUserWorkshopsChart();
            else if (tabId === 'user-orders') drawUserOrdersChart();
            else if (tabId === 'user-rewards') drawUserRewardsChart();
            else if (tabId === 'user-settings') drawUserSettingsChart();
        }
    } else if (state.activePage === 'admin-dashboard') {
        const activeTab = document.querySelector('#admin-dashboard .dash-tab-pane.active');
        if (activeTab) {
            const tabId = activeTab.id;
            if (tabId === 'admin-members') drawAdminMembersChart();
            else if (tabId === 'admin-inventory') drawAdminInventoryChart();
            else if (tabId === 'admin-bookings') drawAdminBookingsChart();
            else if (tabId === 'admin-analytics') { drawAdminMembershipChart(); drawAdminCategoryChart(); }
            else if (tabId === 'admin-orders') drawAdminOrdersChart();
            else if (tabId === 'admin-sourcing') drawAdminSourcingChart();
            else if (tabId === 'admin-staff') drawAdminStaffChart();
        }
    }
}

// Apply saved theme preference on load
(function applySavedTheme() {
    const saved = localStorage.getItem('sado-theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();


// ==================== TOAST NOTIFICATIONS ====================
function addNotification(message) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span>${message}</span>
        <i data-lucide="x" class="notification-close" onclick="this.parentElement.remove()"></i>
    `;
    
    container.appendChild(notification);
    lucide.createIcons();
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.35s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ==================== INSTRUMENT HOTSPOTS ====================
function showHotspotInfo(id, triggerNotification = true) {
    const displayCard = document.getElementById('hotspot-display');
    if (!displayCard) return;
    const defaultText = displayCard.querySelector('.hotspot-default-text');
    const detailPanel = document.getElementById('hotspot-detail');
    
    const title = document.getElementById('hotspot-title');
    const desc = document.getElementById('hotspot-desc');
    const zen = document.getElementById('hotspot-zen');
    
    const data = {
        chasen: {
            title: 'Chasen (竹茶筅) - The Bamboo Whisk',
            desc: 'Carved out of a single tube of seasoned bamboo, the chasen has 80 to 100 curved, micro-split tines. It is designed to fully suspend matcha particles in hot water, creating a velvety foam that reduces perceived bitterness.',
            zen: 'Sei (Purity) - Rinsing is performed with meditative attention to detail.'
        },
        chawan: {
            title: 'Chawan (抹茶碗) - The Tea Bowl',
            desc: 'Unlike mugs, ceramic chawans feature flat, wide bases that permit swift whisking, and high walls that restrain splashes. Their coarse volcanic clays insulate the hot tea, warming the hands of the guest during colder ceremonies.',
            zen: 'Wa (Harmony) - Seasonal glazes match the surrounding gardens.'
        },
        chashaku: {
            title: 'Chashaku (茶杓) - The Bamboo Scoop',
            desc: 'Bent using steam over a charcoal fire, the chashaku measures exactly 1 gram of matcha. Traditional tea masters often name their scoops (chashaku-mei) to reflect seasonal expressions or Buddhist concepts.',
            zen: 'Kei (Respect) - Handled with precise vertical orientation.'
        }
    };
    
    if (data[id]) {
        if (defaultText) defaultText.classList.add('hidden');
        if (detailPanel) detailPanel.classList.remove('hidden');
        if (title) title.textContent = data[id].title;
        if (desc) desc.textContent = data[id].desc;
        if (zen) zen.textContent = data[id].zen;
        
        if (triggerNotification) {
            addNotification(`Details loaded for ${id.charAt(0).toUpperCase() + id.slice(1)}`);
        }
    }
}

function showInstrumentDetail(btn, id) {
    // Remove active state from other items
    document.querySelectorAll('.instrument-selector-item').forEach(el => el.classList.remove('active-selector'));
    // Add active state to clicked item
    btn.classList.add('active-selector');
    // Call original hotspot function
    showHotspotInfo(id);
}

// ==================== HOME 2 PHILOSOPHY TABS ====================
function switchPhilosophyTab(tabId) {
    // Reset tab buttons
    const tabBtns = document.querySelectorAll('.philosophy-tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Find the clicked button and activate it
    const activeBtn = Array.from(tabBtns).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (activeBtn) activeBtn.classList.add('active');
    
    // Reset tab contents
    const panes = document.querySelectorAll('.philosophy-pane');
    panes.forEach(pane => pane.classList.remove('active'));
    
    // Show selected pane
    const targetPane = document.getElementById(`phi-${tabId}`);
    if (targetPane) targetPane.classList.add('active');
}

// ==================== SHADE SIMULATION SLIDER ====================
function updateShadeSimulation(val) {
    const label = document.getElementById('shade-days-val');
    const leaf = document.getElementById('leaf-preview');
    const descTitle = document.getElementById('shade-title-desc');
    const descP = document.getElementById('shade-p-desc');
    const shadeImg = document.getElementById('shade-showcase-img');
    
    const barChlorophyll = document.getElementById('bar-chlorophyll');
    const barTheanine = document.getElementById('bar-theanine');
    const barCatechins = document.getElementById('bar-catechins');
    
    label.textContent = `${val} Days`;
    
    if (val == 0) {
        leaf.style.backgroundColor = 'hsl(78, 45%, 52%)';
        descTitle.textContent = 'Unshaded Green Tea (Sencha)';
        descP.textContent = 'Bushes receive maximum sunlight. Catechins are abundant, rendering a highly astringent, dry taste. Green is pale with a yellow hue.';
        // Open sunny tea field — unique to this stage
        if (shadeImg) shadeImg.src = 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=500';

        barChlorophyll.style.width = '15%';
        barTheanine.style.width = '10%';
        barCatechins.style.width = '100%';
    } else if (val == 10) {
        leaf.style.backgroundColor = 'hsl(90, 40%, 45%)';
        descTitle.textContent = 'Slightly Shaded Tea (Kabusecha)';
        descP.textContent = 'Bushes shaded for 10 days. The conversion of sweet amino acids slows. Color becomes a lighter pea-green. Flavor is fresh and moderately earthy.';
        // Light shade net rows — unique to this stage
        if (shadeImg) shadeImg.src = 't8.jpg';

        barChlorophyll.style.width = '40%';
        barTheanine.style.width = '30%';
        barCatechins.style.width = '70%';
    } else if (val == 20) {
        leaf.style.backgroundColor = 'hsl(105, 38%, 32%)';
        descTitle.textContent = 'Ceremonial Grade Shading';
        descP.textContent = 'Shaded for 20 days. Chlorophyll rises, giving the leaves a deeper forest shade. L-theanine surges, creating high umami with mild bitterness.';
        // Dense covered tarp farming — unique to this stage
        if (shadeImg) shadeImg.src = 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=500';

        barChlorophyll.style.width = '75%';
        barTheanine.style.width = '70%';
        barCatechins.style.width = '40%';
    } else if (val >= 30) {
        leaf.style.backgroundColor = 'hsl(118, 42%, 24%)';
        descTitle.textContent = 'Imperial Grade Shade-Grown';
        descP.textContent = 'Shaded for a full 30 days under black nets and straw. Catechins drop drastically. The result is pure, creamy sweetness (Koicha grade) with a vivid jade color.';
        // Black net canopy Tencha rows — unique to this stage
        if (shadeImg) shadeImg.src = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=500';

        barChlorophyll.style.width = '100%';
        barTheanine.style.width = '100%';
        barCatechins.style.width = '15%';
    }
}

// ==================== BREWING TIMER LOGIC ====================
let timerInterval = null;
let timerTimeLeft = 30;
const timerProgressCircle = document.getElementById('timer-progress-ring');
const timerDisplay = document.getElementById('timer-time');
const whiskIcon = document.getElementById('whisk-icon');

function startWhiskTimer() {
    if (timerInterval) return;
    
    document.getElementById('btn-timer-start').disabled = true;
    document.getElementById('btn-timer-pause').disabled = false;
    whiskIcon.classList.add('whisking-active');
    
    addNotification('Whisking started! Move your wrist in a swift M/W motion.');
    
    timerInterval = setInterval(() => {
        timerTimeLeft--;
        timerDisplay.textContent = timerTimeLeft;
        
        // Progress Ring calculation (Radius = 72, Circumference = 452.39)
        const progress = (30 - timerTimeLeft) / 30;
        const offset = 452.39 - (progress * 452.39);
        timerProgressCircle.style.strokeDashoffset = offset;
        
        if (timerTimeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            whiskIcon.classList.remove('whisking-active');
            document.getElementById('btn-timer-start').disabled = false;
            document.getElementById('btn-timer-pause').disabled = true;
            addNotification('Timer completed! Enjoy your perfect froth.');
            // Play a audio mock sound
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
                oscillator.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.3);
            } catch(e) {}
        }
    }, 1000);
}

function pauseWhiskTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    whiskIcon.classList.remove('whisking-active');
    document.getElementById('btn-timer-start').disabled = false;
    document.getElementById('btn-timer-pause').disabled = true;
    addNotification('Whisking timer paused.');
}

function resetWhiskTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerTimeLeft = 30;
    timerDisplay.textContent = '30';
    timerProgressCircle.style.strokeDashoffset = '0';
    whiskIcon.classList.remove('whisking-active');
    document.getElementById('btn-timer-start').disabled = false;
    document.getElementById('btn-timer-pause').disabled = true;
    addNotification('Timer reset to 30 seconds.');
}

// ==================== TASTING JOURNAL RADAR CHART ====================
function drawSlidersRadarChart(activeNote = null) {
    const canvas = document.getElementById('flavor-radar-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 80;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Define metrics
    const metrics = ['Umami', 'Sweetness', 'Astringency', 'Bitterness', 'Texture'];
    const numPoints = metrics.length;
    
    // Determine slider values
    let values = [];
    if (activeNote) {
        values = [activeNote.umami, activeNote.sweet, activeNote.astringency, activeNote.bitter, activeNote.texture];
    } else {
        values = [
            parseFloat(document.getElementById('sl-umami')?.value || 3),
            parseFloat(document.getElementById('sl-sweet')?.value || 3),
            parseFloat(document.getElementById('sl-astringency')?.value || 2),
            parseFloat(document.getElementById('sl-bitter')?.value || 2),
            parseFloat(document.getElementById('sl-texture')?.value || 3)
        ];
    }
    
    // Draw concentric scale rings (Grid)
    ctx.strokeStyle = 'rgba(35, 52, 37, 0.15)';
    ctx.lineWidth = 1;
    for (let r = 1; r <= 5; r++) {
        const currentRadius = (r / 5) * radius;
        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
            const x = cx + currentRadius * Math.cos(angle);
            const y = cy + currentRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // Draw axis lines and labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '10px var(--font-sans)';
    ctx.fillStyle = 'var(--text-muted)';
    
    for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
        // Axis line
        const ax = cx + radius * Math.cos(angle);
        const ay = cy + radius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        
        // Label position
        const lx = cx + (radius + 20) * Math.cos(angle);
        const ly = cy + (radius + 12) * Math.sin(angle);
        ctx.fillText(metrics[i], lx, ly);
    }
    
    // Plot flavor value polygon
    ctx.fillStyle = 'rgba(35, 52, 37, 0.35)'; // Translucent Moss Green
    ctx.strokeStyle = 'var(--accent)'; // Gold Border
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < numPoints; i++) {
        const value = values[i];
        const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
        const valRadius = (value / 5) * radius;
        const px = cx + valRadius * Math.cos(angle);
        const py = cy + valRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function updateSlidersChart() {
    drawSlidersRadarChart();
}

function renderTastingNotes() {
    const list = document.getElementById('journal-notes-list');
    if (!list) return;
    
    list.innerHTML = '';
    state.tastingJournal.forEach(note => {
        const card = document.createElement('div');
        card.className = 'journal-note-item';
        card.style.cursor = 'pointer';
        card.onclick = () => {
            drawSlidersRadarChart(note);
            addNotification(`Viewing flavor wheel for ${note.blend}`);
        };
        card.innerHTML = `
            <h5>${note.blend}</h5>
            <div class="meta-row">
                <span>Date: ${note.date}</span>
                <span>Umami: ${note.umami}/5 • Sweet: ${note.sweet}/5</span>
            </div>
            <p>${note.notes}</p>
        `;
        list.appendChild(card);
    });
}

function addTastingNote(event) {
    event.preventDefault();
    const blend = document.getElementById('t-blend').value;
    const notes = document.getElementById('t-notes').value;
    
    const umami = parseInt(document.getElementById('sl-umami').value);
    const sweet = parseInt(document.getElementById('sl-sweet').value);
    const astringency = parseInt(document.getElementById('sl-astringency').value);
    const bitter = parseInt(document.getElementById('sl-bitter').value);
    const texture = parseInt(document.getElementById('sl-texture').value);
    
    const today = new Date().toISOString().split('T')[0];
    
    const newNote = {
        id: Date.now(),
        blend,
        date: today,
        umami,
        sweet,
        astringency,
        bitter,
        texture,
        notes
    };
    
    state.tastingJournal.unshift(newNote);
    renderTastingNotes();
    addNotification('Tasting session logged in journal!');
    
    // Clear form
    document.getElementById('t-blend').value = '';
    document.getElementById('t-notes').value = '';
    drawSlidersRadarChart();
}

// ==================== WORKSHOP BOOKINGS ====================
function renderActiveBookings() {
    const list = document.getElementById('user-bookings-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (state.workshops.length === 0) {
        list.innerHTML = `<p class="text-muted">No workshops scheduled yet.</p>`;
        return;
    }
    
    state.workshops.forEach(booking => {
        const item = document.createElement('div');
        item.className = 'booking-item-card';
        item.innerHTML = `
            <h4>${booking.topic}</h4>
            <div class="booking-meta-row">
                <span>Date: ${booking.date} • ${booking.time}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="kit-badge">${booking.kitShipped ? 'Tea Kit Dispatched' : 'Kit preparing'}</span>
                <span class="status-badge" style="background-color: ${booking.status === 'Approved' ? 'var(--primary)' : 'var(--accent)'}; color: var(--text-light);">${booking.status}</span>
            </div>
            <i data-lucide="trash-2" class="cancel-booking-btn" onclick="cancelWorkshopBooking(${booking.id})" title="Cancel Booking"></i>
        `;
        list.appendChild(item);
    });
    lucide.createIcons();
}

function bookWorkshop(event) {
    event.preventDefault();
    const topic = document.getElementById('w-select').value;
    const attendee = document.getElementById('w-name').value;
    const requests = document.getElementById('w-notes').value || 'None';
    
    // parse date out of selection
    const datePart = topic.substring(topic.lastIndexOf(' - ') + 3);
    const dateText = datePart ? `${datePart}, 2026` : 'July 15, 2026';
    
    const newBooking = {
        id: Date.now(),
        topic: topic.split(' - ')[0],
        date: dateText,
        time: '11:00 AM (EST)',
        attendee,
        requests,
        status: 'Pending Approval',
        kitShipped: false
    };
    
    state.workshops.push(newBooking);
    renderActiveBookings();
    renderAdminBookings();
    addNotification('Workshop booking request submitted!');
    
    // Clear Form
    document.getElementById('w-name').value = '';
    document.getElementById('w-notes').value = '';
}

function cancelWorkshopBooking(id) {
    state.workshops = state.workshops.filter(b => b.id !== id);
    renderActiveBookings();
    renderAdminBookings();
    addNotification('Workshop registration cancelled.');
}

// ==================== SUBSCRIPTION SETTINGS ====================
function updateSubBlend(val) {
    state.userSubscription.blend = val;
    updateSubBlendDisplay();
    addNotification(`Your upcoming box blend is set to ${val.split(' (')[0]}`);
}

function updateSubBlendDisplay() {
    const display = document.getElementById('user-sub-blend');
    if (display) {
        display.textContent = `${state.userSubscription.blend} (30g tin)`;
    }
}

function toggleSubscriptionPause() {
    const btn = document.getElementById('pause-sub-btn');
    state.userSubscription.paused = !state.userSubscription.paused;
    
    if (state.userSubscription.paused) {
        btn.textContent = 'Resume Membership';
        btn.className = 'btn btn-primary';
        addNotification('Your tea subscription has been paused.');
    } else {
        btn.textContent = 'Pause Membership';
        btn.className = 'btn btn-outline';
        addNotification('Your tea subscription is now active.');
    }
}

// ==================== DASHBOARD PROFILE DROPDOWN ====================
function toggleProfileMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (!menu) return;
    const isOpen = menu.classList.contains('open');
    // Close all profile menus first
    document.querySelectorAll('.dash-profile-menu').forEach(m => m.classList.remove('open'));
    if (!isOpen) menu.classList.add('open');
}

// Close profile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dash-profile-dropdown')) {
        document.querySelectorAll('.dash-profile-menu').forEach(m => m.classList.remove('open'));
    }
});

// ==================== LOGIN MODAL CONTROLS ====================
function openLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.classList.remove('hidden');
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.classList.add('hidden');
}

function closeLoginModalOnOverlay(event) {
    if (event.target.id === 'login-modal') {
        closeLoginModal();
    }
}

function handleLogin(event) {
    event.preventDefault();
    const pageEmail = document.getElementById('login-page-email');
    const modalEmail = document.getElementById('login-email');
    const email = (pageEmail ? pageEmail.value : (modalEmail ? modalEmail.value : ''));
    
    closeLoginModal();
    
    // Simple admin redirect simulation
    if (email.toLowerCase().startsWith('admin')) {
        addNotification('Welcome back, administrator!');
        navigateTo('admin-dashboard');
    } else {
        addNotification(`Welcome back to the Tea Club!`);
        navigateTo('user-dashboard');
    }
}

function handleContactSubmit(event) {
    event.preventDefault();
    addNotification('Your message has been delivered to our tea experts!');
    document.getElementById('contact-form').reset();
}

// ==================== ADMINISTRATIVE VIEW ACTIONS ====================
function renderAdminMembers() {
    const tbody = document.getElementById('admin-members-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    state.members.forEach(member => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${member.name}</strong><br>
                <small class="text-muted">${member.email}</small>
            </td>
            <td>${member.tier}</td>
            <td>${member.deliveries} boxes</td>
            <td><span class="status-badge" style="background-color: ${member.status === 'Active' ? 'var(--primary)' : member.status === 'Paused' ? 'var(--accent)' : 'var(--text-muted)'}">${member.status}</span></td>
            <td>
                <button class="btn btn-outline-dark btn-sm" onclick="toggleMemberStatus(${member.id})">${member.status === 'Active' ? 'Pause' : 'Activate'}</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleMemberStatus(memberId) {
    const member = state.members.find(m => m.id === memberId);
    if (member) {
        member.status = member.status === 'Active' ? 'Paused' : 'Active';
        renderAdminMembers();
        addNotification(`Status updated for member ${member.name}`);
        
        // Update KPI counter
        const activeCount = state.members.filter(m => m.status === 'Active').length;
        document.getElementById('admin-kpi-active').textContent = activeCount * 96; // scale multiplier
    }
}

function renderAdminInventory() {
    const grid = document.getElementById('admin-inventory-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    let lowStockCount = 0;
    
    state.inventory.forEach(item => {
        const isLow = item.stock <= item.threshold;
        if (isLow) lowStockCount++;
        
        const card = document.createElement('div');
        card.className = 'card inventory-card';
        card.innerHTML = `
            <span class="status-badge" style="background-color: ${isLow ? 'var(--red)' : 'var(--primary)'}; color: var(--text-light);">${isLow ? 'LOW STOCK' : 'IN STOCK'}</span>
            <h3 class="margin-top-sm">${item.name}</h3>
            <p class="text-muted">Category: ${item.category}</p>
            <div class="flex justify-between items-center margin-top-sm">
                <span>Stock Level:</span>
                <span class="inv-stock-val" id="stock-val-${item.id}">${item.stock}</span>
            </div>
            <div class="inv-adjust-row">
                <button class="btn btn-outline-dark btn-sm flex-grow" onclick="adjustStock('${item.id}', -1)" aria-label="Decrease stock">-1</button>
                <button class="btn btn-outline-dark btn-sm flex-grow" onclick="adjustStock('${item.id}', 1)" aria-label="Increase stock">+1</button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    // Update KPI counter
    document.getElementById('admin-kpi-low-stock').textContent = `${lowStockCount} Items`;
}

function adjustStock(itemId, amount) {
    const item = state.inventory.find(i => i.id === itemId);
    if (item) {
        item.stock = Math.max(0, item.stock + amount);
        renderAdminInventory();
        addNotification(`Stock adjusted for ${item.name}`);
    }
}

function renderAdminBookings() {
    const tbody = document.getElementById('admin-bookings-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    state.workshops.forEach(booking => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${booking.attendee}</strong></td>
            <td>${booking.topic}</td>
            <td>${booking.requests}</td>
            <td><span class="status-badge" style="background-color: ${booking.status === 'Approved' ? 'var(--primary)' : 'var(--accent)'}; color: var(--text-light);">${booking.status}</span></td>
            <td>
                ${booking.status !== 'Approved' ? 
                    `<button class="btn btn-primary btn-sm" onclick="approveBooking(${booking.id})">Approve</button>` : 
                    `<button class="btn btn-outline-dark btn-sm" onclick="approveBooking(${booking.id}, 'Pending Approval')">Pending</button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Update KPI workshops count
    const pendingCount = state.workshops.filter(w => w.status !== 'Approved').length;
    document.getElementById('admin-kpi-workshops').textContent = state.workshops.length;
}

function approveBooking(id, customStatus = 'Approved') {
    const booking = state.workshops.find(w => w.id === id);
    if (booking) {
        booking.status = customStatus;
        if (customStatus === 'Approved') {
            booking.kitShipped = true;
            addNotification(`Booking approved! Ceremony Kit marked as shipped for ${booking.attendee}`);
        } else {
            booking.kitShipped = false;
            addNotification(`Booking set to pending approval.`);
        }
        renderAdminBookings();
        renderActiveBookings();
    }
}

// ==================== DYNAMIC CHARTS (PURE HTML5 CANVAS) ====================
function drawAdminMembershipChart() {
    const canvas = document.getElementById('membership-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    
    // Chart padding
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Data (Jan to Jun growth)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const values = [120, 150, 210, 260, 310, 384];
    const maxVal = 400;
    
    // Draw grid lines (Horizontal)
    ctx.strokeStyle = colors.gridColor;
    ctx.lineWidth = 1;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.textMuted;
    ctx.font = '10px var(--font-sans)';
    
    for (let i = 0; i <= 4; i++) {
        const yVal = (i / 4) * maxVal;
        const y = padding.top + chartHeight - (i / 4) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        ctx.fillText(yVal, padding.left - 8, y);
    }
    
    // Plot Line and Area
    const points = [];
    for (let i = 0; i < values.length; i++) {
        const x = padding.left + (i / (values.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (values[i] / maxVal) * chartHeight;
        points.push({ x, y });
    }
    
    // Fill Area under line (Gradient)
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    const primaryColor = colors.primary;
    gradient.addColorStop(0, primaryColor === '#bda26b' ? 'rgba(189, 162, 107, 0.25)' : 'rgba(35, 52, 37, 0.2)');
    gradient.addColorStop(1, primaryColor === '#bda26b' ? 'rgba(189, 162, 107, 0.01)' : 'rgba(35, 52, 37, 0.01)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Draw Line
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    // Draw points & labels
    ctx.fillStyle = colors.accent;
    points.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Draw Month Labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = colors.textMuted;
    months.forEach((month, i) => {
        const x = padding.left + (i / (months.length - 1)) * chartWidth;
        ctx.fillText(month, x, padding.top + chartHeight + 8);
    });
}

function drawAdminCategoryChart() {
    const canvas = document.getElementById('category-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 20, bottom: 30, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Horizontal Bar Chart
    const categories = ['Matcha Tins', 'Accessories', 'Workshops'];
    const values = [12400, 3900, 2150]; // Revenue splits
    const maxVal = 15000;
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '10px var(--font-sans)';
    
    const numBars = categories.length;
    const barSpacing = chartHeight / numBars;
    const barHeight = barSpacing * 0.6;
    
    for (let i = 0; i < numBars; i++) {
        const y = padding.top + (i * barSpacing) + (barSpacing / 2);
        
        // Label
        ctx.fillStyle = colors.text;
        ctx.fillText(categories[i], padding.left - 12, y);
        
        // Bar background
        ctx.fillStyle = colors.barBg;
        ctx.beginPath();
        ctx.roundRect(padding.left, y - (barHeight / 2), chartWidth, barHeight, 4);
        ctx.fill();
        
        // Bar fill
        const fillWidth = (values[i] / maxVal) * chartWidth;
        ctx.fillStyle = i === 0 ? colors.primary : i === 1 ? colors.accent : colors.primaryLight;
        ctx.beginPath();
        ctx.roundRect(padding.left, y - (barHeight / 2), fillWidth, barHeight, 4);
        ctx.fill();
        
        // Value Text
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'left';
        ctx.fillText(`$${values[i]}`, padding.left + fillWidth + 8, y);
        ctx.textAlign = 'right'; // reset align
    }
}

// ==================== ACCESSIBILITY & TABS FOR INNER SCREENS ====================
function toggleDashSidebar(dashboardId) {
    const dashboard = document.getElementById(dashboardId);
    if (!dashboard) return;
    const sidebar = dashboard.querySelector('.dash-sidebar');
    if (!sidebar) return;
    
    sidebar.classList.toggle('active');
    
    const menuToggleIcon = dashboard.querySelector('.dash-mobile-menu-toggle i');
    if (menuToggleIcon) {
        const isSidebarActive = sidebar.classList.contains('active');
        menuToggleIcon.setAttribute('data-lucide', isSidebarActive ? 'x' : 'menu');
        lucide.createIcons();
    }
}

function switchDashboardTab(element, tabId) {
    // Reset side links active style
    const links = document.querySelectorAll('#user-dashboard .dash-nav-link');
    links.forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    
    // Close dashboard mobile menu drawer if open
    const sidebar = document.querySelector('#user-dashboard .dash-sidebar');
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        const menuToggleIcon = document.querySelector('#user-dashboard .dash-mobile-menu-toggle i');
        if (menuToggleIcon) {
            menuToggleIcon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        }
    }
    
    // Reset dashboard tabs
    const tabPanes = document.querySelectorAll('#user-dashboard .dash-tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Show selected pane
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    }
    
    // Update breadcrumb
    const tabName = element.querySelector('span')?.textContent || 'Matcha Deliveries';
    const breadcrumb = document.getElementById('user-dash-breadcrumb');
    if (breadcrumb) breadcrumb.textContent = tabName;
    
    // Trigger tab-specific drawing
    if (tabId === 'user-deliveries') {
        if(document.getElementById("user-deliveries-chart")) drawUserDeliveriesChart();
    } else if (tabId === 'user-brewing') {
        drawUserBrewingChart();
    } else if (tabId === 'user-tasting') {
        drawSlidersRadarChart();
        drawUserJournalChart();
    } else if (tabId === 'user-workshops') {
        drawUserWorkshopsChart();
    } else if (tabId === 'user-orders') {
        drawUserOrdersChart();
    } else if (tabId === 'user-rewards') {
        drawUserRewardsChart();
    } else if (tabId === 'user-settings') {
        drawUserSettingsChart();
    }
}

function switchAdminTab(element, tabId) {
    // Reset side links active style
    const links = document.querySelectorAll('#admin-dashboard .dash-nav-link');
    links.forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    
    // Close dashboard mobile menu drawer if open
    const sidebar = document.querySelector('#admin-dashboard .dash-sidebar');
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        const menuToggleIcon = document.querySelector('#admin-dashboard .dash-mobile-menu-toggle i');
        if (menuToggleIcon) {
            menuToggleIcon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        }
    }
    
    // Reset dashboard tabs
    const tabPanes = document.querySelectorAll('#admin-dashboard .dash-tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Show selected pane
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    }
    
    // Update breadcrumb
    const tabName = element.querySelector('span')?.textContent || 'Manage Members';
    const breadcrumb = document.getElementById('admin-dash-breadcrumb');
    if (breadcrumb) breadcrumb.textContent = tabName;
    
    // Trigger tab-specific drawing
    if (tabId === 'admin-members') {
        drawAdminMembersChart();
    } else if (tabId === 'admin-inventory') {
        drawAdminInventoryChart();
    } else if (tabId === 'admin-bookings') {
        drawAdminBookingsChart();
    } else if (tabId === 'admin-analytics') {
        drawAdminMembershipChart();
        drawAdminCategoryChart();
    } else if (tabId === 'admin-orders') {
        drawAdminOrdersChart();
    } else if (tabId === 'admin-sourcing') {
        drawAdminSourcingChart();
    } else if (tabId === 'admin-staff') {
        drawAdminStaffChart();
    }
}

// Get computed theme colors helper
function getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        primary: isDark ? '#bda26b' : '#233425',
        primaryLight: isDark ? '#d5c29d' : '#557c56',
        accent: '#bda26b',
        text: isDark ? '#f9f7f2' : '#233425',
        textMuted: isDark ? '#a8b0a9' : '#888888',
        gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(35, 52, 37, 0.08)',
        barBg: isDark ? '#243226' : '#f0f4f1'
    };
}

// Draw standard axes helper
function drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, steps, labels, colors, direction = 'ltr') {
    ctx.strokeStyle = colors.gridColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = colors.textMuted;
    ctx.font = '10px var(--font-sans)';
    
    // Y-axis grid & labels
    ctx.textBaseline = 'middle';
    if (direction === 'rtl') {
        ctx.textAlign = 'left';
        for (let i = 0; i <= steps; i++) {
            const yVal = Math.round((i / steps) * maxVal);
            const y = padding.top + chartHeight - (i / steps) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
            ctx.fillText(yVal, padding.left + chartWidth + 8, y);
        }
    } else {
        ctx.textAlign = 'right';
        for (let i = 0; i <= steps; i++) {
            const yVal = Math.round((i / steps) * maxVal);
            const y = padding.top + chartHeight - (i / steps) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
            ctx.fillText(yVal, padding.left - 8, y);
        }
    }
    
    // X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    labels.forEach((label, i) => {
        const x = padding.left + (i / (labels.length - 1)) * chartWidth;
        ctx.fillText(label, x, padding.top + chartHeight + 8);
    });
}

// 1. Subscription Delivery Frequency Chart (User Tab 1)
function drawUserDeliveriesChart() {
    const canvas = document.getElementById('user-deliveries-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const deliveries = [1, 1, 2, 1, 2, 2]; // tins per month
    const maxVal = 3;
    
    drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, 3, months, colors, state.currentDir);
    
    // Plot Line
    const points = [];
    for (let i = 0; i < deliveries.length; i++) {
        const x = padding.left + (i / (deliveries.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (deliveries[i] / maxVal) * chartHeight;
        points.push({ x, y });
    }
    
    // Area
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    grad.addColorStop(0, 'rgba(189, 162, 107, 0.25)');
    grad.addColorStop(1, 'rgba(189, 162, 107, 0.01)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Line
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    // Points
    ctx.fillStyle = colors.primary;
    points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });
}

// 2. Brew Temperature Consistency Chart (User Tab 2)
function drawUserBrewingChart() {
    const canvas = document.getElementById('user-brewing-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const brews = ['Brew 1', 'Brew 2', 'Brew 3', 'Brew 4', 'Brew 5'];
    const temps = [78, 82, 80, 81, 80]; // target is 80
    const maxVal = 100;
    
    drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, 4, brews, colors, state.currentDir);
    
    // Target Line (80 degrees)
    const targetY = padding.top + chartHeight - (80 / maxVal) * chartHeight;
    ctx.strokeStyle = 'rgba(235, 94, 85, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, targetY);
    ctx.lineTo(padding.left + chartWidth, targetY);
    ctx.stroke();
    ctx.setLineDash([]); // reset
    
    // Draw columns
    const numBars = temps.length;
    const barWidth = (chartWidth / numBars) * 0.4;
    ctx.fillStyle = colors.primaryLight;
    
    for (let i = 0; i < numBars; i++) {
        const x = padding.left + (i / (numBars - 1)) * chartWidth - (barWidth / 2);
        const y = padding.top + chartHeight - (temps[i] / maxVal) * chartHeight;
        const barH = padding.top + chartHeight - y;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 3);
        ctx.fill();
        
        // Temp text
        ctx.fillStyle = colors.text;
        ctx.font = '9px var(--font-sans)';
        ctx.textAlign = 'center';
        ctx.fillText(`${temps[i]}°C`, x + barWidth / 2, y - 8);
        ctx.fillStyle = colors.primaryLight; // reset
    }
}

// 3. Tasting Frequency Analytics Chart (User Tab 3)
function drawUserJournalChart() {
    const canvas = document.getElementById('user-journal-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 15, right: 15, bottom: 25, left: 30 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const months = ['Mar', 'Apr', 'May', 'Jun'];
    const sessionCounts = [4, 6, 9, 12];
    const maxVal = 15;
    
    drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, 3, months, colors, state.currentDir);
    
    // Draw line
    const points = [];
    for (let i = 0; i < sessionCounts.length; i++) {
        const x = padding.left + (i / (sessionCounts.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (sessionCounts[i] / maxVal) * chartHeight;
        points.push({ x, y });
    }
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    ctx.fillStyle = colors.accent;
    points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// 4. Chado Skills Mastery Program Chart (User Tab 4)
function drawUserWorkshopsChart() {
    const canvas = document.getElementById('user-workshops-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const cx = width / 2;
    const cy = height / 2;
    const radius = 65;
    
    const skills = ['Usucha', 'Koicha', 'Philosophy', 'Utensils', 'Host Etiquette'];
    const levels = [4, 3, 2, 4, 3]; // 1-5 levels
    const numPoints = skills.length;
    
    // Draw rings
    ctx.strokeStyle = colors.gridColor;
    ctx.lineWidth = 1;
    for (let r = 1; r <= 5; r++) {
        const curR = (r / 5) * radius;
        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
            const x = cx + curR * Math.cos(angle);
            const y = cy + curR * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // Labels
    ctx.font = '10px var(--font-sans)';
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
        const ax = cx + radius * Math.cos(angle);
        const ay = cy + radius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        
        const lx = cx + (radius + 20) * Math.cos(angle);
        const ly = cy + (radius + 10) * Math.sin(angle);
        ctx.fillText(skills[i], lx, ly);
    }
    
    // Skill polygon
    ctx.fillStyle = 'rgba(85, 124, 86, 0.3)';
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
        const valR = (levels[i] / 5) * radius;
        const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
        const px = cx + valR * Math.cos(angle);
        const py = cy + valR * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 5. Monthly Tea Spending Chart (User Tab 5)
function drawUserOrdersChart() {
    const canvas = document.getElementById('user-orders-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 20, bottom: 25, left: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const months = ['Mar', 'Apr', 'May', 'Jun'];
    const spending = [38, 65, 38, 32];
    const maxVal = 80;
    
    drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, 4, months, colors, state.currentDir);
    
    // Columns
    const numBars = spending.length;
    const barWidth = (chartWidth / numBars) * 0.45;
    ctx.fillStyle = colors.accent;
    
    for (let i = 0; i < numBars; i++) {
        const x = padding.left + (i / (numBars - 1)) * chartWidth - (barWidth / 2);
        const y = padding.top + chartHeight - (spending[i] / maxVal) * chartHeight;
        const barH = padding.top + chartHeight - y;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 4);
        ctx.fill();
        
        ctx.fillStyle = colors.text;
        ctx.font = '10px var(--font-sans)';
        ctx.textAlign = 'center';
        ctx.fillText(`$${spending[i]}`, x + barWidth / 2, y - 6);
        ctx.fillStyle = colors.accent; // reset
    }
}

// 6. Point Accrual Analytics Chart (User Tab 6)
function drawUserRewardsChart() {
    const canvas = document.getElementById('user-rewards-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 20, bottom: 25, left: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const dates = ['1/1', '2/15', '4/1', '5/20', '6/10'];
    const points = [100, 150, 220, 290, 350];
    const maxVal = 400;
    
    drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, 4, dates, colors, state.currentDir);
    
    // Area & Line
    const pts = [];
    for (let i = 0; i < points.length; i++) {
        const x = padding.left + (i / (points.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (points[i] / maxVal) * chartHeight;
        pts.push({ x, y });
    }
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    
    ctx.fillStyle = colors.primary;
    pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// 7. Account Session Logs Chart (User Tab 7)
function drawUserSettingsChart() {
    const canvas = document.getElementById('user-settings-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 20, bottom: 25, left: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const logs = ['Log 1', 'Log 2', 'Log 3', 'Log 4', 'Log 5'];
    const durations = [12, 18, 5, 25, 14]; // active minutes
    const maxVal = 30;
    
    drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, 3, logs, colors, state.currentDir);
    
    ctx.fillStyle = colors.primaryLight;
    const numBars = durations.length;
    const barWidth = (chartWidth / numBars) * 0.4;
    
    for (let i = 0; i < numBars; i++) {
        const x = padding.left + (i / (durations.length - 1)) * chartWidth - (barWidth / 2);
        const y = padding.top + chartHeight - (durations[i] / maxVal) * chartHeight;
        const barH = padding.top + chartHeight - y;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 3);
        ctx.fill();
    }
}

// 8. Member Subscription Tiers Chart (Admin Tab 1)
function drawAdminMembersChart() {
    const canvas = document.getElementById('admin-members-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 20, bottom: 30, left: 95 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const tiers = ['Koicha Master', 'Ceremonial Scholar', 'Usucha Novice'];
    const counts = [84, 182, 118];
    const maxVal = 200;
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '10px var(--font-sans)';
    
    const numBars = tiers.length;
    const barSpacing = chartHeight / numBars;
    const barHeight = barSpacing * 0.5;
    
    for (let i = 0; i < numBars; i++) {
        const y = padding.top + (i * barSpacing) + (barSpacing / 2);
        
        ctx.fillStyle = colors.text;
        ctx.fillText(tiers[i], padding.left - 12, y);
        
        // Background track
        ctx.fillStyle = colors.barBg;
        ctx.beginPath();
        ctx.roundRect(padding.left, y - (barHeight / 2), chartWidth, barHeight, 4);
        ctx.fill();
        
        // Fill bar
        const fillW = (counts[i] / maxVal) * chartWidth;
        ctx.fillStyle = i === 0 ? colors.primary : i === 1 ? colors.accent : colors.primaryLight;
        ctx.beginPath();
        ctx.roundRect(padding.left, y - (barHeight / 2), fillW, barHeight, 4);
        ctx.fill();
        
        // Count text
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'left';
        ctx.fillText(`${counts[i]} members`, padding.left + fillW + 8, y);
        ctx.textAlign = 'right'; // reset
    }
}

// 9. Stock Levels vs Reorder Thresholds Chart (Admin Tab 2)
function drawAdminInventoryChart() {
    const canvas = document.getElementById('admin-inventory-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const items = ['Uji Tin', 'Fukuoka', 'Nishio', 'Scoop', 'Whisk', 'Bowl'];
    const stocks = [45, 32, 8, 12, 3, 15];
    const thresholds = [10, 10, 10, 5, 8, 5];
    const maxVal = 50;
    
    drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, 5, items, colors, state.currentDir);
    
    const numBars = items.length;
    const barWidth = (chartWidth / numBars) * 0.35;
    
    for (let i = 0; i < numBars; i++) {
        const groupX = padding.left + (i / (numBars - 1)) * chartWidth;
        
        // Stock Bar
        const x1 = groupX - barWidth - 2;
        const y1 = padding.top + chartHeight - (stocks[i] / maxVal) * chartHeight;
        const h1 = padding.top + chartHeight - y1;
        ctx.fillStyle = stocks[i] <= thresholds[i] ? 'var(--red)' : colors.primary;
        ctx.beginPath();
        ctx.roundRect(x1, y1, barWidth, h1, 3);
        ctx.fill();
        
        // Threshold Bar
        const x2 = groupX + 2;
        const y2 = padding.top + chartHeight - (thresholds[i] / maxVal) * chartHeight;
        const h2 = padding.top + chartHeight - y2;
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.roundRect(x2, y2, barWidth, h2, 3);
        ctx.fill();
    }
}

// 10. Workshop Bookings by Topic Chart (Admin Tab 3)
function drawAdminBookingsChart() {
    const canvas = document.getElementById('admin-bookings-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 20, bottom: 30, left: 110 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const topics = ['Usucha Intro', 'Chado Philosophy', 'Koicha Ritual', 'Craft Pottery'];
    const signups = [14, 8, 11, 6];
    const maxVal = 20;
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '10px var(--font-sans)';
    
    const numBars = topics.length;
    const barSpacing = chartHeight / numBars;
    const barHeight = barSpacing * 0.5;
    
    for (let i = 0; i < numBars; i++) {
        const y = padding.top + (i * barSpacing) + (barSpacing / 2);
        
        ctx.fillStyle = colors.text;
        ctx.fillText(topics[i], padding.left - 12, y);
        
        ctx.fillStyle = colors.barBg;
        ctx.beginPath();
        ctx.roundRect(padding.left, y - (barHeight / 2), chartWidth, barHeight, 4);
        ctx.fill();
        
        const fillW = (signups[i] / maxVal) * chartWidth;
        ctx.fillStyle = colors.primaryLight;
        ctx.beginPath();
        ctx.roundRect(padding.left, y - (barHeight / 2), fillW, barHeight, 4);
        ctx.fill();
        
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'left';
        ctx.fillText(`${signups[i]} booked`, padding.left + fillW + 8, y);
        ctx.textAlign = 'right'; // reset
    }
}

// 11. Order Volume Trends Chart (Admin Tab 5)
function drawAdminOrdersChart() {
    const canvas = document.getElementById('admin-orders-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 30, bottom: 25, left: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const dates = ['6/01', '6/04', '6/07', '6/10', '6/13'];
    const orders = [8, 15, 11, 24, 18];
    const maxVal = 30;
    
    drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, 3, dates, colors, state.currentDir);
    
    const pts = [];
    for (let i = 0; i < orders.length; i++) {
        const x = padding.left + (i / (orders.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (orders[i] / maxVal) * chartHeight;
        pts.push({ x, y });
    }
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    
    ctx.fillStyle = colors.accent;
    pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// 12. Cultivar Annual Yield Split Chart (Admin Tab 6)
function drawAdminSourcingChart() {
    const canvas = document.getElementById('admin-sourcing-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 20, bottom: 25, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const cultivars = ['Okumidori', 'Samidori', 'Yabukita'];
    const yields = [520, 410, 310]; // kg harvested
    const maxVal = 600;
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '10px var(--font-sans)';
    
    const numBars = cultivars.length;
    const barSpacing = chartHeight / numBars;
    const barHeight = barSpacing * 0.55;
    
    for (let i = 0; i < numBars; i++) {
        const y = padding.top + (i * barSpacing) + (barSpacing / 2);
        
        ctx.fillStyle = colors.text;
        ctx.fillText(cultivars[i], padding.left - 12, y);
        
        ctx.fillStyle = colors.barBg;
        ctx.beginPath();
        ctx.roundRect(padding.left, y - (barHeight / 2), chartWidth, barHeight, 4);
        ctx.fill();
        
        const fillW = (yields[i] / maxVal) * chartWidth;
        ctx.fillStyle = i === 0 ? colors.primary : i === 1 ? colors.primaryLight : colors.accent;
        ctx.beginPath();
        ctx.roundRect(padding.left, y - (barHeight / 2), fillW, barHeight, 4);
        ctx.fill();
        
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'left';
        ctx.fillText(`${yields[i]} kg`, padding.left + fillW + 8, y);
        ctx.textAlign = 'right'; // reset
    }
}

// 13. Administrative Actions Volume Chart (Admin Tab 7)
function drawAdminStaffChart() {
    const canvas = document.getElementById('admin-staff-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const colors = getThemeColors();
    const padding = { top: 20, right: 30, bottom: 25, left: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const actions = [14, 25, 18, 30, 22];
    const maxVal = 40;
    
    drawChartAxes(ctx, padding, chartWidth, chartHeight, maxVal, 4, days, colors, state.currentDir);
    
    const pts = [];
    for (let i = 0; i < actions.length; i++) {
        const x = padding.left + (i / (actions.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (actions[i] / maxVal) * chartHeight;
        pts.push({ x, y });
    }
    
    ctx.strokeStyle = colors.primaryLight;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    
    ctx.fillStyle = colors.accent;
    pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Helper polyfill for roundRect in older canvas environments
if (typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x+r, y);
        this.arcTo(x+w, y,   x+w, y+h, r);
        this.arcTo(x+w, y+h, x,   y+h, r);
        this.arcTo(x,   y+h, x,   y,   r);
        this.arcTo(x,   y,   x+w, y,   r);
        this.closePath();
        return this;
    };
}

// ==================== INTERACTIVE LEAFLET MAP ====================
let contactMap = null;
let mapMarkers = {};

function initContactMap() {
    const mapContainer = document.getElementById('contact-map');
    if (!mapContainer) return;
    
    if (contactMap) {
        // If map already exists, invalidate size so it fits container correctly
        setTimeout(() => {
            contactMap.invalidateSize();
        }, 150);
        return;
    }
    
    // Create map centered on Kyoto Gion
    contactMap = L.map('contact-map').setView([35.0037, 135.7782], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(contactMap);
    
    // Add markers
    mapMarkers.kyoto = L.marker([35.0037, 135.7782]).addTo(contactMap)
        .bindPopup('<b>Sado Kyoto Tea House</b><br>15 Gionmachi Minamigawa, Kyoto');
        
    mapMarkers.sf = L.marker([37.7884, -122.4093]).addTo(contactMap)
        .bindPopup('<b>Sado San Francisco Ritual Room</b><br>450 Post St, San Francisco');
        
    // Invalidate size on first load
    setTimeout(() => {
        contactMap.invalidateSize();
    }, 150);
}

function showMapLocation(locationKey) {
    if (!contactMap) {
        initContactMap();
    }
    
    const coords = {
        kyoto: [35.0037, 135.7782],
        sf: [37.7884, -122.4093]
    };
    
    if (coords[locationKey]) {
        contactMap.setView(coords[locationKey], 15);
        mapMarkers[locationKey].openPopup();
        addNotification(`Map centered on Sado ${locationKey === 'kyoto' ? 'Kyoto' : 'San Francisco'} location.`);
    }
}

// Auto-initialize map if present on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('contact-map')) {
        initContactMap();
    }
});

// Highlight active navigation link
document.addEventListener('DOMContentLoaded', () => {
    // Get the current page filename
    let path = window.location.pathname;
    let page = path.split("/").pop();
    
    // Default to index.html if root
    if (page === '') {
        page = 'index.html';
    }

    // Find all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Loop through links and add active class if href matches current page
    navLinks.forEach(link => {
        // Get the href attribute
        const href = link.getAttribute('href');
        if (href && href === page) {
            link.classList.add('active');
            
            // If this link is inside a dropdown menu, also highlight the parent dropdown toggle
            const parentDropdown = link.closest('.nav-item.dropdown');
            if (parentDropdown) {
                const toggle = parentDropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.classList.add('active');
            }
        }
    });
});
