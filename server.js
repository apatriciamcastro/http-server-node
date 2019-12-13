const http = require("http"); //to use the HTTP interfaces in Node.js
const fs = require("fs"); // to interact with the file system
const path = require("path"); // to work with file and directory paths
const url = require("url"); // for URL resolution and parsing

/*
    MIME types dictionary to assign the appropriate MIME type
    to the requested resource based on its extension

    MIME (Multipurpose Internet Mail Extensions) - standard that
    indicates the nature and format of a document, file or assorment of bytes

    type/subtype = e.g.text/html
*/

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

// Function to create the HTTP server
// https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener
const server = http.createServer();

/*
    Request handler function that gets called once every time an HTTP
    request is made against the serverbundleRenderer.renderToStream

    The request object is an instance of IncomingMessage, and allows us to
    access all information about the request (response status, headers, data).

    The response object is and instance of ServerResponse, a writable stream,
    and provides several methods to send data back to the client.

    URL constructor: https://nodejs.org/docs/latest-v10.x/api/url.html#url_constructor_new_url_input_base
*/
server.on("request", (req, res) => {
  // Parse the incoming request and handle those without extensions
  const parsedUrl = new URL(req.url, "https://node-http.glitch.me/");
  let pathName = parsedUrl.pathname;
  let ext = path.extname(pathName);

  /*
    Handle URLs with trailing '/' by removing aforementioned '/'
*/
  if (pathName !== "/" && pathName[pathName.length - 1] === "/") {
    res.writeHead(302, { Location: pathName.slice(0, -1) });
    res.end();
    return;
  }
  /*
    If the request is for the root directory, return index.html.
    Otherwise, append '.html' to any other request without an extension.
*/
  if (pathName === "/") {
    ext = ".html";
    pathName = "/index.html";
  } else if (!ext) {
    ext = ".html";
    pathName += ext;
  }
  // Construct valid file path so the relevant assets can be accessed
  const filePath = path.join(process.cwd(), "/public", pathName);

  //Check if the requested asset exists on the server
  fs.exists(filePath, function(exists, err) {
    // If it doesn't exist, respond with a 404 Not Found status
    if (!exists || !mimeTypes[ext]) {
      console.log("File does not exist:" + pathName);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.write("404 Not Found");
      res.end();
      return;
    }
    // If it exists, respond with a 200 OK status
    res.writeHead(200, { "Content-Type": mimeTypes[ext] });

    /*
        Read file and stream it to the response.
        Use the pipe command to take all the data from the
        read stream and push it to the response.
    */
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

server.listen(process.env.PORT);

console.log("Server listening on " + process.env.PORT);
