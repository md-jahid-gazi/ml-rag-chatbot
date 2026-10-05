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
            background: radial-gradient(circle at 50% 50%, #e2e8f0 0%, #cbd5e1 100%);
        }
        /* Mobile Device Frame styling matching Image 1 */
        .phone-frame {
            width: 100%;
            max-width: 380px;
            height: 720px;
            background: #ffffff;
            border-radius: 46px;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 12px #ffffff, 0 0 0 14px #e2e8f0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        .phone-notch {
            width: 140px;
            height: 24px;
            background: #ffffff;
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-left-radius: 16px;
            border-bottom-right-radius: 16px;
            z-index: 20;
        }
        .speaker {
            width: 48px;
            height: 4px;
            background: #cbd5e1;
            border-radius: 2px;
            margin: 8px auto 0;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-4">

    <!-- Top Mode Switcher Bar -->
    <div class="mb-4 flex items-center space-x-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-200">
        <span class="text-xs font-semibold text-slate-700">UI Mode:</span>
        <a href="/" class="text-xs font-medium px-3 py-1 bg-blue-600 text-white rounded-full shadow-sm">
            📱 Chat Widget (Image 1)
        </a>
        <a href="/admin" class="text-xs font-medium px-3 py-1 text-slate-600 hover:text-slate-900 transition">
            💻 Admin Console (Image 2)
        </a>
    </div>

    <!-- Phone Mockup Container (Image 1) -->
    <div class="phone-frame">
        <div class="phone-notch">
            <div class="speaker"></div>
        </div>

        <!-- Phone Top Header -->
        <div class="pt-8 pb-3 px-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <div class="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <!-- Geometric Logo matching Image 1 -->
                    <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </div>
                <div>
                    <h2 class="text-xs font-bold text-slate-800">KnowledgeBot</h2>
                    <span class="text-[10px] text-emerald-600 font-medium flex items-center space-x-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Grounding Active</span>
                    </span>
                </div>
            </div>
            <span class="text-[10px] bg-slate-200 text-slate-600 font-mono px-2 py-0.5 rounded-full">PHP & MySQL</span>
        </div>

        <!-- Chat Stream Area -->
        <div id="chatStream" class="flex-1 overflow-y-auto p-4 space-y-4">
            
            <!-- Default Sample Turn Matching User's Image 1 -->
            <!-- User Bubble -->
            <div class="flex justify-end items-start space-x-2">
                <div class="bg-[#dbeafe] text-slate-800 text-xs px-4 py-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] leading-relaxed font-normal">
                    How do I reset my password?
                </div>
                <div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                </div>
            </div>

            <!-- Assistant Bubble with Source: Account_Security.pdf badge -->
            <div class="flex justify-start items-start space-x-2">
                <div class="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </div>
                <div class="max-w-[82%]">
                    <span class="text-[11px] font-bold text-slate-700 block mb-1">KnowledgeBot</span>
                    <div class="bg-[#f1f5f9] text-slate-800 text-xs p-3.5 rounded-2xl rounded-tl-none shadow-sm leading-relaxed">
                        According to the "Account Security" document, you can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your registered email.
                        
                        <!-- Exact Source citation badge from Image 1 -->
                        <div class="mt-2.5 pt-2 border-t border-slate-200/80">
                            <span class="inline-block bg-[#e2e8f0] text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded">
                                Source: Account_Security.pdf
                            </span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Chat Input Footer -->
        <div class="p-3 bg-slate-50 border-t border-slate-100">
            <!-- Sample Chips -->
            <div class="flex space-x-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[10px]">
                <button onclick="setQuery('How do I reset my password?')" class="whitespace-nowrap px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition">
                    🔑 Reset Password
                </button>
                <button onclick="setQuery('Explain reparameterization trick in VAE')" class="whitespace-nowrap px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition">
                    🧠 VAE Trick
                </button>
                <button onclick="setQuery('What is Teacher Forcing?')" class="whitespace-nowrap px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition">
                    📖 Teacher Forcing
                </button>
                <button onclick="setQuery('Who won the world cup?')" class="whitespace-nowrap px-2 py-1 bg-white border border-slate-200 text-rose-600 rounded-lg hover:bg-rose-50 transition">
                    🚫 Fallback Test
                </button>
            </div>

            <form id="chatForm" class="flex items-center space-x-2">
                <input 
                    type="text" 
                    id="queryInput" 
                    placeholder="Ask KnowledgeBot..." 
                    class="flex-1 bg-white border border-slate-200 text-xs text-slate-800 rounded-full px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                    required
                >
                <button 
                    type="submit" 
                    id="sendBtn"
                    class="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                </button>
            </form>
        </div>
    </div>

    <script>
        const chatStream = document.getElementById('chatStream');
        const chatForm = document.getElementById('chatForm');
        const queryInput = document.getElementById('queryInput');
        const sessionId = 'session_' + Math.random().toString(36).substring(7);

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
                renderAssistantMessage("Error connecting to MySQL / PHP Backend: " + err.message, null, false);
            }
            chatStream.scrollTop = chatStream.scrollHeight;
        });

        function renderUserMessage(text) {
            const div = document.createElement('div');
            div.className = 'flex justify-end items-start space-x-2';
            div.innerHTML = `
                <div class="bg-[#dbeafe] text-slate-800 text-xs px-4 py-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] leading-relaxed font-normal">
                    ${escapeHtml(text)}
                </div>
                <div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
            `;
            chatStream.appendChild(div);
        }

        function renderAssistantMessage(answer, sourceDoc, inScope) {
            const div = document.createElement('div');
            div.className = 'flex justify-start items-start space-x-2';
            div.innerHTML = `
                <div class="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </div>
                <div class="max-w-[82%]">
                    <span class="text-[11px] font-bold text-slate-700 block mb-1">KnowledgeBot</span>
                    <div class="${inScope ? 'bg-[#f1f5f9]' : 'bg-amber-50 border border-amber-200'} text-slate-800 text-xs p-3.5 rounded-2xl rounded-tl-none shadow-sm leading-relaxed whitespace-pre-wrap">
                        ${escapeHtml(answer)}
                        ${sourceDoc ? `
                            <div class="mt-2.5 pt-2 border-t border-slate-200/80">
                                <span class="inline-block bg-[#e2e8f0] text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded">
                                    Source: ${escapeHtml(sourceDoc)}
                                </span>
                            </div>
                        ` : ''}
                    </div>
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
