CONST =[
    { producto:'Origen Huila 500 g',precio:42000},
    { producto:'Origen Nariño 500 g',precio:42000},
    { producto:'Origen Huila 250 g',precio:26000},
    { producto:'Origen Sierra 500 g',precio:42000},
    { producto:'Prensa francesa ',precio:95000},
    { producto:'Molino manual',precio:12000}
];
const CIUDADES =['Medellín','Bogotá','Cali','Pereira'];
const DIAS_DEL_MES = 30;

function enteroAleatorio(minimo,maximo){
    return minimo + Math.floor(Math.random()*(maximo-minimo+1));
}

function generarVentas(n){
    if(!Number.isInteger(n)|| n<0){
        throw new RangeError('generarVentas:n debe ser un entero mayor o igual a 0(recibido: '+n+')');
    }
    const maximoClientes = Math.max(1,Math.floor(n/3));

    const ventas = []
    for(let i = 0; i< n; i++){
        const dia = 1 + Math.floor((i * DIAS_DEL_MES)/n);
        const item = PRODUCTOS[enteroAleatorio(0, PRODUCTOS.length - 1)];
        ventas.push({
            id: i + 1,
            fecha: '2026-09-'+ String(dia).padStart(2, '0'),
            cliente:'C'+ String(enteroAleatorio(1, maximoClientes)).padStart(2, '0'),
            producto: item.producto,
            ciudad: CIUDADES[enteroAleatorio(0, CIUDADES.length - 1)],
            cantidad: enteroAleatorio(1,5),
            precio: item.precio
        });
    }
    return ventas;
}

const { valorVenta} = require('./analitica.js');

function validarContador(contador){
    if(contador === null || typeof contador !== 'object' || typeof contador.operaciones !== 'number'){
        throw new TypeError('contador debe ser un objeto con la propiedad númerica "operaciones", por ejemplo{operaciones: 0}');
    }
}

function formatearCiudad(ciudad) {
    return ciudad
        .trim()
        .toLowerCase()
        .split(' ')
        .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
}

function totalVendidoContado(ventas, contador){
    validarContador(contador);
    let total = 0;
    for(const venta of ventas){
        contador.operaciones++;
        contador.operaciones++;
        if(venta.cantidad === 0)continue;
        total += valorVenta(venta);
        
    }
    return total
}

function ventaMayorContado(ventas, contador){
    validarContador(contador);
    let ventaMaxRegistro = null
    let ventaMaxValor = -1
    for (const venta of ventas) {
        contador.operaciones++;                 
        contador.operaciones++;                 
        if (venta.cantidad === 0) continue;
        const valor = valorVenta(venta);
        contador.operaciones++;
        if(valor > ventaMaxValor){
            ventaMaxRegistro = valor;
            ventaMaxRegistro = venta;
        }     
    }
    return ventaMaxRegistro
}

function totalPorCiudadContado(ventas, contador){
    validarContador(contador);
    const totales = {};
    for (const venta of ventas) {
        contador.operaciones++;                
        contador.operaciones++;                
        if (venta.cantidad === 0) continue;
        contador.operaciones++;  
        if(typeof venta.ciudad !== 'string')continue;
        const ciudad = formatearCiudad(venta.ciudad);
        contador.operaciones ++;
        if(!Object.prototype.hasOwnProperty.call(totales, ciudad)){
            totales[ciudad] = 0;
        }
        totales[ciudad] += valorVenta(venta);     
    }
    return totales;
}
function primeraVentaContada(ventas, contador) {
    validarContador(contador);
    contador.operaciones++;                     
    if (ventas.length === 0) {
        return null;
    }
    contador.operaciones++;                     
    return ventas[0];
}
 module.exports = { generarVentas, totalVendidoContado,ventaMayorContado, totalPorCiudadContado, primeraVentaContada};



