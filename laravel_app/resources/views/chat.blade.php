<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KnowledgeBot - AI Assistant</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #f1f5f9;
        }
        /* Mobile Device Frame styling - Full Height View */
        .phone-frame {
            width: 100%;
            max-width: 420px;
            height: calc(100vh - 110px);
            max-height: calc(100dvh - 110px);
            min-height: 520px;
            background: #ffffff;
            border-radius: 44px;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.22), 0 0 0 8px #ffffff, 0 0 0 11px #cbd5e1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* Desktop Window styling - Full View Windows */
        .desktop-frame {
            width: 100%;
            max-width: 700px;
            height: calc(100vh - 110px);
            max-height: calc(100dvh - 110px);
            min-height: 520px;
            background: #ffffff;
            border-radius: 18px;
            box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px #e2e8f0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 640px) {
            .phone-frame, .desktop-frame {
                max-width: 100%;
                height: calc(100dvh - 80px);
                max-height: none;
                border-radius: 24px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 4px #ffffff, 0 0 0 6px #cbd5e1;
            }
        }
        .phone-notch {
            width: 150px;
            height: 24px;
            background: #ffffff;
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-left-radius: 18px;
            border-bottom-right-radius: 18px;
            z-index: 20;
        }
        .speaker {
            width: 50px;
            height: 4px;
            background: #cbd5e1;
            border-radius: 2px;
            margin: 8px auto 0;
        }
        /* Hide all scrollbars inside phone frame for genuine native app look */
        .phone-frame * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
        }
        .phone-frame *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-between p-2 sm:p-4">

    <!-- Top Mode Switcher Bar -->
    <div class="w-full max-w-6xl mx-auto flex items-center justify-between mb-2 px-2">
        <div class="flex items-center space-x-2">
            <div class="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </div>
            <span class="font-bold text-sm text-slate-800">KnowledgeBot</span>
        </div>

        <div class="flex items-center space-x-1.5 bg-white px-2 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button id="btnDesktopMode" onclick="setViewMode('desktop')" class="text-xs font-semibold px-3 py-1 bg-blue-600 text-white rounded-xl shadow-xs transition">
                🖥️ Desktop View
            </button>
            <button id="btnPhoneMode" onclick="setViewMode('phone')" class="text-xs font-semibold px-3 py-1 text-slate-600 hover:text-slate-900 rounded-xl transition">
                📱 Mobile Widget
            </button>
            <a href="/admin" class="text-xs font-semibold px-3 py-1 text-slate-600 hover:text-slate-900 rounded-xl transition">
                💻 Admin Console
            </a>
        </div>
    </div>

    <!-- Main Widget / Window Container -->
    <div id="mainContainer" class="desktop-frame">
        <div id="phoneNotchEl" class="phone-notch hidden">
            <div class="speaker"></div>
        </div>

        <!-- Desktop Title Bar -->
        <div id="desktopHeader" class="py-2.5 px-4 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between z-20 flex-shrink-0">
            <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-1.5">
                    <div class="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/30"></div>
                    <div class="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/30"></div>
                    <div class="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/30"></div>
                </div>
                <div class="h-4 w-px bg-slate-300 mx-1"></div>
                <div class="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <svg class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </div>
                <div class="flex items-center space-x-2">
                    <h2 class="text-xs font-bold text-slate-800">KnowledgeBot AI Assistant</h2>
                    <span class="text-[11px] text-slate-400 hidden sm:inline">— Desktop Window View</span>
                </div>
                <span class="text-[10px] text-emerald-600 font-medium flex items-center space-x-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Active</span>
                </span>
            </div>

            <div class="flex items-center space-x-2">
                <button onclick="setViewMode('phone')" class="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs">
                    📱 Mobile Widget
                </button>
                <button onclick="resetConversation()" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition" title="Reset conversation">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </button>
            </div>
        </div>

        <!-- Phone Top Header (shown only in phone mode) -->
        <div id="phoneHeader" class="hidden pt-8 pb-3 px-5 bg-slate-50 border-b border-slate-100 items-center justify-between z-20 flex-shrink-0">
            <div class="flex items-center space-x-2.5">
                <div class="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </div>
                <div>
                    <h2 class="text-xs font-bold text-slate-800">KnowledgeBot</h2>
                    <span class="text-[10px] text-emerald-600 font-medium flex items-center space-x-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Active</span>
                    </span>
                </div>
            </div>

            <div class="flex items-center space-x-1">
                <button onclick="setViewMode('desktop')" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition" title="Full Desktop View">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                </button>
                <button onclick="resetConversation()" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition" title="Reset conversation">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </button>
            </div>
        </div>

        <!-- Chat Stream Area -->
        <div id="chatStream" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            <!-- Default Sample Turn -->
            <div class="flex justify-end items-start space-x-2">
                <div class="bg-[#dbeafe] text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-none shadow-xs max-w-[80%] leading-relaxed font-normal">
                    Can I change my booking?
                </div>
                <div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                </div>
            </div>

            <div class="flex justify-start items-start space-x-2">
                <div class="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </div>
                <div class="max-w-[82%] text-left">
                    <span class="text-[11px] font-bold text-slate-700 block mb-1">KnowledgeBot</span>
                    <div class="bg-[#f1f5f9] text-slate-800 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-none shadow-xs leading-relaxed">
                        Sorry, I couldn’t find this information in my knowledge base.
                    </div>
                </div>
            </div>

        </div>

        <!-- Chat Input Footer -->
        <div class="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
            <!-- Sample Chips covering all knowledge base topics -->
            <div class="flex space-x-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[10px]">
                <button onclick="setQuery('BRAC University Location?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs font-medium text-blue-700 bg-blue-50/50">
                    📍 BRAC University Location?
                </button>
                <button onclick="setQuery('BRAC University Founder ?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs">
                    👤 BRAC University Founder ?
                </button>
                <button onclick="setQuery('BRAC University Founding Date ?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs">
                    📅 Founding Date ?
                </button>
                <button onclick="setQuery('What is the capital of Bangladesh?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs">
                    🏛️ Capital of Bangladesh?
                </button>
                <button onclick="setQuery('What is the official language of Bangladesh?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs">
                    🗣️ Language of Bangladesh?
                </button>
                <button onclick="setQuery('What is Supervised Learning?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs">
                    🤖 Supervised Learning
                </button>
                <button onclick="setQuery('What is Unsupervised Learning?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs">
                    🔮 Unsupervised Learning
                </button>
                <button onclick="setQuery('What is Deep Learning?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs">
                    🧠 Deep Learning
                </button>
                <button onclick="setQuery('What is Overfitting in Machine Learning?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs">
                    📉 Overfitting
                </button>
                <button onclick="setQuery('Can I change my booking?')" class="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs text-rose-600">
                    ❓ Out-of-Scope Test
                </button>
            </div>

            <form id="chatForm" class="flex items-center space-x-2">
                <input 
                    type="text" 
                    id="queryInput" 
                    placeholder="Ask KnowledgeBot..." 
                    class="flex-1 bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 rounded-full px-4 py-2.5 sm:py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                    required
                >
                <button 
                    type="submit" 
                    id="sendBtn"
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                </button>
            </form>
        </div>
    </div>

    <!-- Footer -->
    <footer class="mt-2 text-center text-xs text-slate-400 font-medium">
        © MD. JAHID GAZI - 2026
    </footer>

    <script>
        const chatStream = document.getElementById('chatStream');
        const chatForm = document.getElementById('chatForm');
        const queryInput = document.getElementById('queryInput');
        const mainContainer = document.getElementById('mainContainer');
        const phoneNotchEl = document.getElementById('phoneNotchEl');
        const desktopHeader = document.getElementById('desktopHeader');
        const phoneHeader = document.getElementById('phoneHeader');
        const btnDesktopMode = document.getElementById('btnDesktopMode');
        const btnPhoneMode = document.getElementById('btnPhoneMode');
        let currentMode = 'desktop';
        let sessionId = 'session_' + Math.random().toString(36).substring(7);

        function setViewMode(mode) {
            currentMode = mode;
            if (mode === 'desktop') {
                mainContainer.className = 'desktop-frame';
                phoneNotchEl.classList.add('hidden');
                desktopHeader.classList.remove('hidden');
                desktopHeader.classList.add('flex');
                phoneHeader.classList.add('hidden');
                phoneHeader.classList.remove('flex');
                btnDesktopMode.className = 'text-xs font-semibold px-3 py-1 bg-blue-600 text-white rounded-xl shadow-xs transition';
                btnPhoneMode.className = 'text-xs font-semibold px-3 py-1 text-slate-600 hover:text-slate-900 rounded-xl transition';
            } else {
                mainContainer.className = 'phone-frame';
                phoneNotchEl.classList.remove('hidden');
                desktopHeader.classList.add('hidden');
                desktopHeader.classList.remove('flex');
                phoneHeader.classList.remove('hidden');
                phoneHeader.classList.add('flex');
                btnDesktopMode.className = 'text-xs font-semibold px-3 py-1 text-slate-600 hover:text-slate-900 rounded-xl transition';
                btnPhoneMode.className = 'text-xs font-semibold px-3 py-1 bg-blue-600 text-white rounded-xl shadow-xs transition';
            }
        }

        function resetConversation() {
            sessionId = 'session_' + Math.random().toString(36).substring(7);
            chatStream.innerHTML = `
                <div class="flex justify-end items-start space-x-2">
                    <div class="bg-[#dbeafe] text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-none shadow-xs max-w-[80%] leading-relaxed font-normal">
                        Can I change my booking?
                    </div>
                    <div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                </div>
                <div class="flex justify-start items-start space-x-2">
                    <div class="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" /><circle cx="12" cy="12" r="3" /></svg>
                    </div>
                    <div class="max-w-[82%] text-left">
                        <span class="text-[11px] font-bold text-slate-700 block mb-1">KnowledgeBot</span>
                        <div class="bg-[#f1f5f9] text-slate-800 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-none shadow-xs leading-relaxed">
                            Sorry, I couldn’t find this information in my knowledge base.
                        </div>
                    </div>
                </div>
            `;
        }

        function setQuery(text) {
            queryInput.value = text;
            queryInput.focus();
        }

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = queryInput.value.trim();
            if (!query) return;

            // Render User Bubble
            renderUserMessage(query);
            queryInput.value = '';
            chatStream.scrollTop = chatStream.scrollHeight;

            // Show Typing indicator
            const typingId = 'typing_' + Date.now();
            renderTyping(typingId);
            chatStream.scrollTop = chatStream.scrollHeight;

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: query, session_id: sessionId })
                });
                const data = await res.json();
                document.getElementById(typingId)?.remove();

                renderAssistantMessage(data.answer, data.source_doc, data.in_scope);
            } catch (err) {
                document.getElementById(typingId)?.remove();
                renderAssistantMessage("Error connecting to backend: " + err.message, null, false);
            }
            chatStream.scrollTop = chatStream.scrollHeight;
        });

        function renderUserMessage(text) {
            const div = document.createElement('div');
            div.className = 'flex justify-end items-start space-x-2';
            div.innerHTML = `
                <div class="bg-[#dbeafe] text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-none shadow-xs max-w-[80%] leading-relaxed font-normal">
                    ${escapeHtml(text)}
                </div>
                <div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
            `;
            chatStream.appendChild(div);
        }

        function renderAssistantMessage(answer, sourceDoc, inScope) {
            let cleanAnswer = answer.trim()
                .replace(/^According to the [^,]+,\s*/i, '')
                .replace(/^Source:\s*[^\n]+\n*/i, '')
                .replace(/^[^\n]+:\s*A \d+-Page Overview\s*(Page \d+\s*)?/si, '')
                .trim();

            const div = document.createElement('div');
            div.className = 'flex justify-start items-start space-x-2 text-left';
            div.innerHTML = `
                <div class="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </div>
                <div class="max-w-[82%] text-left">
                    <span class="text-[11px] font-bold text-slate-700 block mb-1 text-left">KnowledgeBot</span>
                    <div class="bg-[#f1f5f9] text-slate-800 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-none shadow-xs leading-relaxed text-left">${escapeHtml(cleanAnswer)}</div>
                </div>
            `;
            chatStream.appendChild(div);
        }

        function renderTyping(id) {
            const div = document.createElement('div');
            div.id = id;
            div.className = 'flex justify-start items-center space-x-2 text-[10px] text-slate-500 pl-9';
            div.innerHTML = `<span>KnowledgeBot is retrieving knowledge...</span>`;
            chatStream.appendChild(div);
        }

        function escapeHtml(str) {
            return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
        }
    </script>
</body>
</html>
