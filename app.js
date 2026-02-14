/* ========================================
   MedConnect — Complete Application Logic
   Frontend-only (localStorage persistence)
   ======================================== */

// ===== SEED DATA =====
const SEED_LOCALITIES = [
    { id: 'loc1', name: 'Koramangala', icon: '🏙️' },
    { id: 'loc2', name: 'Indiranagar', icon: '🌳' },
    { id: 'loc3', name: 'Whitefield', icon: '🏢' },
    { id: 'loc4', name: 'Jayanagar', icon: '🏘️' },
    { id: 'loc5', name: 'HSR Layout', icon: '🌆' },
    { id: 'loc6', name: 'Electronic City', icon: '💻' },
    { id: 'loc7', name: 'Marathahalli', icon: '🛣️' },
    { id: 'loc8', name: 'Malleshwaram', icon: '🕌' },
    { id: 'loc9', name: 'Banashankari', icon: '🏡' },
    { id: 'loc10', name: 'JP Nagar', icon: '🏗️' },
];

const DOCTOR_PHOTOS = [
    'https://api.dicebear.com/7.x/personas/svg?seed=doc1',
    'https://api.dicebear.com/7.x/personas/svg?seed=doc2',
    'https://api.dicebear.com/7.x/personas/svg?seed=doc3',
    'https://api.dicebear.com/7.x/personas/svg?seed=doc4',
    'https://api.dicebear.com/7.x/personas/svg?seed=doc5',
    'https://api.dicebear.com/7.x/personas/svg?seed=doc6',
];

const SEED_HOSPITALS = [
    {
        id: 'h1', name: 'Apollo Clinic', locality: 'loc1', address: '123, 80 Feet Rd, Koramangala',
        phone: '+91 80 2553 1234', email: 'info@apollokoramangala.com', status: 'approved',
        adminEmail: 'hospital@demo.com',
    },
    {
        id: 'h2', name: 'Fortis Hospital', locality: 'loc1', address: '45, 1st Cross, Koramangala',
        phone: '+91 80 2553 5678', email: 'info@fortiskoramangala.com', status: 'approved',
        adminEmail: 'fortis@demo.com',
    },
    {
        id: 'h3', name: 'Manipal HealthCare', locality: 'loc2', address: '78, 100 Feet Rd, Indiranagar',
        phone: '+91 80 2552 9012', email: 'info@manipal.com', status: 'approved',
        adminEmail: 'manipal@demo.com',
    },
    {
        id: 'h4', name: 'Sakra World Hospital', locality: 'loc2', address: '52/2, Devarabisanahalli, Indiranagar',
        phone: '+91 80 4969 4969', email: 'info@sakra.com', status: 'approved',
        adminEmail: 'sakra@demo.com',
    },
    {
        id: 'h5', name: 'Columbia Asia', locality: 'loc3', address: 'Whitefield Main Rd',
        phone: '+91 80 3344 5566', email: 'info@columbia.com', status: 'approved',
        adminEmail: 'columbia@demo.com',
    },
    {
        id: 'h6', name: 'Narayana Hrudayalaya', locality: 'loc4', address: '1, Hosur Rd, Jayanagar',
        phone: '+91 80 7122 2222', email: 'info@narayana.com', status: 'pending',
        adminEmail: 'narayana@demo.com',
    },
    {
        id: 'h7', name: 'Rainbow Clinic', locality: 'loc5', address: 'Sector 2, HSR Layout',
        phone: '+91 80 4545 6767', email: 'info@rainbow.com', status: 'approved',
        adminEmail: 'rainbow@demo.com',
    },
    {
        id: 'h8', name: 'Sparsh Hospital', locality: 'loc3', address: 'ITPL Main Rd, Whitefield',
        phone: '+91 80 4343 2121', email: 'info@sparsh.com', status: 'approved',
        adminEmail: 'sparsh@demo.com',
    },
];

const SPECIALIZATIONS = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic',
    'Pediatrician', 'ENT Specialist', 'Gynecologist', 'Neurologist',
    'Ophthalmologist', 'Dentist',
];

function generateDoctors() {
    const docs = [];
    const names = [
        'Dr. Arun Sharma', 'Dr. Priya Reddy', 'Dr. Vikram Patel', 'Dr. Neha Gupta',
        'Dr. Rajesh Kumar', 'Dr. Sunita Rao', 'Dr. Amit Singh', 'Dr. Kavitha Nair',
        'Dr. Suresh Menon', 'Dr. Divya Iyer', 'Dr. Manoj Hegde', 'Dr. Anjali Das',
        'Dr. Kiran Joshi', 'Dr. Meera Shetty', 'Dr. Ravi Kulkarni', 'Dr. Pooja Bhat',
        'Dr. Sanjay Desai', 'Dr. Lakshmi Prasad', 'Dr. Harish Gowda', 'Dr. Deepa Kamath',
    ];
    const approvedHospitals = SEED_HOSPITALS.filter(h => h.status === 'approved');
    let id = 1;
    approvedHospitals.forEach(h => {
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const nameIdx = (id - 1) % names.length;
            const specIdx = (id - 1) % SPECIALIZATIONS.length;
            const hour = 8 + Math.floor(Math.random() * 6);
            docs.push({
                id: 'd' + id,
                hospitalId: h.id,
                name: names[nameIdx],
                photo: DOCTOR_PHOTOS[id % DOCTOR_PHOTOS.length],
                specialization: SPECIALIZATIONS[specIdx],
                place: h.address.split(',').pop().trim(),
                consultingTime: `${hour}:00 AM - ${hour + 4}:00 PM`,
                roomNumber: 'Room ' + (100 + id),
                available: Math.random() > 0.2,
                bookingEnabled: true,
                email: names[nameIdx].toLowerCase().replace(/dr\.\s/, '').replace(/\s/g, '.') + '@demo.com',
            });
            id++;
        }
    });
    return docs;
}

