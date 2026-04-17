// --- GLOBAL HISTORY LOG & MEMORY STATES ---
let actionHistory = [];
let llState = [];
let stackState = [];
let queueState = [];

// ==========================================
// UI & STATE MANAGEMENT
// ==========================================
function switchTab(tabId) {
    // 1. Update Active Sidebar Tab
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');

    // 2. Hide all button groups initially
    document.getElementById('btn-group-ll').classList.add('hidden');
    document.getElementById('btn-group-stack').classList.add('hidden');
    document.getElementById('btn-group-queue').classList.add('hidden');

    // 3. Grab the Position input field to hide/show it
    const posInput = document.getElementById('inputPos');

    // 4. Show specific controls based on selected tab
    if (tabId === 'linkedlist') {
        document.getElementById('ds-title').innerText = "Linked List Operations";
        document.getElementById('btn-group-ll').classList.remove('hidden');
        posInput.classList.remove('hidden'); // SHOW Position input
    } else if (tabId === 'stack') {
        document.getElementById('ds-title').innerText = "Stack Operations";
        document.getElementById('btn-group-stack').classList.remove('hidden');
        posInput.classList.add('hidden');    // HIDE Position input
    } else if (tabId === 'queue') {
        document.getElementById('ds-title').innerText = "Queue Operations";
        document.getElementById('btn-group-queue').classList.remove('hidden');
        posInput.classList.add('hidden');    // HIDE Position input
    }
    
    document.getElementById('visualCanvas').innerHTML = `<span class="placeholder">Ready...</span>`;
    logToConsole(`Switched to ${tabId}`);
}

function operate(action) {
    const val = document.getElementById('inputValue').value;
    const pos = document.getElementById('inputPos').value;
    
    // Clear inputs after grabbing values
    document.getElementById('inputValue').value = '';
    document.getElementById('inputPos').value = '';

    // Record to history array
    const timestamp = new Date().toLocaleTimeString();
    actionHistory.push({ time: timestamp, action: action, val: val, pos: pos });

    logToConsole(`Action: ${action} | Value: ${val || 'N/A'} | Pos: ${pos || 'N/A'}`);
    
    // Send to backend simulation
    simulateCppBackend(action, val, pos);
}

function logToConsole(msg) {
    const log = document.getElementById('console-log');
    log.innerHTML = `> ${msg}`;
}

// ==========================================
// HISTORY MODAL LOGIC
// ==========================================
function showHistory(dsType) {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    document.getElementById('historyTitle').innerText = `${dsType} History`;
    
    list.innerHTML = ''; 

    // Determine the prefix to filter the correct logs for the active data structure
    let prefix = '';
    if (dsType === 'Linked List') prefix = 'll_';
    else if (dsType === 'Stack') prefix = 'stack_';
    else if (dsType === 'Queue') prefix = 'queue_';

    const filteredLogs = actionHistory.filter(log => log.action.startsWith(prefix));

    if (filteredLogs.length === 0) {
        list.innerHTML = '<li>No history recorded yet.</li>';
    } else {
        // Reverse array to show newest actions at the top of the list
        filteredLogs.slice().reverse().forEach(log => {
            let li = document.createElement('li');
            li.innerHTML = `<span class="timestamp">[${log.time}]</span> <span class="action">${log.action}</span> | Val: ${log.val || '-'} | Pos: ${log.pos || '-'}`;
            list.appendChild(li);
        });
    }

    modal.classList.remove('hidden');
}

function closeHistory() {
    document.getElementById('historyModal').classList.add('hidden');
}

// ==========================================
// BACKEND SIMULATION (C++ Bridge Replacement)
// ==========================================
function simulateCppBackend(action, val, pos) {
    val = parseInt(val);
    pos = parseInt(pos);

    // --- LINKED LIST ---
    if (action.startsWith('ll_')) {
        if (action === 'll_insert_start') {
            if(!isNaN(val)) llState.unshift(val);
            renderHorizontal(llState, 0, true);
        } else if (action === 'll_insert_end') {
            if(!isNaN(val)) llState.push(val);
            renderHorizontal(llState, llState.length - 1, true);
        } else if (action === 'll_insert_pos') {
            if(!isNaN(val) && !isNaN(pos) && pos > 0 && pos <= llState.length + 1) {
                llState.splice(pos - 1, 0, val);
                renderHorizontal(llState, pos - 1, true);
            } else { logToConsole("Error: Invalid position"); }
        } else if (action === 'll_delete_pos') {
            if(!isNaN(pos) && pos > 0 && pos <= llState.length) {
                llState.splice(pos - 1, 1);
                renderHorizontal(llState, -1, true);
            } else { logToConsole("Error: Invalid position"); }
        }
    } 
    // --- STACK ---
    else if (action.startsWith('stack_')) {
        if (action === 'stack_push') {
            if(!isNaN(val)) stackState.push(val);
            renderVertical(stackState, stackState.length - 1);
        } else if (action === 'stack_pop') {
            if(stackState.length > 0) stackState.pop();
            renderVertical(stackState, stackState.length - 1);
        } else if (action === 'stack_peek') {
            if(stackState.length > 0) {
                renderVertical(stackState, stackState.length - 1);
                logToConsole(`Peek Top: ${stackState[stackState.length - 1]}`);
            } else { logToConsole("Stack is empty"); }
        } else if (action === 'stack_isempty') {
            const isEmpty = stackState.length === 0;
            logToConsole(`Stack IsEmpty: ${isEmpty ? 'True' : 'False'}`);
        }
    } 
    // --- QUEUE ---
    else if (action.startsWith('queue_')) {
        if (action === 'queue_enqueue') {
            if(!isNaN(val)) queueState.push(val);
            renderHorizontal(queueState, queueState.length - 1, false);
        } else if (action === 'queue_dequeue') {
            if(queueState.length > 0) queueState.shift();
            renderHorizontal(queueState, 0, false);
        }
    }
}

// ==========================================
// RENDERERS (Visual Output)
// ==========================================
function renderHorizontal(arrayData, highlightIndex = -1, isLinkedList = false) {
    const canvas = document.getElementById('visualCanvas');
    canvas.className = 'canvas horizontal'; 
    canvas.innerHTML = ''; 

    if (arrayData.length === 0) { 
        canvas.innerHTML = `<span class="placeholder">Empty</span>`; 
        return; 
    }

    arrayData.forEach((item, index) => {
        let span = document.createElement('span');
        span.className = `node ${index === highlightIndex ? 'highlight' : ''}`;
        span.innerText = item; 
        canvas.appendChild(span);
        
        // Only draw arrows if it's a linked list
        if (isLinkedList && index < arrayData.length - 1) {
            let arrow = document.createElement('span'); 
            arrow.innerText = ' ➔ '; 
            canvas.appendChild(arrow);
        }
    });
}

function renderVertical(arrayData, highlightIndex = -1) {
    const canvas = document.getElementById('visualCanvas');
    canvas.className = 'canvas vertical'; 
    canvas.innerHTML = ''; 

    if (arrayData.length === 0) { 
        canvas.innerHTML = `<span class="placeholder">Stack is Empty</span>`; 
        return; 
    }

    arrayData.forEach((item, index) => {
        let span = document.createElement('span');
        span.className = `node ${index === highlightIndex ? 'highlight' : ''}`;
        span.innerText = item; 
        canvas.appendChild(span);
    });
}
