const canvas = document.getElementById("pendulumCanvas");
const ctx = canvas.getContext("2d");

const initTheta1 = document.getElementById("initTheta1");
const initTheta2 = document.getElementById("initTheta2");
const playButton = document.getElementById("playButton");
const resetButton = document.getElementById("resetButton");

const length1Slider = document.getElementById("length1Slider");
const length2Slider = document.getElementById("length2Slider");
const massSlider = document.getElementById("massSlider");

const length1Text = document.getElementById("length1Text");
const length2Text = document.getElementById("length2Text");
const massText = document.getElementById("massText");

const KECtx = document.getElementById("KEGraph").getContext("2d");
const PECtx = document.getElementById("PEGraph").getContext("2d");
const TotalECtx = document.getElementById("TotalEGraph").getContext("2d");

const g = 9.8;
let length1;
let length2;
const mass1 = 0.01;
let mass2;
const dt = 0.01;
const scale = 100;

let theta1 = Math.PI/4;
let theta2 = Math.PI/4;
let omega1 = 0;
let omega2 = 0;
let alpha1;
let alpha2;
let KE;
let PE;

let play = false;
let timeStepCounter = 0;

const pivotx = canvas.width/2;
const pivoty = canvas.height/4;

const KEChart = new Chart(KECtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Kinetic Energy (J)',
            data: [],
            borderColor: '#ff4343',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: { display: false },
            y: {}
        }
    }
});

const PEChart = new Chart(PECtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Gravitational Potential Energy (J)',
            data: [],
            borderColor: '#ff4343',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: { display: false },
            y: {}
        }
    }
});

const TotalEChart = new Chart(TotalECtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Total Energy (J)',
            data: [],
            borderColor: '#ff4343',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: { 
                display: false,
                type: "linear",
                min: 0
            },
            y: { min: 0}
        }
    }
});

function loop(){
    length1 = parseFloat(length1Slider.value);
    length2 = parseFloat(length2Slider.value);
    mass2 = parseFloat(massSlider.value);

    length1Text.innerText = "Length 1: " + length1 + " m";
    length2Text.innerText = "Length 2: " + length2 + " m";
    massText.innerText = "Mass: " + mass2 + " kg";

    if (play) {
        calcAcceleration();
        omega1 = omega1 + alpha1 * dt;
        omega2 = omega2 + alpha2 * dt;
        theta1 = theta1 + omega1 * dt;
        theta2 = theta2 + omega2 * dt;

        const vx = omega1*length1*Math.cos(theta1)+omega2*length2*Math.cos(theta2);
        const vy = omega1*length1*Math.sin(theta1)+omega2*length2*Math.sin(theta2);
        KE = 0.5*mass2*(vx*vx+vy*vy);

        PE = mass2*g*(length1*(1-Math.cos(theta1))+length2*(1-Math.cos(theta2)));

        timeStepCounter++;
        KEChart.data.labels.push(timeStepCounter);
        KEChart.data.datasets[0].data.push(KE);

        if (KEChart.data.labels.length > 200) {
            KEChart.data.labels.shift();
            KEChart.data.datasets[0].data.shift();
        }
        KEChart.update();

        PEChart.data.labels.push(timeStepCounter);
        PEChart.data.datasets[0].data.push(PE);

        if (PEChart.data.labels.length > 200) {
            PEChart.data.labels.shift();
            PEChart.data.datasets[0].data.shift();
        }
        PEChart.update();

        TotalEChart.data.datasets[0].data.push({
            x: timeStepCounter,
            y: KE + PE
        });
        TotalEChart.update();
    }
    
    const x = Math.floor(100*(length1*Math.sin(theta1)+length2*Math.sin(theta2)))/100;
    const y = Math.floor(100*(length1*(1-Math.cos(theta1))+length2*(1-Math.cos(theta2))))/100;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    const p1x = pivotx+length1*scale*Math.sin(theta1);
    const p1y = pivoty+length1*scale*Math.cos(theta1);

    const p2x = p1x+length2*scale*Math.sin(theta2);
    const p2y = p1y+length2*scale*Math.cos(theta2);

    ctx.beginPath();
    ctx.fillStyle = "#ff0000";
    ctx.textAlign = "center";
    ctx.font = "20px Calibri";
    ctx.fillText("Pivot", pivotx,pivoty-10);
    ctx.arc(pivotx,pivoty,5,0,2*Math.PI);
    ctx.fill();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(pivotx,pivoty);
    ctx.lineTo(p1x,p1y);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "#0000ff";
    ctx.arc(p1x,p1y,5,0,2*Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(p1x,p1y);
    ctx.lineTo(p2x,p2y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.fillText("("+x+","+y+")",p2x,p2y+50);
    ctx.fillStyle = "#222222";
    ctx.arc(p2x,p2y,mass2*2,0,2*Math.PI);
    ctx.fill();

    requestAnimationFrame(loop);
}

function calcAcceleration(){
    const A = (mass1+mass2)*length1*length1;
    const B = mass2*length1*length2*Math.cos(theta1-theta2);
    const C = B;
    const D = mass2*length2*length2;
    
    const X = -1*(mass1+mass2)*g*length1*Math.sin(theta1)-mass2*length1*length2*omega2*omega2*Math.sin(theta1-theta2);
    const Y = mass2*length1*length2*omega1*omega1*Math.sin(theta1-theta2)-mass2*g*length2*Math.sin(theta2);

    const det = A*D-B*C;

    alpha1 = (D*X-B*Y)/det;
    alpha2 = (-1*C*X+A*Y)/det;
}

playButton.addEventListener("click",function(){
    if (play){
        play = false;
        playButton.innerText = "Play";
    }
    else{
        play = true;
        playButton.innerText = "Pause";
    }
});

function reset(){
    let degrees = parseFloat(initTheta1.value);
    if (!isNaN(degrees)) {
        theta1 = degrees * (Math.PI / 180);
    }

    degrees = parseFloat(initTheta2.value);
    if (!isNaN(degrees)) {
        theta2 = degrees * (Math.PI / 180);
    }
    
    omega1 = 0;
    omega2 = 0;
    timeStepCounter = 0;

    [KEChart, PEChart, TotalEChart].forEach(chart => {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.update();
    });
}

resetButton.addEventListener("click", function(){
    reset();
});

initTheta1.addEventListener("input", function() {
    reset();
});

initTheta2.addEventListener("input", function() {
    reset();
});

loop();
