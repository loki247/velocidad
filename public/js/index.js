let modalMensaje = document.getElementById("modal_mensaje");

window.onclick = function(event) {
    if (event.target == modalMensaje) {
        closeModal()
    }
}
const openModal = () => {
    document.getElementById("backdrop").style.display = "block"
    modalMensaje.style.display = "block"
    modalMensaje.classList.add("show")
}
const closeModal = () => {
    document.getElementById("backdrop").style.display = "none"
    modalMensaje.style.display = "none"
    modalMensaje.classList.remove("show")
}

let socket = io.connect("localhost:3000", {forceNew: true});
let socket2 = io.connect("localhost:8125", {forceNew: true});
let velocidades =[];
let velocidadIntervalo = [];

socket.on('data', function(data) {
    if (data.velocidad >= 50){
        document.getElementById("vel_registrada").style.color = "#F44336";
    }else if (data.velocidad < 50){
        document.getElementById("vel_registrada").style.color = "#00cc00";
    }

    document.getElementById("vel_registrada").innerHTML = data.velocidad;
    document.getElementById("hora_registrada").innerHTML = "Hora: " + data.tiempo;

    velocidades.push(data);

    console.log(velocidades);

    velocidadIntervalo = [];

    for (let i = 0; i < horas.length; i++){

        let inicio = new Date("10/10/2023 " + horas[i].split("-")[0]);
        let fin = new Date("10/10/2023 " + horas[i].split("-")[1]);

        let sumaPermitida = 0;
        let sumaVelocidadPermitida = 0;
        let sumaSuperada = 0;
        let sumaVelocidadSuperada = 0;

        for(let j = 0; j < velocidades.length; j++){
            let hora = new Date("10/10/2023 " + velocidades[j].tiempo);
            if (hora >= inicio && hora <= fin){
                if(velocidades[j].velocidad <= 50){
                    sumaPermitida ++;
                    sumaVelocidadPermitida = sumaVelocidadPermitida + velocidades[j].velocidad;
                }

                if(velocidades[j].velocidad > 50){
                    sumaSuperada ++;
                    sumaVelocidadSuperada = sumaVelocidadSuperada + velocidades[j].velocidad;
                }
            }
        }

        velocidadIntervalo.push({
            velocidad_permitida: sumaPermitida,
            promedio_permitida: (sumaVelocidadPermitida/sumaPermitida).toFixed(2),
            velocidad_superada: sumaSuperada,
            promedio_superada: (sumaVelocidadSuperada/sumaSuperada).toFixed(2),
            intervalo: horas[i]
        });
    }

    updateChartSeries(velocidadIntervalo);
});

var options = {
    series: [],
    chart: {
        type: 'bar',
        height: 350
    },
    responsive: [{
        breakpoint: 1000,
        options: {
            plotOptions: {
                bar: {
                    horizontal: true
                }
            },
            legend: {
                position: "bottom"
            }
        }
    }],
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '100%',
            endingShape: 'rounded'
        },
    },
    dataLabels: {
        enabled: false
    },
    colors: ["#00cc00", "#F44336"],
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: horas,
        labels: {
            datetimeFormatter: {
                year: 'yyyy',
                month: 'MMM \'yy',
                day: 'dd MMM',
                hour: 'HH:mm'
            }
        }
    },
    yaxis: {
        title: {
            text: 'Veces'
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val + "  Veces"
            }
        }
    }
};

var chart = new ApexCharts(document.querySelector("#grafico"), options);
chart.render();

const updateChartSeries = (velocidadIntervalo) => {
    document.getElementById("vel_superada").innerHTML = "<b>Velocidad Superada: </b>0 veces";
    document.getElementById("vel_permitida").innerHTML = "<b>Velocidad Permitida: </b>0 veces";
    document.getElementById("vel_promedio").innerHTML = "<b>Velocidad Promedio: </b>0 KM/H";

    let totalvelocidadPermitida = [];
    let totalvelocidadSuperada = [];

    let sumaVelocidad = 0;
    let velPromedio = 0;
    let velSuperada = 0;
    let velPermitida = 0;

    velocidades.forEach((data) => {
        sumaVelocidad = parseInt(sumaVelocidad) + parseInt(data.velocidad);
    });

    velPromedio = sumaVelocidad/velocidades.length;

    velocidadIntervalo.forEach((data) =>{
        totalvelocidadPermitida.push(data.velocidad_permitida);
        totalvelocidadSuperada.push(data.velocidad_superada);

        velPermitida = velPermitida + data.velocidad_permitida;
        velSuperada = velSuperada + data.velocidad_superada;
    });

    document.getElementById("vel_superada").innerHTML = "<b>Velocidad Superada: </b>" + velSuperada + " veces";
    document.getElementById("vel_permitida").innerHTML = "<b>Velocidad Permitida: </b>" + velPermitida + " veces";
    document.getElementById("vel_promedio").innerHTML = "<b>Velocidad Promedio: </b>" + velPromedio.toFixed(2) + " KM/H";

    chart.updateSeries([
        {
            name: 'Permitida',
            data: totalvelocidadPermitida
        },
        {
            name: 'Superada',
            data: totalvelocidadSuperada
        }
    ]);
}

const enviarMensaje = () => {
    let mensaje = document.getElementById('mensaje');

    let arrayMsg = [0x02, 0x0A, 0x0A, 0x0A, mensaje.value, 0x00]

    if (mensaje.value) {
        socket2.emit('mensaje', arrayMsg);
        mensaje.value = '';
    }
}