// ===== STATE =====
let DB = {};
let currentUser = null;
let patientState = { locality: null, hospital: null, doctor: null };
let liveInterval = null;

// ===== INIT =====
function initDB() {
    const stored = localStorage.getItem('medconnect_db');
    if (stored) {
        DB = JSON.parse(stored);
    } else {
        DB = {
            localities: SEED_LOCALITIES,
            hospitals: SEED_HOSPITALS,
            doctors: generateDoctors(),
            tokens: [],
            users: [
                { email: 'admin@demo.com', password: 'demo', name: 'Super Admin', role: 'superadmin', phone: '9999999999' },
                { email: 'hospital@demo.com', password: 'demo', name: 'Hospital Admin', role: 'hospital', phone: '9888888888' },
                { email: 'patient@demo.com', password: 'demo', name: 'John Doe', role: 'patient', phone: '9777777777' },
            ],
        };
        // Link first doctor user
        if (DB.doctors.length) {
            DB.users.push({ email: DB.doctors[0].email, password: 'demo', name: DB.doctors[0].name, role: 'doctor', phone: '9666666666', doctorId: DB.doctors[0].id });
        }
        saveDB();
    }
}

function saveDB() {
    localStorage.setItem('medconnect_db', JSON.stringify(DB));
}

// ===== BOOT =====
window.addEventListener('DOMContentLoaded', () => {
    initDB();
    setTimeout(() => {
        document.getElementById('splash').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('splash').style.display = 'none';
            document.getElementById('appMain').classList.remove('hidden');
            const session = sessionStorage.getItem('medconnect_user');
            if (session) {
                currentUser = JSON.parse(session);
                afterLogin();
            } else {
                showView('viewAuth');
            }
        }, 600);
    }, 1400);
});

// ===== VIEW MANAGEMENT =====
function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function goHome() {
    if (!currentUser) { showView('viewAuth'); return; }
    routeByRole();
}

// ===== AUTH =====
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('formLogin').classList.toggle('hidden', tab !== 'login');
    document.getElementById('formRegister').classList.toggle('hidden', tab !== 'register');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;
    const role = document.getElementById('loginRole').value;

    let user = DB.users.find(u => u.email === email && u.role === role);
    if (!user && pass === 'demo') {
        // auto-create for demo
        user = { email, password: pass, name: email.split('@')[0], role, phone: '0000000000' };
        DB.users.push(user);
        saveDB();
    }
    if (!user) { toast('Invalid credentials', 'error'); return; }

    currentUser = user;
    sessionStorage.setItem('medconnect_user', JSON.stringify(user));
    afterLogin();
    toast(`Welcome, ${user.name}!`, 'success');
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const pass = document.getElementById('regPass').value;
    const phone = document.getElementById('regPhone').value.trim();
    const role = document.getElementById('regRole').value;

    if (DB.users.find(u => u.email === email)) { toast('Email already registered', 'error'); return; }

    const user = { email, password: pass, name, role, phone };
    DB.users.push(user);
    saveDB();
    currentUser = user;
    sessionStorage.setItem('medconnect_user', JSON.stringify(user));
    afterLogin();
    toast('Account created!', 'success');
}

function afterLogin() {
    document.getElementById('topNav').classList.remove('hidden');
    document.getElementById('navUser').textContent = `${getRoleIcon(currentUser.role)} ${currentUser.name}`;
    routeByRole();
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('medconnect_user');
    document.getElementById('topNav').classList.add('hidden');
    if (liveInterval) clearInterval(liveInterval);
    showView('viewAuth');
    toast('Logged out', 'info');
}

function getRoleIcon(role) {
    return { superadmin: '👑', hospital: '🏥', doctor: '🩺', patient: '👤' }[role] || '👤';
}

function routeByRole() {
    clearLiveInterval();
    switch (currentUser.role) {
        case 'patient': initPatient(); break;
        case 'doctor': initDoctor(); break;
        case 'hospital': initHospital(); break;
        case 'superadmin': initSuperAdmin(); break;
        default: showView('viewAuth');
    }
}

// ===========================
// PATIENT MODULE
// ===========================
function initPatient() {
    showView('viewPatient');
    showPatientStep(1);
    renderLocalities();
    updateFAB();
}

function showPatientStep(n) {
    for (let i = 1; i <= 5; i++) {
        document.getElementById('patientStep' + i).classList.toggle('hidden', i !== n);
    }
    // show FAB only in steps 1-4
    document.getElementById('fabTokens').classList.toggle('hidden', n === 5);
}

function patientBack(step) {
    if (step === 0) { showPatientStep(1); patientState = { locality: null, hospital: null, doctor: null }; return; }
    showPatientStep(step);
}

// — Localities —
function renderLocalities() {
    const grid = document.getElementById('localityGrid');
    const locs = DB.localities;
    grid.innerHTML = locs.map(l => {
        const hCount = DB.hospitals.filter(h => h.locality === l.id && h.status === 'approved').length;
        return `
      <div class="locality-card" onclick="selectLocality('${l.id}')" tabindex="0" role="button" aria-label="${l.name}">
        <span class="loc-icon">${l.icon}</span>
        <div class="loc-name">${l.name}</div>
        <div class="loc-count">${hCount} hospital${hCount !== 1 ? 's' : ''}</div>
      </div>`;
    }).join('');
}

