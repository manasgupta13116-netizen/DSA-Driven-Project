// State management for UI switching
function switchTab(tabId) {
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('btn-group-ll').classList.add('hidden');
    document.getElementById('btn-group-stack').classList.add('hidden');
    document.getElementById('btn-group-queue').classList.add('hidden');

    if (tabId === 'linkedlist') {
        document.getElementById('ds-title').innerText = "Linked List Operations";
        document.getElementById('btn-group-ll').classList.remove('hidden');
    } else if (tabId === 'stack') {
        document.getElementById('ds-title').innerText = "Stack Operations";
        document.getElementById('btn-group-stack').classList.remove('hidden');
    } else if (tabId === 'queue') {
        document.getElementById('ds-title').innerText = "Queue Operations";
        document.getElementById('btn-group-queue').classList.remove('hidden');
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

    logToConsole(`Action: ${action} | Value: ${val || 'N/A'} | Pos: ${pos || 'N/A'}`);
    simulateCppBackend(action, val, pos);
}

function logToConsole(msg) {
    const log = document.getElementById('console-log');
    log.innerHTML = `> ${msg}`;
}

// ==========================================
// BACKEND SIMULATION (Replaces C++ until Wasm is compiled)
// ==========================================
let llState = [];
let stackState = [];
let queueState = [];

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
// RENDERERS
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