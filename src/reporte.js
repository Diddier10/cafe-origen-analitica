const { ventas } = require('./datos.js');
const {
    valorVenta,
    totalVendido,
    unidadesVendidas,
    ventaMayor,
    ticketPromedio,
    totalPorCiudad,
    unidadesPorProducto,
    topProductosPorValor,
    ventasDelDia
} = require('./analitica.js');

function pesos(numero){
    return '$' + Math.round(numero).toLocaleString('es-Co')
}
const fecha = process.argv[2];

const ventasReporte = fecha
    ? ventasDelDia(ventas, fecha)
    : ventas;

if (fecha && ventasReporte.length === 0) {
    console.log(`No hay ventas registradas para el día ${fecha}.`);
}

console.log('CAFE-ORIGEN - REPORTE DE VENTAS')
console.log('================================')

console.log('RESUMEN GENERAL')
console.log(`Total vendido: ${pesos(totalVendido(ventasReporte))}`);
console.log(`Unidades vendidas: ${unidadesVendidas(ventasReporte)}`);
console.log(`Ticket promedio por compra: ${pesos(ticketPromedio(ventasReporte))}`);

const mayor= ventaMayor(ventas);
if (mayor === null) {
    console.log('Venta más grande: sin ventas registradas');
} else {
    console.log(`Venta más grande: ${pesos(valorVenta(mayor))} (ID ${mayor.id}, ${mayor.producto}, ${mayor.ciudad})`);
}

console.log('\nVENTAS POR CIUDAD');

const ciudades = totalPorCiudad(ventasReporte);

if (Object.keys(ciudades).length === 0) {
    console.log('Sin ventas registradas.');
} else {
    for (const ciudad of Object.keys(ciudades)) {
        console.log(`${ciudad}: ${pesos(ciudades[ciudad])}`);
    }
}

console.log('\nUNIDADES POR PRODUCTO');

const unidades = unidadesPorProducto(ventasReporte);

if (Object.keys(unidades).length === 0) {
    console.log('Sin ventas registradas.');
} else {
    for (const producto of Object.keys(unidades)) {
        console.log(`${producto}: ${unidades[producto]}`);
    }
}

console.log('\nTOP 3 DE PRODUCTOS POR VALOR');

const top = topProductosPorValor(ventasReporte, 3);

if (top.length === 0) {
    console.log('Sin ventas registradas.');
} else {
    for (let i = 0; i < top.length; i++) {
        console.log(`${i + 1}. ${top[i].producto}: ${pesos(top[i].valor)}`);
    }
}