function filterLocalities() {
    const q = document.getElementById('localitySearch').value.toLowerCase();
    document.querySelectorAll('.locality-card').forEach(card => {
        const name = card.querySelector('.loc-name').textContent.toLowerCase();
        card.style.display = name.includes(q) ? '' : 'none';
    });
}

function selectLocality(locId) {
    patientState.locality = locId;
    const loc = DB.localities.find(l => l.id === locId);
    document.getElementById('hospitalListTitle').textContent = `🏥 Hospitals in ${loc.name}`;
    renderHospitalList(locId);
    showPatientStep(2);
}

// — Hospital List —
function renderHospitalList(locId) {
    const list = document.getElementById('hospitalList');
    const hospitals = DB.hospitals.filter(h => h.locality === locId && h.status === 'approved');
    if (!hospitals.length) {
        list.innerHTML = '<p class="empty-state">No hospitals found in this locality.</p>';
        return;
    }
    list.innerHTML = hospitals.map(h => {
        const docCount = DB.doctors.filter(d => d.hospitalId === h.id).length;
        return `
      <div class="list-card" onclick="selectHospital('${h.id}')" tabindex="0" role="button">
        <div class="card-avatar">🏥</div>
        <div class="card-info">
          <h4>${h.name}</h4>
          <p>${h.address}</p>
          <div class="card-meta">
            <span class="meta-tag">📞 ${h.phone}</span>
            <span class="meta-tag">👨‍⚕️ ${docCount} doctors</span>
          </div>
        </div>
      </div>`;
    }).join('');
}

// — Hospital Detail —
function selectHospital(hId) {
    patientState.hospital = hId;
    const h = DB.hospitals.find(x => x.id === hId);
    const loc = DB.localities.find(l => l.id === h.locality);
    document.getElementById('hospitalDetail').innerHTML = `
    <h3>${h.name}</h3>
    <div class="detail-grid">
      <div class="detail-item"><strong>📍 Locality:</strong> ${loc ? loc.name : ''}</div>
      <div class="detail-item"><strong>📫 Address:</strong> ${h.address}</div>
      <div class="detail-item"><strong>📞 Phone:</strong> ${h.phone}</div>
      <div class="detail-item"><strong>📧 Email:</strong> ${h.email}</div>
    </div>`;
    renderDoctorList(hId);
    showPatientStep(3);
}

// — Doctor List —
function renderDoctorList(hId) {
    const list = document.getElementById('doctorList');
    const doctors = DB.doctors.filter(d => d.hospitalId === hId);
    if (!doctors.length) {
        list.innerHTML = '<p class="empty-state">No doctors registered at this hospital yet.</p>';
        return;
    }
    list.innerHTML = doctors.map(d => `
    <div class="list-card" onclick="selectDoctor('${d.id}')" tabindex="0" role="button">
      <div class="card-avatar"><img src="${d.photo}" alt="${d.name}" onerror="this.parentElement.innerHTML='👨‍⚕️'"></div>
      <div class="card-info">
        <h4>${d.name}</h4>
        <p>${d.specialization}</p>
        <div class="card-meta">
          <span class="meta-tag">🕐 ${d.consultingTime}</span>
          <span class="meta-tag ${d.available ? 'available' : 'unavailable'}">${d.available ? '● Available' : '○ Unavailable'}</span>
        </div>
      </div>
    </div>`).join('');
}

// — Doctor Profile —
function selectDoctor(dId) {
    patientState.doctor = dId;
    const d = DB.doctors.find(x => x.id === dId);
    const h = DB.hospitals.find(x => x.id === d.hospitalId);

    const bookedToday = DB.tokens.filter(t => t.doctorId === dId && t.date === todayStr());
    const hasBooked = bookedToday.some(t => t.patientEmail === (currentUser ? currentUser.email : ''));

    document.getElementById('doctorProfile').innerHTML = `
    <div class="doc-photo"><img src="${d.photo}" alt="${d.name}" onerror="this.parentElement.innerHTML='👨‍⚕️'"></div>
    <div class="doc-details">
      <h3>${d.name}</h3>
      <p>🩺 ${d.specialization}</p>
      <p>📍 ${d.place} • ${h ? h.name : ''}</p>
      <p>🕐 ${d.consultingTime}</p>
      <p>🚪 ${d.roomNumber}</p>
      <div class="availability-badge ${d.available ? 'online' : 'offline'}">
        <span>${d.available ? '●' : '○'}</span> ${d.available ? 'Available Now' : 'Unavailable'}
      </div>
      ${d.available && d.bookingEnabled && !hasBooked
            ? `<button class="btn btn-primary doc-book-btn" onclick="openBookingForm()">📝 Book Appointment</button>`
            : hasBooked
                ? `<button class="btn btn-outline doc-book-btn" onclick="openLiveTrack('${dId}')">📡 Track Token</button>`
                : `<p style="margin-top:.6rem;color:var(--text-dim)">Booking not available</p>`
        }
    </div>`;

    document.getElementById('bookingSection').classList.add('hidden');
    document.getElementById('bookingConfirm').classList.add('hidden');
    showPatientStep(4);
}

function openBookingForm() {
    const sec = document.getElementById('bookingSection');
    sec.classList.remove('hidden');
    document.getElementById('bookingConfirm').classList.add('hidden');
    if (currentUser) {
        document.getElementById('bookName').value = currentUser.name;
        document.getElementById('bookPhone').value = currentUser.phone || '';
    }
}

