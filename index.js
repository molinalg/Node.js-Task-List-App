const http = require('http');
const fs = require('fs');

// El puerto ha sido cambiado a 3000 (en un inicio era 80)
const PORT = 3000;

const serveStaticFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function(err, data) {
      if(err) reject(err);
      resolve(data);
    });
  });
} 

const sendResponse = (response, content, contentType) => {
  response.writeHead(200, {"Content-Type": contentType});
  response.end(content);
}

const handleRequest = async (request, response) => {
  const url = request.url;

  if(request.method === "GET"){
    let content;
    let contentType;
    switch(url){
      case "/":
      case "/index.html":
        content = await serveStaticFile("www/index.html");
        contentType = "text/html";
        break;
      case "/script.js":
        content = await serveStaticFile("www/script.js");
        contentType = "text/javascript";
        break;
      case "/style.css":
        content = await serveStaticFile("www/style.css");
        contentType = "text/css";
        break;
      // Consideramos el caso en el que leemos el json
      case "/tasks/get":
        content = await serveStaticFile("tasks.json");
        contentType = "application/json";
        break;
      default: 
        content = "Ruta no v&aacutelida\r\n";
        contentType = "text/html";
    }

     sendResponse(response, content, contentType);
    // Consideramos el caso en el que escribimos en el json
  } else if (request.method === "POST") {
    let content;
    let contentType;
    switch(url){
      case "/tasks/update":
        content = "Json actualizado\r\n";
        contentType = "text/html";
        var resultado = "";
        request.on("data", (contenido) => {
           resultado += contenido;
        });
        request.on("end", () => {
          var string_json = JSON.stringify(resultado);
          var total_json = JSON.parse(string_json);
          fs.writeFileSync("tasks.json", total_json);
        });
        break;
      default:
        content = "Ruta no v&aacutelida\r\n";
        contentType = "text/html";
    }

      sendResponse(response, content, contentType);
  } else{
     response.writeHead(405, {"Content-Type": "text/html"});
     response.write(`M&eacutetodo ${request.method} no permitido!\r\n`);
  }
}


const server = http.createServer(handleRequest);
server.listen(PORT);