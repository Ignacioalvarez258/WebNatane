
document.addEventListener('DOMContentLoaded', function() {
   CargarProgram();
   CargarOS();  
   //verificarRolUsuario();
   cargarmeses();
   cargaraños();
   setActiveLink()
   mostrarEnlacesAdmin()
   mostrarEnlacesSuper()
  });

  
  const token = sessionStorage.getItem('jwtToken')
  function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
  }
  
  
function verificarRolUsuario() {
    const token = sessionStorage.getItem('jwtToken');
    if (token == null){
      window.location.href = 'index.html'
    }
    if (token) {
        try {
            const tokenData = parseJwt(token);
            const userRole = tokenData.Rol;
            if (userRole == 'Admin' ) {                
                mostrarEnlacesAdmin();
                mostrarEnlacesSuper();               
            }else if(userRole == 'Supervisor'){
              mostrarEnlacesSuper();
            }

        } catch (error) {
            
            console.error('Error al decodificar el token:', error);
        }
    }
  }
  
  function mostrarEnlacesAdmin() {
  const enlacesRestringidos = document.querySelectorAll('.admin-link');
  
  enlacesRestringidos.forEach(enlace => {
      enlace.style.display = "inline-block";
  });
  }
  function mostrarEnlacesSuper() {
    const enlacesRestringidos = document.querySelectorAll('.super-link');
    
    enlacesRestringidos.forEach(enlace => {
        enlace.style.display = "inline-block";
    });
    }
 
 function cargarmeses(){
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Obtener el elemento select
const selectMes = document.getElementById('DespMes');

// Llenar el select con los meses
meses.forEach((mes, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = mes;
    selectMes.appendChild(option);
 });
 }
 function cargaraños(){
  const años = [
    2024,2025,2026
];

// Obtener el elemento select
const selectaño = document.getElementById('DespYear');

// Llenar el select con los meses
años.forEach((años, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = años;
    selectaño.appendChild(option);
 });
 }
document.getElementById('DespOs').addEventListener('change', function() {
    CargarPlan();
  });
  document.getElementById('btnCargarDatos').addEventListener('click', cargarDatos);
  
  function cargarDatos() {
    var idPrograma = document.getElementById('DespPrograma').value;
    var codigoOS = document.getElementById('DespOs').value;
    var planId = document.getElementById('DespPlan').value;
    var total = document.getElementById('total');
    var coseguroAPagar = document.getElementById('coseguro');
    var importe_minimo = document.getElementById('importeMinimo');
    var importe_particular = document.getElementById('montoParticular');
    var importeAPagarPaciente = document.getElementById('importeAPagar');
    var excepciones = document.getElementById('excepciones');
    var mes=  document.getElementById('DespMes').value;
    var año=  document.getElementById('DespYear');
    var opcionSeleccionadaAño = año.options[año.selectedIndex];
    var textoSeleccionadoAño = opcionSeleccionadaAño.textContent;
    año= textoSeleccionadoAño;
  
  
    var url = 'https://localhost:7174/api/ValorResult/' + idPrograma + '/' + codigoOS + '/' + planId;
    var url2 = 'https://localhost:7174/api/MontoMinimoPrograma/'+ idPrograma + '/' + mes + '/' + año;
    var url3 = 'https://localhost:7174/api/Excepciones/byOs/' + codigoOS;
    var url4 = 'https://localhost:7174/api/IntereseTarjetas';
    
    // Realizar todas las llamadas fetch necesarias
    Promise.all([
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()),
        
        fetch(url2, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()),

        fetch(url3, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
          if (response.ok) {
              return response.json();
          } else {
              return ""; 
          }
      }),
        fetch(url4, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
    ])
    .then(([data, data2, data3, data4]) => {
        // Actualizar la tabla con los datos de url
        const tablaBody = document.querySelector('#tablaDatos tbody');
        tablaBody.innerHTML = '';
        let suma = 0;
        let coseguro = 0;
        let particular = 0;
        data.forEach((item, index) => {
            suma += item.totalConvenio;
            coseguro += item.coseguro;
            particular += item.valorParticular;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.codigoPractica}</td>
                <td>${item.nombrePractica}</td>
                <td>${item.totalConvenio}</td>
                <td>${item.otroTipoDeAutorizacion}</td>
                <td>${item.derivacion}</td>
                <td>${item.coseguro}</td>
                <td>${item.valorParticular}</td>
                <td>${item.excepcion}</td>
            `;

            if (index === 0) {
              const infoAdicionalCell = document.createElement('td');
              infoAdicionalCell.rowSpan = data.length;
              infoAdicionalCell.textContent = data3.excepcion; // Usar el dato de url3
              row.appendChild(infoAdicionalCell);
          }
          tablaBody.appendChild(row);
        });
        coseguroAPagar.value = coseguro;
        total.value = suma;
        importe_particular.value = particular;

        // Actualizar campos con datos de url2
        if (data2) {
            if (codigoOS == 206) {
                importe_minimo.value = data2.importe_minimo_apross;
                importeAPagarPaciente.value = (parseFloat(coseguroAPagar.value) + parseFloat(importe_minimo.value)).toFixed(2);
            } else {
                importe_minimo.value = data2.importe_minimo;
                if (parseFloat(importe_minimo.value) >= parseFloat(total.value)) {
                    importeAPagarPaciente.value = (parseFloat(importe_minimo.value) - (parseFloat(coseguroAPagar.value) + parseFloat(total.value))).toFixed(2);
                } else {
                    importeAPagarPaciente.value = 0;
                }
            }
        }

        // Actualizar la tabla de intereses con datos de url4
        const tablaInteresesBody = document.querySelector('#tablaintereses tbody');
        tablaInteresesBody.innerHTML = '';  // Asegúrate de limpiar la tabla antes de agregar nuevas filas

        const importeAPagar = parseFloat(importeAPagarPaciente.value);

        if (isNaN(importeAPagar)) {
            console.error('El valor de importeAPagar no es un número válido');
            return;
        }

        data4.forEach(item => {
            const interes = parseFloat(item.interes);
            const cuotas = parseInt(item.cuotas);
          
            const importeTotalAPagar = (importeAPagar * (interes + 1)) / cuotas;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.tarjeta}</td>
                <td>${item.cuotas}</td>
                <td>${(item.interes * 100).toFixed(0)}%</td>
                <td>$ ${importeTotalAPagar.toFixed(2)}</td>
            `;
            tablaInteresesBody.appendChild(row);
        });

        excepciones.value = data3.excepcion;

    })
    .catch(error => console.error('Error al obtener los datos:', error));
}