function handleBooking(e) {
    e.preventDefault();
    const d = DB.doctors.find(x => x.id === patientState.doctor);
    if (!d) return;

    const todayTokens = DB.tokens.filter(t => t.doctorId === d.id && t.date === todayStr());
    const tokenNum = todayTokens.length + 1;
    const waitMins = todayTokens.filter(t => t.status !== 'completed' && t.status !== 'skipped').length * 15;

    const token = {
        id: 'tk' + Date.now(),
        doctorId: d.id,
        hospitalId: d.hospitalId,
        patientEmail: currentUser.email,
        patientName: document.getElementById('bookName').value.trim(),
        patientAge: document.getElementById('bookAge').value,
        patientPlace: document.getElementById('bookPlace').value.trim(),
        patientPhone: document.getElementById('bookPhone').value.trim(),
        tokenNumber: tokenNum,
        date: todayStr(),
        status: 'booked', // booked | waiting | consulting | completed | skipped
        bookedAt: new Date().toISOString(),
        estimatedWait: waitMins,
    };

    DB.tokens.push(token);
    saveDB();

    // show confirmation
    document.getElementById('bookingSection').classList.add('hidden');
    document.getElementById('bookingConfirm').classList.remove('hidden');
    document.getElementById('confirmDetails').innerHTML = `
    <div style="font-size:3rem;font-weight:800;color:var(--primary);margin:.5rem 0">Token #${tokenNum}</div>
    <p style="color:var(--text-secondary)">Estimated Wait: ~${waitMins} mins</p>
    <div class="confirm-details-grid">
      <div class="detail-item"><strong>Doctor:</strong> ${d.name}</div>
      <div class="detail-item"><strong>Specialization:</strong> ${d.specialization}</div>
      <div class="detail-item"><strong>Patient:</strong> ${token.patientName}</div>
      <div class="detail-item"><strong>Phone:</strong> ${token.patientPhone}</div>
    </div>
    <button class="btn btn-primary" style="margin-top:1.2rem" onclick="openLiveTrack('${d.id}')">📡 Live Track</button>`;

    updateFAB();
    toast('Booking confirmed! Token #' + tokenNum, 'success');
}

// — My Tokens —
function showMyTokens() {
    showPatientStep(5);
    renderMyTokens();
}

function renderMyTokens() {
    const list = document.getElementById('myTokensList');
    const myTokens = DB.tokens.filter(t => t.patientEmail === currentUser.email).sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    if (!myTokens.length) {
        list.innerHTML = '<p class="empty-state">No bookings yet.</p>';
        return;
    }
    list.innerHTML = myTokens.map(t => {
        const d = DB.doctors.find(x => x.id === t.doctorId);
        const cls = t.status === 'booked' ? 'booked' : t.status === 'consulting' ? 'consulting' : t.status === 'waiting' ? 'waiting' : t.status === 'completed' ? 'completed' : 'skipped';
        return `
      <div class="token-item ${cls}">
        <div class="token-number">#${t.tokenNumber}</div>
        <div class="token-info">
          <h4>${d ? d.name : 'Doctor'} — ${d ? d.specialization : ''}</h4>
          <p>${t.date} • Est. wait: ${t.estimatedWait} min • Status: ${t.status.toUpperCase()}</p>
        </div>
        <div class="token-actions">
          ${t.status !== 'completed' && t.status !== 'skipped' ? `<button class="btn btn-sm btn-outline" onclick="openLiveTrack('${t.doctorId}')">📡 Track</button>` : ''}
        </div>
      </div>`;
    }).join('');
}

function updateFAB() {
    if (!currentUser) return;
    const count = DB.tokens.filter(t => t.patientEmail === currentUser.email && !['completed', 'skipped'].includes(t.status)).length;
    const badge = document.getElementById('fabBadge');
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
}

// — Live Token Tracking —
function openLiveTrack(doctorId) {
    showView('viewTokenTrack');
    const d = DB.doctors.find(x => x.id === doctorId);
    const h = d ? DB.hospitals.find(x => x.id === d.hospitalId) : null;
    document.getElementById('trackDoctorName').textContent = d ? `${d.name} — ${d.specialization} • ${h ? h.name : ''}` : '';

    renderLiveTokens(doctorId);
    clearLiveInterval();
    liveInterval = setInterval(() => renderLiveTokens(doctorId), 3000);
}

function renderLiveTokens(doctorId) {
    // reload DB for cross-tab sync
    DB = JSON.parse(localStorage.getItem('medconnect_db') || '{}');

    const list = document.getElementById('liveTokenList');
    const tokens = (DB.tokens || []).filter(t => t.doctorId === doctorId && t.date === todayStr())
        .sort((a, b) => a.tokenNumber - b.tokenNumber);

    if (!tokens.length) {
        list.innerHTML = '<p class="empty-state">No tokens for today.</p>';
        return;
    }
    list.innerHTML = tokens.map(t => {
        let cls = '';
        if (t.status === 'consulting') cls = 'consulting';
        else if (t.status === 'waiting') cls = 'waiting';
        else if (t.status === 'booked') cls = 'booked';
        else if (t.status === 'completed') cls = 'completed';
        else if (t.status === 'skipped') cls = 'skipped';

        const waitMin = t.estimatedWait || 0;
        return `
      <div class="token-item ${cls}">
        <div class="token-number">#${t.tokenNumber}</div>
        <div class="token-info">
          <h4>${t.patientName}</h4>
          <p>Expected: ~${waitMin} min • ${t.status.toUpperCase()}</p>
        </div>
        <div class="token-actions">
          ${cls === 'waiting' || cls === 'booked' ? `<button class="btn btn-sm btn-outline" onclick="remindToken('${t.id}')">🔔 Remind</button>` : ''}
        </div>
      </div>`;
    }).join('');
}

