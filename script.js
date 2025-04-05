// CPU Scheduler Visualizer - Main JavaScript

// Process class to represent each process
class Process {
    constructor(pid, at, bt) {
        this.pid = pid;             // Process ID
        this.at = parseFloat(at);   // Arrival Time
        this.bt = parseFloat(bt);   // Burst Time
        this.rt = parseFloat(bt);   // Remaining Time
        this.ct = 0;               // Completion Time
        this.tat = 0;              // Turnaround Time
        this.wt = 0;               // Waiting Time
        this.color = getRandomColor();
    }

    // Clone a process for simulations
    clone() {
        let p = new Process(this.pid, this.at, this.bt);
        p.color = this.color;
        return p;
    }
}

// Global variables
let processes = [];
let currentAlgorithm = 'fcfs';
let timeQuantum = 2;
let animationSpeed = 5;
let isSimulationRunning = false;
let simulationInterval;
let processIdCounter = 1;

// DOM elements
const algorithmInfo = {
    'fcfs': {
        title: 'First-Come, First-Served (FCFS)',
        description: 'Processes are executed in the order they arrive in the ready queue. It\'s simple but can lead to the convoy effect.'
    },
    'sjf': {
        title: 'Shortest Job First (SJF)',
        description: 'A non-preemptive algorithm that selects the process with the smallest burst time. It\'s optimal for minimizing average waiting time but requires knowing burst times in advance.'
    },
    'srtf': {
        title: 'Shortest Remaining Time First (SRTF)',
        description: 'A preemptive version of SJF. The process with the smallest remaining time is executed next. If a new process arrives with a smaller burst time, the current process is preempted.'
    },
    'rr': {
        title: 'Round Robin (RR)',
        description: 'Each process is assigned a fixed time slot called a quantum. After a process executes for the time quantum, it\'s preempted and added to the end of the ready queue. It\'s good for time-sharing systems but performance depends on the quantum size.'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    setupEventListeners();
    
    // Add some initial processes for demo purposes
    addProcess(0, 6);
    addProcess(2, 4);
    addProcess(4, 8);
    addProcess(6, 5);
    
    // Make accordion functional
    setupAccordion();
});

// Set up all event listeners
function setupEventListeners() {
    // Algorithm selection
    document.getElementById('fcfs-btn').addEventListener('click', () => selectAlgorithm('fcfs'));
    document.getElementById('sjf-btn').addEventListener('click', () => selectAlgorithm('sjf'));
    document.getElementById('srtf-btn').addEventListener('click', () => selectAlgorithm('srtf'));
    document.getElementById('rr-btn').addEventListener('click', () => selectAlgorithm('rr'));
    
    // Process management
    document.getElementById('add-process-btn').addEventListener('click', () => {
        const at = document.getElementById('arrival-time').value;
        const bt = document.getElementById('burst-time').value;
        addProcess(at, bt);
    });
    
    // Simulation controls
    document.getElementById('start-btn').addEventListener('click', toggleSimulation);
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
    
    // Speed control
    document.getElementById('simulation-speed').addEventListener('input', (e) => {
        animationSpeed = e.target.value;
        if (isSimulationRunning) {
            stopSimulation();
            startSimulation();
        }
    });
    
    // Dark mode toggle
    document.querySelector('.theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
}

// Set up accordion functionality
function setupAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
    
    // Open the first accordion by default
    accordionItems[0].classList.add('active');
}

