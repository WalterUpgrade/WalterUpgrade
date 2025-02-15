const fs = require('fs');
const axios = require('axios');

// Configuración
const GITHUB_TOKEN = process.env.STATS;
const USERNAME = 'WalterUpGrade';  // Cambia esto por tu nombre de usuario de GitHub

if (!GITHUB_TOKEN) {
    console.error("Error: La variable de entorno STATS no está definida.");
    process.exit(1);
}

// Headers para la autenticación
const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
};

// Función para obtener los repositorios
async function getRepos() {
    try {
        const url = `https://api.github.com/users/${USERNAME}/repos`;
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error("Error obteniendo los repositorios:", error.response ? error.response.data : error.message);
        return [];
    }
}

// Función principal
async function main() {
    const repos = await getRepos();

    // Contar repositorios públicos y privados
    const publicRepos = repos.filter(repo => !repo.private).length;
    const privateRepos = repos.filter(repo => repo.private).length;

    // Generar el texto para el README.md
    const statsText = `
<!-- STATS_START -->
## 📊 Estadísticas de Repositorios 🚀

- **Repositorios Públicos:** ${publicRepos}
- **Repositorios Privados:** ${privateRepos}
<!-- STATS_END -->
`;

    // Leer el README.md actual
    let readmeContent = fs.readFileSync('README.md', 'utf8');

    // Verificar si los marcadores existen, si no, agregarlos
    const startMarker = "<!-- STATS_START -->";
    const endMarker = "<!-- STATS_END -->";

    if (readmeContent.includes(startMarker) && readmeContent.includes(endMarker)) {
        // Reemplazar la sección de estadísticas existente
        const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "g");
        readmeContent = readmeContent.replace(regex, statsText);
    } else {
        // Agregar la sección al final del README.md si no existe
        readmeContent += `\n${statsText}`;
    }

    // Escribir el nuevo contenido en el README.md
    fs.writeFileSync('README.md', readmeContent, 'utf8');

    console.log("✅ Estadísticas actualizadas en README.md");
}

main().catch(console.error);