function remindToken(tokenId) {
    toast('⏰ Reminder set! We\'ll notify you when your turn is near.', 'info');
}

function closeTokenTrack() {
    clearLiveInterval();
    if (currentUser && currentUser.role === 'patient') {
        showView('viewPatient');
    } else {
        routeByRole();
    }
}

function clearLiveInterval() {
    if (liveInterval) { clearInterval(liveInterval); liveInterval = null; }
}

// ===========================
// DOCTOR MODULE
// ===========================
function initDoctor() {
    showView('viewDoctor');
    switchDocTab('bookings');
}

function switchDocTab(tab) {
    document.querySelectorAll('#viewDoctor .sub-tab').forEach((t, i) => {
        t.classList.toggle('active', ['bookings', 'tokens', 'active'][i] === tab);
    });
    document.getElementById('docBookings').classList.toggle('hidden', tab !== 'bookings');
    document.getElementById('docTokens').classList.toggle('hidden', tab !== 'tokens');
    document.getElementById('docActive').classList.toggle('hidden', tab !== 'active');

    const docId = getMyDoctorId();
    if (tab === 'bookings') renderDocBookings(docId);
    if (tab === 'tokens') renderDocTokens(docId);
    if (tab === 'active') renderDocActive(docId);
}

function getMyDoctorId() {
    if (currentUser.doctorId) return currentUser.doctorId;
    const d = DB.doctors.find(x => x.email === currentUser.email);
    return d ? d.id : (DB.doctors.length ? DB.doctors[0].id : null);
}

function renderDocBookings(docId) {
    const tokens = DB.tokens.filter(t => t.doctorId === docId && t.date === todayStr())
        .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    document.getElementById('docBookCount').textContent = tokens.length + ' booking' + (tokens.length !== 1 ? 's' : '');
    const list = document.getElementById('docBookingList');
    if (!tokens.length) { list.innerHTML = '<p class="empty-state">No bookings today.</p>'; return; }
    list.innerHTML = tokens.map(t => `
    <div class="list-card" style="cursor:default">
      <div class="card-avatar" style="font-size:1.2rem;width:44px;height:44px">#${t.tokenNumber}</div>
      <div class="card-info">
        <h4>${t.patientName}</h4>
        <p>Age: ${t.patientAge} • ${t.patientPlace} • 📞 ${t.patientPhone}</p>
        <div class="card-meta">
          <span class="meta-tag ${t.status === 'completed' ? 'available' : t.status === 'consulting' ? 'available' : ''}">${t.status.toUpperCase()}</span>
          <span class="meta-tag">Booked: ${new Date(t.bookedAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>`).join('');
}

function renderDocTokens(docId) {
    const tokens = DB.tokens.filter(t => t.doctorId === docId && t.date === todayStr())
        .sort((a, b) => a.tokenNumber - b.tokenNumber);
    const list = document.getElementById('docTokenList');
    if (!tokens.length) { list.innerHTML = '<p class="empty-state">No tokens.</p>'; return; }
    list.innerHTML = tokens.map(t => {
        let cls = t.status === 'consulting' ? 'consulting' : t.status === 'waiting' ? 'waiting' : t.status === 'booked' ? 'booked' : t.status === 'completed' ? 'completed' : 'skipped';
        return `
      <div class="token-item ${cls}">
        <div class="token-number">#${t.tokenNumber}</div>
        <div class="token-info">
          <h4>${t.patientName}</h4>
          <p>Age: ${t.patientAge} • ${t.patientPlace} • 📞 ${t.patientPhone}</p>
        </div>
        <div class="token-actions">
          ${t.status === 'booked' || t.status === 'waiting'
                ? `<button class="btn btn-sm btn-success" onclick="startConsulting('${t.id}')">▶️ Start</button>`
                : ''}
        </div>
      </div>`;
    }).join('');
}

function renderDocActive(docId) {
    const consulting = DB.tokens.find(t => t.doctorId === docId && t.date === todayStr() && t.status === 'consulting');
    const card = document.getElementById('activeTokenCard');
    const actions = document.getElementById('activeActions');

    if (consulting) {
        card.innerHTML = `
      <div class="active-number">Token #${consulting.tokenNumber}</div>
      <div class="active-name">${consulting.patientName}</div>
      <div class="active-details">Age: ${consulting.patientAge} • ${consulting.patientPlace} • 📞 ${consulting.patientPhone}</div>`;
        actions.style.display = 'flex';
    } else {
        card.innerHTML = '<p class="empty-state">No active consultation. Start one from the Token List tab.</p>';
        actions.style.display = 'none';
    }

    // Queue
    const queue = DB.tokens.filter(t => t.doctorId === docId && t.date === todayStr() && (t.status === 'waiting' || t.status === 'booked'))
        .sort((a, b) => a.tokenNumber - b.tokenNumber);
    document.getElementById('docQueue').innerHTML = queue.map(t => `
    <div class="token-item ${t.status === 'waiting' ? 'waiting' : 'booked'}">
      <div class="token-number">#${t.tokenNumber}</div>
      <div class="token-info">
        <h4>${t.patientName}</h4>
        <p>${t.status.toUpperCase()}</p>
      </div>
    </div>`).join('') || '<p class="empty-state">Queue is empty.</p>';
}

