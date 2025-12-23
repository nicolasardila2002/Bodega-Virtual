<?php
/**
 * guardar-cliente.php
 * Guarda los datos del cliente en archivo JSON
 */

// Configurar cabeceras para JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Respuesta por defecto
$respuesta = [
    'success' => false,
    'message' => 'Error desconocido',
    'cliente' => null
];

// Verificar que sea POST
if ($