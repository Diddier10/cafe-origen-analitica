const assert = require('assert');
const analitica = require('./analitica.js');
const { ventas } = require('./datos.js');

const pares = [
    {
        nombre: 'totalVendido',
        ciclo: () => analitica.totalVendido(ventas),
        metodos: () => analitica.totalVendidoM(ventas)
    },
    {
        nombre: 'unidadesVendidas',
        ciclo: () => analitica.unidadesVendidas(ventas),
        metodos: () => analitica.unidadesVendidasM(ventas)
    }
];


const ciudades = ['Medellín', 'Bogotá', 'Cali', 'Pereira', '  MEDELLÍN  '];
for (const ciudad of ciudades) {
    pares.push({
        nombre: 'ventasPorCiudad(' + JSON.stringify(ciudad) + ')',
        ciclo: () => analitica.ventasPorCiudad(ventas, ciudad),
        metodos: () => analitica.ventasPorCiudadM(ventas, ciudad)
    });
}

function ejecutar(funcion) {
    try {
        return { valor: funcion() };
    } catch (error) {
        return { error: error.message };
    }
}

function sonIguales(a, b) {
    try {
        assert.deepStrictEqual(a, b);
        return true;
    } catch (error) {
        return false;
    }
}

function mostrar(resultado) {
    if (resultado.error !== undefined) {
        return 'ERROR (' + resultado.error + ')';
    }
    return JSON.stringify(resultado.valor);
}

console.log('====================================');
console.log('   VERIFICACIÓN: CICLO vs MÉTODOS   ');
console.log('====================================');
console.log('Datos: ' + ventas.length + ' ventas de datos.js');
console.log('');

let iguales = 0;
let diferentes = 0;

for (const par of pares) {
    const resultadoCiclo = ejecutar(par.ciclo);
    const resultadoMetodos = ejecutar(par.metodos);

    const hayError = resultadoCiclo.error !== undefined || resultadoMetodos.error !== undefined;
    const coinciden = !hayError && sonIguales(resultadoCiclo.valor, resultadoMetodos.valor);

    const etiqueta = coinciden ? 'OK        ' : 'DIFERENTE ';
    console.log(
        etiqueta + par.nombre.padEnd(34) +
        ' ciclo: ' + mostrar(resultadoCiclo) +
        ' | métodos: ' + mostrar(resultadoMetodos)
    );

    if (coinciden) {
        iguales++;
    } else {
        diferentes++;
    }
}

console.log('');
console.log('Resultado: ' + iguales + ' OK, ' + diferentes + ' DIFERENTE, de ' + pares.length + ' pares');

if (diferentes > 0) {
    process.exitCode = 1;
}