function startConsulting(tokenId) {
    const docId = getMyDoctorId();
    // set any existing consulting to waiting
    DB.tokens.forEach(t => {
        if (t.doctorId === docId && t.date === todayStr() && t.status === 'consulting') t.status = 'waiting';
    });
    const token = DB.tokens.find(t => t.id === tokenId);
    if (token) {
        token.status = 'consulting';
        // set all booked before it to waiting
        DB.tokens.forEach(t => {
            if (t.doctorId === docId && t.date === todayStr() && t.status === 'booked' && t.tokenNumber < token.tokenNumber) {
                t.status = 'waiting';
            }
        });
    }
    saveDB();
    switchDocTab('active');
    toast('Consultation started for Token #' + token.tokenNumber, 'success');
}

function completeToken() {
    const docId = getMyDoctorId();
    const consulting = DB.tokens.find(t => t.doctorId === docId && t.date === todayStr() && t.status === 'consulting');
    if (!consulting) return;
    consulting.status = 'completed';

    // auto move to next
    const next = DB.tokens.filter(t => t.doctorId === docId && t.date === todayStr() && (t.status === 'waiting' || t.status === 'booked'))
        .sort((a, b) => a.tokenNumber - b.tokenNumber)[0];
    if (next) {
        next.status = 'consulting';
        toast('Token #' + consulting.tokenNumber + ' completed. Now consulting #' + next.tokenNumber, 'success');
    } else {
        toast('Token #' + consulting.tokenNumber + ' completed. No more patients in queue.', 'info');
    }
    saveDB();
    renderDocActive(docId);
}

function skipToken() {
    const docId = getMyDoctorId();
    const consulting = DB.tokens.find(t => t.doctorId === docId && t.date === todayStr() && t.status === 'consulting');
    if (!consulting) return;
    consulting.status = 'skipped';

    const next = DB.tokens.filter(t => t.doctorId === docId && t.date === todayStr() && (t.status === 'waiting' || t.status === 'booked'))
        .sort((a, b) => a.tokenNumber - b.tokenNumber)[0];
    if (next) {
        next.status = 'consulting';
        toast('Token #' + consulting.tokenNumber + ' skipped. Now consulting #' + next.tokenNumber, 'warning');
    } else {
        toast('Token #' + consulting.tokenNumber + ' skipped. Queue empty.', 'info');
    }
    saveDB();
    renderDocActive(docId);
}

// ===========================
// HOSPITAL ADMIN MODULE
// ===========================
function initHospital() {
    showView('viewHospital');
    switchHospTab('profile');
}

function switchHospTab(tab) {
    document.querySelectorAll('#viewHospital .sub-tab').forEach((t, i) => {
        t.classList.toggle('active', ['profile', 'doctors', 'schedule'][i] === tab);
    });
    document.getElementById('hospProfile').classList.toggle('hidden', tab !== 'profile');
    document.getElementById('hospDoctors').classList.toggle('hidden', tab !== 'doctors');
    document.getElementById('hospSchedule').classList.toggle('hidden', tab !== 'schedule');

    if (tab === 'profile') renderHospProfile();
    if (tab === 'doctors') renderHospDoctors();
    if (tab === 'schedule') renderHospSchedule();
}

function getMyHospital() {
    return DB.hospitals.find(h => h.adminEmail === currentUser.email);
}

function renderHospProfile() {
    const h = getMyHospital();
    // populate locality dropdown
    const sel = document.getElementById('hospLocality');
    sel.innerHTML = DB.localities.map(l => `<option value="${l.id}" ${h && h.locality === l.id ? 'selected' : ''}>${l.name}</option>`).join('');

    if (h) {
        document.getElementById('hospName').value = h.name;
        document.getElementById('hospAddress').value = h.address;
        document.getElementById('hospPhone').value = h.phone;
        document.getElementById('hospEmail').value = h.email;
        const badge = document.getElementById('hospStatus');
        badge.textContent = h.status.toUpperCase();
        badge.className = 'status-badge ' + h.status;
    } else {
        document.getElementById('hospStatus').textContent = 'Not registered yet';
        document.getElementById('hospStatus').className = 'status-badge pending';
    }
}

function saveHospital(e) {
    e.preventDefault();
    let h = getMyHospital();
    const data = {
        name: document.getElementById('hospName').value.trim(),
        locality: document.getElementById('hospLocality').value,
        address: document.getElementById('hospAddress').value.trim(),
        phone: document.getElementById('hospPhone').value.trim(),
        email: document.getElementById('hospEmail').value.trim(),
    };
    if (h) {
        Object.assign(h, data);
        toast('Hospital profile updated!', 'success');
    } else {
        h = { id: 'h' + Date.now(), ...data, status: 'pending', adminEmail: currentUser.email };
        DB.hospitals.push(h);
        toast('Hospital registered! Awaiting Super Admin approval.', 'success');
    }
    saveDB();
    renderHospProfile();
}

// — Manage Doctors —
function renderHospDoctors() {
    const h = getMyHospital();
    const list = document.getElementById('hospDoctorList');
    if (!h) { list.innerHTML = '<p class="empty-state">Register your hospital first.</p>'; return; }

    const docs = DB.doctors.filter(d => d.hospitalId === h.id);
    if (!docs.length) { list.innerHTML = '<p class="empty-state">No doctors added yet.</p>'; return; }

    list.innerHTML = docs.map(d => `
    <div class="list-card" style="cursor:default">
      <div class="card-avatar"><img src="${d.photo}" alt="${d.name}" onerror="this.parentElement.innerHTML='👨‍⚕️'"></div>
      <div class="card-info">
        <h4>${d.name}</h4>
        <p>${d.specialization} • ${d.roomNumber}</p>
        <div class="card-meta">
          <span class="meta-tag">🕐 ${d.consultingTime}</span>
          <span class="meta-tag ${d.available ? 'available' : 'unavailable'}">${d.available ? '● Online' : '○ Offline'}</span>
          <span class="meta-tag">${d.bookingEnabled ? '📗 Booking On' : '📕 Booking Off'}</span>
        </div>
      </div>
      <div class="token-actions" style="flex-direction:column;gap:.3rem">
        <button class="btn btn-sm btn-outline" onclick="editDoctor('${d.id}')">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDoctor('${d.id}')">🗑️</button>
        <button class="btn btn-sm ${d.available ? 'btn-warning' : 'btn-success'}" onclick="toggleDoctorAvail('${d.id}')">${d.available ? 'Disable' : 'Enable'}</button>
      </div>
    </div>`).join('');
}