// Select scheduling algorithm
function selectAlgorithm(algorithm) {
    currentAlgorithm = algorithm;
    
    // Update UI
    const buttons = document.querySelectorAll('.algorithm-buttons button');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${algorithm}-btn`).classList.add('active');
    
    // Update algorithm info
    const infoElement = document.getElementById('algorithm-info');
    infoElement.innerHTML = `
        <h4>${algorithmInfo[algorithm].title}</h4>
        <p>${algorithmInfo[algorithm].description}</p>
    `;
    
    // Show/hide quantum input for Round Robin
    const quantumContainer = document.getElementById('quantum-container');
    if (algorithm === 'rr') {
        quantumContainer.classList.remove('hidden');
        timeQuantum = parseInt(document.getElementById('time-quantum').value);
    } else {
        quantumContainer.classList.add('hidden');
    }
    
    // Reset if simulation was running
    if (isSimulationRunning) {
        stopSimulation();
        resetGanttChart();
        document.getElementById('start-btn').innerHTML = '<i class="fas fa-play"></i> Start Simulation';
        isSimulationRunning = false;
    }
}

// Add a new process
function addProcess(arrivalTime, burstTime) {
    if (burstTime <= 0) {
        alert('Burst time must be greater than 0');
        return;
    }
    
    const pid = `P${processIdCounter++}`;
    const process = new Process(pid, arrivalTime, burstTime);
    processes.push(process);
    
    updateProcessTable();
}

// Remove a process
function removeProcess(pid) {
    processes = processes.filter(p => p.pid !== pid);
    updateProcessTable();
}

// Update the process table
function updateProcessTable() {
    const tableBody = document.getElementById('process-table-body');
    tableBody.innerHTML = '';
    
    processes.forEach(process => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="process-badge" style="background-color: ${process.color}">${process.pid}</span></td>
            <td>${process.at}</td>
            <td>${process.bt}</td>
            <td><button class="action-btn" onclick="removeProcess('${process.pid}')"><i class="fas fa-trash-alt"></i></button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Toggle simulation (start/stop)
function toggleSimulation() {
    if (processes.length === 0) {
        alert('Please add at least one process');
        return;
    }
    
    if (isSimulationRunning) {
        stopSimulation();
        document.getElementById('start-btn').innerHTML = '<i class="fas fa-play"></i> Start Simulation';
    } else {
        startSimulation();
        document.getElementById('start-btn').innerHTML = '<i class="fas fa-pause"></i> Pause Simulation';
    }
    
    isSimulationRunning = !isSimulationRunning;
}

// Start the simulation
function startSimulation() {
    // Clear previous results
    resetGanttChart();
    
    // Get updated time quantum for RR
    if (currentAlgorithm === 'rr') {
        timeQuantum = parseInt(document.getElementById('time-quantum').value);
        if (timeQuantum <= 0) {
            alert('Time quantum must be greater than 0');
            return;
        }
    }
    
    // Run the appropriate algorithm
    let ganttData;
    switch (currentAlgorithm) {
        case 'fcfs':
            ganttData = fcfsScheduling();
            break;
        case 'sjf':
            ganttData = sjfScheduling();
            break;
        case 'srtf':
            ganttData = srtfScheduling();
            break;
        case 'rr':
            ganttData = rrScheduling();
            break;
    }
    
    // Animate the Gantt chart
    animateGanttChart(ganttData);
}

// Stop the simulation
function stopSimulation() {
    clearInterval(simulationInterval);
}

// Reset the simulation
function resetSimulation() {
    stopSimulation();
    resetGanttChart();
    resetResultsTable();
    document.getElementById('start-btn').innerHTML = '<i class="fas fa-play"></i> Start Simulation';
    isSimulationRunning = false;
}

// Reset the Gantt chart
function resetGanttChart() {
    document.getElementById('gantt-chart').innerHTML = '';
    document.getElementById('timeline').innerHTML = '';
    document.getElementById('avg-metrics').innerHTML = '<p>No data yet. Run the simulation to see results.</p>';
    resetResultsTable();
}

// Reset the results table
function resetResultsTable() {
    document.getElementById('results-table-body').innerHTML = '';
}

// FCFS (First-Come, First-Served) Scheduling
function fcfsScheduling() {
    // Clone processes to avoid modifying the original data
    let processesClone = processes.map(p => p.clone());
    
    // Sort by arrival time
    processesClone.sort((a, b) => a.at - b.at);
    
    let currentTime = 0;
    let ganttData = [];
    
    for (let p of processesClone) {
        // If current time is less than arrival time, jump to arrival time
        if (currentTime < p.at) {
            currentTime = p.at;
        }
        
        // Execute the process
        let startTime = currentTime;
        currentTime += p.bt;
        
        // Update process metrics
        p.ct = currentTime;
        p.tat = p.ct - p.at;
        p.wt = p.tat - p.bt;
        
        // Add to Gantt chart data
        ganttData.push({
            pid: p.pid,
            startTime: startTime,
            endTime: currentTime,
            color: p.color
        });
    }
    
    updateResults(processesClone);
    return ganttData;
}

// SJF (Shortest Job First) Scheduling
function sjfScheduling() {
    // Clone processes to avoid modifying the original data
    let processesClone = processes.map(p => p.clone());
    
    // Sort initially by arrival time
    processesClone.sort((a, b) => a.at - b.at);
    
    let currentTime = 0;
    let ganttData = [];
    let completed = 0;
    let n = processesClone.length;
    
    // Continue until all processes are complete
    while (completed < n) {
        // Find the process with the shortest burst time among the arrived ones
        let shortestIndex = -1;
        let shortestBurst = Infinity;
        
        for (let i = 0; i < n; i++) {
            if (processesClone[i].at <= currentTime && processesClone[i].rt > 0) {
                if (processesClone[i].bt < shortestBurst) {
                    shortestBurst = processesClone[i].bt;
                    shortestIndex = i;
                }
            }
        }
        
        // If no process is available, jump to the next arrival
        if (shortestIndex === -1) {
            // Find the next arrival time
            let nextArrival = Infinity;
            for (let i = 0; i < n; i++) {
                if (processesClone[i].rt > 0 && processesClone[i].at < nextArrival) {
                    nextArrival = processesClone[i].at;
                }
            }
            currentTime = nextArrival;
            continue;
        }
        
        // Execute the selected process
        let p = processesClone[shortestIndex];
        let startTime = currentTime;
        currentTime += p.bt;
        
        // Update process metrics
        p.ct = currentTime;
        p.tat = p.ct - p.at;
        p.wt = p.tat - p.bt;
        p.rt = 0;
        
        // Add to Gantt chart data
        ganttData.push({
            pid: p.pid,
            startTime: startTime,
            endTime: currentTime,
            color: p.color
        });
        
        completed++;
    }
    
    updateResults(processesClone);
    return ganttData;
}

// SRTF (Shortest Remaining Time First) Scheduling
function srtfScheduling() {
    // Clone processes to avoid modifying the original data
    let processesClone = processes.map(p => p.clone());
    
    let currentTime = 0;
    let ganttData = [];
    let completed = 0;
    let n = processesClone.length;
    let prevProcess = null;
    
    // Get the earliest arrival time
    currentTime = Math.min(...processesClone.map(p => p.at));
    
    // Continue until all processes are complete
    while (completed < n) {
        // Find the process with shortest remaining time among the arrived ones
        let shortestIndex = -1;
        let shortestRemaining = Infinity;
        
        for (let i = 0; i < n; i++) {
            if (processesClone[i].at <= currentTime && processesClone[i].rt > 0) {
                if (processesClone[i].rt < shortestRemaining) {
                    shortestRemaining = processesClone[i].rt;
                    shortestIndex = i;
                }
            }
        }
        
        // If no process is available, jump to the next arrival
        if (shortestIndex === -1) {
            // Find the next arrival time
            let nextArrival = Infinity;
            for (let i = 0; i < n; i++) {
                if (processesClone[i].rt > 0 && processesClone[i].at < nextArrival) {
                    nextArrival = processesClone[i].at;
                }
            }
            currentTime = nextArrival;
            continue;
        }
        
        let p = processesClone[shortestIndex];
        
        // If switching to a different process, create a new entry in the Gantt chart
        if (prevProcess !== p.pid) {
            if (ganttData.length > 0 && prevProcess) {
                ganttData[ganttData.length - 1].endTime = currentTime;
            }
            
            ganttData.push({
                pid: p.pid,
                startTime: currentTime,
                endTime: currentTime + 1, // Will be updated later
                color: p.color
            });
        } else if (ganttData.length > 0) {
            // Extend the current process's time slot
            ganttData[ganttData.length - 1].endTime = currentTime + 1;
        }
        
        // Simulate time passing (smaller increments for SRTF)
        const timeIncrement = 1;
        currentTime += timeIncrement;
        p.rt -= timeIncrement;
        
        // Check if process is completed
        if (p.rt <= 0) {
            p.ct = currentTime;
            p.tat = p.ct - p.at;
            p.wt = p.tat - p.bt;
            completed++;
            
            // Ensure the end time is set correctly
            ganttData[ganttData.length - 1].endTime = currentTime;
        }
        
        prevProcess = p.pid;
    }
    
    // Merge adjacent blocks with the same process ID
    ganttData = mergeAdjacentBlocks(ganttData);
    
    updateResults(processesClone);
    return ganttData;
}

// RR (Round Robin) Scheduling
function rrScheduling() {
    // Clone processes to avoid modifying the original data
    let processesClone = processes.map(p => p.clone());
    
    // Sort by arrival time
    processesClone.sort((a, b) => a.at - b.at);
    
    let currentTime = 0;
    let ganttData = [];
    let queue = [];
    let completed = 0;
    let n = processesClone.length;
    
    // Initialize with the first arrived process
    currentTime = processesClone[0].at;
    
    // Add all processes that have arrived at currentTime to the queue
    for (let i = 0; i < n; i++) {
        if (processesClone[i].at <= currentTime) {
            queue.push(processesClone[i]);
        }
    }
    
    while (completed < n) {
        // If queue is empty, jump to the next arrival
        if (queue.length === 0) {
            // Find the next process to arrive
            let nextArrival = Infinity;
            let nextProcess = null;
            
            for (let i = 0; i < n; i++) {
                if (processesClone[i].rt > 0 && processesClone[i].at < nextArrival && processesClone[i].at > currentTime) {
                    nextArrival = processesClone[i].at;
                    nextProcess = processesClone[i];
                }
            }
            
            currentTime = nextArrival;
            queue.push(nextProcess);
        }
        
        // Get the next process from the queue
        let p = queue.shift();
        
        // Calculate execution time (either full quantum or remaining time)
        let executionTime = Math.min(timeQuantum, p.rt);
        
        // Add to Gantt chart
        ganttData.push({
            pid: p.pid,
            startTime: currentTime,
            endTime: currentTime + executionTime,
            color: p.color
        });
        
        // Update current time and remaining time
        currentTime += executionTime;
        p.rt -= executionTime;
        
        // Check if process is completed
        if (p.rt <= 0) {
            p.ct = currentTime;
            p.tat = p.ct - p.at;
            p.wt = p.tat - p.bt;
            completed++;
        } else {
            // Put back in queue if not complete, but first check for new arrivals
            // Add all processes that have arrived while this process was executing
            for (let i = 0; i < n; i++) {
                let proc = processesClone[i];
                if (proc.at <= currentTime && proc.rt > 0 && !queue.includes(proc) && proc !== p) {
                    queue.push(proc);
                }
            }
            
            // Put the current process back in the queue
            queue.push(p);
        }
    }
    
    // Merge adjacent blocks with the same process ID
    ganttData = mergeAdjacentBlocks(ganttData);
    
    updateResults(processesClone);
    return ganttData;
}

// Merge adjacent Gantt chart blocks with the same process ID
function mergeAdjacentBlocks(ganttData) {
    if (ganttData.length <= 1) return ganttData;
    
    let merged = [];
    let current = ganttData[0];
    
    for (let i = 1; i < ganttData.length; i++) {
        if (ganttData[i].pid === current.pid) {
            // Extend the current block
            current.endTime = ganttData[i].endTime;
        } else {
            // Add the current block to the merged list and start a new one
            merged.push(current);
            current = ganttData[i];
        }
    }
    
    // Add the last block
    merged.push(current);
    
    return merged;
}

// Animate the Gantt chart
function animateGanttChart(ganttData) {
    const ganttChart = document.getElementById('gantt-chart');
    const timeline = document.getElementById('timeline');
    
    // Clear existing content
    ganttChart.innerHTML = '';
    timeline.innerHTML = '';
    
    // Find the maximum end time for scaling
    const maxTime = Math.max(...ganttData.map(d => d.endTime));
    
    // Create timeline markers
    for (let t = 0; t <= maxTime; t += 2) {
        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.left = `${(t / maxTime) * 100}%`;
        
        const label = document.createElement('div');
        label.className = 'timeline-label';
        label.style.left = `${(t / maxTime) * 100}%`;
        label.textContent = t;
        
        timeline.appendChild(marker);
        timeline.appendChild(label);
    }
    
    // Track the index of the current block being animated
    let currentIndex = 0;
    
    // Determine animation speed (lower values = faster animation)
    const speed = 1100 - (animationSpeed * 100); // Convert 1-10 scale to ms delay
    
    // Function to animate each block in sequence
    function animateBlock() {
        if (currentIndex >= ganttData.length) {
            isSimulationRunning = false;
            document.getElementById('start-btn').innerHTML = '<i class="fas fa-play"></i> Start Simulation';
            return;
        }
        
        const data = ganttData[currentIndex];
        const width = ((data.endTime - data.startTime) / maxTime) * 100;
        const left = (data.startTime / maxTime) * 100;
        
        const block = document.createElement('div');
        block.className = 'gantt-block process-running';
        block.style.width = `${width}%`;
        block.style.left = `${left}%`;
        block.style.top = '45px';
        block.style.backgroundColor = data.color;
        block.textContent = data.pid;
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'gantt-tooltip';
        tooltip.innerHTML = `
            <strong>${data.pid}</strong><br>
            Start: ${data.startTime}<br>
            End: ${data.endTime}<br>
            Duration: ${data.endTime - data.startTime}
        `;
        
        block.appendChild(tooltip);
        ganttChart.appendChild(block);
        
        currentIndex++;
        simulationInterval = setTimeout(animateBlock, speed);
    }
    
    // Start the animation
    animateBlock();
}

// Update results table and metrics
function updateResults(processesData) {
    const resultsBody = document.getElementById('results-table-body');
    const avgMetricsDiv = document.getElementById('avg-metrics');
    
    // Clear existing results
    resultsBody.innerHTML = '';
    
    // Calculate averages
    let totalTAT = 0;
    let totalWT = 0;
    let totalCT = 0;
    
    // Update results table
    processesData.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="process-badge" style="background-color: ${p.color}">${p.pid}</span></td>
            <td>${p.ct.toFixed(2)}</td>
            <td>${p.tat.toFixed(2)}</td>
            <td>${p.wt.toFixed(2)}</td>
        `;
        resultsBody.appendChild(row);
        
        // Add to totals
        totalTAT += p.tat;
        totalWT += p.wt;
        totalCT += p.ct;
    });
    
    // Calculate averages
    const avgTAT = totalTAT / processesData.length;
    const avgWT = totalWT / processesData.length;
    const avgCT = totalCT / processesData.length;
    
    // Update average metrics
    avgMetricsDiv.innerHTML = `
        <div class="metric-item">
            <span>Average Completion Time:</span>
            <span class="metric-value">${avgCT.toFixed(2)}</span>
        </div>
        <div class="metric-item">
            <span>Average Turnaround Time:</span>
            <span class="metric-value">${avgTAT.toFixed(2)}</span>
        </div>
        <div class="metric-item">
            <span>Average Waiting Time:</span>
            <span class="metric-value">${avgWT.toFixed(2)}</span>
        </div>
    `;
}

// Helper function to get a random color
function getRandomColor() {
    const colors = [
        '#4a6fa5', '#ff6b6b', '#4ecdc4', '#ff9f1c', '#6a0572', 
        '#6f42c1', '#20bf55', '#fb8b24', '#3a86ff', '#ef476f',
        '#118ab2', '#06d6a0', '#ffd166', '#073b4c', '#7209b7'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
