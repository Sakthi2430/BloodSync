/**
 * BloodSync - Gamified Eligibility & Donor Passport Generator (Modular Component)
 */

window.initGamifiedEligibility = function(containerId, currentUser, onCompleteCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Quiz Questions
    const questions = [
        { q: "Are you aged between 17 and 65 years?", tip: "Regulatory requirement to ensure physiological maturity & safety.", icon: "fa-calendar-alt" },
        { q: "Do you weigh at least 50 kg (110 lbs)?", tip: "A healthy minimum body weight ensures safe fluid depletion ratios.", icon: "fa-weight" },
        { q: "Have you had a tattoo or body piercing in the last 12 months?", tip: "A standard precautionary buffer against potential infectious disease exposure.", icon: "fa-pen-fancy" },
        { q: "Are you feeling completely well, healthy, and active today?", tip: "Temporary deferrals apply if you have a cold, flu, fever, or standard symptoms.", icon: "fa-heartbeat" },
        { q: "Have you taken oral antibiotics in the last 7 days?", tip: "Bacterial infections must be fully cleared from the system before blood collection.", icon: "fa-pills" },
        { q: "Have you traveled outside the country in the last 6 months?", tip: "Screens for travel to regions with endemic malaria, dengue, or other viruses.", icon: "fa-plane" }
    ];

    let currentStep = 0;
    let answers = [];
    let heightCm = 175;
    let weightKg = 70;
    let gender = 'male';

    function calculateBloodVolume(gender, heightCm, weightKg) {
        // Nadler's formulas
        let volumeL = 0;
        if (gender === 'male') {
            volumeL = (0.3669 * Math.pow(heightCm / 100, 3)) + (0.03219 * weightKg) + 0.6041;
        } else {
            volumeL = (0.3561 * Math.pow(heightCm / 100, 3)) + (0.03308 * weightKg) + 0.1833;
        }
        return parseFloat(volumeL.toFixed(2));
    }

    function render() {
        const volumeL = calculateBloodVolume(gender, heightCm, weightKg);
        const percentDrawn = ((0.450 / volumeL) * 100).toFixed(1);

        container.innerHTML = `
            <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: grid; grid-template-columns: 1fr; gap: 30px;">
                
                <!-- Main Grid splitting advisor calculator and the interactive screening -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
                    
                    <!-- Left column: Scientific Volume Calculator -->
                    <div style="background: #fafafa; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px;">
                        <h3 style="font-size: 16px; color: #1e293b; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-calculator" style="color: #dc2626;"></i> Personal Blood Volume Estimator
                        </h3>
                        <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
                            Estimate your body's total blood volume using Nadler's scientific formula. See what fraction of your volume is contributed during a single-unit donation.
                        </p>

                        <!-- Calculator Inputs -->
                        <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
                            <div>
                                <label style="font-size: 12px; font-weight: 600; color: #64748b; display: block; margin-bottom: 6px;">BIOLOGICAL GENDER</label>
                                <div style="display: flex; gap: 10px;">
                                    <button class="vol-gender-btn ${gender === 'male' ? 'active' : ''}" onclick="window.setVolGender('male')" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid ${gender === 'male' ? '#dc2626' : '#cbd5e1'}; background: ${gender === 'male' ? '#fef2f2' : 'white'}; color: ${gender === 'male' ? '#b91c1c' : '#475569'}; font-weight: 600; font-size: 13px; cursor: pointer;">Male</button>
                                    <button class="vol-gender-btn ${gender === 'female' ? 'active' : ''}" onclick="window.setVolGender('female')" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid ${gender === 'female' ? '#dc2626' : '#cbd5e1'}; background: ${gender === 'female' ? '#fef2f2' : 'white'}; color: ${gender === 'female' ? '#b91c1c' : '#475569'}; font-weight: 600; font-size: 13px; cursor: pointer;">Female</button>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div>
                                    <label style="font-size: 12px; font-weight: 600; color: #64748b; display: block; margin-bottom: 6px;">HEIGHT (CM)</label>
                                    <input type="number" value="${heightCm}" oninput="window.setVolHeight(this.value)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13.5px; font-weight: 600;" min="100" max="250">
                                </div>
                                <div>
                                    <label style="font-size: 12px; font-weight: 600; color: #64748b; display: block; margin-bottom: 6px;">WEIGHT (KG)</label>
                                    <input type="number" value="${weightKg}" oninput="window.setVolWeight(this.value)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13.5px; font-weight: 600;" min="30" max="200">
                                </div>
                            </div>
                        </div>

                        <!-- Volume Output Gauge -->
                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                            <div>
                                <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">ESTIMATED TOTAL VOLUME</div>
                                <div style="font-size: 24px; font-weight: 800; color: #dc2626; margin: 4px 0;">${volumeL} Liters</div>
                                <p style="font-size: 11.5px; color: #64748b; margin: 0; line-height: 1.4;">
                                    A single standard donation (450 mL) is only about <strong>${percentDrawn}%</strong> of your total supply. Your body easily replenishes plasma in 24 hours!
                                </p>
                            </div>
                            <div style="width: 60px; height: 60px; border-radius: 50%; border: 4px solid #fecaca; display: flex; align-items: center; justify-content: center; position: relative;">
                                <i class="fas fa-tint" style="color: #ef4444; font-size: 24px;"></i>
                                <span style="position: absolute; font-size: 9px; font-weight: 700; color: white; bottom: 18px;">${percentDrawn}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right column: Interactive screening wizard -->
                    <div style="display: flex; flex-direction: column; justify-content: space-between;" id="screening-wizard-panel">
                        <!-- Loaded dynamically -->
                    </div>
                </div>

                <!-- Digital Donor Passport Spot (Appears on completion) -->
                <div id="donor-passport-spot" style="display: none;"></div>
            </div>
        `;

        renderWizardStep();
    }

    function renderWizardStep() {
        const wizardPanel = document.getElementById('screening-wizard-panel');
        if (!wizardPanel) return;

        if (currentStep < questions.length) {
            const q = questions[currentStep];
            const progress = ((currentStep) / questions.length) * 100;

            wizardPanel.innerHTML = `
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 11px; background: #eff6ff; color: #2563eb; font-weight: 700; padding: 4px 10px; border-radius: 12px;">STEP ${currentStep + 1} of ${questions.length}</span>
                        <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">${Math.round(progress)}% COMPLETE</span>
                    </div>

                    <!-- Progress Bar -->
                    <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; margin-bottom: 24px; overflow: hidden;">
                        <div style="width: ${progress}%; height: 100%; background: #2563eb; border-radius: 3px; transition: width 0.3s ease;"></div>
                    </div>

                    <!-- Question Card -->
                    <div style="text-align: center; padding: 15px 0;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: #f8fafc; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; border: 1px solid #e2e8f0;">
                            <i class="fas ${q.icon}" style="font-size: 20px; color: #dc2626;"></i>
                        </div>
                        <h4 style="font-size: 18px; color: #1e293b; font-weight: 700; line-height: 1.4; margin-bottom: 10px; min-height: 50px;">${q.q}</h4>
                        <p style="font-size: 13px; color: #64748b; max-width: 320px; margin: 0 auto; line-height: 1.5; min-height: 40px;">
                            <i class="far fa-lightbulb" style="color: #eab308;"></i> ${q.tip}
                        </p>
                    </div>
                </div>

                <!-- Action buttons -->
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button onclick="window.submitWizardAnswer(false)" class="btn btn-outline" style="flex: 1; padding: 12px; font-weight: 700; font-size: 14px; border-color: #cbd5e1; color: #475569; background: white;">
                        No
                    </button>
                    <button onclick="window.submitWizardAnswer(true)" class="btn btn-primary" style="flex: 1; padding: 12px; font-weight: 700; font-size: 14px;">
                        Yes
                    </button>
                </div>
            `;
        } else {
            // Process results
            evaluateScreeningResults();
        }
    }

    window.setVolGender = function(val) {
        gender = val;
        render();
    };

    window.setVolHeight = function(val) {
        heightCm = parseInt(val) || 170;
        const volumeL = calculateBloodVolume(gender, heightCm, weightKg);
        const percentDrawn = ((0.450 / volumeL) * 100).toFixed(1);
        const textVal = document.querySelector('div h4 + div + p + div h4');
        if (textVal) textVal.textContent = `${volumeL} Liters`;
    };

    window.setVolWeight = function(val) {
        weightKg = parseInt(val) || 70;
        const volumeL = calculateBloodVolume(gender, heightCm, weightKg);
        const percentDrawn = ((0.450 / volumeL) * 100).toFixed(1);
        const textVal = document.querySelector('div h4 + div + p + div h4');
        if (textVal) textVal.textContent = `${volumeL} Liters`;
    };

    window.submitWizardAnswer = function(answer) {
        answers.push(answer);
        currentStep++;
        renderWizardStep();
    };

    async function evaluateScreeningResults() {
        // Correct responses mapping:
        // Q1: YES (true)
        // Q2: YES (true)
        // Q3: NO (false)
        // Q4: YES (true)
        // Q5: NO (false)
        // Q6: NO (false)
        const rules = [true, true, false, true, false, false];
        let score = 0;
        for (let i = 0; i < answers.length; i++) {
            if (answers[i] === rules[i]) score++;
        }

        const isEligible = score === questions.length;
        const status = isEligible ? 'Eligible' : 'Ineligible';

        const wizardPanel = document.getElementById('screening-wizard-panel');
        if (!wizardPanel) return;

        wizardPanel.innerHTML = `
            <div style="text-align: center; padding: 20px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <div style="width: 70px; height: 70px; border-radius: 50%; background: ${isEligible ? '#ecfdf5' : '#fef2f2'}; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid ${isEligible ? '#a7f3d0' : '#fecaca'};">
                    <i class="fas ${isEligible ? 'fa-check-circle' : 'fa-times-circle'}" style="font-size: 34px; color: ${isEligible ? '#059669' : '#dc2626'};"></i>
                </div>
                <h3 style="font-size: 20px; color: #1e293b; font-weight: 700; margin-bottom: 8px;">${isEligible ? 'Verified Eligible!' : 'Ineligible for Now'}</h3>
                <p style="font-size: 13.5px; color: #64748b; line-height: 1.5; max-width: 320px; margin-bottom: 24px;">
                    ${isEligible 
                        ? 'Great news! Your parameters satisfy clinical criteria. Your official Digital Donor Passport has been generated successfully.' 
                        : 'For your safety and patients\' safety, you are temporarily deferred. Please read our guidelines or consult a primary clinic nurse.'}
                </p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-outline" onclick="window.resetScreeningWizard()" style="font-size: 13px; padding: 8px 16px; font-weight: 600; background: white; border-color: #cbd5e1;">Retake screening</button>
                    ${isEligible ? `<button class="btn btn-primary" onclick="document.getElementById('donor-passport-spot').scrollIntoView({behavior: 'smooth'})" style="font-size: 13px; padding: 8px 16px; font-weight: 600;">View Passport</button>` : ''}
                </div>
            </div>
        `;

        // Render Passport if eligible
        if (isEligible) {
            renderDonorPassport();
        }

        // Notify parent / trigger API save
        if (onCompleteCallback) {
            onCompleteCallback(score, status);
        }
    }

    function renderDonorPassport() {
        const passportSpot = document.getElementById('donor-passport-spot');
        if (!passportSpot) return;

        passportSpot.style.display = 'block';

        const bloodType = currentUser.bloodGroup || 'O-';
        const name = currentUser.name || 'John Doe';
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        let recommendedDonation = 'Whole Blood';
        let subText = 'Standard multi-purpose transfusion component';
        if (bloodType === 'O-') {
            recommendedDonation = 'Double Red Blood Cells';
            subText = 'Critical demand: delivers twice the oxygen-carrying red cells.';
        } else if (bloodType === 'AB+' || bloodType === 'AB-') {
            recommendedDonation = 'Apheresis Platelets / Plasma';
            subText = 'Universal plasma donor preference: aids cancer & trauma patients.';
        }

        passportSpot.innerHTML = `
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 24px; margin-top: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 10px; background: #fef3c7; color: #d97706; font-weight: 700; padding: 3px 8px; border-radius: 10px;">SECURE DIGITAL PASS</span>
                    <h3 style="font-size: 18px; color: #1e293b; font-weight: 700; margin-top: 6px; margin-bottom: 2px;">Your Digital Donor Passport</h3>
                    <p style="font-size: 12.5px; color: #64748b;">Present this verified pass on your smartphone during your next appointment check-in.</p>
                </div>

                <!-- Visual Passport Graphic -->
                <div id="passport-print-target" style="max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; border: 1px solid #334155; padding: 24px; color: white; position: relative; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                    <!-- Decorative blood drop glow background -->
                    <div style="position: absolute; right: -20px; top: -20px; opacity: 0.15; font-size: 160px; color: #ef4444; z-index: 1;">
                        <i class="fas fa-tint"></i>
                    </div>

                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; z-index: 2; position: relative; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 15px;">
                        <div>
                            <div style="font-size: 15px; font-weight: 800; color: #ef4444; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-heartbeat"></i> BLOODSYNC CLINICAL PASS
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; font-weight: 600; letter-spacing: 1px; margin-top: 2px;">VERIFIED SCREENING METRICS</div>
                        </div>
                        <span style="background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">ACTIVE</span>
                    </div>

                    <!-- Grid Layout -->
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px; z-index: 2; position: relative; margin-bottom: 15px;">
                        
                        <!-- Left Info -->
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <span style="font-size: 10px; color: #64748b; font-weight: 600; display: block; letter-spacing: 0.5px; text-transform: uppercase;">DONOR NAME</span>
                                <span style="font-size: 15px; font-weight: 700; color: #f8fafc;">${name}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div>
                                    <span style="font-size: 10px; color: #64748b; font-weight: 600; display: block; letter-spacing: 0.5px; text-transform: uppercase;">BLOOD GROUP</span>
                                    <span style="font-size: 16px; font-weight: 800; color: #ef4444;">${bloodType}</span>
                                </div>
                                <div>
                                    <span style="font-size: 10px; color: #64748b; font-weight: 600; display: block; letter-spacing: 0.5px; text-transform: uppercase;">ISSUE DATE</span>
                                    <span style="font-size: 13px; font-weight: 600; color: #cbd5e1;">${dateStr}</span>
                                </div>
                            </div>
                            <div>
                                <span style="font-size: 10px; color: #64748b; font-weight: 600; display: block; letter-spacing: 0.5px; text-transform: uppercase;">RECOMMENDED CLINICAL TRACK</span>
                                <span style="font-size: 13.5px; font-weight: 700; color: #38bdf8; display: block; margin-top: 2px;">${recommendedDonation}</span>
                                <span style="font-size: 11px; color: #94a3b8; display: block; margin-top: 1px; line-height: 1.3;">${subText}</span>
                            </div>
                        </div>

                        <!-- Right QR & Barcode Simulation -->
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 10px;">
                            <!-- SVG QR code generator -->
                            <div style="background: white; padding: 8px; border-radius: 8px; display: inline-block;">
                                <svg width="84" height="84" viewBox="0 0 100 100" style="display: block;">
                                    <!-- Dynamic Simulated QR patterns -->
                                    <rect x="0" y="0" width="30" height="30" fill="#1e293b"/>
                                    <rect x="5" y="5" width="20" height="20" fill="#ffffff"/>
                                    <rect x="10" y="10" width="10" height="10" fill="#1e293b"/>
                                    
                                    <rect x="70" y="0" width="30" height="30" fill="#1e293b"/>
                                    <rect x="75" y="5" width="20" height="20" fill="#ffffff"/>
                                    <rect x="80" y="10" width="10" height="10" fill="#1e293b"/>
                                    
                                    <rect x="0" y="70" width="30" height="30" fill="#1e293b"/>
                                    <rect x="5" y="75" width="20" height="20" fill="#ffffff"/>
                                    <rect x="10" y="80" width="10" height="10" fill="#1e293b"/>
                                    
                                    <!-- Random noise clusters representing verified medical payload -->
                                    <rect x="40" y="10" width="10" height="20" fill="#1e293b"/>
                                    <rect x="55" y="0" width="10" height="10" fill="#1e293b"/>
                                    <rect x="45" y="40" width="15" height="15" fill="#1e293b"/>
                                    <rect x="10" y="45" width="20" height="10" fill="#1e293b"/>
                                    <rect x="70" y="45" width="25" height="15" fill="#1e293b"/>
                                    <rect x="40" y="70" width="10" height="25" fill="#1e293b"/>
                                    <rect x="55" y="80" width="25" height="10" fill="#1e293b"/>
                                    <rect x="80" y="70" width="15" height="15" fill="#1e293b"/>
                                    <circle cx="50" cy="50" r="10" fill="#ef4444"/>
                                    <circle cx="50" cy="50" r="4" fill="#ffffff"/>
                                </svg>
                            </div>
                            <span style="font-family: monospace; font-size: 9px; color: #94a3b8; letter-spacing: 1.5px; font-weight: 600;">PASS-948A2-E</span>
                        </div>

                    </div>

                    <!-- Bottom Barcode -->
                    <div style="border-top: 1px solid #334155; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div style="display: flex; flex-direction: column; gap: 1px;">
                            <!-- Simulating Barcode Stripes -->
                            <div style="display: flex; height: 16px; background: #334155; width: 140px; gap: 2px;">
                                <div style="width:4px; height:100%; background: #94a3b8;"></div>
                                <div style="width:2px; height:100%; background: #94a3b8;"></div>
                                <div style="width:6px; height:100%; background: #94a3b8;"></div>
                                <div style="width:1px; height:100%; background: #94a3b8;"></div>
                                <div style="width:3px; height:100%; background: #94a3b8;"></div>
                                <div style="width:1px; height:100%; background: #94a3b8;"></div>
                                <div style="width:5px; height:100%; background: #94a3b8;"></div>
                                <div style="width:2px; height:100%; background: #94a3b8;"></div>
                                <div style="width:4px; height:100%; background: #94a3b8;"></div>
                                <div style="width:1px; height:100%; background: #94a3b8;"></div>
                                <div style="width:7px; height:100%; background: #94a3b8;"></div>
                            </div>
                        </div>
                        <span style="font-size: 11px; color: #94a3b8; font-weight: 500; display: flex; align-items: center; gap: 4px;">
                            <i class="fas fa-shield-alt" style="color: #22c55e;"></i> Verified clinical safety stamp
                        </span>
                    </div>
                </div>

                <div style="display: flex; justify-content: center; gap: 12px; margin-top: 16px;">
                    <button class="btn btn-outline" onclick="window.printDonorPassport()" style="font-size: 13px; padding: 8px 16px; font-weight: 600; background: white; border-color: #cbd5e1; display: inline-flex; align-items: center; gap: 6px;">
                        <i class="fas fa-print"></i> Print Passport
                    </button>
                    <a href="donate.html" class="btn btn-primary" style="font-size: 13px; padding: 8px 16px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                        <i class="far fa-calendar-check"></i> Book Reservation Now
                    </a>
                </div>
            </div>
        `;
    }

    window.resetScreeningWizard = function() {
        currentStep = 0;
        answers = [];
        render();
    };

    window.printDonorPassport = function() {
        const printContent = document.getElementById('passport-print-target');
        if (!printContent) return;
        
        const originalContent = document.body.innerHTML;
        
        // Simulating a elegant print view
        const printWindow = window.open('', '', 'height=500,width=600');
        printWindow.document.write('<html><head><title>BloodSync Digital Donor Passport</title>');
        printWindow.document.write('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: "Poppins", sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f1f5f9; }');
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 800);
    };

    render();
};
