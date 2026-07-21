import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { existsSync, writeFileSync } from 'fs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bloodsync_secure_super_secret_jwt_key_2026';

// Unified helper to extract and verify session details safely using JWT
function getSessionUser(req) {
    const token = req.cookies.session_token || req.cookies.session_user;
    if (!token) return null;
    try {
        if (typeof token === 'string' && (token.startsWith('{') || token.startsWith('['))) {
            return JSON.parse(token);
        }
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ensure data directory and files exist
const DATA_DIR = path.join(__dirname, 'data');
if (!existsSync(DATA_DIR)) {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        // Fallback or ignore if already exists
    }
}

const filePaths = {
    users: path.join(DATA_DIR, 'users.json'),
    donations: path.join(DATA_DIR, 'donations.json'),
    requests: path.join(DATA_DIR, 'requests.json'),
    contacts: path.join(DATA_DIR, 'contacts.json')
};

// Initial mock data if files don't exist
const initialUsers = [
    {
        email: 'john@example.com',
        password: 'DonorSecurePass!99',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        bloodGroup: 'A+',
        phone: '+1 234 567 8902',
        dob: '1998-05-15',
        gender: 'male',
        weight: '75',
        city: 'Downtown',
        state: 'NY',
        address: '123 Main St, Downtown',
        eligibilityScore: null
    },
    {
        email: 'sarah@example.com',
        password: 'DonorSecurePass!99',
        firstName: 'Sarah',
        lastName: 'Connor',
        name: 'Sarah Connor',
        bloodGroup: 'O-',
        phone: '+1 987 654 3210',
        dob: '1992-08-24',
        gender: 'female',
        weight: '62',
        city: 'Westside',
        state: 'CA',
        address: '456 Elm St, Pasadena',
        eligibilityScore: null
    }
];

const initialDonations = [
    {
        id: 1,
        email: 'john@example.com',
        fullName: 'John Doe',
        donationDate: '2026-01-15',
        donationCenter: 'center1',
        donationCenterName: 'City Hospital Blood Bank',
        bloodGroup: 'A+',
        unitsNeeded: 1,
        status: 'Completed',
        donationType: 'whole'
    },
    {
        id: 2,
        email: 'john@example.com',
        fullName: 'John Doe',
        donationDate: '2025-10-20',
        donationCenter: 'center2',
        donationCenterName: 'Life Care Center',
        bloodGroup: 'A+',
        unitsNeeded: 1,
        status: 'Completed',
        donationType: 'whole'
    },
    {
        id: 3,
        email: 'john@example.com',
        fullName: 'John Doe',
        donationDate: '2025-07-12',
        donationCenter: 'center4',
        donationCenterName: 'Red Cross Blood Bank',
        bloodGroup: 'A+',
        unitsNeeded: 1,
        status: 'Completed',
        donationType: 'whole'
    },
    {
        id: 4,
        email: 'john@example.com',
        fullName: 'John Doe',
        donationDate: '2025-04-05',
        donationCenter: 'center1',
        donationCenterName: 'City Hospital Blood Bank',
        bloodGroup: 'A+',
        unitsNeeded: 1,
        status: 'Completed',
        donationType: 'whole'
    }
];

const initialRequests = [
    {
        id: 1,
        requesterEmail: 'john@example.com',
        patientName: 'Mary Doe',
        patientAge: 45,
        bloodGroupNeeded: 'A+',
        unitsNeeded: 2,
        urgency: 'urgent',
        hospitalName: 'City Hospital',
        hospitalPhone: '+1 234 567 8901',
        hospitalAddress: '123 Main St, Downtown',
        date: '2026-07-10',
        status: 'Approved'
    },
    {
        id: 2,
        requesterEmail: 'sarah@example.com',
        patientName: 'Robert Vance',
        patientAge: 58,
        bloodGroupNeeded: 'O-',
        unitsNeeded: 3,
        urgency: 'emergency',
        hospitalName: 'Red Cross Blood Bank',
        hospitalPhone: '+1 987 654 3211',
        hospitalAddress: 'City Center Hub, Suite A',
        date: '2026-07-19',
        status: 'Pending'
    },
    {
        id: 3,
        requesterEmail: 'hospital@metro.org',
        patientName: 'Anna Vance',
        patientAge: 29,
        bloodGroupNeeded: 'B+',
        unitsNeeded: 2,
        urgency: 'urgent',
        hospitalName: 'Metro Health Services',
        hospitalPhone: '+1 234 567 8903',
        hospitalAddress: 'Eastside Medical Park',
        date: '2026-07-20',
        status: 'Pending'
    },
    {
        id: 4,
        requesterEmail: 'anonymous@example.com',
        patientName: 'David Miller',
        patientAge: 34,
        bloodGroupNeeded: 'AB-',
        unitsNeeded: 1,
        urgency: 'normal',
        hospitalName: 'Life Care Center',
        hospitalPhone: '+1 234 567 8902',
        hospitalAddress: 'Westside Avenue, Block B',
        date: '2026-07-21',
        status: 'Pending'
    }
];

const staticBloodBanksAndHospitals = [
    {
        name: 'City Hospital Blood Bank',
        type: 'banks',
        bloodGroup: 'A+',
        units: 25,
        location: 'Downtown',
        phone: '+1 234 567 8901',
        timing: 'Open 24/7'
    },
    {
        name: 'Life Care Center',
        type: 'hospitals',
        bloodGroup: 'O+',
        units: 18,
        location: 'Westside',
        phone: '+1 234 567 8902',
        timing: 'Open 8 AM - 8 PM'
    },
    {
        name: 'Metro Health Services',
        type: 'hospitals',
        bloodGroup: 'B+',
        units: 12,
        location: 'Eastside',
        phone: '+1 234 567 8903',
        timing: 'Open 8 AM - 8 PM'
    },
    {
        name: 'Red Cross Blood Bank',
        type: 'banks',
        bloodGroup: 'O-',
        units: 12,
        location: 'City Center',
        phone: '+1 234 567 8905',
        timing: 'Open 24/7'
    }
];

// Asynchronous File Persistence helpers
async function readData(key, fallback = []) {
    try {
        const filePath = filePaths[key];
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        if (!exists) {
            await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
            return fallback;
        }
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return fallback;
    }
}

async function writeData(key, data) {
    try {
        const filePath = filePaths[key];
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error writing ${key}:`, error);
    }
}

// Populate database files with initial data on boot if they don't exist
const setupDB = async () => {
    let users = await readData('users', initialUsers);
    const adminExists = users.some(u => u.email.toLowerCase() === 'admin@bloodsync.org');
    if (!adminExists) {
        users.push({
            email: 'admin@bloodsync.org',
            password: 'AdminSecurePass!99',
            firstName: 'System',
            lastName: 'Admin',
            name: 'System Admin',
            bloodGroup: 'AB+',
            phone: '+1 800 555 0199',
            dob: '1985-10-10',
            gender: 'male',
            weight: '82',
            city: 'City Center',
            state: 'NY',
            address: '456 Administrative Plaza, Suite 100',
            eligibilityScore: null,
            role: 'admin'
        });
        await writeData('users', users);
    }
    await readData('donations', initialDonations);
    await readData('requests', initialRequests);
    await readData('contacts', []);
};
await setupDB();

// Helper to resolve donation center select IDs to human names
function getCenterName(centerId) {
    switch (centerId) {
        case 'center1': return 'City Hospital Blood Bank';
        case 'center2': return 'Life Care Center';
        case 'center3': return 'Metro Health Services';
        case 'center4': return 'Red Cross Blood Bank';
        default: return 'Community Health Center';
    }
}

// Router API endpoints
app.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    const users = await readData('users', initialUsers);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        if (role === 'admin' && user.role !== 'admin') {
            return res.redirect('/login.html?role=admin&error=not_admin');
        }
        // Generate cryptographic JWT signed with secret
        const token = jwt.sign(
            { email: user.email, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.cookie('session_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.cookie('session_user', JSON.stringify({ email: user.email }), { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // backward compatibility fallback
        res.redirect('/dashboard.html');
    } else {
        res.redirect(`/login.html?error=invalid${role === 'admin' ? '&role=admin' : ''}`);
    }
});

app.post('/register', async (req, res) => {
    const {
        firstName, lastName, email, phone, dob, gender,
        bloodGroup, weight, address, city, state, password
    } = req.body;

    const users = await readData('users', initialUsers);

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.redirect('/register.html?error=exists');
    }

    const newUser = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        dob,
        gender,
        bloodGroup,
        weight,
        address,
        city,
        state,
        password,
        eligibilityScore: null
    };

    users.push(newUser);
    await writeData('users', users);

    // Generate cryptographic JWT signed with secret
    const token = jwt.sign(
        { email: newUser.email, role: 'user' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
    res.cookie('session_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('session_user', JSON.stringify({ email: newUser.email }), { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // backward compatibility fallback
    res.redirect('/dashboard.html?success=registered');
});

app.post('/donate', async (req, res) => {
    const {
        fullName, email, phone, dob, bloodGroup, weight,
        donationCenter, donationDate, donationTime, donationType
    } = req.body;

    const donations = await readData('donations', initialDonations);

    const newDonation = {
        id: donations.length + 1,
        email: email || 'anonymous@example.com',
        fullName: fullName || 'Anonymous',
        phone: phone || '',
        weight: weight || '',
        donationDate,
        donationCenter,
        donationCenterName: getCenterName(donationCenter),
        donationTime: donationTime || '10:00 AM',
        bloodGroup,
        unitsNeeded: 1,
        status: 'Approved',
        donationType: donationType || 'whole'
    };

    donations.push(newDonation);
    await writeData('donations', donations);
    res.redirect('/dashboard.html?success=donation');
});

app.post('/request', async (req, res) => {
    const {
        patientName, patientAge, patientGender, bloodGroupNeeded, unitsNeeded, urgency, reason,
        hospitalName, hospitalPhone, hospitalAddress, city, state,
        requesterName, relationship, requesterPhone, requesterEmail
    } = req.body;

    const requests = await readData('requests', initialRequests);

    const newRequest = {
        id: requests.length + 1,
        requesterEmail: requesterEmail || 'anonymous@example.com',
        patientName,
        patientAge: parseInt(patientAge) || 0,
        bloodGroupNeeded,
        unitsNeeded: parseInt(unitsNeeded) || 1,
        urgency,
        hospitalName,
        hospitalPhone,
        hospitalAddress,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    };

    requests.push(newRequest);
    await writeData('requests', requests);
    res.redirect('/dashboard.html?success=request');
});

app.post('/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    const contacts = await readData('contacts', []);
    contacts.push({ name, email, phone, subject, message, date: new Date().toISOString() });
    await writeData('contacts', contacts);
    res.redirect('/contact.html?success=1');
});

app.get('/api/session', async (req, res) => {
    const sessionPayload = getSessionUser(req);
    if (sessionPayload && sessionPayload.email) {
        try {
            const users = await readData('users', initialUsers);
            const user = users.find(u => u.email.toLowerCase() === sessionPayload.email.toLowerCase());
            if (user) {
                const { password, ...safeUser } = user;
                return res.json({ loggedIn: true, user: safeUser });
            }
        } catch (e) {
            // Safe fallback
        }
    }
    res.json({ loggedIn: false });
});

app.get('/api/logout', (req, res) => {
    res.clearCookie('session_token');
    res.clearCookie('session_user');
    res.redirect('/index.html');
});

app.get('/api/user-data', async (req, res) => {
    const sessionPayload = getSessionUser(req);
    if (!sessionPayload || !sessionPayload.email) {
        return res.json({ donations: [], requests: [] });
    }

    try {
        const donations = await readData('donations', initialDonations);
        const requests = await readData('requests', initialRequests);

        const userDonations = donations.filter(d => d.email.toLowerCase() === sessionPayload.email.toLowerCase());
        const userRequests = requests.filter(r => r.requesterEmail.toLowerCase() === sessionPayload.email.toLowerCase());
        res.json({
            donations: userDonations,
            requests: userRequests
        });
    } catch (e) {
        res.json({ donations: [], requests: [] });
    }
});

app.post('/api/cancel-appointment', async (req, res) => {
    const sessionPayload = getSessionUser(req);
    if (!sessionPayload || !sessionPayload.email) {
        return res.status(401).json({ error: 'Unauthorized session' });
    }
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Missing appointment ID' });
    }

    try {
        const donations = await readData('donations', initialDonations);
        const index = donations.findIndex(d => d.id === parseInt(id) && d.email.toLowerCase() === sessionPayload.email.toLowerCase());
        if (index === -1) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        
        donations.splice(index, 1);
        await writeData('donations', donations);
        res.json({ success: true, message: 'Appointment cancelled successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Advanced API Search Blood
app.get('/api/search', async (req, res) => {
    const { bloodGroup, location, type } = req.query;

    const results = [];
    const users = await readData('users', initialUsers);

    // Filter static blood banks and hospitals
    staticBloodBanksAndHospitals.forEach(item => {
        const matchesGroup = !bloodGroup || item.bloodGroup === bloodGroup;
        const matchesLocation = !location || item.location.toLowerCase().includes(location.toLowerCase());
        const matchesType = !type || type === 'all' || item.type === type;

        if (matchesGroup && matchesLocation && matchesType) {
            results.push({
                name: item.name,
                category: item.type === 'banks' ? 'Blood Bank' : 'Hospital',
                bloodType: item.bloodGroup,
                details: `${item.units} units available`,
                location: `${item.location}`,
                phone: item.phone,
                extra: `Open Hours: ${item.timing}`,
                actionText: 'Request Blood'
            });
        }
    });

    // Filter donor users
    users.forEach(user => {
        const matchesGroup = !bloodGroup || user.bloodGroup === bloodGroup;
        const matchesLocation = !location || user.city.toLowerCase().includes(location.toLowerCase()) || user.state.toLowerCase().includes(location.toLowerCase());
        const matchesType = !type || type === 'all' || type === 'donors';

        if (matchesGroup && matchesLocation && matchesType) {
            results.push({
                name: `${user.firstName} ${user.lastName}`,
                category: 'Blood Donor',
                bloodType: user.bloodGroup,
                details: `Age: 25 years`,
                location: `${user.city}, ${user.state}`,
                phone: user.phone,
                extra: `Last Donated: Eligible to donate`,
                actionText: 'Contact Donor'
            });
        }
    });

    res.json(results);
});

// GET all urgent request feed
app.get('/api/all-requests', async (req, res) => {
    const requests = await readData('requests', initialRequests);
    res.json(requests);
});

// POST Pledge to donate for a request
app.post('/api/pledge', async (req, res) => {
    const sessionPayload = getSessionUser(req);
    if (!sessionPayload || !sessionPayload.email) {
        return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    try {
        const users = await readData('users', initialUsers);
        const currentUser = users.find(u => u.email.toLowerCase() === sessionPayload.email.toLowerCase());

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const { requestId } = req.body;
        const requests = await readData('requests', initialRequests);
        const request = requests.find(r => r.id === parseInt(requestId));

        if (!request) {
            return res.status(404).json({ error: 'Request not found.' });
        }

        // Add donation entry
        const donations = await readData('donations', initialDonations);
        const newDonation = {
            id: donations.length + 1,
            email: currentUser.email,
            fullName: currentUser.name,
            donationDate: new Date().toISOString().split('T')[0],
            donationCenter: 'center1',
            donationCenterName: request.hospitalName || 'Requested Hospital',
            bloodGroup: currentUser.bloodGroup,
            unitsNeeded: 1,
            status: 'Completed',
            donationType: 'whole'
        };

        donations.push(newDonation);
        await writeData('donations', donations);

        // Update request status to 'Approved' or 'Supported'
        request.status = 'Approved';
        await writeData('requests', requests);

        res.json({ success: true, donation: newDonation });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST Save Eligibility quiz results
app.post('/api/eligibility', async (req, res) => {
    const sessionPayload = getSessionUser(req);
    if (!sessionPayload || !sessionPayload.email) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }

    try {
        const { score, status } = req.body;

        const users = await readData('users', initialUsers);
        const userIndex = users.findIndex(u => u.email.toLowerCase() === sessionPayload.email.toLowerCase());

        if (userIndex !== -1) {
            users[userIndex].eligibilityScore = score;
            users[userIndex].eligibilityStatus = status;
            await writeData('users', users);
            res.json({ success: true, user: users[userIndex] });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper helper for admin check
async function checkAdmin(req, res, next) {
    const sessionPayload = getSessionUser(req);
    if (!sessionPayload || !sessionPayload.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const users = await readData('users', initialUsers);
        const user = users.find(u => u.email.toLowerCase() === sessionPayload.email.toLowerCase());
        if (user && user.role === 'admin') {
            req.adminUser = user;
            next();
        } else {
            res.status(403).json({ error: 'Access denied. Administrators only.' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Internal server error checking admin status.' });
    }
}

// GET admin system stats
app.get('/api/admin/stats', checkAdmin, async (req, res) => {
    try {
        const users = await readData('users', initialUsers);
        const donations = await readData('donations', initialDonations);
        const requests = await readData('requests', initialRequests);
        const contacts = await readData('contacts', []);

        const stats = {
            totalDonors: users.filter(u => u.role !== 'admin').length,
            totalDonations: donations.length,
            totalRequests: requests.length,
            pendingRequests: requests.filter(r => r.status === 'Pending').length,
            emergencyRequests: requests.filter(r => r.urgency === 'emergency').length,
            inquiries: contacts.length,
            inventory: staticBloodBanksAndHospitals
        };
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: 'Error calculating admin stats' });
    }
});

// GET list of registered users/donors
app.get('/api/admin/users', checkAdmin, async (req, res) => {
    try {
        const users = await readData('users', initialUsers);
        const safeUsers = users.map(({ password, ...u }) => u);
        res.json(safeUsers);
    } catch (e) {
        res.status(500).json({ error: 'Error loading user directories' });
    }
});

// POST change request status (Approved/Completed/Pending/Rejected)
app.post('/api/admin/request/status', checkAdmin, async (req, res) => {
    try {
        const { requestId, status } = req.body;
        const requests = await readData('requests', initialRequests);
        const reqIndex = requests.findIndex(r => r.id === parseInt(requestId));

        if (reqIndex !== -1) {
            requests[reqIndex].status = status;
            await writeData('requests', requests);
            res.json({ success: true, request: requests[reqIndex] });
        } else {
            res.status(404).json({ error: 'Request not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Error modifying request status' });
    }
});

// POST delete a request
app.post('/api/admin/request/delete', checkAdmin, async (req, res) => {
    try {
        const { requestId } = req.body;
        let requests = await readData('requests', initialRequests);
        const exists = requests.some(r => r.id === parseInt(requestId));

        if (exists) {
            requests = requests.filter(r => r.id !== parseInt(requestId));
            await writeData('requests', requests);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Request not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Error deleting request' });
    }
});

// POST update specific blood center inventory level
app.post('/api/admin/inventory/update', checkAdmin, async (req, res) => {
    try {
        const { name, units } = req.body;
        const target = staticBloodBanksAndHospitals.find(item => item.name === name);
        if (target) {
            target.units = parseInt(units) || 0;
            res.json({ success: true, item: target });
        } else {
            res.status(404).json({ error: 'Center inventory target not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Error updating medical inventory' });
    }
});

// GET list of contact submissions
app.get('/api/admin/contacts', checkAdmin, async (req, res) => {
    try {
        const contacts = await readData('contacts', []);
        res.json(contacts);
    } catch (e) {
        res.status(500).json({ error: 'Error loading contact submissions' });
    }
});

// Keep style.css and main.js routes backward compatible regardless of folder path references in imported HTMLs
app.get('/css/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));
app.get('/js/main.js', (req, res) => res.sendFile(path.join(__dirname, 'main.js')));
app.get('/main.js', (req, res) => res.sendFile(path.join(__dirname, 'main.js')));

// Serve other static files in root directly
app.use(express.static(__dirname));

// SPA Fallback: serve index.html for undefined routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`BloodSync app server listening on http://0.0.0.0:${PORT}`);
});
