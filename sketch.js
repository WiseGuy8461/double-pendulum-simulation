const canvas = document.getElementById("pendulumCanvas");
const ctx = canvas.getContext("2d");

const initTheta1 = document.getElementById("initTheta1");
const initTheta2 = document.getElementById("initTheta2");
const playButton = document.getElementById("playButton");
const resetButton = document.getElementById("resetButton");

const length1Slider = document.getElementById("length1Slider");
const length2Slider = document.getElementById("length2Slider");
const mass1Slider = document.getElementById("mass1Slider");
const mass2Slider = document.getElementById("mass2Slider");

const length1Text = document.getElementById("length1Text");
const length2Text = document.getElementById("length2Text");
const mass1Text = document.getElementById("mass1Text");
const mass2Text = document.getElementById("mass2Text");

const KECtx = document.getElementById("KEGraph").getContext("2d");
const PECtx = document.getElementById("PEGraph").getContext("2d");
const TotalECtx = document.getElementById("TotalEGraph").getContext("2d");

const g = 9.8;
let length1;
let length2;
let mass1;
let mass2;
const dt = 0.01;
const scale = 100;

let theta1 = Math.PI/4;
let theta2 = Math.PI/4;
let omega1 = 0;
let omega2 = 0;
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
            x: { display: false,
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
    mass1 = parseFloat(mass1Slider.value);
    mass2 = parseFloat(mass2Slider.value);

    length1Text.innerText = "Length 1: " + length1 + " m";
    length2Text.innerText = "Length 2: " + length2 + " m";
    mass1Text.innerText = "Blue Mass: " + mass1 + " kg";
    mass2Text.innerText = "Black Mass: " + mass2 + " kg";

    if (play) {
        calcNewSystem();
        
        const v1sq = length1*length1*omega1*omega1;
        const v2sq =
            length1*length1*omega1*omega1 +
            length2*length2*omega2*omega2 +
            2*length1*length2*omega1*omega2*Math.cos(theta1-theta2);

        KE = 0.5*mass1*v1sq + 0.5*mass2*v2sq;
        PE = mass1*g*length1*(1-Math.cos(theta1)) + mass2*g*(length1*(1-Math.cos(theta1)) +length2*(1-Math.cos(theta2)));

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

    const p2x =p1x+length2*scale*Math.sin(theta2);
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
    ctx.arc(p1x,p1y,mass1,0,2*Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(p1x,p1y);
    ctx.lineTo(p2x,p2y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.fillText("("+x+","+y+")",p2x,p2y+50);
    ctx.fillStyle = "#222222";
    ctx.arc(p2x,p2y,mass2,0,2*Math.PI);
    ctx.fill();

    requestAnimationFrame(loop);
}

function calcNewSystem(){
    let theta1s = new Array(5);
    theta1s[0]=theta1;
    let theta2s = new Array(5);
    theta2s[0]=theta2;
    let omega1s = new Array(5);
    omega1s[0]=omega1;
    let omega2s = new Array(5);
    omega2s[0]=omega2;
    let alpha1s = new Array(4);
    let alpha2s = new Array(4);


    const A = (mass1+mass2)*length1*length1;
    const D = mass2*length2*length2;
    let B;
    let X;
    let Y;
    let det;
    let deltat;
    for(let i = 0;i<4;i++){ 
        B = mass2*length1*length2*Math.cos(theta1s[i]-theta2s[i]);
        X = -(mass1+mass2)*g*length1*Math.sin(theta1s[i])- mass2*length1*length2*omega2s[i]*omega2s[i]*Math.sin(theta1s[i]-theta2s[i]);

        Y = mass2*length1*length2*omega1s[i]*omega1s[i]*Math.sin(theta1s[i]-theta2s[i])- mass2*g*length2*Math.sin(theta2s[i]);

        det = A*D-B*B;

        alpha1s[i] = (D*X-B*Y)/det;
        alpha2s[i] = (A*Y-B*X)/det;

        if(i==0||i==1){
            deltat = dt/2;
        } else {
            deltat = dt;
        }

        omega1s[i+1]= omega1 + alpha1s[i]*deltat;
        omega2s[i+1]= omega2 + alpha2s[i]*deltat;
        theta1s[i+1]= theta1 + omega1s[i+1]*deltat;
        theta2s[i+1]=theta2 + omega2s[i+1]*deltat;
    }
    
    omega1 = omega1 + dt/6*(alpha1s[0]+2*alpha1s[1]+2*alpha1s[2]+alpha1s[3]);
    omega2 = omega2 + dt/6*(alpha2s[0]+2*alpha2s[1]+2*alpha2s[2]+alpha2s[3]);
    theta1 = theta1 + dt/6*(omega1s[0]+2*omega1s[1]+2*omega1s[2]+omega1s[3]);
    theta2 = theta2 + dt/6*(omega2s[0]+2*omega2s[1]+2*omega2s[2]+omega2s[3]);

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

resetButton.addEventListener("click", function(){
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
});

initTheta1.addEventListener("input", function() {
    let degrees = parseFloat(initTheta1.value);
    if (!isNaN(degrees)) {
        theta1 = degrees * (Math.PI / 180);
        omega1 = 0;
        omega2 = 0;
    }
});

initTheta2.addEventListener("input", function() {
    let degrees = parseFloat(initTheta2.value);
    if (!isNaN(degrees)) {
        theta2 = degrees * (Math.PI / 180);
        omega1 = 0;
        omega2 = 0;
    }
});

loop();
