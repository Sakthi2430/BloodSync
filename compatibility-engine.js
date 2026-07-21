/**
 * BloodSync - Compatibility Matcher Engine (Modular Component)
 * Provides interactive animated blood transfusion simulation with medical insights.
 */

window.initCompatibilityEngine = function(containerId, initialGroup = 'A+') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Compatibility matrix definitions
    const matrix = {
        'O-': { give: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], receive: ['O-'], name: 'Universal Donor' },
        'O+': { give: ['O+', 'A+', 'B+', 'AB+'], receive: ['O-', 'O+'], name: 'High-Demand Donor' },
        'A-': { give: ['A-', 'A+', 'AB-', 'AB+'], receive: ['O-', 'A-'], name: 'Sub-group Savior' },
        'A+': { give: ['A+', 'AB+'], receive: ['O-', 'O+', 'A-', 'A+'], name: 'Standard Active' },
        'B-': { give: ['B-', 'B+', 'AB-', 'AB+'], receive: ['O-', 'B-'], name: 'Rare Group Hero' },
        'B+': { give: ['B+', 'AB+'], receive: ['O-', 'O+', 'B-', 'B+'], name: 'Active Matcher' },
        'AB-': { give: ['AB-', 'AB+'], receive: ['O-', 'A-', 'B-', 'AB-'], name: 'Rare Receptor' },
        'AB+': { give: ['AB+'], receive: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], name: 'Universal Recipient' }
    };

    const types = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    
    let selectedDonor = initialGroup;
    let selectedRecipient = initialGroup;
    let isSimulating = false;

    function render() {
        const isCompatible = matrix[selectedDonor].give.includes(selectedRecipient);

        container.innerHTML = `
            <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 11px; background: #fee2e2; color: #dc2626; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Scientific Sandbox</span>
                    <h3 style="font-size: 20px; color: #1e293b; font-weight: 700; margin-top: 8px; margin-bottom: 4px;">Dynamic Transfusion Simulator</h3>
                    <p style="font-size: 13.5px; color: #64748b; max-width: 500px; margin: 0 auto;">Select donor and recipient groups to simulate how immune systems react in real time.</p>
                </div>

                <!-- Input selectors grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <!-- Donor selection panel -->
                    <div style="background: #fafafa; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9;">
                        <h4 style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                            <span style="display: inline-block; width: 8px; height: 8px; background: #dc2626; border-radius: 50%;"></span> Select Donor Type
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;" id="sim-donor-grid"></div>
                    </div>

                    <!-- Recipient selection panel -->
                    <div style="background: #fafafa; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9;">
                        <h4 style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                            <span style="display: inline-block; width: 8px; height: 8px; background: #2563eb; border-radius: 50%;"></span> Select Recipient Type
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;" id="sim-recipient-grid"></div>
                    </div>
                </div>

                <!-- Visual simulation stage -->
                <div style="background: #0f172a; border-radius: 14px; padding: 24px; position: relative; height: 260px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 24px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);">
                    <!-- Simulation particles / grid background -->
                    <div style="position: absolute; inset: 0; opacity: 0.1; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 16px 16px;"></div>
                    
                    <div id="simulation-stage-inner" style="display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 450px; z-index: 2;">
                        <!-- Donor Bag -->
                        <div style="text-align: center; width: 110px;">
                            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">DONOR</div>
                            <div style="position: relative; display: inline-block;">
                                <svg width="70" height="100" viewBox="0 0 70 100" style="overflow: visible;">
                                    <!-- Blood Bag Outline -->
                                    <path d="M 10 5 Q 10 0 15 0 L 55 0 Q 60 0 60 5 L 60 75 Q 60 90 35 95 Q 10 90 10 75 Z" fill="#334155" stroke="#475569" stroke-width="2" />
                                    <!-- Hanging loop -->
                                    <circle cx="35" cy="-5" r="4" fill="none" stroke="#475569" stroke-width="2" />
                                    <!-- Blood Fill Level -->
                                    <path id="donor-bag-fill" d="M 12 15 Q 12 15 12 15 L 58 15 Q 58 15 58 15 L 58 75 Q 58 88 35 93 Q 12 88 12 75 Z" fill="#991b1b" style="transition: d 2s cubic-bezier(0.4, 0, 0.2, 1); clip-path: inset(0% 0% 0% 0% -webkit-clip-path); transform-origin: bottom;" />
                                    <!-- Blood Group Text Overlay -->
                                    <text x="35" y="55" font-family="Poppins" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle" id="donor-type-text">${selectedDonor}</text>
                                </svg>
                            </div>
                        </div>

                        <!-- Interactive Transfusion Tube & Flow Indicator -->
                        <div style="flex: 1; height: 40px; display: flex; align-items: center; justify-content: center; position: relative;">
                            <div style="width: 100%; height: 6px; background: #334155; border-radius: 3px; overflow: hidden; position: relative; border: 1px solid #475569;">
                                <div id="flow-line-indicator" style="position: absolute; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, #ef4444, transparent);"></div>
                            </div>
                            <button id="btn-run-transfusion" class="btn btn-primary" style="position: absolute; z-index: 5; font-size: 12px; padding: 6px 14px; white-space: nowrap; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.4); border-radius: 30px;">
                                <i class="fas fa-play"></i> Run Transfusion
                            </button>
                        </div>

                        <!-- Recipient Receiver -->
                        <div style="text-align: center; width: 110px;">
                            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">RECIPIENT</div>
                            <div style="position: relative; display: inline-block;">
                                <svg width="70" height="100" viewBox="0 0 70 100" style="overflow: visible;">
                                    <!-- Recipient Beaker/IV Outline -->
                                    <rect x="15" y="10" width="40" height="80" rx="6" fill="#334155" stroke="#475569" stroke-width="2" />
                                    <!-- Fluid Level -->
                                    <rect id="recipient-beaker-fill" x="17" y="55" width="36" height="33" rx="4" fill="#1e3a8a" style="transition: y 2s, height 2s;" />
                                    <!-- Blood Group Text Overlay -->
                                    <text x="35" y="55" font-family="Poppins" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle" id="recipient-type-text">${selectedRecipient}</text>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Overlay Result Message -->
                    <div id="sim-result-overlay" style="position: absolute; bottom: 12px; left: 12px; right: 12px; background: rgba(15, 23, 42, 0.95); border: 1px solid #334155; border-radius: 8px; padding: 12px; text-align: center; display: none; transform: translateY(10px); opacity: 0; transition: all 0.3s ease;">
                        <span id="sim-result-title" style="font-size: 13.5px; font-weight: 700; display: block; margin-bottom: 2px;"></span>
                        <span id="sim-result-desc" style="font-size: 11.5px; color: #94a3b8; display: block;"></span>
                    </div>
                </div>

                <!-- Live Medical Diagnostic Breakdown -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                    <h4 style="font-size: 14.5px; color: #1e293b; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-stethoscope" style="color: #dc2626;"></i> Clinical Diagnostic Report
                    </h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #edf2f7;">
                            <span style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">DONOR ERYTHROCYTES</span>
                            <div style="font-size: 13px; color: #475569; font-weight: 600; margin-top: 4px;" id="diag-donor-antigens"></div>
                        </div>
                        <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #edf2f7;">
                            <span style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">RECIPIENT SERUM PLASMAS</span>
                            <div style="font-size: 13px; color: #475569; font-weight: 600; margin-top: 4px;" id="diag-recipient-antibodies"></div>
                        </div>
                        <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #edf2f7; grid-column: span 1;">
                            <span style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">IMMUNE CLUMPING RISK</span>
                            <div style="font-size: 13px; font-weight: 700; margin-top: 4px;" id="diag-clump-risk"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render Grids
        const donorGrid = document.getElementById('sim-donor-grid');
        const recipientGrid = document.getElementById('sim-recipient-grid');

        if (donorGrid) {
            donorGrid.innerHTML = types.map(t => {
                const active = t === selectedDonor ? 'background: #dc2626; color: white; border-color: #dc2626;' : 'background: white; color: #334155; border-color: #cbd5e1;';
                return `<button class="compat-node-btn" style="${active} padding: 8px 4px; border-radius: 8px; border: 1px solid; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;" data-type="${t}" onclick="window.selectSimDonor('${t}')">${t}</button>`;
            }).join('');
        }

        if (recipientGrid) {
            recipientGrid.innerHTML = types.map(t => {
                const active = t === selectedRecipient ? 'background: #2563eb; color: white; border-color: #2563eb;' : 'background: white; color: #334155; border-color: #cbd5e1;';
                return `<button class="compat-node-btn" style="${active} padding: 8px 4px; border-radius: 8px; border: 1px solid; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;" data-type="${t}" onclick="window.selectSimRecipient('${t}')">${t}</button>`;
            }).join('');
        }

        // Setup Clinical Report text
        updateDiagnosticDetails(selectedDonor, selectedRecipient, isCompatible);

        // Bind simulation button click
        document.getElementById('btn-run-transfusion').addEventListener('click', runTransfusionAnimation);
    }

    function updateDiagnosticDetails(donor, recipient, isCompatible) {
        const donorAntigens = [];
        if (donor.includes('A')) donorAntigens.push('Antigen A');
        if (donor.includes('B')) donorAntigens.push('Antigen B');
        if (donor.includes('+')) donorAntigens.push('Rh factor (D Antigen)');
        if (donorAntigens.length === 0) donorAntigens.push('No surface antigens (Type O)');

        const recipientAntibodies = [];
        if (!recipient.includes('A')) recipientAntibodies.push('Anti-A Antibody');
        if (!recipient.includes('B')) recipientAntibodies.push('Anti-B Antibody');
        if (!recipient.includes('+')) recipientAntibodies.push('Anti-D (Rh) Antibody');
        if (recipient === 'AB+') recipientAntibodies.push('No antibodies');

        document.getElementById('diag-donor-antigens').innerHTML = donorAntigens.map(a => `<span style="display: block; margin-bottom: 2px;"><i class="fas fa-microscope" style="color:#ef4444;"></i> ${a}</span>`).join('');
        document.getElementById('diag-recipient-antibodies').innerHTML = recipientAntibodies.map(ab => `<span style="display: block; margin-bottom: 2px;"><i class="fas fa-shield-alt" style="color:#3b82f6;"></i> ${ab}</span>`).join('');

        const riskEl = document.getElementById('diag-clump-risk');
        if (isCompatible) {
            riskEl.innerHTML = '<span style="color: #16a34a;"><i class="fas fa-check-double"></i> SECURE (0% Agglutination Risk)</span>';
        } else {
            riskEl.innerHTML = '<span style="color: #dc2626;"><i class="fas fa-radiation-alt"></i> SEVERE (100% Hemolytic Clumping Risk)</span>';
        }
    }

    window.selectSimDonor = function(type) {
        if (isSimulating) return;
        selectedDonor = type;
        render();
    };

    window.selectSimRecipient = function(type) {
        if (isSimulating) return;
        selectedRecipient = type;
        render();
    };

    function runTransfusionAnimation() {
        if (isSimulating) return;
        isSimulating = true;
        
        const isCompatible = matrix[selectedDonor].give.includes(selectedRecipient);

        const btn = document.getElementById('btn-run-transfusion');
        const donorFill = document.getElementById('donor-bag-fill');
        const recipientFill = document.getElementById('recipient-beaker-fill');
        const flowLine = document.getElementById('flow-line-indicator');
        const overlay = document.getElementById('sim-result-overlay');

        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-sync fa-spin"></i> Flowing...`;
        
        // Hide overlay initially
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateY(10px)';

        // Animate fluid flowing through tube
        flowLine.style.animation = 'flowAcross 1.5s linear infinite';
        flowLine.style.left = '0';

        // Animate donor bag draining
        donorFill.style.transform = 'scaleY(0.4)';
        
        // Animate recipient beaker filling with red blood cells
        setTimeout(() => {
            recipientFill.style.fill = isCompatible ? '#991b1b' : '#450a0a'; // Lighter pleasant red or thick clot color
            recipientFill.style.y = '12px';
            recipientFill.style.height = '76px';
        }, 500);

        // Complete simulation
        setTimeout(() => {
            flowLine.style.animation = 'none';
            flowLine.style.left = '-100%';
            isSimulating = false;
            
            // Render Result Card Overlay inside stage
            overlay.style.display = 'block';
            
            const titleEl = document.getElementById('sim-result-title');
            const descEl = document.getElementById('sim-result-desc');

            if (isCompatible) {
                overlay.style.borderColor = '#16a34a';
                titleEl.innerHTML = `<i class="fas fa-check-circle" style="color: #16a34a;"></i> Transfusion Successful`;
                titleEl.style.color = '#22c55e';
                descEl.innerHTML = `Blood group <strong>${selectedDonor}</strong> successfully integrated with <strong>${selectedRecipient}</strong>. No immunological rejection detected. Recipient cell count is safe.`;
            } else {
                overlay.style.borderColor = '#dc2626';
                titleEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #dc2626;"></i> FATAL Hemolytic Reaction`;
                titleEl.style.color = '#ef4444';
                descEl.innerHTML = `Rejection! Antibodies in <strong>${selectedRecipient}</strong> serum recognized surface antigens on <strong>${selectedDonor}</strong> erythrocytes. Rapid clumping (agglutination) occurred!`;
            }

            setTimeout(() => {
                overlay.style.opacity = '1';
                overlay.style.transform = 'translateY(0)';
            }, 50);

            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-redo"></i> Reset Sandbox`;
            btn.onclick = function() {
                donorFill.style.transform = 'none';
                recipientFill.style.fill = '#1e3a8a';
                recipientFill.style.y = '55px';
                recipientFill.style.height = '33px';
                overlay.style.display = 'none';
                overlay.style.opacity = '0';
                overlay.style.transform = 'translateY(10px)';
                btn.innerHTML = `<i class="fas fa-play"></i> Run Transfusion`;
                btn.onclick = runTransfusionAnimation;
            };

        }, 2200);
    }

    // Embed CSS rules for blood flowing animations
    if (!document.getElementById('flow-animations')) {
        const style = document.createElement('style');
        style.id = 'flow-animations';
        style.textContent = `
            @keyframes flowAcross {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            .compat-node-btn:hover {
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
    }

    render();
};
