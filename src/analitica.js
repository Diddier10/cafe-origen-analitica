const { ventas } = require('./datos.js');

function valorVenta(venta) {
    return venta.cantidad * venta.precio;
}

function totalVendido(ventas) {
    let total = 0;
    for (const venta of ventas) {
        if (venta.cantidad ===0 )continue;
        total += valorVenta(venta);
    }
    return total;
}

function unidadesVendidas(ventas) {
    let totalUnidades = 0;
    for (const venta of ventas) {
        if (venta.cantidad ===0 )continue;
        totalUnidades += venta.cantidad;
    }
    return totalUnidades;
}

function ventaMayor(ventas) {
    let ventaMaxRegistro = null;
    let ventaMaxValor = -1;
    for (const venta of ventas) {
        if (venta.cantidad ===0 )continue;
        const valor = valorVenta(venta);
        if (valor > ventaMaxValor) {
            ventaMaxValor = valor;
            ventaMaxRegistro = venta;
        }
    }
    return ventaMaxRegistro;
}


function ticketPromedio(ventas) {
    let contadorValidas = 0;
    for (const venta of ventas) {
        if (venta.cantidad !== 0){
            contadorValidas++;
        }  
    }
    if(contadorValidas === 0) {
        return 0;
    }
    const total = totalVendido(ventas);
    return total / contadorValidas;
}

function ventasPorCiudad(ventas, ciudad) {
    if (typeof ciudad !== 'string') {
        return 0;
    }
    const ciudadBuscada = ciudad.trim().toLowerCase();
    let total = 0;
    for (const venta of ventas) {
        if (venta.cantidad === 0) continue;
        if (typeof venta.ciudad !== 'string') continue;
        const ciudadVenta = venta.ciudad.trim().toLowerCase();
        if (ciudadVenta === ciudadBuscada) {
            total += valorVenta(venta);
        }
    }
    return total;
}
function totalVendidoM(ventas){
    return ventas
        .filter((venta)=>venta.cantidad !==0)
        . map((venta)=> valorVenta(venta))
        .reduce((acumulado,valor)=> acumulado + valor, 0);
}
function unidadesVendidasM(ventas){
    return ventas
        .filter((venta)=>venta.cantidad !==0)
        .map((venta) =>venta.cantidad)
        .reduce((acumulado,cantidad) =>acumulado+cantidad,0);
}
function ventasPorCiudadM(ventas,ciudad){
    if(typeof ciudad !== 'string'){
        return 0
    }
    const ciudadBuscada = ciudad.trim().toLowerCase();
    return ventas
        .filter((venta)=>venta.cantidad !== 0 && typeof venta.ciudad ==='string' && venta.ciudad.trim().toLowerCase()===ciudadBuscada)
        .map((venta)=> valorVenta(venta))
        .reduce((acumulado,valor)=> acumulado + valor,0)
}
function totalporCiudad(ventas){
    const totales={};
    for(const venta of ventas) {
        if(venta.cantidad === 0) continue;
        if(typeof venta.ciudad !== 'string')continue;
        const ciudad = venta.ciudad.trim().toLowerCase();
        if (! Object.prototype.hasOwnProperty.call(totales,ciudad)){
            totales[ciudad]=0; 
        }
        totales[ciudad]+=valorVenta(venta);
    }
    return totales
}
function unidadesPorProducto(ventas){
    const unidades = {};
    for(const venta of ventas){
        if(venta.cantidad === 0)continue;
        if(typeof venta.producto !== 'string')continue;
        const producto = venta.producto.trim();
        if(!Object.prototype.hasOwnProperty.call(unidades,producto)){
            unidades[producto]=0;
        }
        unidades[producto]+= venta.cantidad;
    }
    return unidades;
}

function topProductosPorValor(valor,k){
    if(!Number.isInteger(k) || k < 0){
        return [];
    }
    const valores ={};
    for(const venta of ventas){
        if(venta.cantidad === 0) continue;
        if(venta.cantidad !=='string')continue;
        const producto = venta.producto.trim();
        if(!Object.prototype.hasOwnProperty.call(valores, producto)){
            valores[producto]=0;
        }
        valores[producto] += valorVenta(venta);
    }
    const ranking = [];
    for (const producto of Object.keys(valores)) {
        ranking.push({ producto: producto, valor: valores[producto] });
    }
    ranking.sort((a, b) => {
        if (b.valor !== a.valor) return b.valor - a.valor;
        if (a.producto < b.producto) return -1;
        if (a.producto > b.producto) return 1;
        return 0;
    });
    return ranking.slice(0, k);
}
module.exports = {
    valorVenta,
    totalVendido,
    unidadesVendidas,
    ventaMayor,
    ticketPromedio,
    ventasPorCiudad,
    totalVendidoM,
    unidadesVendidasM,
    ventasPorCiudadM
};