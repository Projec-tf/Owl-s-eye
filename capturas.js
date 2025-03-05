const CORRECT_PASSWORD = 'admin123';

document.getElementById('login').addEventListener('click', () => {
  const password = document.getElementById('password').value;
  if (password === CORRECT_PASSWORD) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('captures').classList.remove('hidden');
    loadScreenshots();
  } else {
    alert('Codigo de acceso incorrecta :(');
  }
});

function loadScreenshots() {
  chrome.storage.local.get('screenshots', function(data) {
    const container = document.getElementById('screenshotContainer');
    if (data.screenshots && data.screenshots.length > 0) {
      data.screenshots.forEach(screenshot => {
        const div = document.createElement('div');
        div.className = 'screenshot';
        div.innerHTML = `
          <p>Captured: ${screenshot.timestamp}</p>
          <p>URL: ${screenshot.url || 'N/A'}</p>
          <img src="${screenshot.image}" alt="Screenshot">
        `;
        container.appendChild(div);
      });
    } else {
      container.innerHTML = '<p>No hay capturas disponibles.</p>';
    }
  });
}