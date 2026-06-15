// ==========================================
// 1. DATA STRUKTUR & INITIALIZATION
// ==========================================
const defaultChatData = {
    sovy: [
        { sender: 'incoming', type: 'text', text: 'Pagi! Projek chat kemarin apa kabarnya?', time: '10:40' },
        { sender: 'outgoing', type: 'text', text: 'Pagi, Sov. Aman kok, ini lagi buat desain halaman utamanya.', time: '10:41' },
        { sender: 'incoming', type: 'text', text: 'Halo! Lagi sibuk nggak? Kalo udah selesai boleh liat hasilnya dong? 😁', time: '10:42' }
    ],
    haris: [
        { sender: 'incoming', type: 'text', text: 'Kodenya sudah saya push ke GitHub ya', time: 'Kemarin' }
    ],
    rimba: [
        { sender: 'incoming', type: 'text', text: 'Besok jadi ngopi kan?', time: 'Senin' }
    ],
    fauzan: [
        { sender: 'incoming', type: 'text', text: 'Halo bro, ini Fauzan. Sori baru chat pakai akun ini.', time: '11:00' }
    ]
};

const currentUser = localStorage.getItem('currentUser') || 'guest';
let chatStorage = JSON.parse(localStorage.getItem('telegram_chats')) || defaultChatData;

let activeContact = 'sovy'; 
if (currentUser === 'sovy@gmail.com') {
    activeContact = 'haris'; 
} else if (currentUser === 'haris@gmail.com') {
    activeContact = 'sovy';  
}

// Variables untuk fitur Voice Note
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// ==========================================
// 2. LOGIKA LOGIN & LOGOUT
// ==========================================
const loginForm = document.querySelector('form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        if (usernameInput === 'sovy@gmail.com' && passwordInput === '12345') {
            localStorage.setItem('currentUser', 'sovy@gmail.com');
        } else if (usernameInput === 'Haris@gmail.com' && passwordInput === '12346') {
            localStorage.setItem('currentUser', 'haris@gmail.com');
        } else {
            localStorage.setItem('currentUser', 'regular_user');
        }
        window.location.href = 'index.html'; 
    });
}

// ==========================================
// 3. LOGIKA HALAMAN CHAT (JIKA ELEMEN ADA)
// ==========================================
const chatMessagesContainer = document.querySelector('.chat-messages');
const messageInput = document.querySelector('.message-input');
const sendButton = document.querySelector('.btn-send');
const fileInput = document.getElementById('file-hidup');
const micButton = document.getElementById('mic-button');