function openDoctorModal(docId) {
    const d = docId ? DB.doctors.find(x => x.id === docId) : null;
    const modal = document.getElementById('modalContent');
    modal.innerHTML = `
    <h3>${d ? 'Edit' : 'Add'} Doctor</h3>
    <form id="formDocModal" onsubmit="saveDoctorModal(event, '${docId || ''}')">
      <div class="form-group"><label>Name</label><input type="text" id="mdDocName" value="${d ? d.name : ''}" required></div>
      <div class="form-group"><label>Specialization</label>
        <select id="mdDocSpec" required>
          ${SPECIALIZATIONS.map(s => `<option ${d && d.specialization === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Consulting Time</label><input type="text" id="mdDocTime" value="${d ? d.consultingTime : '9:00 AM - 1:00 PM'}" required></div>
        <div class="form-group"><label>Room Number</label><input type="text" id="mdDocRoom" value="${d ? d.roomNumber : ''}" required></div>
      </div>
      <div class="form-group"><label>Email (for login)</label><input type="email" id="mdDocEmail" value="${d ? d.email : ''}" required></div>
      <div class="form-row">
        <div class="form-group"><label>Available</label><select id="mdDocAvail"><option value="1" ${d && d.available ? 'selected' : ''}>Yes</option><option value="0" ${d && !d.available ? 'selected' : ''}>No</option></select></div>
        <div class="form-group"><label>Booking</label><select id="mdDocBooking"><option value="1" ${d && d.bookingEnabled ? 'selected' : ''}>Enabled</option><option value="0" ${d && !d.bookingEnabled ? 'selected' : ''}>Disabled</option></select></div>
      </div>
      <button type="submit" class="btn btn-primary btn-block" style="margin-top:.5rem">${d ? 'Update' : 'Add'} Doctor</button>
    </form>`;
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function saveDoctorModal(e, docId) {
    e.preventDefault();
    const h = getMyHospital();
    if (!h) return;

    const data = {
        name: document.getElementById('mdDocName').value.trim(),
        specialization: document.getElementById('mdDocSpec').value,
        consultingTime: document.getElementById('mdDocTime').value.trim(),
        roomNumber: document.getElementById('mdDocRoom').value.trim(),
        email: document.getElementById('mdDocEmail').value.trim().toLowerCase(),
        available: document.getElementById('mdDocAvail').value === '1',
        bookingEnabled: document.getElementById('mdDocBooking').value === '1',
    };

    if (docId) {
        const d = DB.doctors.find(x => x.id === docId);
        if (d) Object.assign(d, data);
        toast('Doctor updated', 'success');
    } else {
        const photoIdx = DB.doctors.length % DOCTOR_PHOTOS.length;
        DB.doctors.push({
            id: 'd' + Date.now(),
            hospitalId: h.id,
            photo: DOCTOR_PHOTOS[photoIdx],
            place: h.address.split(',').pop().trim(),
            ...data,
        });
        // create user for doctor
        if (!DB.users.find(u => u.email === data.email)) {
            DB.users.push({ email: data.email, password: 'demo', name: data.name, role: 'doctor', phone: '0000000000', doctorId: 'd' + (Date.now()) });
        }
        toast('Doctor added', 'success');
    }
    saveDB();
    closeModal();
    renderHospDoctors();
}

function editDoctor(docId) { openDoctorModal(docId); }

function deleteDoctor(docId) {
    DB.doctors = DB.doctors.filter(d => d.id !== docId);
    saveDB();
    renderHospDoctors();
    toast('Doctor removed', 'info');
}

function toggleDoctorAvail(docId) {
    const d = DB.doctors.find(x => x.id === docId);
    if (d) { d.available = !d.available; saveDB(); renderHospDoctors(); }
}

function renderHospSchedule() {
    const h = getMyHospital();
    const list = document.getElementById('scheduleList');
    if (!h) { list.innerHTML = '<p class="empty-state">Register your hospital first.</p>'; return; }

    const docs = DB.doctors.filter(d => d.hospitalId === h.id);
    if (!docs.length) { list.innerHTML = '<p class="empty-state">Add doctors to see schedules.</p>'; return; }

    list.innerHTML = docs.map(d => {
        const tokenCount = DB.tokens.filter(t => t.doctorId === d.id && t.date === todayStr()).length;
        return `
    <div class="list-card" style="cursor:default">
      <div class="card-avatar" style="font-size:1.2rem;width:44px;height:44px">📅</div>
      <div class="card-info">
        <h4>${d.name}</h4>
        <p>${d.specialization} • ${d.roomNumber}</p>
        <div class="card-meta">
          <span class="meta-tag">🕐 ${d.consultingTime}</span>
          <span class="meta-tag">🎫 ${tokenCount} tokens today</span>
          <span class="meta-tag ${d.available ? 'available' : 'unavailable'}">${d.available ? '● Active' : '○ Inactive'}</span>
        </div>
      </div>
    </div>`;
    }).join('');
}

// ===========================
// SUPER ADMIN MODULE
// ===========================
function initSuperAdmin() {
    showView('viewSuperAdmin');
    switchAdminTab('analytics');
}

function switchAdminTab(tab) {
    document.querySelectorAll('#viewSuperAdmin .sub-tab').forEach((t, i) => {
        t.classList.toggle('active', ['analytics', 'hospitals', 'localities'][i] === tab);
    });
    document.getElementById('adminAnalytics').classList.toggle('hidden', tab !== 'analytics');
    document.getElementById('adminHospitals').classList.toggle('hidden', tab !== 'hospitals');
    document.getElementById('adminLocalities').classList.toggle('hidden', tab !== 'localities');

    if (tab === 'analytics') renderAnalytics();
    if (tab === 'hospitals') renderAdminHospitals();
    if (tab === 'localities') renderAdminLocalities();
}

function renderAnalytics() {
    document.getElementById('statHospitals').textContent = DB.hospitals.filter(h => h.status === 'approved').length;
    document.getElementById('statDoctors').textContent = DB.doctors.length;

    const activeTokens = DB.tokens.filter(t => t.date === todayStr() && !['completed', 'skipped'].includes(t.status));
    document.getElementById('statTokens').textContent = activeTokens.length;
    document.getElementById('statLive').textContent = DB.tokens.filter(t => t.date === todayStr() && t.status === 'consulting').length;
}

function renderAdminHospitals() {
    const list = document.getElementById('adminHospList');
    const hospitals = [...DB.hospitals].sort((a, b) => {
        const order = { pending: 0, approved: 1, suspended: 2 };
        return (order[a.status] || 0) - (order[b.status] || 0);
    });
    list.innerHTML = hospitals.map(h => {
        const loc = DB.localities.find(l => l.id === h.locality);
        return `
    <div class="list-card" style="cursor:default">
      <div class="card-avatar">🏥</div>
      <div class="card-info">
        <h4>${h.name}</h4>
        <p>${loc ? loc.name : ''} • ${h.address}</p>
        <div class="card-meta">
          <span class="meta-tag ${h.status}">${h.status.toUpperCase()}</span>
          <span class="meta-tag">📞 ${h.phone}</span>
        </div>
      </div>
      <div class="token-actions" style="flex-direction:column;gap:.3rem">
        ${h.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="approveHospital('${h.id}')">✅ Approve</button>` : ''}
        ${h.status === 'approved' ? `<button class="btn btn-sm btn-warning" onclick="suspendHospital('${h.id}')">⏸️ Suspend</button>` : ''}
        ${h.status === 'suspended' ? `<button class="btn btn-sm btn-success" onclick="activateHospital('${h.id}')">▶️ Activate</button>` : ''}
      </div>
    </div>`;
    }).join('');
}

