
const {
    generarVentas,
    totalVendidoContado,
    ventaMayorContado,
    totalPorCiudadContado,
    primeraVentaContada
} = require('./generador.js');

const TAMANOS = [100, 1000, 10000, 100000];

const FUNCIONES = [
    { nombre: 'totalVendido', funcion: totalVendidoContado },
    { nombre: 'ventaMayor', funcion: ventaMayorContado },
    { nombre: 'totalPorCiudad', funcion: totalPorCiudadContado },
    { nombre: 'primeraVenta', funcion: primeraVentaContada }
];

const ANCHO_N = 9;
const ANCHO_ETIQUETA = 20;
const ANCHO_COLUMNA = 16;

function conMiles(numero) {
    return numero.toLocaleString('de-DE');
}


function comoMultiplicador(razon) {
    return 'x' + razon.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function contarOperaciones(funcion, ventas) {
    const contador = { operaciones: 0 };
    funcion(ventas, contador);
    return contador.operaciones;
}

function encabezadoDeColumnas(primera, ancho) {
    let linea = primera.padStart(ancho);
    for (const item of FUNCIONES) {
        linea += item.nombre.padStart(ANCHO_COLUMNA);
    }
    return linea;
}


const mediciones = [];   
for (const n of TAMANOS) {
    const ventas = generarVentas(n);
    const operaciones = [];
    for (const item of FUNCIONES) {
        operaciones.push(contarOperaciones(item.funcion, ventas));
    }
    mediciones.push({ n: n, operaciones: operaciones });
}


console.log('OPERACIONES POR FUNCIÓN SEGÚN EL TAMAÑO DE LOS DATOS');
console.log('(operación = visita de un elemento o comparación)\n');
console.log(encabezadoDeColumnas('n', ANCHO_N));
console.log('-'.repeat(ANCHO_N + ANCHO_COLUMNA * FUNCIONES.length));
for (const medicion of mediciones) {
    let fila = conMiles(medicion.n).padStart(ANCHO_N);
    for (const operaciones of medicion.operaciones) {
        fila += conMiles(operaciones).padStart(ANCHO_COLUMNA);
    }
    console.log(fila);
}


console.log('\nCRECIMIENTO: por cuánto se multiplican las operaciones cuando n se multiplica por 10');
console.log('(x1,00 = el trabajo no crece | x10,00 = crece igual que n)\n');
console.log(encabezadoDeColumnas('n', ANCHO_ETIQUETA));
console.log('-'.repeat(ANCHO_ETIQUETA + ANCHO_COLUMNA * FUNCIONES.length));
for (let i = 1; i < mediciones.length; i++) {
    const anterior = mediciones[i - 1];
    const actual = mediciones[i];
    let fila = (conMiles(anterior.n) + ' -> ' + conMiles(actual.n)).padStart(ANCHO_ETIQUETA);
    for (let j = 0; j < FUNCIONES.length; j++) {
        fila += comoMultiplicador(actual.operaciones[j] / anterior.operaciones[j]).padStart(ANCHO_COLUMNA);
    }
    console.log(fila);
}