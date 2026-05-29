import http from 'http';

const server = http.createServer(async (req, res) => {
  try {
    // Fetch the dashboard from the running dev server
    const response = await fetch('http://localhost:4000/dashboard', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const html = await response.text();

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; }
          h1 { color: #c00; }
          code { background: #eee; padding: 5px 10px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>⚠️ Erro ao carregar o dashboard</h1>
          <p>Não foi possível conectar ao servidor em <code>localhost:4000</code></p>
          <p>Verifique se o dev server está rodando: <code>npm run dev</code></p>
          <p>Ou acesse diretamente: <a href="http://localhost:4000/dashboard">http://localhost:4000/dashboard</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(3000, () => {
  console.log('✅ Proxy server running on port 3000');
  console.log('📍 Open http://localhost:3000 to view the dashboard');
});