if (chatMessagesContainer) {
    const allChatItems = document.querySelectorAll('.chat-item');

    allChatItems.forEach(item => {
        const nameText = item.querySelector('.chat-name').textContent.toLowerCase().trim();
        item.setAttribute('data-chat', nameText);
    });

    if (currentUser === 'sovy@gmail.com') {
        allChatItems.forEach(item => {
            const currentKey = item.getAttribute('data-chat');
            if (currentKey === 'sovy') {
                item.setAttribute('data-chat', 'fauzan'); 
                item.querySelector('.avatar').textContent = 'F';
                item.querySelector('.avatar').className = 'avatar fauzan';
                item.querySelector('.chat-name').textContent = 'Fauzan';
                item.classList.remove('active');
            }
            if (currentKey === 'haris') item.classList.add('active');
        });
        updateHeader('Haris', 'H', 'haris');
    } else if (currentUser === 'haris@gmail.com') {
        allChatItems.forEach(item => {
            const currentKey = item.getAttribute('data-chat');
            if (currentKey === 'haris') {
                item.setAttribute('data-chat', 'fauzan'); 
                item.querySelector('.avatar').textContent = 'F';
                item.querySelector('.avatar').className = 'avatar fauzan';
                item.querySelector('.chat-name').textContent = 'Fauzan';
                item.classList.remove('active');
            }
            if (currentKey === 'sovy') item.classList.add('active');
        });
        updateHeader('Sovy', 'S', 'sovy');
    } else {
        allChatItems.forEach(item => {
            if (item.getAttribute('data-chat') === 'sovy') item.classList.add('active');
        });
        updateHeader('Sovy', 'S', 'sovy');
    }

    function updateHeader(name, initial, className) {
        document.querySelector('.chat-header h4').textContent = name;
        const headerAvatar = document.querySelector('.chat-header .avatar');
        headerAvatar.className = `avatar ${className}`;
        headerAvatar.textContent = initial;
        document.querySelector('.chat-header p').textContent = 'online';
    }

    const style = document.createElement('style');
    style.innerHTML = '.avatar.fauzan { background-color: #9c27b0; }';
    document.head.appendChild(style);

    function updateSidebarPreviews() {
        allChatItems.forEach(item => {
            const chatKey = item.getAttribute('data-chat');
            const messages = chatStorage[chatKey] || [];
            if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                const previewDiv = item.querySelector('.chat-preview');
                const timeSpan = item.querySelector('.chat-time');
                
                if (previewDiv) {
                    if (lastMessage.type === 'file') previewDiv.textContent = `📁 ${lastMessage.fileName}`;
                    else if (lastMessage.type === 'voice') previewDiv.textContent = `🎙️ Voice Note`;
                    else previewDiv.textContent = lastMessage.text;
                }
                if (timeSpan) timeSpan.textContent = lastMessage.time;
            }
        });
    }

    const searchBar = document.querySelector('.search-bar');

    if (searchBar) {
        searchBar.addEventListener('input', function(e) {
            // Ambil teks yang diketik pengguna dan ubah menjadi huruf kecil (case-insensitive)
            const searchText = e.target.value.toLowerCase().trim();

            allChatItems.forEach(item => {
                // Ambil nama kontak dari elemen .chat-name
                const contactName = item.querySelector('.chat-name').textContent.toLowerCase();

                // Jika nama kontak mengandung teks yang dicari, tampilkan. Jika tidak, sembunyikan.
                if (contactName.includes(searchText)) {
                    item.style.display = 'flex'; // Tampilkan kembali dengan layout bawaannya
                } else {
                    item.style.display = 'none'; // Sembunyikan kontak
                }
            });
        });
    }

    // --- RENDER PESAN MASUK/KELUAR (MENDUKUNG MULTIMEDIA) ---
    function renderMessages() {
        chatMessagesContainer.innerHTML = ''; 
        const currentMessages = chatStorage[activeContact] || [];
        
        currentMessages.forEach(msg => {
            const bubble = document.createElement('div');
            bubble.classList.add('message-bubble', msg.sender);
            
            // Cek tipe pesan untuk merender elemen HTML yang sesuai
            if (msg.type === 'file') {
                bubble.innerHTML = `
                    <a href="${msg.fileData}" download="${msg.fileName}" class="file-link">📁 ${msg.fileName}</a>
                    <span class="message-time">${msg.time}</span>
                `;
            } else if (msg.type === 'voice') {
                bubble.innerHTML = `
                    <audio src="${msg.audioData}" controls></audio>
                    <span class="message-time">${msg.time}</span>
                `;
            } else {
                // Tipe Teks biasa
                bubble.innerHTML = `
                    ${msg.text}
                    <span class="message-time">${msg.time}</span>
                `;
            }
            chatMessagesContainer.appendChild(bubble);
        });
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // --- FUNGSI MENGIRIM DATA CHAT ---
    function saveAndPushMessage(messageObject) {
        if (!chatStorage[activeContact]) chatStorage[activeContact] = [];
        chatStorage[activeContact].push(messageObject);
        localStorage.setItem('telegram_chats', JSON.stringify(chatStorage));
        renderMessages();
        updateSidebarPreviews();
    }
    

    function getFormattedTime() {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // 1. Kirim Pesan Teks
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === '') return;

        saveAndPushMessage({
            sender: 'outgoing',
            type: 'text',
            text: text,
            time: getFormattedTime()
        });
        messageInput.value = '';
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // 2. Logika Unggah & Kirim File
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                saveAndPushMessage({
                    sender: 'outgoing',
                    type: 'file',
                    fileName: file.name,
                    fileData: event.target.result, // Menyimpan file dalam format string Base64
                    time: getFormattedTime()
                });
            };
            reader.readAsDataURL(file);
            fileInput.value = ''; // Reset input file
        });
    }

    // 3. Logika Rekam & Kirim Voice Note
    if (micButton) {
        micButton.addEventListener('click', async function() {
            if (!isRecording) {
                // Mulai Merekam Suara
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];

                    mediaRecorder.addEventListener('dataavailable', event => {
                        audioChunks.push(event.data);
                    });

                    mediaRecorder.addEventListener('stop', () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                        const reader = new FileReader();
                        reader.onloadend = function() {
                            saveAndPushMessage({
                                sender: 'outgoing',
                                type: 'voice',
                                audioData: reader.result, // Menyimpan rekaman suara dalam format string Base64
                                time: getFormattedTime()
                            });
                        };
                        reader.readAsDataURL(audioBlob);

                        // Matikan fungsi mic setelah selesai digunakan
                        stream.getTracks().forEach(track => track.stop());
                    });

                    mediaRecorder.start();
                    isRecording = true;
                    micButton.classList.add('recording');
                    micButton.textContent = '🛑'; // Ubah ikon mic menjadi tombol stop sementara perekaman aktif
                } catch (err) {
                    alert('Gagal mengakses mikrofon. Pastikan Anda mengizinkan izin mic di browser!');
                    console.error(err);
                }
            } else {
                // Berhenti Merekam
                mediaRecorder.stop();
                isRecording = false;
                micButton.classList.remove('recording');
                micButton.textContent = '🎙️';
            }
        });
    }

    // Logika Alih Kontak saat Diklik
    allChatItems.forEach(item => {
        item.addEventListener('click', function() {
            const currentActive = document.querySelector('.chat-item.active');
            if (currentActive) currentActive.classList.remove('active');
            
            this.classList.add('active');
            const targetChat = this.getAttribute('data-chat');
            activeContact = targetChat;

            document.querySelector('.chat-header h4').textContent = this.querySelector('.chat-name').textContent;
            const headerAvatar = document.querySelector('.chat-header .avatar');
            headerAvatar.className = `avatar ${targetChat}`;
            headerAvatar.textContent = this.querySelector('.avatar').textContent;

            renderMessages();
        });
    });

    renderMessages();
    updateSidebarPreviews();
}

const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Alihkan ke halaman login tiruan (buat file login.html baru jika perlu)
        window.location.href = "login.html"; 
    });
}