// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navButtons = document.querySelector('.nav-buttons');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        navButtons.classList.toggle('active');
    });
}

// Counter Animation
function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-target')) || 0;
    const duration = 2000; // 2 seconds animation duration
    let startTime = null;

    function update(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // cubic ease-out: f(t) = 1 - (1 - t)^3
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeProgress * target);

        counter.innerText = currentCount.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            counter.innerText = target.toLocaleString();
        }
    }

    requestAnimationFrame(update);
}

// Intersection Observer for stats cards with elegant staggering and entry transitions
const statsSection = document.querySelector('.stats');
const statCards = document.querySelectorAll('.stat-card');

if (statsSection && statCards.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('visible');
                        const counter = card.querySelector('.counter');
                        if (counter) {
                            animateCounter(counter);
                        }
                    }, index * 150); // 150ms stagger between each card
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    statsObserver.observe(statsSection);
} else {
    // Fallback for counters on other pages if any exist
    const counters = document.querySelectorAll('.counter');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(counter => counterObserver.observe(counter));
    }
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        try {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } catch (err) {
            console.error('Invalid selector:', href, err);
        }
    });
});

// Form Validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            showError(input, 'This field is required');
        } else {
            clearError(input);
        }
    });

    // Email validation
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
            isValid = false;
            showError(emailInput, 'Please enter a valid email address');
        }
    }

    // Phone validation
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput && phoneInput.value) {
        const phonePattern = /^[\d\s\-\+\(\)]{10,}$/;
        if (!phonePattern.test(phoneInput.value)) {
            isValid = false;
            showError(phoneInput, 'Please enter a valid phone number');
        }
    }

    return isValid;
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    let errorElement = formGroup.querySelector('.error-message');

    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        errorElement.style.display = 'block';
        formGroup.appendChild(errorElement);
    }

    errorElement.textContent = message;
    input.style.borderColor = '#e74c3c';
}

function clearError(input) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    const errorElement = formGroup.querySelector('.error-message');

    if (errorElement) {
        errorElement.remove();
    }

    input.style.borderColor = '#e0e0e0';
}

// Add form validation to all forms
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function (e) {
        if (!validateForm(this)) {
            e.preventDefault();
        }
    });
});

// Search Functionality
const searchForm = document.querySelector('.search-form');
if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        performSearch();
    });
}

function performSearch() {
    const bloodGroup = document.getElementById('bloodGroup')?.value || '';
    const location = document.getElementById('location')?.value || '';
    const type = document.getElementById('type')?.value || 'all';

    // Fetch from real search API
    fetch(`/api/search?bloodGroup=${encodeURIComponent(bloodGroup)}&location=${encodeURIComponent(location)}&type=${encodeURIComponent(type)}`)
        .then(res => res.json())
        .then(data => {
            showSearchResults(data);
        })
        .catch(err => {
            console.error('Error performing search:', err);
        });
}

function showSearchResults(results) {
    const resultsContainer = document.querySelector('.results-grid');
    if (!resultsContainer) return;

    const countContainer = document.querySelector('.results-section strong');
    if (countContainer) {
        countContainer.textContent = results.length;
    }

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--bg-light); border-radius: 12px; color: var(--text-light);">
                <i class="fas fa-search" style="font-size: 36px; margin-bottom: 10px; color: #cbd5e1;"></i>
                <p>No matches found. Try widening your search filters or selecting 'All' blood types.</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = results.map(result => `
        <div class="result-card" id="card-${Math.random().toString(36).substr(2, 9)}">
            <div class="result-header">
                <div class="blood-type-badge">${result.bloodType}</div>
                <div class="result-info">
                    <h4>${result.name}</h4>
                    <p>${result.category}</p>
                </div>
            </div>
            <div class="result-details">
                <p><i class="fas fa-info-circle"></i> ${result.details}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${result.location}</p>
                <p><i class="fas fa-phone"></i> ${result.phone}</p>
                <p><i class="fas fa-clock"></i> ${result.extra}</p>
            </div>
            ${result.category === 'Blood Donor' ? `
                <button class="btn btn-outline btn-block" onclick="contactDonor('${result.name}')">
                    <i class="fas fa-envelope"></i> Contact Donor
                </button>
            ` : `
                <button class="btn btn-primary btn-block" onclick="requestBloodDirect('${result.name}', '${result.bloodType}')">
                    <i class="fas fa-tint"></i> Request Blood
                </button>
            `}
        </div>
    `).join('');
}

function requestBloodDirect(bankName, bloodGroup) {
    window.location.href = `request.html?bloodGroup=${encodeURIComponent(bloodGroup)}&hospitalName=${encodeURIComponent(bankName)}`;
}

window.requestBloodDirect = requestBloodDirect;

window.contactDonor = function(donorName) {
    showAlert(`Your contact request has been sent to ${donorName}. They will receive your details and reach out shortly!`, 'success');
};

window.requestBlood = function(bankName) {
    showAlert(`Blood request successfully submitted to ${bankName}. We will notify you when approved.`, 'success');
};

// Alert Messages / Toast Notifications
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        margin: 10px;
    `;

    // Inject CSS animation if not already present
    if (!document.getElementById('alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideIn 0.3s reverse ease-in';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Global state variables
let currentUser = null;
let userDonations = [];
let userRequests = [];

// Compatibility rules data structure
const bloodCompatibility = {
    'A+': { give: ['A+', 'AB+'], receive: ['A+', 'A-', 'O+', 'O-'] },
    'A-': { give: ['A+', 'A-', 'AB+', 'AB-'], receive: ['A-', 'O-'] },
    'B+': { give: ['B+', 'AB+'], receive: ['B+', 'B-', 'O+', 'O-'] },
    'B-': { give: ['B+', 'B-', 'AB+', 'AB-'], receive: ['B-', 'O-'] },
    'AB+': { give: ['AB+'], receive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    'AB-': { give: ['AB+', 'AB-'], receive: ['A-', 'B-', 'AB-', 'O-'] },
    'O+': { give: ['A+', 'B+', 'AB+', 'O+'], receive: ['O+', 'O-'] },
    'O-': { give: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], receive: ['O-'] }
};

// Eligibility Quiz Questions
const quizQuestions = [
    {
        q: "Are you aged between 17 and 65 years?",
        tip: "Standard regulatory requirement for blood donation safety.",
        yesScore: 1,
        noScore: 0
    },
    {
        q: "Do you weigh at least 50 kg (110 lbs)?",
        tip: "A healthy weight ensures safe fluid depletion ratios.",
        yesScore: 1,
        noScore: 0
    },
    {
        q: "Have you had a tattoo or ear/body piercing in the last 12 months?",
        tip: "Prevents potential infectious disease transmissions.",
        yesScore: 0,
        noScore: 1
    },
    {
        q: "Are you currently feeling completely well, healthy, and active today?",
        tip: "We cannot accept donors who have a cold, fever, or feel unwell.",
        yesScore: 1,
        noScore: 0
    },
    {
        q: "Have you taken oral antibiotics in the last 7 days?",
        tip: "Bacterial infections must be fully cleared before donating.",
        yesScore: 0,
        noScore: 1
    },
    {
        q: "Have you traveled outside the country in the last 6 months?",
        tip: "Used to screen for endemic diseases like malaria or dengue.",
        yesScore: 0,
        noScore: 1
    }
];

let quizCurrentStep = 0;
let quizAnswers = [];

// Dashboard Canvas Blood Dropping and Dripping Animation
function initDashboardAnimation() {
    const canvas = document.getElementById('dashboard-bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;

    // Handle resizing gracefully
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            width = canvas.width = entry.contentRect.width || canvas.parentElement.offsetWidth;
            height = canvas.height = entry.contentRect.height || canvas.parentElement.offsetHeight;
        }
    });
    if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
    }

    const drops = [];
    const splashes = [];
    const maxDrops = 35;

    class BloodDrop {
        constructor(isInteractive = false, ix = 0, iy = 0) {
            this.reset(isInteractive, ix, iy);
        }

        reset(isInteractive = false, ix = 0, iy = 0) {
            this.x = isInteractive ? ix : Math.random() * width;
            this.y = isInteractive ? iy : -20 - Math.random() * 120;
            this.radius = Math.random() * 4 + 3; // 3 to 7px radius
            this.speed = Math.random() * 1.5 + 1.2; // vertical falling speed
            this.gravity = 0.05 + Math.random() * 0.04;
            this.opacity = Math.random() * 0.45 + 0.35; // transparency for background subtlety
            this.color = Math.random() > 0.4 ? '#c0392b' : '#e74c3c'; // rich deep red & bright red
            this.tailLength = Math.random() * 15 + 10;
        }

        update() {
            this.speed += this.gravity;
            this.y += this.speed;

            // Collision with bottom of screen or virtual pool
            if (this.y > height - 10) {
                // Trigger splash particles
                const particleCount = Math.floor(Math.random() * 4) + 3;
                for (let i = 0; i < particleCount; i++) {
                    splashes.push(new SplashParticle(this.x, height - 10, this.color));
                }
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowColor = 'rgba(192, 41, 43, 0.4)';
            ctx.shadowBlur = 4;

            // Draw perfect stylized teardrop
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.tailLength);
            // Control points for droplet shape
            ctx.quadraticCurveTo(this.x + this.radius * 1.2, this.y, this.x, this.y + this.radius);
            ctx.quadraticCurveTo(this.x - this.radius * 1.2, this.y, this.x, this.y - this.tailLength);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    class SplashParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = -Math.random() * 3 - 1;
            this.radius = Math.random() * 1.8 + 0.8;
            this.gravity = 0.12;
            this.opacity = 1.0;
            this.decay = Math.random() * 0.03 + 0.02;
        }

        update() {
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= this.decay;
        }

        draw() {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Populate initial drops
    for (let i = 0; i < maxDrops; i++) {
        const drop = new BloodDrop();
        // pre-warm positions so they don't all start at the top
        drop.y = Math.random() * height;
        drops.push(drop);
    }

    // Interactivity: Spawn on click
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        // Burst of drops cascading
        for (let i = 0; i < 8; i++) {
            const extraDrop = new BloodDrop(true, mx + (Math.random() - 0.5) * 40, my - Math.random() * 30);
            extraDrop.speed = Math.random() * 1 + 0.5;
            drops.push(extraDrop);
            if (drops.length > 70) drops.shift(); // bound max interactive drops
        }
    });

    let mouseX = -1000;
    let mouseY = -1000;
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Subtle bottom reservoir glow
        const reservoirGlow = ctx.createLinearGradient(0, height - 30, 0, height);
        reservoirGlow.addColorStop(0, 'rgba(231, 76, 60, 0.0)');
        reservoirGlow.addColorStop(1, 'rgba(192, 41, 43, 0.08)');
        ctx.fillStyle = reservoirGlow;
        ctx.fillRect(0, height - 30, width, 30);

        // Update and draw drops
        for (let i = 0; i < drops.length; i++) {
            const drop = drops[i];
            drop.update();
            drop.draw();

            // Wind/Repel from mouse
            if (mouseX > -200 && mouseY > -200) {
                const dx = mouseX - drop.x;
                const dy = mouseY - drop.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 100) {
                    // Push drop away horizontally
                    drop.x -= (dx / dist) * 1.5;
                }
            }
        }

        // Update and draw splash particles
        for (let i = splashes.length - 1; i >= 0; i--) {
            const splash = splashes[i];
            splash.update();
            if (splash.opacity <= 0) {
                splashes.splice(i, 1);
            } else {
                splash.draw();
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// Side links event routing
const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        sidebarLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        const section = this.getAttribute('data-section');
        loadDashboardSection(section);
    });
});

function calculateDaysSinceLast(donationsList) {
    if (!donationsList || donationsList.length === 0) return 'N/A';
    const completed = donationsList.filter(d => d.status === 'Completed' || d.status === 'Approved');
    if (completed.length === 0) return 'N/A';
    
    completed.sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));
    const lastDate = new Date(completed[0].donationDate);
    const diffTime = Math.abs(new Date() - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getDonorStatus(count) {
    if (count >= 5) return 'Gold';
    if (count >= 3) return 'Silver';
    if (count >= 1) return 'Bronze';
    return 'Active';
}

function selectCompatNode(bloodGroup) {
    const compatibility = bloodCompatibility[bloodGroup];
    if (!compatibility) return;

    // Highlight selected node
    document.querySelectorAll('.compat-node').forEach(node => {
        node.className = 'compat-node';
        const type = node.getAttribute('data-type');
        if (type === bloodGroup) {
            node.classList.add('active-selection');
        } else if (compatibility.give.includes(type)) {
            node.classList.add('compatible-give');
        } else if (compatibility.receive.includes(type)) {
            node.classList.add('compatible-receive');
        }
    });

    // Update info cards
    const giveToContainer = document.getElementById('matcher-give-to');
    const receiveFromContainer = document.getElementById('matcher-receive-from');
    if (giveToContainer) {
        giveToContainer.innerHTML = compatibility.give.map(g => `<span class="status-badge approved" style="font-weight: 600; font-size: 14px; padding: 6px 14px;">${g}</span>`).join(' ');
    }
    if (receiveFromContainer) {
        receiveFromContainer.innerHTML = compatibility.receive.map(r => `<span class="status-badge" style="background-color: rgba(52, 152, 219, 0.15); color: #2980b9; font-weight: 600; font-size: 14px; padding: 6px 14px;">${r}</span>`).join(' ');
    }
}

window.selectCompatNode = selectCompatNode;

function handleQuizAnswer(answer) {
    quizAnswers.push(answer);
    if (quizCurrentStep < quizQuestions.length - 1) {
        quizCurrentStep++;
        renderQuizStep();
    } else {
        submitQuizResults();
    }
}

window.handleQuizAnswer = handleQuizAnswer;

function renderQuizStep() {
    const qContainer = document.getElementById('quiz-question-card');
    if (!qContainer) return;

    const question = quizQuestions[quizCurrentStep];
    const progressPercent = ((quizCurrentStep) / quizQuestions.length) * 100;
    
    const progressFill = document.querySelector('.quiz-progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }

    qContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--primary-color);">Question ${quizCurrentStep + 1} of ${quizQuestions.length}</span>
            <span style="font-size: 12px; color: var(--text-light); font-weight: 500;">Step ${quizCurrentStep + 1}</span>
        </div>
        <h3 style="font-size: 20px; color: var(--text-dark); margin-bottom: 12px; line-height: 1.4;">${question.q}</h3>
        <p style="font-size: 14px; color: var(--text-light); background: #f8fafc; border-left: 3px solid #cbd5e1; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <i class="fas fa-info-circle" style="color: #64748b; margin-right: 6px;"></i> ${question.tip}
        </p>
        <div class="quiz-options">
            <button class="quiz-btn" onclick="handleQuizAnswer(true)">Yes</button>
            <button class="quiz-btn" onclick="handleQuizAnswer(false)">No</button>
        </div>
    `;
}

