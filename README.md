# CPU Scheduler Visualizer

## Overview
CPU Scheduler Visualizer is an interactive web-based tool designed to help students, educators, and professionals understand CPU scheduling algorithms through dynamic visualization. This project transforms complex operating system concepts into an engaging, visual experience that makes learning intuitive and enjoyable.

## Features

- **Interactive Visualization**: Watch CPU scheduling algorithms run in real-time with animated Gantt charts
- **Multiple Algorithms**: Visualize and compare four key scheduling algorithms:
  - First-Come, First-Served (FCFS)
  - Shortest Job First (SJF)
  - Shortest Remaining Time First (SRTF)
  - Round Robin (RR)
- **Custom Process Creation**: Add and remove processes with specific arrival and burst times
- **Adjustable Simulation Speed**: Control how fast the visualization runs
- **Real-time Metrics**: View essential performance metrics including:
  - Average Completion Time
  - Average Turnaround Time
  - Average Waiting Time
  - Per-process detailed statistics
- **Educational Content**: Built-in explanations for all algorithms and metrics
- **Responsive Design**: Works seamlessly on desktops, tablets, and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing

## How to Use

1. **Open the application** by launching `index.html` in any modern web browser
2. **Select an algorithm** using the buttons on the left panel
3. **Add processes** by specifying arrival time and burst time, then clicking "Add Process"
4. **Adjust time quantum** for Round Robin algorithm (when selected)
5. **Start the simulation** by clicking the "Start Simulation" button
6. **Control simulation speed** using the slider above the Gantt chart
7. **View results** in the table below the visualization
8. **Learn more** about scheduling concepts in the accordion sections at the bottom

## Algorithms Explained

### First-Come, First-Served (FCFS)
The simplest scheduling algorithm where processes are executed in the order they arrive in the ready queue. While easy to implement, it can lead to the "convoy effect" where short processes wait behind long ones.

### Shortest Job First (SJF)
A non-preemptive algorithm that selects the process with the smallest burst time to execute next. It's optimal for minimizing average waiting time but requires prior knowledge of burst times.

### Shortest Remaining Time First (SRTF)
A preemptive version of SJF where the process with the smallest remaining time is executed. If a new process arrives with a smaller burst time, the current process is preempted.

### Round Robin (RR)
An algorithm designed for time-sharing systems. Each process is assigned a fixed time slice (quantum) and, after execution for that time, is moved to the back of the ready queue allowing another process to execute.

## Performance Metrics

- **Completion Time (CT)**: The time at which a process completes execution
- **Turnaround Time (TAT)**: Total time from submission to completion (CT - AT)
- **Waiting Time (WT)**: Time a process spends waiting in the ready queue (TAT - BT)

## Requirements

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No server or special software installation required

## Suggested Project Names

While "CPU Scheduler Visualizer" is the current name, here are some other options:

- ScheduleViz
- CPUSim Pro
- VisualCPU Scheduler
- ProcessFlow Visualizer
- AlgoScheduler

## Educational Value

This visualization tool is perfect for:
- Operating Systems courses
- Computer Science education
- Self-learning CPU scheduling concepts
- Teaching complex OS concepts visually

## Get Started

Open `index.html` in your web browser to begin exploring CPU scheduling algorithms interactively!
