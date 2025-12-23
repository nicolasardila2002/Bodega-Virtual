<?php
/**
 * guardar-cliente.php
 * Guarda los datos del cliente en archivo JSON
 * Versión premium para Bodega Virtual
 */

// Configuración de seguridad
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Respuesta por defecto
$respuesta = [
    'success' => false,
    'message' => 'Error desconocido',
    'data' => null,
    'timestamp' => date('Y-m-d H:i:s')
];

try {
    // Verificar método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Obtener y decodificar JSON
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido');
    }

    // Validar datos requeridos
    if (empty($input['nombre']) || empty($input['telefono'])) {
        throw new Exception('Nombre y teléfono son obligatorios');
    }

    // Sanitizar datos
    $cliente = [
        'id' => uniqid('cliente_', true),
        'nombre' => trim(htmlspecialchars($input['nombre'])),
        'telefono' => preg_replace('/[^0-9+]/', '', $input['telefono']),
        'intereses' => isset($input['intereses']) ? htmlspecialchars($input['intereses']) : '',
        'aceptaWhatsApp' => isset($input['aceptaWhatsApp']) ? (bool)$input['aceptaWhatsApp'] : false,
        'tipo' => isset($input['tipo']) ? htmlspecialchars($input['tipo']) : 'general',
        'fecha_registro' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ];

    // Nombre del archivo JSON
    $archivoJson = 'clientes.json';
    
    // Leer clientes existentes
    $clientes = [];
    if (file_exists($archivoJson)) {
        $contenido = file_get_contents($archivoJson);
        $clientes = json_decode($contenido, true) ?: [];
    }

    // Verificar si el cliente ya existe (por teléfono)
    $clienteExiste = false;
    foreach ($clientes as $c) {
        if ($c['telefono'] === $cliente['telefono']) {
            $clienteExiste = true;
            break;
        }
    }

    if (!$clienteExiste) {
        // Agregar nuevo cliente
        $clientes[] = $cliente;
        
        // Guardar en JSON con formato bonito
        $jsonData = json_encode(['clientes' => $clientes], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if (file_put_contents($archivoJson, $jsonData) === false) {
            throw new Exception('Error al guardar datos');
        }

        // Crear backup mensual
        $backupFile = 'backups/clientes_' . date('Y-m') . '.json';
        if (!file_exists('backups')) {
            mkdir('backups', 0755, true);
        }
        file_put_contents($backupFile, $jsonData);

        $respuesta['success'] = true;
        $respuesta['message'] = 'Cliente registrado exitosamente';
        $respuesta['data'] = $cliente;
        
        // Opcional: Enviar notificación por email
        // enviarNotificacionEmail($cliente);
        
    } else {
        $respuesta['success'] = true;
        $respuesta['message'] = 'Cliente ya registrado, actualizando información';
        $respuesta['data'] = $cliente;
    }

} catch (Exception $e) {
    $respuesta['message'] = $e->getMessage();
    $respuesta['error'] = true;
    http_response_code(400);
}

// Enviar respuesta JSON
echo json_encode($respuesta, JSON_PRETTY_PRINT);

/**
 * Función para enviar notificación por email (opcional)
 */
function enviarNotificacionEmail($cliente) {
    $to = "tuemail@bodegavirtual.com"; // Cambiar por tu email
    $subject = "📱 Nuevo Cliente Club VIP - Bodega Virtual";
    
    $message = "
    <html>
    <head>
        <title>Nuevo Cliente Club VIP</title>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #8B0000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .cliente-info { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>🎉 Nuevo Cliente Club VIP</h2>
            </div>
            <div class='content'>
                <div class='cliente-info'>
                    <h3>Información del Cliente:</h3>
                    <p><strong>Nombre:</strong> {$cliente['nombre']}</p>
                    <p><strong>Teléfono:</strong> {$cliente['telefono']}</p>
                    <p><strong>Intereses:</strong> " . ($cliente['intereses'] ?: 'No especificado') . "</p>
                    <p><strong>Fecha:</strong> {$cliente['fecha_registro']}</p>
                    <p><strong>Acepta WhatsApp:</strong> " . ($cliente['aceptaWhatsApp'] ? 'Sí' : 'No') . "</p>
                </div>
                <p>Cliente registrado desde IP: {$cliente['ip']}</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Bodega Virtual <noreply@bodegavirtual.com>\r\n";
    
    @mail($to, $subject, $message, $headers);
}
?>