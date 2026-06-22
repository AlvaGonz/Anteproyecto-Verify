async function testWorkflow() {
  console.log("== Iniciando prueba manual solicitada por el usuario ==");
  
  const email = "see_black01@gmail.com";
  const password = "@Rvl7851819100";
  
  // 1. Registro
  console.log(`\n1. Registrando cuenta: ${email}`);
  const registerPayload = {
    nombre: "Test",
    apellido: "Usuario",
    email: email,
    password: password,
    telefono: "8095550199",
    cedula: "40200000004"
  };
  
  try {
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });
    
    console.log(`Status de Registro: ${registerRes.status}`);
    const registerBody = await registerRes.text();
    console.log(`Cuerpo de Respuesta: ${registerBody}`);
    
    // 2. Inicio de Sesión
    console.log(`\n2. Iniciando sesión con: ${email}`);
    const loginPayload = {
      email: email,
      password: password
    };
    
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });
    
    console.log(`Status de Login: ${loginRes.status}`);
    const loginBody = await loginRes.text();
    console.log(`Cuerpo de Respuesta: ${loginBody}`);
    
    const cookies = loginRes.headers.get('set-cookie');
    if (cookies) {
      console.log(`\nCookie recibida correctamente:`);
      console.log(cookies);
    } else {
      console.log(`\nNo se recibió cookie de sesión.`);
    }
    
  } catch (error) {
    console.error("Error en la prueba:", error);
  }
}

testWorkflow();
