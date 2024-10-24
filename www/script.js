const taskList = [];

// Lista de HTML con las tareas
var tareas = document.getElementById("tareas");

// Objeto tarea para ir añadiendo a la lista
class Tarea {
  constructor(id, title, done) {
    this.id = id;
    this.title = title;
    this.done = done;
  }
}

// Parámetros para controlar el deslizamiento
var inicioTactil = 0;
var finalTactil = 0;
var desplazamiento = 0;
var seleccionado = null;
// Parámetro par controlar el tiempo de pulsación
var completar = false;

// Añadimos dos event listeners para cuando se deslize sobre las tareas
tareas.addEventListener("touchstart", function (e) {
  // Registramos el inicio de la interacción táctil
  inicioTactil = e.changedTouches[0].clientX;
  // Registramos el elemento seleccionado
  seleccionado = e.target.closest("li");
  seleccionado.classList.add("seleccionado");
  completar = false;
  // Creamos un temporizador para controlar si se está usando toggle o remove
  temporizador = setTimeout(function() {
    completar = true;
    toggleDone();
    // Provocamos una vibración para indicar que se ha cambiado el estado
    if("vibrate" in navigator) {
      navigator.vibrate(200);
    }
  }, 2001);
});

tareas.addEventListener("touchend", function (e) {
  seleccionado.classList.remove("seleccionado");
  // Si completar es falso significa que no se ha ejecutado toggle y se puede ejecutar remove
  if (completar == false) {
    // Evitamos que se ejecute toggle
   clearTimeout(temporizador);
    // Registramos el final de la interacción táctil
    finalTactil = e.changedTouches[0].clientX;
    // Calculamos el desplazamiento
    desplazamiento = finalTactil - inicioTactil;
    // Si es más de 130, se borra la tarea sobre la que se deslizaba
    if (desplazamiento > 130) {
      // Clase para mostrar animación de eliminación, hace falta un temporizador para poder verla
      seleccionado.classList.add("eliminando");
      setTimeout(function() {
        remove();
      }, 300);
      // Cuando se elimina una tarea se provoca una vibración doble
      if("vibrate" in navigator) {
        navigator.vibrate([200,200,200]);
      }
  
    }
  }
});

const loadTasks = async () => {
  // Usamos un try para atrapar errores
  try {
    // Hacemos get
    var respuesta = await fetch("/tasks/get");
    // Convertimos la respuesta a JSON
    var tareas_json = await respuesta.json();

    // Metemos las tareas en el array taskList
    for (var i = 0; i < tareas_json.length; i++) {
      taskList.push(tareas_json[i]);
    }
    // Mostramos las tareas
    mostrarTareas();

  } catch (error) { // Si hay un error, lo imprimimos en consola
    console.error(error);
  }

}

function mostrarTareas() {
  // Borramos tareas actuales
  tareas.innerHTML = "";

  //Creamos todas las tareas para la lista
  for (var i = 0; i < taskList.length; i++) {
    var tarea = document.createElement("li");
    tarea.classList.add("tarea"); 
    var cadena_tarea = "Tarea " + taskList[i].id + ": " + taskList[i].title
    // Se comprueba si está completada o no para mostrarlo al final
    if (taskList[i].done) {
      cadena_tarea += " [COMPLETADA]";
    } else {
      cadena_tarea += " [PENDIENTE]";
    }
    tarea.innerHTML =  cadena_tarea;
    // Se añade la tarea a la lista
    tareas.appendChild(tarea);
  }
}

const add = () => {
  // Leemos el texto introducido
  var caja = document.getElementById("task-name");
  var titulo = caja.value;
  // Comprobamos que no esté vacío
  if (titulo == "") {
    return;
  }

  // Establecemos el id
  if (taskList.length == 0) {
    var id = 1;
  } else {
    var id = taskList[taskList.length - 1].id + 1;
  }

  // Modificamos el objeto tarea
  var tarea_nueva = new Tarea(id, titulo, false);

  // Añadimos la tarea nueva al array
  taskList.push(tarea_nueva);

  // Vaciamos el cuadro de texto
  caja.value = "";

  // Actualizamos el JSON
  actualizarJson();
  // Reseteamos lista de tareas mostradas
  mostrarTareas();
}

const remove = () => {
  if (seleccionado != null) {
    // Obtenemos el id de la tarea que va a ser eliminada
    var contenido = seleccionado.innerHTML;
    var id = contenido.split(" ")[1].slice(0, -1);
    // Buscamos en que puesto de la lista esta la tarea con ese id
    for (var i = 0; i < taskList.length; i++) {
      if (taskList[i].id == id) {
        var posicion = i;
        break;
      }
    }
    // Eliminamos seleccionado de taskList
    taskList.splice(posicion, 1);
    // Actualizamos el JSON
    actualizarJson();
    // Recargamos tareas
    mostrarTareas();
  } 

}

const toggleDone = () => {
  if (seleccionado != null) {
    // Obtenemos el id de la tarea que va a ser completada/descompletada
    var contenido = seleccionado.innerHTML;
    var id = contenido.split(" ")[1].slice(0, -1);
    // Buscamos en la lista la tarea y modificamos su estado
    for (var i = 0; i < taskList.length; i++) {
      if (taskList[i].id == id) {
        // Cambiamos el estado de completado
        if (taskList[i].done == true) {
          taskList[i].done = false;
        } else {
          taskList[i].done = true;
        }
        break;
      }
    }
    // Actualizamos el JSON
    actualizarJson();
    // Recargamos tareas
    mostrarTareas();
  }
}

// Función para sustituir el contenido del json por el de taskList
const actualizarJson = async () => {
  cuerpo = JSON.stringify(taskList);
  var respuesta = await fetch('/tasks/update' , {
    method: 'POST',
    body: cuerpo});
}

// Añadimos un event listener para cuando se cargue la página
window.addEventListener("load", loadTasks);

const addButton = document.querySelector("#fab-add");

addButton.addEventListener("touchend", add);