function CargarProgram(){

    fetch('https://localhost:7174/api/Programa',{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
     
    })
    .then(response => response.json())
    .then(data => {
      const desplegable = document.getElementById('DespPrograma');
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id; 
        option.textContent = item.nombre_programa;
        desplegable.appendChild(option); 
      });
    })
    .catch(error => console.error('Error al obtener los datos:', error));
  
}
function CargarOS(){

    fetch('https://localhost:7174/OS',{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
     
    })
    .then(response => response.json())
    .then(data => {
      const desplegable = document.getElementById('DespOs');
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.codigoOs; 
        option.textContent = item.os; 
        desplegable.appendChild(option); 
      });
    })
    .catch(error => console.error('Error al obtener los datos:', error));
}
function CargarPlan(){
  var codigoOS = document.getElementById('DespOs').value;
  var url = 'https://localhost:7174/api/PlanOS/' + codigoOS
    fetch(url,{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
     
    })
    .then(response => response.json())
    .then(data => {
      const desplegable = document.getElementById('DespPlan');
      desplegable.innerHTML = '';
      const opcionEnBlanco = document.createElement('option');
      opcionEnBlanco.value = 'Selecciona un Plan'; 
      opcionEnBlanco.textContent = 'Selecciona un Plan'; 
      desplegable.appendChild(opcionEnBlanco);
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.planId; 
        option.textContent = item.plan; 
        desplegable.appendChild(option); 
      });
    })
    .catch(error => console.error('Error al obtener los datos:', error));
  
}
  ///Logout
  document.getElementById('logout').addEventListener('click', function() {
     
    sessionStorage.clear();
    localStorage.clear();

    window.location.href = 'index.html';
});
//// 
function setActiveLink() {
  const divs = document.querySelectorAll('.divnav');
  const currentUrl = window.location.href;
  divs.forEach(div => {
      const link = div.querySelector('a');
      if (link && link.href === currentUrl) {
          div.classList.add('active');
      }
  });
}