function approveHospital(hId) {
    const h = DB.hospitals.find(x => x.id === hId);
    if (h) { h.status = 'approved'; saveDB(); renderAdminHospitals(); renderAnalytics(); toast(h.name + ' approved!', 'success'); }
}

function suspendHospital(hId) {
    const h = DB.hospitals.find(x => x.id === hId);
    if (h) { h.status = 'suspended'; saveDB(); renderAdminHospitals(); renderAnalytics(); toast(h.name + ' suspended', 'warning'); }
}

function activateHospital(hId) {
    const h = DB.hospitals.find(x => x.id === hId);
    if (h) { h.status = 'approved'; saveDB(); renderAdminHospitals(); renderAnalytics(); toast(h.name + ' activated!', 'success'); }
}

// — Localities —
function renderAdminLocalities() {
    const list = document.getElementById('adminLocalityList');
    list.innerHTML = DB.localities.map(l => {
        const hCount = DB.hospitals.filter(h => h.locality === l.id).length;
        return `
    <div class="list-card" style="cursor:default">
      <div class="card-avatar" style="font-size:1.5rem">${l.icon}</div>
      <div class="card-info">
        <h4>${l.name}</h4>
        <p>${hCount} hospital${hCount !== 1 ? 's' : ''} registered</p>
      </div>
      <div class="token-actions">
        <button class="btn btn-sm btn-danger" onclick="deleteLocality('${l.id}')">🗑️</button>
      </div>
    </div>`;
    }).join('');
}

function openLocalityModal() {
    const modal = document.getElementById('modalContent');
    modal.innerHTML = `
    <h3>Add Locality</h3>
    <form onsubmit="addLocality(event)">
      <div class="form-group"><label>Name</label><input type="text" id="mdLocName" required></div>
      <div class="form-group"><label>Icon (emoji)</label><input type="text" id="mdLocIcon" value="📍" required></div>
      <button type="submit" class="btn btn-primary btn-block" style="margin-top:.5rem">Add Locality</button>
    </form>`;
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function addLocality(e) {
    e.preventDefault();
    DB.localities.push({
        id: 'loc' + Date.now(),
        name: document.getElementById('mdLocName').value.trim(),
        icon: document.getElementById('mdLocIcon').value.trim() || '📍',
    });
    saveDB();
    closeModal();
    renderAdminLocalities();
    toast('Locality added', 'success');
}

function deleteLocality(locId) {
    DB.localities = DB.localities.filter(l => l.id !== locId);
    saveDB();
    renderAdminLocalities();
    toast('Locality removed', 'info');
}

// ===========================
// UTILITIES
// ===========================
function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

function toast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3500);
}
