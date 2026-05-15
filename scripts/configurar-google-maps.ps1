# Abre la consola de Google y muestra los pasos para obtener VITE_GOOGLE_MAPS_API_KEY
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Google Maps API (direccion de clientes) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "La API key es OBLIGATORIA si quieres el buscador de direcciones de Google." -ForegroundColor Yellow
Write-Host "Sin ella puedes escribir la direccion a mano en el formulario de clientes." -ForegroundColor Gray
Write-Host ""
Write-Host "Pasos:" -ForegroundColor White
Write-Host "  1. Entra con tu cuenta de Google"
Write-Host "  2. Crea un proyecto (o elige uno existente)"
Write-Host "  3. Habilita estas APIs:"
Write-Host "     - Maps JavaScript API"
Write-Host "     - Places API"
Write-Host "  4. Credenciales -> Crear credenciales -> Clave de API"
Write-Host "  5. (Recomendado) Restringe la clave:"
Write-Host "     - Restriccion de aplicacion: sitios web"
Write-Host "     - Dominios: localhost, api-crm-adrian.test, ijfca.com"
Write-Host "     - Restriccion de API: solo Maps JavaScript API y Places API"
Write-Host "  6. Copia la clave y pegala en:"
Write-Host "     c:\laragon\www\frontend\crm-adrian-front\.env"
Write-Host "     Linea: VITE_GOOGLE_MAPS_API_KEY=tu_clave_aqui"
Write-Host "  7. Reinicia el servidor de Vite (npm run dev)"
Write-Host ""

$open = Read-Host "Abrir Google Cloud Console en el navegador? (S/N)"
if ($open -eq "S" -or $open -eq "s" -or $open -eq "Y" -or $open -eq "y") {
    Start-Process "https://console.cloud.google.com/google/maps-apis/onboard"
    Start-Sleep -Seconds 1
    Start-Process "https://console.cloud.google.com/apis/credentials"
}

Write-Host ""
Write-Host "Cuando tengas la clave, edito .env por ti si me la pegas en el chat." -ForegroundColor Green
Write-Host ""