async function submitQuizResults() {
    const progressFill = document.querySelector('.quiz-progress-fill');
    if (progressFill) {
        progressFill.style.width = '100%';
    }

    // Evaluate score
    let score = 0;
    for (let i = 0; i < quizQuestions.length; i++) {
        const question = quizQuestions[i];
        const answer = quizAnswers[i];
        if (answer === true && question.yesScore === 1) score++;
        if (answer === false && question.noScore === 1) score++;
    }

    const isEligible = score === quizQuestions.length;
    const status = isEligible ? 'Eligible' : 'Ineligible';

    const qContainer = document.getElementById('quiz-question-card');
    if (!qContainer) return;

    qContainer.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
            <div style="width: 70px; height: 70px; border-radius: 50%; background: ${isEligible ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i class="fas fa-${isEligible ? 'check-circle' : 'times-circle'}" style="font-size: 38px; color: ${isEligible ? 'var(--accent-color)' : 'var(--primary-color)'};"></i>
            </div>
            <h3 style="font-size: 22px; margin-bottom: 10px;">${isEligible ? 'Congratulations!' : 'Thank you for your response'}</h3>
            <p style="font-size: 15px; color: var(--text-light); max-width: 480px; margin: 0 auto 24px; line-height: 1.6;">
                ${isEligible 
                    ? "Your health parameters fit the requirements. You are eligible to donate! You have unlocked the <strong>'Safe Donor' badge</strong>." 
                    : "Unfortunately, based on the standard screening criteria, you are not eligible to donate at this time. Please contact a clinical supervisor for a detailed review."}
            </p>
            <button class="btn btn-primary" onclick="loadDashboardSection('eligibility')">Retake Quiz</button>
        </div>
    `;

    // Save score to backend persistent database
    try {
        const response = await fetch('/api/eligibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score, status })
        });
        const data = await response.json();
        if (data.success) {
            currentUser.eligibilityScore = score;
            currentUser.eligibilityStatus = status;
            // Unlock badge
            showAlert('Eligibility check submitted and recorded successfully!', 'success');
        }
    } catch (e) {
        console.error('Error saving quiz results:', e);
    }
}

window.pledgeToDonate = async function(requestId) {
    try {
        const response = await fetch('/api/pledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId })
        });
        const data = await response.json();
        if (data.success) {
            showAlert('Thank you so much! Your pledge was submitted successfully. An appointment has been scheduled.', 'success');
            
            // Refresh local user data
            const res = await fetch('/api/user-data');
            const records = await res.json();
            userDonations = records.donations;
            userRequests = records.requests;
            
            loadDashboardSection('urgent');
        } else {
            showAlert(data.error || 'Failed to submit pledge.', 'error');
        }
    } catch (e) {
        console.error(e);
        showAlert('Could not register pledge due to a server connection error.', 'error');
    }
};

function loadDashboardSection(section) {
    const contentArea = document.querySelector('.dashboard-content');
    if (!contentArea || !currentUser) return;

    // Reset quiz state when leaving quiz section
    if (section !== 'eligibility') {
        quizCurrentStep = 0;
        quizAnswers = [];
    }

    if (section === 'overview') {
        const daysSinceLast = calculateDaysSinceLast(userDonations);
        const nextEligibleText = typeof daysSinceLast === 'number' && daysSinceLast < 90
            ? `You will be eligible to donate again in ${90 - daysSinceLast} days.`
            : `You are fully eligible to donate blood! Schedule your appointment today.`;

        // Calculate custom premium responsive SVG tracking chart data
        const sortedDonations = [...userDonations]
            .filter(d => d.status === 'Completed' || d.status === 'Approved')
            .sort((a, b) => new Date(a.donationDate) - new Date(b.donationDate));

        let chartPointsHtml = '';
        let chartGridHtml = '';
        let chartLabelsHtml = '';
        let cumulativeVolume = 0;
        const volumeTrend = [];

        sortedDonations.forEach((d) => {
            cumulativeVolume += (d.unitsNeeded || 1) * 450;
            volumeTrend.push({
                date: new Date(d.donationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: cumulativeVolume
            });
        });

        const svgWidth = 640;
        const svgHeight = 220;
        const paddingLeft = 60;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 40;
        const chartW = svgWidth - paddingLeft - paddingRight;
        const chartH = svgHeight - paddingTop - paddingBottom;
        const maxVal = Math.max(cumulativeVolume, 1000);
        const points = [];

        if (volumeTrend.length === 0) {
            points.push({ x: paddingLeft, y: paddingTop + chartH });
            points.push({ x: paddingLeft + chartW, y: paddingTop + chartH });
        } else if (volumeTrend.length === 1) {
            points.push({ x: paddingLeft, y: paddingTop + chartH });
            points.push({ x: paddingLeft + chartW, y: paddingTop + chartH - (volumeTrend[0].value / maxVal) * chartH, date: volumeTrend[0].date, value: volumeTrend[0].value });
        } else {
            volumeTrend.forEach((pt, i) => {
                const x = paddingLeft + (i / (volumeTrend.length - 1)) * chartW;
                const y = paddingTop + chartH - (pt.value / maxVal) * chartH;
                points.push({ x, y, date: pt.date, value: pt.value });
            });
        }

        const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

        for (let j = 0; j <= 4; j++) {
            const gridY = paddingTop + (j / 4) * chartH;
            const gridVal = Math.round(maxVal - (j / 4) * maxVal);
            chartGridHtml += `
                <line x1="${paddingLeft}" y1="${gridY}" x2="${paddingLeft + chartW}" y2="${gridY}" stroke="#e2e8f0" stroke-dasharray="3,3" />
                <text x="${paddingLeft - 8}" y="${gridY + 4}" fill="#64748b" font-size="10" font-family="system-ui" text-anchor="end">${gridVal} mL</text>
            `;
        }

        if (volumeTrend.length === 0) {
            chartLabelsHtml += `
                <text x="${paddingLeft + chartW/2}" y="${paddingTop + chartH + 20}" fill="#94a3b8" font-size="11" font-family="system-ui" text-anchor="middle">Schedule your first donation to begin tracking health stats</text>
            `;
        } else {
            points.forEach((p, i) => {
                if (p.date) {
                    chartLabelsHtml += `
                        <text x="${p.x}" y="${paddingTop + chartH + 20}" fill="#64748b" font-size="10" font-family="system-ui" text-anchor="middle">${p.date}</text>
                    `;
                    chartPointsHtml += `
                        <circle cx="${p.x}" cy="${p.y}" r="5" fill="#e74c3c" stroke="#ffffff" stroke-width="2" class="chart-point-node" style="cursor: pointer; transition: transform 0.2s;" />
                        <title>${p.date}: ${p.value} mL total</title>
                    `;
                }
            });
        }

        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Dashboard Overview</h2>
                <p style="color: var(--text-light);">Welcome back, <strong>${currentUser.name}</strong>! Here's what's happening with your account.</p>
            </div>

            <!-- Quick Life-Saving Portal -->
            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; margin-bottom: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px;">
                    <h3 style="font-size: 18px; color: var(--text-dark); margin: 0 0 6px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-heartbeat" style="color: var(--primary-color);"></i> Quick Life-Saving Portal
                    </h3>
                    <p style="color: var(--text-light); font-size: 14px; margin: 0; line-height: 1.5;">
                        Choose whether you want to support our community by scheduling a donation or request urgent blood supply for a patient or facility in need.
                    </p>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <a href="donate.html" class="btn btn-primary" style="text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 14px;">
                        <i class="fas fa-heart"></i> Become a Donor
                    </a>
                    <a href="request.html" class="btn btn-outline" style="text-decoration: none; padding: 11px 22px; font-weight: 600; font-size: 14px;">
                        <i class="fas fa-hand-holding-heart"></i> Request Blood
                    </a>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="dashboard-cards">
                <div class="dashboard-card">
                    <div class="dashboard-card-icon blue">
                        <i class="fas fa-tint"></i>
                    </div>
                    <div class="dashboard-card-info">
                        <h4>${userDonations.length}</h4>
                        <p>Total Donations</p>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="dashboard-card-icon red">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="dashboard-card-info">
                        <h4>${daysSinceLast}</h4>
                        <p>Days Since Last</p>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="dashboard-card-icon green">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="dashboard-card-info">
                        <h4>${userDonations.length * 3}</h4>
                        <p>Lives Saved</p>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="dashboard-card-icon orange">
                        <i class="fas fa-award"></i>
                    </div>
                    <div class="dashboard-card-info">
                        <h4>${getDonorStatus(userDonations.length)}</h4>
                        <p>Donor Status</p>
                    </div>
                </div>
            </div>

            <!-- SVG Data Analytics Chart -->
            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h4 style="font-size: 16px; font-weight: 700; color: var(--text-dark); margin: 0;">Cumulative Blood Volume Donated</h4>
                        <p style="font-size: 13px; color: var(--text-light); margin: 2px 0 0 0;">Visualizing your overall physical donor footprint (mL over time)</p>
                    </div>
                    <div style="background: #fdf2f2; color: #b91c1c; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">
                        <i class="fas fa-heartbeat" style="margin-right: 4px;"></i> Total: ${cumulativeVolume} mL
                    </div>
                </div>
                <div style="width: 100%; overflow-x: auto;">
                    <svg viewBox="0 0 640 220" width="100%" height="220" style="display: block;">
                        <!-- Grids & Horizontal Axis lines -->
                        ${chartGridHtml}
                        
                        <!-- Connecting Polyline path -->
                        <polyline points="${polylinePoints}" fill="none" stroke="#e74c3c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                        
                        <!-- X/Y Axis boundary line -->
                        <line x1="${paddingLeft}" y1="${paddingTop + chartH}" x2="${paddingLeft + chartW}" y2="${paddingTop + chartH}" stroke="#cbd5e1" stroke-width="1" />
                        
                        <!-- X labels -->
                        ${chartLabelsHtml}
                        
                        <!-- Interactive node circles -->
                        ${chartPointsHtml}
                    </svg>
                </div>
            </div>

            <!-- Recent Activity -->
            <div style="margin-bottom: 30px;">
                <h3 style="margin-bottom: 20px;">Recent Donations</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Blood Type</th>
                                <th>Units</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userDonations.length === 0 ? `
                                <tr>
                                    <td colspan="5" style="text-align: center; color: var(--text-light); padding: 20px;">
                                        No donation appointments scheduled yet.
                                    </td>
                                </tr>
                            ` : userDonations.map(d => `
                                <tr>
                                    <td>${new Date(d.donationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                    <td>${d.donationCenterName}</td>
                                    <td>${d.bloodGroup}</td>
                                    <td>${d.unitsNeeded || 1}</td>
                                    <td><span class="status-badge ${d.status === 'Completed' || d.status === 'Approved' ? 'approved' : 'pending'}">${d.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Upcoming Appointments -->
            <div>
                <h3 style="margin-bottom: 20px;">Upcoming Appointments</h3>
                <div class="alert alert-info" style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-info-circle"></i>
                    <span>${nextEligibleText}</span>
                </div>
                <div>
                    <a href="donate.html" class="btn btn-primary">
                        <i class="fas fa-calendar-plus"></i> Schedule Donation
                    </a>
                </div>
            </div>
        `;
    } 
    else if (section === 'appointments') {
        const upcoming = userDonations.filter(d => d.status === 'Approved' || d.status === 'Pending');
        
        let appointmentsHtml = '';
        if (upcoming.length === 0) {
            appointmentsHtml = `
                <div style="text-align: center; padding: 50px 20px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <i class="far fa-calendar-times" style="font-size: 48px; color: #94a3b8; margin-bottom: 15px;"></i>
                    <h3 style="color: #334155; margin-bottom: 8px;">No Scheduled Appointments</h3>
                    <p style="color: #64748b; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto;">
                        You don't have any upcoming blood donation appointments scheduled at this moment.
                    </p>
                    <a href="donate.html" class="btn btn-primary">
                        <i class="fas fa-calendar-plus"></i> Schedule New Appointment
                    </a>
                </div>
            `;
        } else {
            appointmentsHtml = upcoming.map(appt => {
                const apptId = appt.id;
                const apptDateObj = new Date(appt.donationDate);
                const todayObj = new Date();
                todayObj.setHours(0,0,0,0);
                apptDateObj.setHours(0,0,0,0);
                const diffTime = apptDateObj - todayObj;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let countdownText = '';
                let countdownClass = 'status-badge pending';
                if (diffDays === 0) {
                    countdownText = 'Happening Today!';
                    countdownClass = 'status-badge approved';
                } else if (diffDays === 1) {
                    countdownText = 'Tomorrow';
                    countdownClass = 'status-badge pending';
                } else if (diffDays > 1) {
                    countdownText = `In ${diffDays} days`;
                    countdownClass = 'status-badge pending';
                } else {
                    countdownText = 'Past scheduled date';
                    countdownClass = 'status-badge';
                }

                const c1 = localStorage.getItem(`prep_1_${apptId}`) === 'true' ? 'checked' : '';
                const c2 = localStorage.getItem(`prep_2_${apptId}`) === 'true' ? 'checked' : '';
                const c3 = localStorage.getItem(`prep_3_${apptId}`) === 'true' ? 'checked' : '';
                const c4 = localStorage.getItem(`prep_4_${apptId}`) === 'true' ? 'checked' : '';

                return `
                    <div class="appt-card" style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 30px; overflow: hidden; display: grid; grid-template-columns: 1fr; gap: 20px;">
                        
                        <!-- Header with Ticket design -->
                        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 24px; border-bottom: 2px dashed #cbd5e1; position: relative;">
                            <div style="position: absolute; left: -10px; bottom: -10px; width: 20px; height: 20px; background: #fff; border-radius: 50%; border: 1px solid #e2e8f0; z-index: 5;"></div>
                            <div style="position: absolute; right: -10px; bottom: -10px; width: 20px; height: 20px; background: #fff; border-radius: 50%; border: 1px solid #e2e8f0; z-index: 5;"></div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                                <span class="${countdownClass}" style="font-size: 13px; padding: 6px 12px; border-radius: 20px; font-weight: 600;"><i class="far fa-clock"></i> ${countdownText}</span>
                                <span style="font-family: monospace; color: #94a3b8; font-weight: 600; font-size: 14px;">TICKET #APPT-0${apptId}</span>
                            </div>
                            
                            <h3 style="font-size: 20px; color: #1e293b; margin-bottom: 8px; font-weight: 700;">${appt.donationCenterName}</h3>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 15px;">
                                <div style="display: flex; align-items: center; gap: 10px; color: #475569;">
                                    <i class="far fa-calendar-alt" style="color: #dc2626; font-size: 18px;"></i>
                                    <div>
                                        <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">APPOINTMENT DATE</div>
                                        <div style="font-size: 14px; font-weight: 600;">${appt.donationDate}</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; color: #475569;">
                                    <i class="far fa-clock" style="color: #dc2626; font-size: 18px;"></i>
                                    <div>
                                        <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">TIME SLOT</div>
                                        <div style="font-size: 14px; font-weight: 600;">${appt.donationTime || '10:00 AM'}</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; color: #475569;">
                                    <i class="fas fa-tint" style="color: #dc2626; font-size: 18px;"></i>
                                    <div>
                                        <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">BLOOD GROUP / TYPE</div>
                                        <div style="font-size: 14px; font-weight: 600;">${appt.bloodGroup} (${(appt.donationType || 'whole').toUpperCase()})</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Ticket Body: Preparation Checklist and route map side-by-side -->
                        <div style="padding: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; align-items: start;">
                            
                            <!-- Checklist -->
                            <div>
                                <h4 style="font-size: 15px; color: #1e293b; margin-bottom: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-tasks" style="color: #dc2626;"></i> Interactive Donor Prep Checklist
                                </h4>
                                <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">
                                    Ensure a smooth, safe donation. Complete these checks before you arrive:
                                </p>
                                
                                <div style="display: flex; flex-direction: column; gap: 10px;">
                                    <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: #475569; cursor: pointer; user-select: none;">
                                        <input type="checkbox" ${c1} onclick="localStorage.setItem('prep_1_${apptId}', this.checked)" style="margin-top: 3px; width: 16px; height: 16px; accent-color: #dc2626;">
                                        <span><strong>Hydrated Well:</strong> Drank 500-1000 mL of water in the last 4 hours.</span>
                                    </label>
                                    <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: #475569; cursor: pointer; user-select: none;">
                                        <input type="checkbox" ${c2} onclick="localStorage.setItem('prep_2_${apptId}', this.checked)" style="margin-top: 3px; width: 16px; height: 16px; accent-color: #dc2626;">
                                        <span><strong>Healthy Meal:</strong> Had a solid iron-rich meal 2-3 hours ago. No fasting!</span>
                                    </label>
                                    <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: #475569; cursor: pointer; user-select: none;">
                                        <input type="checkbox" ${c3} onclick="localStorage.setItem('prep_3_${apptId}', this.checked)" style="margin-top: 3px; width: 16px; height: 16px; accent-color: #dc2626;">
                                        <span><strong>Rested State:</strong> Slept a solid 7-8 hours last night.</span>
                                    </label>
                                    <label style="display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: #475569; cursor: pointer; user-select: none;">
                                        <input type="checkbox" ${c4} onclick="localStorage.setItem('prep_4_${apptId}', this.checked)" style="margin-top: 3px; width: 16px; height: 16px; accent-color: #dc2626;">
                                        <span><strong>Safety Essentials:</strong> ID Card on hand & avoided alcohol / heavy exercise.</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Map Route preview -->
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center;">
                                <h4 style="font-size: 14px; color: #1e293b; margin-bottom: 8px; font-weight: 600; text-align: left; display: flex; align-items: center; gap: 6px;">
                                    <i class="fas fa-map-marked-alt" style="color: #dc2626;"></i> Center Route Map Preview
                                </h4>
                                <div style="width: 100%; height: 120px; background: #e2e8f0; border-radius: 8px; margin-bottom: 10px; overflow: hidden; position: relative;">
                                    
                                    <svg width="100%" height="100%" viewBox="0 0 300 120" style="background-color: #e2f0d9;">
                                        <path d="M 0 30 L 300 30 M 0 90 L 300 90 M 100 0 L 100 120 M 200 0 L 200 120" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M 0 30 L 300 30 M 0 90 L 300 90 M 100 0 L 100 120 M 200 0 L 200 120" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4,4"/>
                                        
                                        <circle cx="50" cy="90" r="14" fill="#3b82f6" fill-opacity="0.2"/>
                                        <circle cx="50" cy="90" r="6" fill="#3b82f6"/>
                                        <text x="40" y="75" font-family="Poppins" font-size="9" font-weight="bold" fill="#1e3a8a">Home</text>
                                        
                                        <path d="M 50 90 L 100 90 L 100 30 L 200 30 L 200 60" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5,5" />
                                        
                                        <circle cx="200" cy="60" r="16" fill="#ef4444" fill-opacity="0.2"/>
                                        <path d="M200 48 L203 54 L209 54 L204 58 L206 64 L200 60 L194 64 L196 58 L191 54 L197 54 Z" fill="#ef4444"/>
                                        <circle cx="200" cy="60" r="3" fill="#ffffff"/>
                                        <text x="175" y="85" font-family="Poppins" font-size="9" font-weight="bold" fill="#991b1b">Center</text>
                                    </svg>
                                    
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: #64748b;">
                                    <span>Distance: <strong>2.4 miles</strong></span>
                                    <span>Est. Drive: <strong>8 mins</strong></span>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background: #f8fafc; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-top: 1px solid #f1f5f9;">
                            <span style="font-size: 12px; color: #64748b; font-weight: 500;">
                                <i class="fas fa-check-circle" style="color: #22c55e;"></i> Registered Donor verified slot.
                            </span>
                            <div style="display: flex; gap: 10px;">
                                <button onclick="cancelUserAppointment(${apptId})" class="btn btn-outline" style="color: #dc2626; border-color: #fca5a5; font-size: 13px; padding: 6px 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; background: transparent;">
                                    <i class="far fa-trash-alt"></i> Cancel Appointment
                                </button>
                                <a href="donate.html" class="btn btn-primary" style="font-size: 13px; padding: 6px 12px; font-weight: 600;">
                                    Reschedule
                                </a>
                            </div>
                        </div>

                    </div>
                `;
            }).join('');
        }

        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Scheduled Appointments</h2>
                <p style="color: var(--text-light);">Manage your upcoming active donation slots, tickets, and travel routes.</p>
            </div>

            <div style="margin-bottom: 35px;">
                ${appointmentsHtml}
            </div>

            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 20px; display: flex; gap: 15px; align-items: flex-start;">
                <i class="fas fa-shield-alt" style="color: #d97706; font-size: 24px; margin-top: 3px;"></i>
                <div>
                    <h4 style="color: #92400e; font-weight: 600; margin-bottom: 5px; font-size: 15px;">Official Donation Day Guidelines</h4>
                    <p style="color: #b45309; font-size: 13.5px; line-height: 1.5;">
                        Please bring a valid photo ID card. Make sure to eat a solid meal beforehand and continue hydrating. If you feel unwell, have a fever, or take certain antibiotics, please click "Cancel" to release the time slot. Thank you!
                    </p>
                </div>
            </div>
        `;
    }
    else if (section === 'analytics') {
        const completedCount = userDonations.filter(d => d.status === 'Completed' || d.status === 'Approved').length;
        const totalVol = completedCount * 450;
        const livesSaved = completedCount * 3;
        
        const shortageData = [
            { bg: 'O-', current: 15, safe: 100, pct: 15, status: 'CRITICAL', color: '#dc2626' },
            { bg: 'O+', current: 40, safe: 100, pct: 40, status: 'HIGH NEED', color: '#ea580c' },
            { bg: 'A-', current: 35, safe: 100, pct: 35, status: 'HIGH NEED', color: '#ea580c' },
            { bg: 'A+', current: 75, safe: 100, pct: 75, status: 'STABLE', color: '#2563eb' },
            { bg: 'B-', current: 50, safe: 100, pct: 50, status: 'MODERATE', color: '#eab308' },
            { bg: 'B+', current: 85, safe: 100, pct: 85, status: 'STABLE', color: '#2563eb' },
            { bg: 'AB-', current: 65, safe: 100, pct: 65, status: 'MODERATE', color: '#eab308' },
            { bg: 'AB+', current: 95, safe: 100, pct: 95, status: 'ABUNDANT', color: '#16a34a' }
        ];

        let svgBars = '';
        shortageData.forEach((item, i) => {
            const y = 15 + i * 34;
            const barWidth = item.pct * 2.2; 
            svgBars += `
                <text x="10" y="${y + 14}" font-family="Poppins" font-size="12" font-weight="600" fill="#334155">${item.bg}</text>
                <rect x="55" y="${y}" width="220" height="18" rx="4" fill="#f1f5f9" />
                <rect x="55" y="${y}" width="${barWidth}" height="18" rx="4" fill="${item.color}" />
                <text x="285" y="${y + 13}" font-family="Poppins" font-size="10.5" font-weight="700" fill="${item.color}">${item.status} (${item.pct}%)</text>
            `;
        });

        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Demand & Impact Analytics</h2>
                <p style="color: var(--text-light);">Interactive analysis of community blood inventory shortages and your personal lifesaver impact.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="position: relative; width: 100px; height: 100px; margin-bottom: 12px;">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#f1f5f9" stroke-width="8" fill="none" />
                            <circle cx="50" cy="50" r="40" stroke="#dc2626" stroke-width="8" stroke-dasharray="251" stroke-dashoffset="${251 - (Math.min(totalVol, 5000) / 5000) * 251}" stroke-linecap="round" fill="none" transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s ease-out;" />
                        </svg>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: Poppins; font-weight: 700; font-size: 14px; color: #1e293b; text-align: center;">
                            ${totalVol} <span style="font-size: 10px; font-weight: 500; color: #64748b; display: block; margin-top: -2px;">mL</span>
                        </div>
                    </div>
                    <h4 style="color: #1e293b; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Total Blood Contributed</h4>
                    <p style="font-size: 12px; color: #64748b;">Target: 5,000 mL (Gold Badge)</p>
                </div>

                <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="position: relative; width: 100px; height: 100px; margin-bottom: 12px;">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#f1f5f9" stroke-width="8" fill="none" />
                            <circle cx="50" cy="50" r="40" stroke="#22c55e" stroke-width="8" stroke-dasharray="251" stroke-dashoffset="${251 - (Math.min(livesSaved, 15) / 15) * 251}" stroke-linecap="round" fill="none" transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s ease-out;" />
                        </svg>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: Poppins; font-weight: 700; font-size: 18px; color: #1e293b; text-align: center;">
                            <div>${livesSaved}</div>
                            <i class="fas fa-heart" style="color: #ef4444; font-size: 10px; margin-top: 1px; display: inline-block;"></i>
                        </div>
                    </div>
                    <h4 style="color: #1e293b; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Lives Saved Impact</h4>
                    <p style="font-size: 12px; color: #64748b;">Each donation preserves up to 3 lives.</p>
                </div>

                <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="position: relative; width: 100px; height: 100px; margin-bottom: 12px;">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#f1f5f9" stroke-width="8" fill="none" />
                            <circle cx="50" cy="50" r="40" stroke="#eab308" stroke-width="8" stroke-dasharray="251" stroke-dashoffset="${251 - (Math.min(userDonations.length, 5) / 5) * 251}" stroke-linecap="round" fill="none" transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s ease-out;" />
                        </svg>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: Poppins; font-weight: 700; font-size: 12px; color: #1e293b; text-align: center;">
                            ${getDonorStatus(userDonations.length)} <span style="font-size: 10px; font-weight: 500; color: #64748b; display: block; margin-top: -2px;">Tier</span>
                        </div>
                    </div>
                    <h4 style="color: #1e293b; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Donation Milestone Progress</h4>
                    <p style="font-size: 12px; color: #64748b;">${userDonations.length}/5 to Gold Class level</p>
                </div>

            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px; margin-bottom: 30px;">
                
                <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
                        <h3 style="font-size: 16px; color: #1e293b; font-weight: 600; margin: 0;">Live Community Stock Shortages</h3>
                        <span style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 12px; font-weight: 600;">LIVE METRICS</span>
                    </div>
                    <p style="font-size: 12.5px; color: #64748b; margin-bottom: 20px;">
                        Percentage values indicate available safe reserves in the central region database. Low values trigger system-wide alerts.
                    </p>
                    
                    <svg width="100%" height="280" viewBox="0 0 380 280" style="overflow: visible;">
                        ${svgBars}
                    </svg>
                </div>

                <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; gap: 20px;">
                    <div>
                        <h3 style="font-size: 16px; color: #1e293b; font-weight: 600; margin-bottom: 10px; margin-top: 0;">Seasonal Blood Shortage Analysis</h3>
                        <p style="font-size: 12.5px; color: #64748b; margin-bottom: 15px;">
                            Historical community trends show blood donation volume decreases and shortages rise during holiday periods.
                        </p>
                        
                        <div style="position: relative; width: 100%; height: 120px; background: #faf9f9; border: 1px solid #f1f5f9; border-radius: 8px; margin-bottom: 10px;">
                            <svg width="100%" height="100%" viewBox="0 0 300 100" style="overflow: visible;">
                                <line x1="0" y1="50" x2="300" y2="50" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />
                                
                                <path d="M 0 50 Q 50 15 100 50 T 200 50 T 300 35" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
                                
                                <circle cx="50" cy="22" r="5" fill="#ef4444" />
                                <text x="50" y="14" font-family="Poppins" font-size="8" font-weight="700" fill="#991b1b" text-anchor="middle">Winter Shortage</text>
                                
                                <circle cx="200" cy="50" r="5" fill="#ef4444" />
                                <text x="200" y="40" font-family="Poppins" font-size="8" font-weight="700" fill="#991b1b" text-anchor="middle">Summer Slump</text>
                                
                                <text x="10" y="90" font-family="Poppins" font-size="8.5" font-weight="600" fill="#94a3b8">Jan</text>
                                <text x="75" y="90" font-family="Poppins" font-size="8.5" font-weight="600" fill="#94a3b8">Apr</text>
                                <text x="150" y="90" font-family="Poppins" font-size="8.5" font-weight="600" fill="#94a3b8">Jul</text>
                                <text x="225" y="90" font-family="Poppins" font-size="8.5" font-weight="600" fill="#94a3b8">Oct</text>
                                <text x="285" y="90" font-family="Poppins" font-size="8.5" font-weight="600" fill="#94a3b8">Dec</text>
                            </svg>
                        </div>
                    </div>

                    <div style="background: #eff6ff; border-radius: 12px; padding: 16px; border: 1px solid #dbeafe;">
                        <h4 style="font-size: 13.5px; color: #1e40af; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; margin-top: 0;">
                            <i class="fas fa-magic" style="color: #2563eb;"></i> Live Personal Optimization
                        </h4>
                        <p style="font-size: 12.5px; color: #1e3a8a; line-height: 1.5; margin: 0;">
                            ${currentUser.bloodGroup === 'O-' 
                                ? `Because you have the universal O- blood type, you have been flagged as a **Critical Savior**. Your type can save anyone. We suggest scheduling a Whole Blood donation during the Winter Vacations to help mitigate seasonal regional shortages.`
                                : `Based on your blood group **${currentUser.bloodGroup || 'O-'}**, you have strong compatibility matching. We highly recommend scheduling regular quarterly donations or platelets donations to help hospitals maintain safe levels during summer vacation gaps.`
                            }
                        </p>
                    </div>
                </div>

            </div>
        `;
    }
    else if (section === 'matcher') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Blood Compatibility Matcher & Transfusion Simulator</h2>
                <p style="color: var(--text-light);">Select blood groups below to dynamically test compatibility and observe immunological reactions.</p>
            </div>
            <div id="compat-simulator-container"></div>
        `;
        if (window.initCompatibilityEngine) {
            window.initCompatibilityEngine('compat-simulator-container', currentUser.bloodGroup || 'A+');
        } else {
            contentArea.innerHTML += `<div style="padding: 20px; color: #dc2626; background: #fee2e2; border-radius: 8px;">Compatibility Engine script could not be loaded. Please reload page.</div>`;
        }
    }
    else if (section === 'eligibility') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Gamified Health Advisor & Digital Passport</h2>
                <p style="color: var(--text-light);">Calculate your exact blood volume and take our clinical eligibility screening to generate your digital passport.</p>
            </div>
            <div id="gamified-eligibility-container"></div>
        `;
        if (window.initGamifiedEligibility) {
            window.initGamifiedEligibility('gamified-eligibility-container', currentUser, async (score, status) => {
                try {
                    const response = await fetch('/api/eligibility', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ score, status })
                    });
                    const data = await response.json();
                    if (data.success) {
                        currentUser.eligibilityScore = score;
                        currentUser.eligibilityStatus = status;
                        showAlert('Eligibility status synchronized successfully!', 'success');
                    }
                } catch (e) {
                    console.error('Error synchronizing eligibility score:', e);
                }
            });
        } else {
            contentArea.innerHTML += `<div style="padding: 20px; color: #dc2626; background: #fee2e2; border-radius: 8px;">Eligibility Advisor script could not be loaded. Please reload page.</div>`;
        }
    }
    else if (section === 'emergency-planner') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Disaster Supply Coordinator & Demand Planner</h2>
                <p style="color: var(--text-light);">Run disaster-scenario simulation matrices, map regional deficits, and coordinate drone/courier dispatches.</p>
            </div>
            <div id="emergency-planner-container"></div>
        `;
        if (window.initSmartEmergencyPlanner) {
            window.initSmartEmergencyPlanner('emergency-planner-container');
        } else {
            contentArea.innerHTML += `<div style="padding: 20px; color: #dc2626; background: #fee2e2; border-radius: 8px;">Emergency Coordinator script could not be loaded. Please reload page.</div>`;
        }
    }
    else if (section === 'urgent') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Live Urgent Requests Feed</h2>
                <p style="color: var(--text-light);">Review peer and hospital requests. Help save lives directly by pledging blood.</p>
            </div>
            <div id="urgent-feed-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                <!-- Loaded from api -->
                <div style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>Loading real-time medical requests...</p>
                </div>
            </div>
        `;

        fetch('/api/all-requests')
            .then(res => res.json())
            .then(data => {
                const feed = document.getElementById('urgent-feed-grid');
                if (!feed) return;

                // Sort pending and emergency first
                data.sort((a, b) => {
                    if (a.urgency === 'emergency' && b.urgency !== 'emergency') return -1;
                    if (a.urgency !== 'emergency' && b.urgency === 'emergency') return 1;
                    return new Date(b.date) - new Date(a.date);
                });

                if (data.length === 0) {
                    feed.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #f8fafc; border-radius: 12px;">
                            <p style="color: var(--text-light);">No active blood requests are currently submitted.</p>
                        </div>
                    `;
                    return;
                }

                feed.innerHTML = data.map(req => {
                    const isCompatible = bloodCompatibility[currentUser.bloodGroup]?.give.includes(req.bloodGroupNeeded);
                    const isOwnRequest = req.requesterEmail.toLowerCase() === currentUser.email.toLowerCase();

                    return `
                        <div class="result-card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative; border: ${req.urgency === 'emergency' ? '2px solid var(--primary-color)' : '1px solid #e2e8f0'};">
                            ${req.urgency === 'emergency' ? `
                                <span style="position: absolute; top: -12px; right: 15px; background: var(--primary-color); color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">EMERGENCY</span>
                            ` : ''}
                            <div>
                                <div class="result-header">
                                    <div class="blood-type-badge">${req.bloodGroupNeeded}</div>
                                    <div class="result-info">
                                        <h4>${req.patientName}</h4>
                                        <p>Patient Age: ${req.patientAge}</p>
                                    </div>
                                </div>
                                <div class="result-details" style="font-size: 13.5px;">
                                    <p><i class="fas fa-hospital"></i> <strong>${req.hospitalName}</strong></p>
                                    <p><i class="fas fa-map-marker-alt"></i> ${req.hospitalAddress}</p>
                                    <p><i class="fas fa-info-circle"></i> Requirement: ${req.unitsNeeded} units</p>
                                    <p><i class="fas fa-phone"></i> Contact: ${req.hospitalPhone}</p>
                                </div>
                            </div>
                            
                            <div style="margin-top: 15px;">
                                ${isOwnRequest ? `
                                    <div style="text-align: center; padding: 8px; font-size: 12.5px; background: #f1f5f9; border-radius: 6px; color: var(--text-light); font-weight: 500;">
                                        Your submitted request
                                    </div>
                                ` : req.status === 'Approved' ? `
                                    <div style="text-align: center; padding: 8px; font-size: 12.5px; background: #e8f8f0; border-radius: 6px; color: var(--accent-color); font-weight: 600;">
                                        <i class="fas fa-check-circle"></i> Pledge Fulfilled
                                    </div>
                                ` : isCompatible ? `
                                    <button class="btn btn-primary btn-block" onclick="pledgeToDonate(${req.id})">
                                        <i class="fas fa-hand-holding-heart"></i> Pledge Blood
                                    </button>
                                    <div style="text-align: center; font-size: 11px; color: #27ae60; margin-top: 6px; font-weight: 600;">
                                        <i class="fas fa-check-double"></i> Compatible with your ${currentUser.bloodGroup} type
                                    </div>
                                ` : `
                                    <button class="btn btn-outline btn-block" style="opacity: 0.65; cursor: not-allowed;" disabled>
                                        Incompatible Type
                                    </button>
                                    <div style="text-align: center; font-size: 11px; color: var(--text-light); margin-top: 6px; font-weight: 500;">
                                        Requires ${req.bloodGroupNeeded} (${currentUser.bloodGroup} cannot donate)
                                    </div>
                                `}
                            </div>
                        </div>
                    `;
                }).join('');
            })
            .catch(err => {
                console.error(err);
                const feed = document.getElementById('urgent-feed-grid');
                if (feed) feed.innerHTML = '<p style="color: var(--primary-color);">Failed to fetch active requests feed.</p>';
            });
    }
    else if (section === 'certificate') {
        const donationCount = userDonations.length;
        const isQuizPassed = currentUser.eligibilityStatus === 'Eligible';
        
        // Render Certificate view
        contentArea.innerHTML = `
            <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2>Donor Achievements & Certificates</h2>
                    <p style="color: var(--text-light);">Unlock digital award badges and generate official donation credentials.</p>
                </div>
                ${donationCount > 0 ? `
                    <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Certificate</button>
                ` : ''}
            </div>

            <!-- Achievements grid -->
            <h3 style="margin-bottom: 15px; font-size: 18px;">Unlocked Achievements</h3>
            <div class="badges-container">
                <div class="badge-item ${donationCount >= 1 ? 'unlocked' : 'locked'}">
                    <div class="badge-icon"><i class="fas fa-drop"></i></div>
                    <h5>First Drop</h5>
                    <p>${donationCount >= 1 ? 'Unlocked' : 'Donate 1 unit'}</p>
                </div>
                <div class="badge-item ${isQuizPassed ? 'unlocked' : 'locked'}">
                    <div class="badge-icon"><i class="fas fa-shield-heart"></i></div>
                    <h5>Safe Donor</h5>
                    <p>${isQuizPassed ? 'Passed Quiz' : 'Pass Health Quiz'}</p>
                </div>
                <div class="badge-item ${donationCount >= 3 ? 'unlocked' : 'locked'}">
                    <div class="badge-icon"><i class="fas fa-medal"></i></div>
                    <h5>Life Saver</h5>
                    <p>${donationCount >= 3 ? 'Unlocked' : 'Donate 3 times'}</p>
                </div>
                <div class="badge-item ${donationCount >= 5 ? 'unlocked' : 'locked'}">
                    <div class="badge-icon"><i class="fas fa-crown"></i></div>
                    <h5>Champion</h5>
                    <p>${donationCount >= 5 ? 'Unlocked' : 'Donate 5 times'}</p>
                </div>
            </div>

            <!-- Certificate preview -->
            ${donationCount > 0 ? `
                <h3 style="margin-bottom: 15px; font-size: 18px;">Your Donation Certificate</h3>
                <div class="certificate-preview-box" id="print-certificate">
                    <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; color: #2c3e50; margin-bottom: 5px;">CERTIFICATE OF COMMENDATION</h2>
                    <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: var(--primary-color); font-weight: 600; margin-bottom: 25px;">BloodSync Network Commendation</p>
                    
                    <p style="font-size: 15px; color: var(--text-light); font-style: italic; margin-bottom: 15px;">This certificate is gratefully awarded to</p>
                    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 32px; color: #1a252f; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; max-width: 450px; margin-left: auto; margin-right: auto;">${currentUser.name}</h1>
                    
                    <p style="font-size: 14.5px; color: #555; max-width: 500px; margin: 0 auto 25px; line-height: 1.6;">
                        for outstanding service and human compassion in donating blood. Your contribution of <strong>${donationCount} units</strong> of <strong>${currentUser.bloodGroup}</strong> blood has played an active role in saving approximately <strong>${donationCount * 3} lives</strong>.
                    </p>

                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; border-top: 1px solid #edf2f7; padding-top: 20px;">
                        <div style="text-align: left;">
                            <p style="font-size: 12px; color: var(--text-light); margin-bottom: 2px;">Certificate ID</p>
                            <p style="font-size: 13px; font-weight: 700; color: #334155;">#BS-CERT-00${currentUser.dob ? currentUser.dob.split('-')[1] : '88'}${donationCount}</p>
                        </div>
                        <div class="certificate-seal">
                            <i class="fas fa-heart" style="color: white; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.1));"></i>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 15px; font-family: 'Caveat', cursive, Georgia; font-weight: 700; color: #334155; transform: rotate(-3deg);">Johnathan Vance</p>
                            <p style="font-size: 11px; color: var(--text-light); border-top: 1px solid #cbd5e1; padding-top: 4px; margin-top: 4px;">Director of BloodSync Board</p>
                        </div>
                    </div>
                </div>
            ` : `
                <div style="text-align: center; padding: 40px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <i class="fas fa-certificate" style="font-size: 38px; color: #94a3b8; margin-bottom: 12px;"></i>
                    <p style="color: var(--text-light); font-weight: 500;">No certificate available yet.</p>
                    <p style="font-size: 13px; color: #94a3b8; max-width: 380px; margin: 6px auto 15px;">You must complete at least 1 blood donation to generate an official commendable digital Certificate.</p>
                    <a href="donate.html" class="btn btn-primary btn-outline"><i class="fas fa-heart"></i> Schedule First Donation</a>
                </div>
            `}
        `;
    }
    else if (section === 'profile') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>My Profile</h2>
                <p style="color: var(--text-light);">Manage your blood donor profile information.</p>
            </div>
            
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 24px;">
                    <div>
                        <label style="font-weight: 500; color: var(--text-light); font-size: 13px;">Full Name</label>
                        <p style="font-size: 16px; font-weight: 600; margin-top: 4px; color: var(--text-color);">${currentUser.name}</p>
                    </div>
                    <div>
                        <label style="font-weight: 500; color: var(--text-light); font-size: 13px;">Email Address</label>
                        <p style="font-size: 16px; font-weight: 600; margin-top: 4px; color: var(--text-color);">${currentUser.email}</p>
                    </div>
                    <div>
                        <label style="font-weight: 500; color: var(--text-light); font-size: 13px;">Phone Number</label>
                        <p style="font-size: 16px; font-weight: 600; margin-top: 4px; color: var(--text-color);">${currentUser.phone}</p>
                    </div>
                    <div>
                        <label style="font-weight: 500; color: var(--text-light); font-size: 13px;">Blood Group</label>
                        <p style="font-size: 16px; font-weight: 700; margin-top: 4px; color: var(--primary-color);">${currentUser.bloodGroup}</p>
                    </div>
                    <div>
                        <label style="font-weight: 500; color: var(--text-light); font-size: 13px;">Gender / Weight</label>
                        <p style="font-size: 16px; font-weight: 600; margin-top: 4px; color: var(--text-color);">${currentUser.gender.toUpperCase()} / ${currentUser.weight} kg</p>
                    </div>
                    <div>
                        <label style="font-weight: 500; color: var(--text-light); font-size: 13px;">Date of Birth</label>
                        <p style="font-size: 16px; font-weight: 600; margin-top: 4px; color: var(--text-color);">${currentUser.dob}</p>
                    </div>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <label style="font-weight: 500; color: var(--text-light); font-size: 13px;">Primary Address</label>
                    <p style="font-size: 16px; font-weight: 600; margin-top: 4px; color: var(--text-color);">${currentUser.address}, ${currentUser.city}, ${currentUser.state}</p>
                </div>
            </div>
        `;
    } 
    else if (section === 'donations') {
        contentArea.innerHTML = `
            <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2>My Donations</h2>
                    <p style="color: var(--text-light);">Scheduled and historical donations</p>
                </div>
                <a href="donate.html" class="btn btn-primary"><i class="fas fa-heart"></i> Schedule Appointment</a>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Center Name</th>
                            <th>Appointment Date</th>
                            <th>Blood Group</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userDonations.length === 0 ? `
                            <tr>
                                <td colspan="5" style="text-align: center; color: var(--text-light); padding: 30px;">
                                    You have no recorded donations. Make a difference by registering today!
                                </td>
                            </tr>
                        ` : userDonations.map(d => `
                            <tr>
                                <td>#DON-0${d.id}</td>
                                <td>${d.donationCenterName}</td>
                                <td>${d.donationDate}</td>
                                <td><strong>${d.bloodGroup}</strong></td>
                                <td><span class="status-badge ${d.status === 'Completed' || d.status === 'Approved' ? 'approved' : 'pending'}">${d.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } 
    else if (section === 'requests') {
        contentArea.innerHTML = `
            <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2>My Blood Requests</h2>
                    <p style="color: var(--text-light);">Track requests you've submitted for patients in need</p>
                </div>
                <a href="request.html" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Submit New Request</a>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient Name</th>
                            <th>Blood Needed</th>
                            <th>Units Needed</th>
                            <th>Urgency</th>
                            <th>Hospital</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userRequests.length === 0 ? `
                            <tr>
                                <td colspan="7" style="text-align: center; color: var(--text-light); padding: 30px;">
                                    You have not submitted any blood requests.
                                </td>
                            </tr>
                        ` : userRequests.map(r => `
                            <tr>
                                <td>#REQ-0${r.id}</td>
                                <td>${r.patientName}</td>
                                <td><strong>${r.bloodGroupNeeded}</strong></td>
                                <td>${r.unitsNeeded}</td>
                                <td><span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: ${r.urgency === 'emergency' ? '#e74c3c' : r.urgency === 'urgent' ? '#f39c12' : '#3498db'}">${r.urgency}</span></td>
                                <td>${r.hospitalName}</td>
                                <td><span class="status-badge ${r.status === 'Approved' ? 'approved' : 'pending'}">${r.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } 
    else if (section === 'history') {
        const historyTimeline = [];
        userDonations.forEach(d => {
            historyTimeline.push({
                date: d.donationDate,
                type: 'Donation',
                description: `Scheduled blood donation at ${d.donationCenterName}`,
                badge: d.bloodGroup,
                status: d.status
            });
        });
        userRequests.forEach(r => {
            historyTimeline.push({
                date: r.date,
                type: 'Request',
                description: `Submitted blood request for ${r.patientName} (${r.unitsNeeded} units)`,
                badge: r.bloodGroupNeeded,
                status: r.status
            });
        });

        historyTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));

        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Activity History</h2>
                <p style="color: var(--text-light);">A chronological timeline of your contributions and requests.</p>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Event Type</th>
                            <th>Description</th>
                            <th>Blood Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historyTimeline.length === 0 ? `
                            <tr>
                                <td colspan="5" style="text-align: center; color: var(--text-light); padding: 30px;">
                                    No transaction or activity history available.
                                </td>
                            </tr>
                        ` : historyTimeline.map(item => `
                            <tr>
                                <td>${item.date}</td>
                                <td><strong style="color: ${item.type === 'Donation' ? '#2ecc71' : '#e74c3c'}">${item.type}</strong></td>
                                <td>${item.description}</td>
                                <td><strong>${item.badge}</strong></td>
                                <td><span class="status-badge ${item.status === 'Completed' || item.status === 'Approved' ? 'approved' : 'pending'}">${item.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } 
    else if (section === 'admin-overview') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Admin Management Panel</h2>
                <p style="color: var(--text-light);">Real-time monitoring of blood storage metrics, live requests, and donor registrations.</p>
            </div>
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-color);"></i>
                <p style="margin-top: 10px; color: var(--text-light);">Loading system analytics...</p>
            </div>
        `;

        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(stats => {
                const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
                const groupTotals = {};
                bloodGroups.forEach(bg => { groupTotals[bg] = 0; });
                stats.inventory.forEach(item => {
                    if (groupTotals[item.bloodGroup] !== undefined) {
                        groupTotals[item.bloodGroup] += (item.units || 0);
                    }
                });

                const maxStock = Math.max(...Object.values(groupTotals), 10);

                const barSvgW = 600;
                const barSvgH = 180;
                const barPadLeft = 40;
                const barPadRight = 10;
                const barPadTop = 20;
                const barPadBottom = 30;
                const barChartW = barSvgW - barPadLeft - barPadRight;
                const barChartH = barSvgH - barPadTop - barPadBottom;

                const barWidth = (barChartW / bloodGroups.length) - 16;
                let barElementsHtml = '';
                let barGridlinesHtml = '';

                for (let k = 0; k <= 3; k++) {
                    const lineY = barPadTop + (k / 3) * barChartH;
                    const val = Math.round(maxStock - (k / 3) * maxStock);
                    barGridlinesHtml += `
                        <line x1="${barPadLeft}" y1="${lineY}" x2="${barPadLeft + barChartW}" y2="${lineY}" stroke="#e2e8f0" stroke-dasharray="3,3" />
                        <text x="${barPadLeft - 8}" y="${lineY + 4}" fill="#64748b" font-size="9" font-family="system-ui" text-anchor="end">${val} U</text>
                    `;
                }

                bloodGroups.forEach((bg, i) => {
                    const val = groupTotals[bg];
                    const barH = (val / maxStock) * barChartH;
                    const barX = barPadLeft + i * (barChartW / bloodGroups.length) + 8;
                    const barY = barPadTop + barChartH - barH;
                    
                    barElementsHtml += `
                        <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barH}" rx="4" fill="#e74c3c" opacity="0.9" />
                        <text x="${barX + barWidth / 2}" y="${barY - 6}" fill="#475569" font-size="10" font-weight="700" font-family="system-ui" text-anchor="middle">${val}</text>
                        <text x="${barX + barWidth / 2}" y="${barPadTop + barChartH + 18}" fill="#475569" font-size="11" font-weight="600" font-family="system-ui" text-anchor="middle">${bg}</text>
                    `;
                });

                contentArea.innerHTML = `
                    <div class="dashboard-header">
                        <h2>Admin Management Panel</h2>
                        <p style="color: var(--text-light);">Real-time monitoring of blood storage metrics, live requests, and donor registrations.</p>
                    </div>

                    <!-- Stats Cards -->
                    <div class="dashboard-cards" style="margin-bottom: 30px;">
                        <div class="dashboard-card">
                            <div class="dashboard-card-icon blue">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="dashboard-card-info">
                                <h4>${stats.totalDonors}</h4>
                                <p>Registered Donors</p>
                            </div>
                        </div>
                        <div class="dashboard-card">
                            <div class="dashboard-card-icon green">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="dashboard-card-info">
                                <h4>${stats.totalDonations}</h4>
                                <p>Donations Logged</p>
                            </div>
                        </div>
                        <div class="dashboard-card">
                            <div class="dashboard-card-icon red">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="dashboard-card-info">
                                <h4>${stats.pendingRequests}</h4>
                                <p>Pending Requests</p>
                            </div>
                        </div>
                        <div class="dashboard-card">
                            <div class="dashboard-card-icon orange">
                                <i class="fas fa-comments"></i>
                            </div>
                            <div class="dashboard-card-info">
                                <h4>${stats.inquiries}</h4>
                                <p>Inquiries Feed</p>
                            </div>
                        </div>
                    </div>

                    <!-- Global Blood Supply Reserves Bar Chart -->
                    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                        <h3 style="color: var(--text-dark); display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; margin-bottom: 5px; margin-top: 0;">
                            <i class="fas fa-chart-bar" style="color: var(--primary-color);"></i>
                            Global Blood Stock Reserves (Units)
                        </h3>
                        <p style="font-size: 13px; color: var(--text-light); margin: 0 0 20px 0;">Aggregated quantity of blood units currently held across network facilities.</p>
                        <div style="width: 100%; overflow-x: auto;">
                            <svg viewBox="0 0 600 180" width="100%" height="180" style="display: block;">
                                ${barGridlinesHtml}
                                ${barElementsHtml}
                                <line x1="${barPadLeft}" y1="${barPadTop + barChartH}" x2="${barPadLeft + barChartW}" y2="${barPadTop + barChartH}" stroke="#cbd5e1" stroke-width="1" />
                            </svg>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr; gap: 25px;">
                        <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <h3 style="color: var(--text-dark); display: flex; align-items: center; gap: 10px; font-size: 18px; margin: 0;">
                                    <i class="fas fa-warehouse" style="color: var(--primary-color);"></i>
                                    Global Blood Inventory Reserves
                                </h3>
                                <button class="btn btn-outline" style="font-size: 13px; padding: 6px 12px;" onclick="loadDashboardSection('admin-inventory')">
                                    <i class="fas fa-edit"></i> Edit Inventory
                                </button>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px;">
                                ${stats.inventory.map(item => `
                                    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #fafafa;">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                            <div>
                                                <h4 style="font-size: 14px; margin-bottom: 2px; color: var(--text-dark);">${item.name}</h4>
                                                <p style="font-size: 12px; color: var(--text-light);"><i class="fas fa-map-marker-alt"></i> ${item.location}</p>
                                            </div>
                                            <span style="font-size: 18px; font-weight: 700; color: var(--primary-color); background: rgba(231,76,60,0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${item.bloodGroup}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 8px;">
                                            <span style="font-size: 12px; color: var(--text-light);">Available Stock:</span>
                                            <strong style="font-size: 14px; color: #2ecc71;">${item.units} Units</strong>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            })
            .catch(err => {
                console.error(err);
                showAlert('Error loading system analytics.', 'error');
            });
    }
    else if (section === 'admin-requests') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Manage Patient Blood Requests</h2>
                <p style="color: var(--text-light);">Approve, complete, or remove medical requests published on the site.</p>
            </div>
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-color);"></i>
                <p style="margin-top: 10px; color: var(--text-light);">Loading user requests...</p>
            </div>
        `;

        fetch('/api/all-requests')
            .then(res => res.json())
            .then(requests => {
                contentArea.innerHTML = `
                    <div class="dashboard-header">
                        <h2>Manage Patient Blood Requests</h2>
                        <p style="color: var(--text-light);">Approve, complete, or remove medical requests published on the site.</p>
                    </div>

                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Blood Type</th>
                                    <th>Units Required</th>
                                    <th>Urgency</th>
                                    <th>Hospital</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Administrative Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${requests.length === 0 ? `
                                    <tr>
                                        <td colspan="7" style="text-align: center; color: var(--text-light); padding: 30px;">No patient requests registered in the system.</td>
                                    </tr>
                                ` : requests.map(req => `
                                    <tr>
                                        <td>
                                            <strong style="color: var(--text-dark);">${req.patientName}</strong>
                                            <div style="font-size: 12px; color: var(--text-light);">Age: ${req.patientAge}</div>
                                        </td>
                                        <td><span class="status-badge" style="background-color: rgba(231,76,60,0.12); color: var(--primary-color); font-weight: 700;">${req.bloodGroupNeeded}</span></td>
                                        <td><strong>${req.unitsNeeded}</strong></td>
                                        <td><span class="status-badge" style="background-color: ${req.urgency === 'emergency' ? '#fde8e8' : '#fff8e6'}; color: ${req.urgency === 'emergency' ? '#e74c3c' : '#f39c12'}">${req.urgency.toUpperCase()}</span></td>
                                        <td>
                                            <div style="font-weight: 500; font-size: 13px; color: var(--text-dark);">${req.hospitalName}</div>
                                            <div style="font-size: 11px; color: var(--text-light);">${req.hospitalPhone || ''}</div>
                                        </td>
                                        <td><span class="status-badge ${req.status === 'Completed' || req.status === 'Approved' ? 'approved' : 'pending'}">${req.status}</span></td>
                                        <td style="text-align: right;">
                                            <div style="display: inline-flex; gap: 6px; justify-content: flex-end;">
                                                <button class="btn btn-primary" style="font-size: 11px; padding: 6px 10px;" onclick="updateAdminRequestStatus(${req.id}, 'Approved')">
                                                    <i class="fas fa-check"></i> Approve
                                                </button>
                                                <button class="btn btn-outline" style="font-size: 11px; padding: 6px 10px;" onclick="updateAdminRequestStatus(${req.id}, 'Completed')">
                                                    <i class="fas fa-check-double"></i> Complete
                                                </button>
                                                <button class="btn btn-outline" style="font-size: 11px; padding: 6px 10px; color: #e74c3c; border-color: rgba(231,76,60,0.3); background: transparent;" onclick="deleteAdminRequest(${req.id})">
                                                    <i class="fas fa-trash-alt"></i> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            })
            .catch(err => {
                console.error(err);
                showAlert('Error fetching requests database.', 'error');
            });
    }
    else if (section === 'admin-users') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Donor Directory Database</h2>
                <p style="color: var(--text-light);">A unified view of registered donors and their respective eligibility flags.</p>
            </div>
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-color);"></i>
                <p style="margin-top: 10px; color: var(--text-light);">Loading user registries...</p>
            </div>
        `;

        fetch('/api/admin/users')
            .then(res => res.json())
            .then(users => {
                const donors = users.filter(u => u.role !== 'admin');
                contentArea.innerHTML = `
                    <div class="dashboard-header">
                        <h2>Donor Directory Database</h2>
                        <p style="color: var(--text-light);">A unified view of registered donors and their respective eligibility flags.</p>
                    </div>

                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Donor Name</th>
                                    <th>Blood Group</th>
                                    <th>Contact Info</th>
                                    <th>Age & Gender</th>
                                    <th>Eligibility Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${donors.length === 0 ? `
                                    <tr>
                                        <td colspan="6" style="text-align: center; color: var(--text-light); padding: 30px;">No registered donors found.</td>
                                    </tr>
                                ` : donors.map(d => `
                                    <tr>
                                        <td>
                                            <strong style="color: var(--text-dark);">${d.name}</strong>
                                            <div style="font-size: 11px; color: var(--text-light);">${d.city || ''}, ${d.state || ''}</div>
                                        </td>
                                        <td><span class="status-badge" style="background-color: rgba(231,76,60,0.12); color: var(--primary-color); font-weight: 700;">${d.bloodGroup}</span></td>
                                        <td>
                                            <div style="font-size: 13px;"><i class="fas fa-phone" style="color: #64748b; font-size: 11px; margin-right: 4px;"></i> ${d.phone}</div>
                                            <div style="font-size: 12px; color: var(--text-light);"><i class="fas fa-envelope" style="color: #64748b; font-size: 11px; margin-right: 4px;"></i> ${d.email}</div>
                                        </td>
                                        <td>
                                            <div style="font-size: 13px;">${d.gender ? d.gender.toUpperCase() : 'N/A'}</div>
                                            <div style="font-size: 11px; color: var(--text-light);">Weight: ${d.weight || 'N/A'} kg</div>
                                        </td>
                                        <td>
                                            <span class="status-badge ${d.eligibilityStatus === 'Eligible' ? 'approved' : d.eligibilityStatus === 'Ineligible' ? 'pending' : ''}" style="background-color: ${d.eligibilityStatus === 'Ineligible' ? '#fee2e2' : ''}; color: ${d.eligibilityStatus === 'Ineligible' ? '#b91c1c' : ''};">
                                                ${d.eligibilityStatus || 'Pending Screen'}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-outline" style="font-size: 11px; padding: 6px 10px;" onclick="window.contactDonor('${d.name}')">
                                                <i class="fas fa-envelope"></i> Message
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            })
            .catch(err => {
                console.error(err);
                showAlert('Error loading registered users.', 'error');
            });
    }
    else if (section === 'admin-inventory') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Clinical Inventory Management</h2>
                <p style="color: var(--text-light);">Directly adjust blood bank stock reserves across hospitals and collection hubs.</p>
            </div>
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-color);"></i>
                <p style="margin-top: 10px; color: var(--text-light);">Loading warehouse metrics...</p>
            </div>
        `;

        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(stats => {
                contentArea.innerHTML = `
                    <div class="dashboard-header">
                        <h2>Clinical Inventory Management</h2>
                        <p style="color: var(--text-light);">Directly adjust blood bank stock reserves across hospitals and collection hubs.</p>
                    </div>

                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Medical Facility Name</th>
                                    <th>Category</th>
                                    <th>Blood Type</th>
                                    <th>Available Units</th>
                                    <th style="width: 250px;">Adjust Stock Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.inventory.map((item, idx) => `
                                    <tr>
                                        <td>
                                            <strong style="color: var(--text-dark);">${item.name}</strong>
                                            <div style="font-size: 11px; color: var(--text-light);"><i class="fas fa-map-marker-alt"></i> ${item.location} | <i class="fas fa-phone"></i> ${item.phone}</div>
                                        </td>
                                        <td><span class="status-badge" style="background-color: ${item.type === 'banks' ? '#e0f2fe' : '#f0fdf4'}; color: ${item.type === 'banks' ? '#0369a1' : '#15803d'}; text-transform: uppercase; font-size: 11px;">${item.type === 'banks' ? 'Blood Bank' : 'Hospital'}</span></td>
                                        <td><strong style="color: var(--primary-color); font-size: 15px;">${item.bloodGroup}</strong></td>
                                        <td><span id="units-val-${idx}" style="font-weight: 700; font-size: 15px; color: #2ecc71;">${item.units} Units</span></td>
                                        <td>
                                            <div style="display: flex; gap: 6px;">
                                                <input type="number" id="input-units-${idx}" value="${item.units}" min="0" max="500" style="width: 70px; padding: 6px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center;">
                                                <button class="btn btn-primary" style="font-size: 12px; padding: 6px 12px;" onclick="saveAdminInventory('${item.name}', ${idx})">
                                                    <i class="fas fa-save"></i> Save
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            })
            .catch(err => {
                console.error(err);
                showAlert('Error loading inventory dataset.', 'error');
            });
    }
    else if (section === 'admin-contacts') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Contact Inquiries Feed</h2>
                <p style="color: var(--text-light);">Read and follow up on messages left by portal visitors.</p>
            </div>
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-color);"></i>
                <p style="margin-top: 10px; color: var(--text-light);">Loading user inquiries...</p>
            </div>
        `;

        fetch('/api/admin/contacts')
            .then(res => res.json())
            .then(contacts => {
                contentArea.innerHTML = `
                    <div class="dashboard-header">
                        <h2>Contact Inquiries Feed</h2>
                        <p style="color: var(--text-light);">Read and follow up on messages left by portal visitors.</p>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        ${contacts.length === 0 ? `
                            <div style="text-align: center; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; color: var(--text-light);">
                                <i class="fas fa-mail-bulk" style="font-size: 44px; margin-bottom: 15px; color: #cbd5e1;"></i>
                                <p>No contact messages or inquiries received yet.</p>
                            </div>
                        ` : contacts.map(c => `
                            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
                                    <div>
                                        <h4 style="font-size: 16px; color: var(--text-dark); margin-bottom: 2px;">Subject: ${c.subject || 'General Inquiry'}</h4>
                                        <p style="font-size: 13px; color: var(--text-light);">Sender: <strong>${c.name}</strong> (${c.email}) ${c.phone ? `| Tel: ${c.phone}` : ''}</p>
                                    </div>
                                    <span style="font-size: 12px; color: var(--text-light);">${new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p style="font-size: 14px; color: var(--text-dark); line-height: 1.6; white-space: pre-wrap;">${c.message}</p>
                                <div style="margin-top: 15px; text-align: right;">
                                    <a href="mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || '')}" class="btn btn-outline" style="font-size: 12px; padding: 6px 12px;">
                                        <i class="fas fa-reply"></i> Send Mail Reply
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            })
            .catch(err => {
                console.error(err);
                showAlert('Error loading contact form feed.', 'error');
            });
    }
    else if (section === 'settings') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Account Settings</h2>
                <p style="color: var(--text-light);">Update your credentials and account preferences.</p>
            </div>

            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                <form id="settingsForm" onsubmit="event.preventDefault(); showAlert('Password updated successfully!', 'success')">
                    <h3 style="margin-bottom: 20px; color: var(--primary-color);">Change Password</h3>
                    <div class="form-group">
                        <label>Current Password</label>
                        <input type="password" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 5px;">
                    </div>
                    <div class="form-group" style="margin-top: 15px;">
                        <label>New Password</label>
                        <input type="password" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 5px;">
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 20px;">Update Password</button>
                </form>
            </div>
        `;
    }
    else if (section === 'blood-finder') {
        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Hospital & Blood Bank Stock Finder</h2>
                <p style="color: var(--text-light);">Search live blood supplies and availability metrics across our clinical network.</p>
            </div>

            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; align-items: flex-end;">
                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 13px; color: var(--text-dark);">Blood Type Needed</label>
                        <select id="finderBloodGroup" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 5px;">
                            <option value="">-- All Groups --</option>
                            <option value="A+" ${currentUser.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                            <option value="A-" ${currentUser.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${currentUser.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B-" ${currentUser.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="AB+" ${currentUser.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                            <option value="AB-" ${currentUser.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                            <option value="O+" ${currentUser.bloodGroup === 'O+' ? 'selected' : ''}>O+</option>
                            <option value="O-" ${currentUser.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 13px; color: var(--text-dark);">City or Region</label>
                        <input type="text" id="finderLocation" placeholder="e.g. Seattle, NY" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 5px;">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 600; font-size: 13px; color: var(--text-dark);">Facility Type</label>
                        <select id="finderType" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 5px;">
                            <option value="all">All Facilities</option>
                            <option value="banks">Blood Banks</option>
                            <option value="hospitals">Hospitals</option>
                        </select>
                    </div>
                    <div>
                        <button class="btn btn-primary" style="width: 100%; height: 42px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="searchBloodFinderStocks()">
                            <i class="fas fa-search"></i> Search Stocks
                        </button>
                    </div>
                </div>
            </div>

            <div id="finderResultsArea">
                <div style="text-align: center; padding: 40px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; color: var(--text-light);">
                    <i class="fas fa-map-marked-alt" style="font-size: 40px; color: #cbd5e1; margin-bottom: 12px;"></i>
                    <p style="margin: 0;">Specify filters above and click 'Search Stocks' to lookup reserves in real-time.</p>
                </div>
            </div>
        `;

        // Auto trigger search with user's blood group
        setTimeout(() => {
            if (window.searchBloodFinderStocks) {
                window.searchBloodFinderStocks();
            }
        }, 10);
    }
    else if (section === 'safety') {
        const checklistItems = [
            { id: 'hydration', title: 'Hydration Intake', desc: 'Drink at least 500mL of water or healthy fluids in the 2-3 hours leading to your appointment.' },
            { id: 'iron_meal', title: 'Iron-Rich Nutrition', desc: 'Consume a solid, iron-rich meal (like spinach, lean meats, or beans) and strictly avoid fatty foods.' },
            { id: 'rest_check', title: 'Rest & Sleeping Cycle', desc: 'Secure a minimum of 7-8 hours of healthy, deep sleep the night before your scheduled donation.' },
            { id: 'identity_doc', title: 'Identification Credentials', desc: 'Ensure you have a valid government-issued photo ID, passport, or blood donor card packed.' },
            { id: 'comfort_clothing', title: 'Comfortable Attire', desc: 'Wear loose-fitting clothing with sleeves that can be easily and comfortably rolled up past your elbow.' },
            { id: 'healthy_active', title: 'Daily Health Assessment', desc: 'Confirm you feel completely well, active, and have been entirely symptom-free of colds or viruses for 48 hours.' }
        ];

        const checklistKey = `prep_checklist_${currentUser.email}`;
        const savedStates = JSON.parse(localStorage.getItem(checklistKey) || '{}');

        contentArea.innerHTML = `
            <div class="dashboard-header">
                <h2>Donor Safety & Prep Tracker</h2>
                <p style="color: var(--text-light);">Follow this clinical preparation checklist before your appointment to ensure a safe and comfortable donation.</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr; gap: 30px; align-items: start; max-width: 1000px;">
                <!-- Checklist Card -->
                <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;">
                        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-dark); margin: 0;">Donation Day Checklist</h3>
                        <div id="safetyProgressBadge" style="background: #f0fdf4; color: #166534; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 20px;">
                            0% Prepared
                        </div>
                    </div>

                    <!-- Progress bar -->
                    <div style="width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 25px;">
                        <div id="safetyProgressBar" style="width: 0%; height: 100%; background: #10b981; transition: width 0.3s ease;"></div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${checklistItems.map(item => `
                            <label style="display: flex; gap: 15px; cursor: pointer; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9; background: #fafafa; transition: background 0.2s;">
                                <input type="checkbox" id="chk-${item.id}" class="safety-checkbox" ${savedStates[item.id] ? 'checked' : ''} onchange="toggleSafetyItem('${item.id}')" style="width: 18px; height: 18px; margin-top: 3px; accent-color: #10b981;">
                                <div>
                                    <strong style="display: block; font-size: 15px; color: var(--text-dark);">${item.title}</strong>
                                    <span style="font-size: 13px; color: var(--text-light); line-height: 1.4; display: block; margin-top: 2px;">${item.desc}</span>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Info Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                    <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 20px;">
                        <h4 style="color: #991b1b; font-size: 15px; font-weight: 700; margin-bottom: 10px;"><i class="fas fa-exclamation-triangle" style="margin-right: 6px;"></i> What to Avoid</h4>
                        <ul style="padding-left: 18px; font-size: 13px; color: #7f1d1d; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
                            <li>Do NOT consume alcoholic beverages for at least 24 hours prior to donating.</li>
                            <li>Avoid aspirin or medication containing aspirin for 48 hours if donating platelets.</li>
                            <li>Do NOT smoke or use nicotine products for at least 3 hours pre- and post-donation.</li>
                        </ul>
                    </div>

                    <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 20px;">
                        <h4 style="color: #1e40af; font-size: 15px; font-weight: 700; margin-bottom: 10px;"><i class="fas fa-shield-alt" style="margin-right: 6px;"></i> Post-Donation Safety</h4>
                        <ul style="padding-left: 18px; font-size: 13px; color: #1e3a8a; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
                            <li>Keep the compression strip bandage on for at least 4-5 hours to prevent bruising.</li>
                            <li>Drink an extra 4-5 glasses of non-alcoholic fluids over the next 24 hours.</li>
                            <li>Avoid strenuous physical activity, heavy lifting, or intense workouts for the rest of the day.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Update progress on load
        setTimeout(() => {
            if (window.updateSafetyProgress) {
                window.updateSafetyProgress();
            }
        }, 10);
    }

    // Register stock finder and safety helpers globally
    window.searchBloodFinderStocks = function() {
        const bg = document.getElementById('finderBloodGroup')?.value || '';
        const loc = document.getElementById('finderLocation')?.value || '';
        const type = document.getElementById('finderType')?.value || 'all';

        const resultsArea = document.getElementById('finderResultsArea');
        if (!resultsArea) return;

        resultsArea.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-color);"></i>
                <p style="margin-top: 10px; color: var(--text-light);">Searching real-time supplies...</p>
            </div>
        `;

        fetch(`/api/search?bloodGroup=${encodeURIComponent(bg)}&location=${encodeURIComponent(loc)}&type=${encodeURIComponent(type)}`)
            .then(res => res.json())
            .then(data => {
                if (data.length === 0) {
                    resultsArea.innerHTML = `
                        <div style="text-align: center; padding: 40px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; color: var(--text-light);">
                            <i class="fas fa-search-minus" style="font-size: 40px; color: #cbd5e1; margin-bottom: 12px;"></i>
                            <p style="margin: 0; font-weight: 600;">No matching blood supplies found.</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px;">Try adjusting your filters or search location terms.</p>
                        </div>
                    `;
                    return;
                }

                resultsArea.innerHTML = `
                    <div class="table-container" style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Facility Name & Location</th>
                                    <th>Type</th>
                                    <th>Blood Group</th>
                                    <th>Stock Available</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map((item, idx) => `
                                    <tr>
                                        <td>
                                            <strong style="color: var(--text-dark); font-size: 14px;">${item.name}</strong>
                                            <div style="font-size: 11px; color: var(--text-light); margin-top: 2px;">
                                                <i class="fas fa-map-marker-alt"></i> ${item.location} | <i class="fas fa-phone"></i> ${item.phone}
                                            </div>
                                        </td>
                                        <td>
                                            <span class="status-badge" style="background-color: ${item.type === 'banks' ? '#e0f2fe' : '#f0fdf4'}; color: ${item.type === 'banks' ? '#0369a1' : '#15803d'}; font-size: 10px; text-transform: uppercase; font-weight: 700;">
                                                ${item.type === 'banks' ? 'Blood Bank' : 'Hospital'}
                                            </span>
                                        </td>
                                        <td><strong style="color: var(--primary-color); font-size: 15px;">${item.bloodGroup}</strong></td>
                                        <td><strong style="color: #10b981; font-size: 15px;">${item.units} Units</strong></td>
                                        <td>
                                            <button class="btn btn-primary" style="font-size: 12px; padding: 6px 12px;" onclick="allocateFinderSupply('${item.name}', '${item.bloodGroup}', ${item.units})">
                                                <i class="fas fa-shipping-fast"></i> Request Stock
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            })
            .catch(err => {
                console.error(err);
                resultsArea.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; color: var(--text-light);">
                        <i class="fas fa-exclamation-circle" style="font-size: 40px; color: #e74c3c; margin-bottom: 12px;"></i>
                        <p style="margin: 0; font-weight: 600; color: #e74c3c;">Failed to retrieve supply records.</p>
                    </div>
                `;
            });
    };

    window.allocateFinderSupply = function(facilityName, bg, units) {
        showAlert(`Supply allocation initiated! Request for ${bg} units from ${facilityName} has been transmitted to our medical dispatch coordinators.`, 'success');
    };

    window.toggleSafetyItem = function(itemId) {
        const chk = document.getElementById(`chk-${itemId}`);
        if (!chk || !currentUser) return;

        const checklistKey = `prep_checklist_${currentUser.email}`;
        const savedStates = JSON.parse(localStorage.getItem(checklistKey) || '{}');
        savedStates[itemId] = chk.checked;
        localStorage.setItem(checklistKey, JSON.stringify(savedStates));

        window.updateSafetyProgress();
    };

    window.updateSafetyProgress = function() {
        if (!currentUser) return;
        const checklistKey = `prep_checklist_${currentUser.email}`;
        const savedStates = JSON.parse(localStorage.getItem(checklistKey) || '{}');
        
        const checklistIds = ['hydration', 'iron_meal', 'rest_check', 'identity_doc', 'comfort_clothing', 'healthy_active'];
        let checkedCount = 0;
        checklistIds.forEach(id => {
            if (savedStates[id]) checkedCount++;
        });

        const percent = Math.round((checkedCount / checklistIds.length) * 100);
        
        const progressBar = document.getElementById('safetyProgressBar');
        const progressBadge = document.getElementById('safetyProgressBadge');
        
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressBadge) {
            progressBadge.textContent = `${percent}% Prepared`;
            if (percent === 100) {
                progressBadge.style.background = '#d1fae5';
                progressBadge.style.color = '#065f46';
            } else {
                progressBadge.style.background = '#f0fdf4';
                progressBadge.style.color = '#166534';
            }
        }
    };

    // Attach administrative event helpers to window
    window.updateAdminRequestStatus = async function(requestId, status) {
        try {
            const response = await fetch('/api/admin/request/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, status })
            });
            const data = await response.json();
            if (data.success) {
                showAlert(`Request status updated to ${status}!`, 'success');
                loadDashboardSection('admin-requests');
            } else {
                showAlert(data.error || 'Error updating request.', 'error');
            }
        } catch (e) {
            console.error(e);
            showAlert('Could not contact administrative API.', 'error');
        }
    };

    window.deleteAdminRequest = async function(requestId) {
        if (!confirm('Are you sure you want to delete this blood request? This action is irreversible.')) return;
        try {
            const response = await fetch('/api/admin/request/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });
            const data = await response.json();
            if (data.success) {
                showAlert('Request deleted successfully.', 'success');
                loadDashboardSection('admin-requests');
            } else {
                showAlert(data.error || 'Error deleting request.', 'error');
            }
        } catch (e) {
            console.error(e);
            showAlert('Could not contact administrative API.', 'error');
        }
    };

    window.saveAdminInventory = async function(name, idx) {
        const input = document.getElementById(`input-units-${idx}`);
        if (!input) return;

        const units = parseInt(input.value);
        if (isNaN(units) || units < 0) {
            showAlert('Please enter a valid non-negative number of units.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/admin/inventory/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, units })
            });
            const data = await response.json();
            if (data.success) {
                showAlert(`Inventory updated for ${name}!`, 'success');
                const valSpan = document.getElementById(`units-val-${idx}`);
                if (valSpan) valSpan.textContent = `${units} Units`;
            } else {
                showAlert(data.error || 'Failed to update stock.', 'error');
            }
        } catch (e) {
            console.error(e);
            showAlert('Could not contact administrative API.', 'error');
        }
    };

    window.contactDonor = function(name) {
        showAlert(`Email/SMS dispatch console initiated for ${name} (Demo mode).`, 'success');
    };
}

// Initialize tooltips, session checks, pre-fills and query params
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'invalid') {
        showAlert('Invalid email or password. Please try again.', 'error');
    }
    if (urlParams.get('error') === 'exists') {
        showAlert('An account with this email address already exists.', 'error');
    }
    if (urlParams.get('success') === 'registered') {
        showAlert('Registration successful! Welcome to BloodSync.', 'success');
    }
    if (urlParams.get('success') === 'donation') {
        showAlert('Your donation appointment has been successfully scheduled!', 'success');
    }
    if (urlParams.get('success') === 'request') {
        showAlert('Your blood request has been successfully registered and published!', 'success');
    }
    if (urlParams.get('success') === '1') {
        showAlert('Thank you! Your message has been received, we will contact you shortly.', 'success');
    }

    if (currentPage === 'request.html') {
        const bgParam = urlParams.get('bloodGroup');
        const hospParam = urlParams.get('hospitalName');
        if (bgParam) {
            const select = document.getElementById('bloodGroupNeeded');
            if (select) select.value = bgParam;
        }
        if (hospParam) {
            const input = document.getElementById('hospitalName');
            if (input) input.value = hospParam;
        }
    }

    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        const today = new Date().toISOString().split('T')[0];
        if (input.id === 'dob') {
            input.setAttribute('max', today);
        } else {
            input.setAttribute('min', today);
        }
    });

    // Verify session and load page-specific values
    fetch('/api/session')
        .then(res => res.json())
        .then(session => {
            if (session.loggedIn) {
                currentUser = session.user;

                const navButtonsContainer = document.querySelector('.nav-buttons');
                if (navButtonsContainer) {
                    navButtonsContainer.innerHTML = `
                        <a href="dashboard.html" class="btn btn-outline active"><i class="fas fa-user"></i> My Account</a>
                        <a href="/api/logout" class="btn btn-primary"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    `;
                }

                if (currentPage === 'donate.html') {
                    const fullNameInput = document.getElementById('fullName');
                    const emailInput = document.getElementById('email');
                    const phoneInput = document.getElementById('phone');
                    const dobInput = document.getElementById('dob');
                    const bloodGroupSelect = document.getElementById('bloodGroup');
                    const weightInput = document.getElementById('weight');

                    if (fullNameInput) fullNameInput.value = currentUser.name;
                    if (emailInput) emailInput.value = currentUser.email;
                    if (phoneInput) phoneInput.value = currentUser.phone;
                    if (dobInput) dobInput.value = currentUser.dob;
                    if (bloodGroupSelect) bloodGroupSelect.value = currentUser.bloodGroup;
                    if (weightInput) weightInput.value = currentUser.weight || '';
                }

                if (currentPage === 'request.html') {
                    const requesterNameInput = document.getElementById('requesterName');
                    const requesterPhoneInput = document.getElementById('requesterPhone');
                    const requesterEmailInput = document.getElementById('requesterEmail');

                    if (requesterNameInput) requesterNameInput.value = currentUser.name;
                    if (requesterPhoneInput) requesterPhoneInput.value = currentUser.phone;
                    if (requesterEmailInput) requesterEmailInput.value = currentUser.email;
                }

                if (currentPage === 'dashboard.html') {
                    // Start the blood background animation
                    initDashboardAnimation();

                    if (currentUser.role === 'admin') {
                        // Setup admin sidebar profile information
                        const profileImg = document.querySelector('.sidebar img');
                        if (profileImg) profileImg.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'; // premium admin avatar
                        
                        const sidebarHeader = document.querySelector('.sidebar h4');
                        if (sidebarHeader) sidebarHeader.textContent = currentUser.name;

                        const sidebarLabel = document.querySelector('.sidebar p');
                        if (sidebarLabel) sidebarLabel.textContent = 'System Administrator';

                        // Change sidebar menu to admin menu options
                        const sidebarMenu = document.querySelector('.sidebar-menu');
                        if (sidebarMenu) {
                            sidebarMenu.innerHTML = `
                                <a href="#" class="active" data-section="admin-overview"><i class="fas fa-chart-line"></i> Admin Overview</a>
                                <a href="#" data-section="admin-requests"><i class="fas fa-tasks"></i> Manage Requests</a>
                                <a href="#" data-section="admin-users"><i class="fas fa-users-cog"></i> Donor Directory</a>
                                <a href="#" data-section="admin-inventory"><i class="fas fa-warehouse"></i> Inventory Manager</a>
                                <a href="#" data-section="admin-contacts"><i class="fas fa-envelope-open-text"></i> Contact Inquiries</a>
                                <a href="#" data-section="settings"><i class="fas fa-cog"></i> Settings</a>
                            `;

                            const newLinks = sidebarMenu.querySelectorAll('a');
                            newLinks.forEach(link => {
                                link.addEventListener('click', function (e) {
                                    e.preventDefault();
                                    newLinks.forEach(l => l.classList.remove('active'));
                                    this.classList.add('active');
                                    const section = this.getAttribute('data-section');
                                    loadDashboardSection(section);
                                });
                            });
                        }

                        // Load initial admin overview dashboard section
                        loadDashboardSection('admin-overview');
                    } else {
                        const sidebarHeader = document.querySelector('.sidebar h4');
                        if (sidebarHeader) sidebarHeader.textContent = currentUser.name;

                        const sidebarLabel = document.querySelector('.sidebar p');
                        if (sidebarLabel) sidebarLabel.textContent = `Type: ${currentUser.bloodGroup || 'O-'}`;

                        // Load user data records
                        fetch('/api/user-data')
                            .then(res => res.json())
                            .then(data => {
                                userDonations = data.donations;
                                userRequests = data.requests;
                                loadDashboardSection('overview');
                            })
                            .catch(err => {
                                console.error('Error fetching user records:', err);
                                loadDashboardSection('overview');
                            });
                    }
                }
            } else {
                if (currentPage === 'dashboard.html') {
                    window.location.href = 'login.html';
                }
            }
        })
        .catch(err => {
            console.error('Error verifying session:', err);
        });
});

// Scroll to top button
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.className = 'scroll-to-top';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        z-index: 999;
    `;

    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.display = 'flex';
        } else {
            button.style.display = 'none';
        }
    });

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-3px)';
        button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
}

createScrollToTopButton();

// Convert and Export data helper
window.exportToCSV = function(data, filename) {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => obj[header]).join(','));
    return [headers.join(','), ...rows].join('\n');
}

window.cancelUserAppointment = function(id) {
    if (!confirm('Are you sure you want to cancel this scheduled blood donation appointment? This will release your reserved slot.')) return;
    
    fetch('/api/cancel-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showAlert('Appointment cancelled successfully.', 'success');
            fetch('/api/user-data')
                .then(res => res.json())
                .then(records => {
                    userDonations = records.donations;
                    loadDashboardSection('appointments');
                });
        } else {
            showAlert(data.error || 'Failed to cancel appointment', 'error');
        }
    })
    .catch(err => {
        showAlert('Error contacting API server', 'error');
    });
};
