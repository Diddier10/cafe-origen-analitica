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
module.exports = {
    valorVenta,
    totalVendido,
    unidadesVendidas,
    ventaMayor,
    ticketPromedio,
    ventasPorCiudad
};