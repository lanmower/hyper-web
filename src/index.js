(async ()=>{
  var express = await requireAsync('express');
  var serveIndex = await requireAsync('serve-index');
  var app  = express();
  app.listen(8081);
  app.use('/',express.static('files'))
  app.use('/',serveIndex('files'))
  console.log('test');
})()