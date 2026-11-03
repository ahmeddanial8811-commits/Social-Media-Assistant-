/*
 * OmniPulse AI dashboard behaviour.
 *
 * Everything lives in this external file (no inline <script>, no inline
 * on* attributes) so the page can run under a strict Content-Security-Policy
 * with script-src 'self' and no 'unsafe-inline'.
 */
(function () {
    'use strict';

    var MAX_MESSAGE_LENGTH = 1000;

    /* ---------- Section navigation ---------- */

    function switchTab(tabId) {
        var target = document.getElementById('tab-' + tabId);
        if (!target) return;

        document.querySelectorAll('.section-tab').forEach(function (tab) {
            tab.classList.add('hidden');
        });
        document.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.classList.remove('active');
            btn.classList.add('text-slate-400');
        });

        target.classList.remove('hidden');

        var activeBtn = document.getElementById('nav-' + tabId);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.classList.remove('text-slate-400');
        }
    }

    /* ---------- Demo action buttons ---------- */

    function handleClick(event) {
        var tabTrigger = event.target.closest('[data-tab]');
        if (tabTrigger) {
            switchTab(tabTrigger.getAttribute('data-tab'));
            return;
        }

        var alertTrigger = event.target.closest('[data-alert]');
        if (alertTrigger) {
            window.alert(alertTrigger.getAttribute('data-alert'));
        }
    }

    /* ---------- AI mentor chat ---------- */

    // Messages are built as DOM nodes with textContent: user input is never
    // parsed as HTML, so it cannot inject markup or script into the page.
    function appendMessage(role, text) {
        var chatHistory = document.getElementById('chat-history');
        if (!chatHistory) return;

        var bubble = document.createElement('div');
        bubble.className = role === 'user'
            ? 'ml-auto bg-slate-800 p-3 rounded-xl border border-slate-700 max-w-[85%] text-slate-200'
            : 'bg-indigo-900/30 p-3 rounded-xl border border-indigo-500/20 max-w-[85%] text-slate-200';

        if (role === 'ai') {
            bubble.appendChild(document.createTextNode('🤖 '));
            var label = document.createElement('strong');
            label.textContent = 'AI Coach:';
            bubble.appendChild(label);
            bubble.appendChild(document.createTextNode(' '));
        }

        bubble.appendChild(document.createTextNode(text));
        chatHistory.appendChild(bubble);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function replyTo(userText) {
        var normalized = userText.toLowerCase();
        var aiReply = "That's a great social media growth question! To boost engagement, focus on a strong hook in the first 3 seconds, use trending audio, and reply to every comment within the first hour of posting.";

        if (normalized.indexOf('viral') !== -1 || normalized.indexOf('views') !== -1) {
            aiReply = 'For viral reach: 1) Keep your video pacing fast with visual cuts every 2-3 seconds, 2) Use curiosity gaps in your captions, and 3) Cross-post simultaneously to TikTok, Reels, and Shorts!';
        } else if (normalized.indexOf('hook') !== -1) {
            aiReply = "Top high-converting hooks: 'Stop doing [common mistake] if you want [desired result]', or 'Most creators are doing this completely wrong...'";
        }

        window.setTimeout(function () {
            appendMessage('ai', aiReply);
        }, 800);
    }

    function sendMentorMessage() {
        var inputField = document.getElementById('chat-input');
        if (!inputField) return;

        var userText = inputField.value.trim().slice(0, MAX_MESSAGE_LENGTH);
        if (!userText) return;

        appendMessage('user', userText);
        inputField.value = '';

        replyTo(userText);
    }

    function bindMentorChat() {
        var inputField = document.getElementById('chat-input');
        var sendButton = document.getElementById('chat-send');

        if (inputField) {
            inputField.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    sendMentorMessage();
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', sendMentorMessage);
        }
    }

    /* ---------- Charts ---------- */

    function renderCharts() {
        if (typeof window.Chart === 'undefined') return;

        var ctx1 = document.getElementById('analyticsChart');
        if (ctx1) {
            new window.Chart(ctx1.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        { label: 'YouTube', data: [15000, 22000, 18000, 29000, 31000, 42000, 58000], borderColor: '#ef4444', tension: 0.4 },
                        { label: 'TikTok', data: [28000, 41000, 45000, 52000, 61000, 80000, 110000], borderColor: '#22d3ee', tension: 0.4 },
                        { label: 'Instagram', data: [10000, 16000, 22000, 28000, 34000, 39000, 48000], borderColor: '#ec4899', tension: 0.4 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } } }
            });
        }

        var ctx2 = document.getElementById('distributionChart');
        if (ctx2) {
            new window.Chart(ctx2.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['TikTok', 'YouTube', 'Instagram', 'Bilibili', 'Facebook'],
                    datasets: [{
                        data: [42, 28, 18, 8, 4],
                        backgroundColor: ['#22d3ee', '#ef4444', '#ec4899', '#38bdf8', '#3b82f6']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
            });
        }
    }

    document.addEventListener('click', handleClick);
    bindMentorChat();
    renderCharts();
})();
