/**
 * BloodSync - Smart Emergency Coordinator & Demand Planner (Modular Component)
 * Designed for administrators and healthcare planners to simulate disasters & coordinate supply reallocations.
 */

window.initSmartEmergencyPlanner = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Disasters definitions
    const scenarios = [
        {
            id: 'pileup',
            name: 'Major Highway Pileup (Multi-vehicle)',
            icon: 'fa-car-crash',
            desc: 'A severe multi-vehicle accident on the Interstate requires immediate trauma surgery support for up to 18 patients.',
            demand: { 'O-': 24, 'O+': 20, 'A+': 15, 'B+': 10, 'A-': 8, 'B-': 6, 'AB-': 4, 'AB+': 2 },
            totalUnits: 89
        },
        {
            id: 'hurricane',
            name: 'Category 3 Hurricane (Infrastructure Blockade)',
            icon: 'fa-wind',
            desc: 'Severe weather halts regional mobile blood drives for 2 weeks. Central storage facilities must ration and reallocate stock.',
            demand: { 'O-': 50, 'O+': 75, 'A+': 60, 'B+': 40, 'A-': 25, 'B-': 20, 'AB-': 10, 'AB+': 15 },
            totalUnits: 295
        },
        {
            id: 'flu',
            name: 'Seasonal Outbreak Deferrals (Severe Shortfall)',
            icon: 'fa-virus',
            desc: 'A sudden respiratory epidemic triggers immediate temporary deferrals of up to 45% of regular active donors.',
            demand: { 'O-': 15, 'O+': 30, 'A+': 25, 'B+': 15, 'A-': 10, 'B-': 8, 'AB-': 5, 'AB+': 5 },
            totalUnits: 128
        }
    ];

    let selectedScenario = scenarios[0];
    let isDispatched = false;
    let dispatchStep = 0;
    let dispatchTimer = null;

    // Mock stock levels at nearby centers (Central, North, South)
    const localBanks = [
        { name: 'Central Community Blood Bank', distance: '1.2 miles', stock: { 'O-': 2, 'O+': 25, 'A+': 30, 'B+': 15, 'A-': 4, 'B-': 5, 'AB-': 2, 'AB+': 10 } },
        { name: 'Northside Medical Depot', distance: '3.8 miles', stock: { 'O-': 12, 'O+': 10, 'A+': 5, 'B+': 20, 'A-': 10, 'B-': 8, 'AB-': 6, 'AB+': 4 } },
        { name: 'Southern Mercy Center', distance: '6.5 miles', stock: { 'O-': 1, 'O+': 18, 'A+': 22, 'B+': 8, 'A-': 3, 'B-': 2, 'AB-': 1, 'AB+': 12 } }
    ];

    function render() {
        // Calculate combined inventory for critical group analysis
        const totalAvailable = {};
        const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
        bloodGroups.forEach(g => {
            totalAvailable[g] = localBanks.reduce((sum, bank) => sum + (bank.stock[g] || 0), 0);
        });

        // Determine deficit list
        const deficits = [];
        bloodGroups.forEach(g => {
            const needed = selectedScenario.demand[g] || 0;
            const available = totalAvailable[g] || 0;
            if (needed > available) {
                deficits.push({ group: g, needed, available, deficit: needed - available });
            }
        });

        // Smart dispatch suggestions
        const transfers = [];
        deficits.forEach(def => {
            // Find banks that have surplus
            localBanks.forEach(bank => {
                if (bank.stock[def.group] > 5) { // Safe surplus threshold
                    const transferUnits = Math.min(bank.stock[def.group] - 5, def.deficit);
                    if (transferUnits > 0) {
                        transfers.push({
                            from: bank.name,
                            to: 'Emergency Medical Site (Hospital)',
                            group: def.group,
                            units: transferUnits,
                            eta: bank.distance === '1.2 miles' ? '8 mins' : (bank.distance === '3.8 miles' ? '15 mins' : '22 mins')
                        });
                    }
                }
            });
        });

        container.innerHTML = `
            <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 11px; background: #fee2e2; color: #dc2626; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Elite Clinical Dashboard</span>
                    <h3 style="font-size: 20px; color: #1e293b; font-weight: 700; margin-top: 8px; margin-bottom: 4px;">Smart Emergency Demand Coordinator</h3>
                    <p style="font-size: 13.5px; color: #64748b; max-width: 540px; margin: 0 auto;">Simulate disaster events, project regional deficits, coordinate reallocations, and trigger donor alerts.</p>
                </div>

                <!-- Scenario Selector Row -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 24px;">
                    ${scenarios.map(sc => {
                        const active = sc.id === selectedScenario.id ? 'border-color: #dc2626; background: #fff5f5;' : 'border-color: #e2e8f0; background: white;';
                        const iconColor = sc.id === selectedScenario.id ? 'color: #dc2626;' : 'color: #64748b;';
                        return `
                            <div onclick="window.selectEmergencyScenario('${sc.id}')" style="${active} border: 2px solid; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s;" class="scenario-card">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <i class="fas ${sc.icon}" style="${iconColor} font-size: 20px;"></i>
                                    <h4 style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin: 0;">${sc.name.split(' (')[0]}</h4>
                                </div>
                                <p style="font-size: 11.5px; color: #64748b; line-height: 1.4; margin: 0;">${sc.desc.substring(0, 75)}...</p>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Scenario details and interactive demand tracker -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 24px;">
                    
                    <!-- Left: Deficit analysis & graph -->
                    <div style="background: #fafafa; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px;">
                        <h4 style="font-size: 14.5px; color: #1e293b; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-chart-bar" style="color: #dc2626;"></i> Projected Stock Deficits
                        </h4>
                        <p style="font-size: 12.5px; color: #64748b; margin-bottom: 15px;">
                            Analysis of selected event requirement (${selectedScenario.totalUnits} units total) mapped against regional reserves.
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${deficits.length === 0 ? `
                                <div style="text-align: center; padding: 20px; color: #16a34a; font-weight: 600; font-size: 13.5px; background: #ecfdf5; border-radius: 8px;">
                                    <i class="fas fa-check-circle"></i> Sufficient regional reserves to cover this scenario!
                                </div>
                            ` : deficits.map(def => {
                                const pct = Math.min(100, (def.available / def.needed) * 100);
                                return `
                                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                            <span style="font-weight: 700; color: #ef4444; font-size: 14px;">Group ${def.group}</span>
                                            <span style="font-size: 12px; font-weight: 600; color: #991b1b;">Deficit: -${def.deficit} Units</span>
                                        </div>
                                        <div style="width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; position: relative;">
                                            <div style="width: ${pct}%; height: 100%; background: #dc2626; border-radius: 3px;"></div>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 4px;">
                                            <span>Available: ${def.available} units</span>
                                            <span>Required: ${def.needed} units</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Right: Smart Dispatch Proposal -->
                    <div style="display: flex; flex-direction: column; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                        <div>
                            <h4 style="font-size: 14.5px; color: #1e293b; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-truck-loading" style="color: #2563eb;"></i> Automated Dispatch Reallocation
                            </h4>
                            <p style="font-size: 12.5px; color: #64748b; margin-bottom: 15px;">
                                Suggesting routing transfers from depots with surplus stocks to clear regional deficits instantly.
                            </p>

                            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
                                ${transfers.length === 0 ? `
                                    <div style="font-size: 12.5px; color: #64748b; font-style: italic; text-align: center; padding: 30px 10px;">
                                        No transfers recommended.
                                    </div>
                                ` : transfers.map(tr => `
                                    <div style="background: white; border-radius: 8px; border: 1px solid #edf2f7; padding: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                                        <div>
                                            <div style="color: #475569; font-weight: 600;"><i class="fas fa-warehouse" style="color:#64748b;"></i> ${tr.from.split(' ')[0]}</div>
                                            <div style="color: #94a3b8; font-size: 11px; margin-top: 1px;">Route ETA: ${tr.eta}</div>
                                        </div>
                                        <div style="text-align: right;">
                                            <span style="font-weight: 700; color: #2563eb; font-size: 13px;">${tr.units} Units</span>
                                            <span style="font-size: 11px; display: block; color: #dc2626; font-weight: 600;">Type ${tr.group}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Action controls -->
                        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
                            <button onclick="window.triggerDonorBlastAlert()" class="btn btn-outline" style="width: 100%; border-color: #fca5a5; color: #dc2626; font-weight: 600; font-size: 13px; padding: 10px; background: white; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i class="fas fa-paper-plane"></i> Broadcast Emergency Donor SMS
                            </button>
                            <button onclick="window.executeDispatchReallocation()" id="btn-dispatch-execute" class="btn btn-primary" style="width: 100%; font-weight: 600; font-size: 13.5px; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i class="fas fa-route"></i> Execute Dispatch Protocol
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Live Dispatch Tracker Stage (Appears when executed) -->
                <div id="dispatch-live-tracker" style="display: none; background: #0f172a; border-radius: 12px; padding: 20px; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">
                        <span style="font-size: 12px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-broadcast-tower" class="fa-pulse"></i> LIVE COURIER DISPATCH MONITOR
                        </span>
                        <span id="tracker-timer-val" style="font-family: monospace; font-size: 12px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 4px;">ACTIVE TRUCKING</span>
                    </div>

                    <!-- Dispatch Tracker Steps -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; position: relative;" id="dispatch-steps-grid">
                        <!-- Loaded dynamically -->
                    </div>
                </div>

            </div>
        `;
    }

    window.selectEmergencyScenario = function(id) {
        if (isDispatched) return;
        selectedScenario = scenarios.find(sc => sc.id === id);
        render();
    };

    window.triggerDonorBlastAlert = function() {
        const modalId = 'donor-alert-sms-modal';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;';
            document.body.appendChild(modal);
        }

        const deficitGroupsStr = Object.entries(selectedScenario.demand)
            .filter(([_, units]) => units > 15)
            .map(([g, _]) => g)
            .join(', ');

        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; width: 100%; max-width: 440px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #cbd5e1; position: relative;">
                <h4 style="font-size: 16px; color: #1e293b; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; margin-top: 0;">
                    <i class="fas fa-bullhorn" style="color: #dc2626;"></i> Emergency Broadcast Simulator
                </h4>
                <p style="font-size: 12.5px; color: #64748b; margin-bottom: 18px;">
                    This allows you to verify the emergency SMS/Email payload to target registered donors with matching profiles in the critical region.
                </p>

                <!-- Phone preview mock -->
                <div style="background: #f1f5f9; border-radius: 12px; padding: 15px; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin-bottom: 18px;">
                    <span style="font-size: 10px; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 6px;">SMS BROADCAST PAYLOAD</span>
                    <div style="background: #ffffff; border-radius: 10px; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 12.5px; color: #1e293b; line-height: 1.4; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <strong>[CRITICAL ALERT]</strong> BloodSync requires urgent <strong>${deficitGroupsStr || 'O-'}</strong> donors due to an active <strong>${selectedScenario.name.split(' (')[0]}</strong>. If you are eligible, please schedule an appointment instantly: <span style="color: #2563eb; text-decoration: underline;">https://bloodsync.org/alert</span>
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-outline" onclick="document.getElementById('${modalId}').remove()" style="flex: 1; padding: 10px; font-weight: 600; font-size: 13px; background: white; border-color: #cbd5e1;">Cancel</button>
                    <button class="btn btn-primary" onclick="window.broadcastSimSMS()" style="flex: 1; padding: 10px; font-weight: 600; font-size: 13px;">Broadcast Now</button>
                </div>
            </div>
        `;
    };

    window.broadcastSimSMS = function() {
        document.getElementById('donor-alert-sms-modal').remove();
        showAlert('Emergency donor broadcast triggered! 142 registered matching donors notified successfully.', 'success');
    };

    window.executeDispatchReallocation = function() {
        if (isDispatched) return;
        isDispatched = true;
        dispatchStep = 0;

        const tracker = document.getElementById('dispatch-live-tracker');
        if (tracker) tracker.style.display = 'block';

        const executeBtn = document.getElementById('btn-dispatch-execute');
        if (executeBtn) {
            executeBtn.disabled = true;
            executeBtn.innerHTML = `<i class="fas fa-sync fa-spin"></i> Dispatch Protocol Active`;
        }

        renderDispatchStep();

        dispatchTimer = setInterval(() => {
            dispatchStep++;
            if (dispatchStep <= 3) {
                renderDispatchStep();
            } else {
                clearInterval(dispatchTimer);
                isDispatched = false;
                showAlert('Courier emergency supply dispatch completed and verified successfully!', 'success');
                if (executeBtn) {
                    executeBtn.disabled = false;
                    executeBtn.innerHTML = `<i class="fas fa-route"></i> Execute Dispatch Protocol`;
                }
            }
        }, 3000);
    };

    function renderDispatchStep() {
        const stepsGrid = document.getElementById('dispatch-steps-grid');
        const timerVal = document.getElementById('tracker-timer-val');
        if (!stepsGrid) return;

        const steps = [
            { label: 'Authorized', desc: 'SOP protocol signed off.', icon: 'fa-file-signature' },
            { label: 'Loading Supply', desc: 'Secure temperature checked.', icon: 'fa-box-open' },
            { label: 'In Transit', desc: 'GPS courier moving.', icon: 'fa-shipping-fast' },
            { label: 'Arrived & Cold', desc: 'Stock locked into database.', icon: 'fa-check-circle' }
        ];

        if (timerVal) {
            if (dispatchStep < 3) {
                timerVal.textContent = `ETA: ${(3 - dispatchStep) * 5} MINS`;
            } else {
                timerVal.textContent = 'DELIVERED & LOGGED';
                timerVal.style.color = '#22c55e';
                timerVal.style.background = 'rgba(34, 197, 94, 0.15)';
            }
        }

        stepsGrid.innerHTML = steps.map((st, idx) => {
            let activeStyle = 'opacity: 0.3; color: #94a3b8;';
            let barStyle = 'background: #334155;';
            
            if (idx === dispatchStep) {
                activeStyle = 'opacity: 1; color: #38bdf8; text-shadow: 0 0 10px rgba(56, 189, 248, 0.4);';
            } else if (idx < dispatchStep) {
                activeStyle = 'opacity: 0.8; color: #22c55e;';
                barStyle = 'background: #22c55e;';
            }

            return `
                <div style="text-align: center; ${activeStyle} transition: all 0.3s;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; background: #0f172a;">
                        <i class="fas ${st.icon}"></i>
                    </div>
                    <div style="font-size: 12px; font-weight: 700;">${st.label}</div>
                    <div style="font-size: 9.5px; opacity: 0.8; margin-top: 2px; line-height: 1.2;">${st.desc}</div>
                </div>
            `;
        }).join('');
    }

    render();
};
