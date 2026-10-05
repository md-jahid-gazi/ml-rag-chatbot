<?php

session_start();

// Autoload classes manually
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../app/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Database connection to XAMPP MySQL
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_DATABASE') ?: 'knowledge_chatbot';
$dbUser = getenv('DB_USERNAME') ?: 'root';
$dbPass = getenv('DB_PASSWORD') ?: '';

try {
    $pdo = new PDO(
        "mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Simple Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. API: POST /api/chat
if ($uri === '/api/chat' && $method === 'POST') {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $controller = new \App\Http\Controllers\ChatController($pdo);
    echo json_encode($controller->handleChat($input));
    exit;
}

// 2. API: POST /api/admin/login
if ($uri === '/api/admin/login' && $method === 'POST') {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    // Check default admin or query MySQL users
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND role = 'admin'");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    $valid = false;
    if ($user && password_verify($password, $user['password'])) {
        $valid = true;
    } elseif ($username === 'admin' && ($password === 'admin123' || $password === 'admin')) {
        $valid = true;
    }

    if ($valid) {
        $_SESSION['admin_user'] = $username;
        echo json_encode(['success' => true, 'username' => $username, 'role' => 'admin']);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid admin username or password']);
    }
    exit;
}

// 3. API: POST /api/admin/logout
if ($uri === '/api/admin/logout' && $method === 'POST') {
    header('Content-Type: application/json');
    unset($_SESSION['admin_user']);
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

// 4. API: GET /api/admin/stats
if ($uri === '/api/admin/stats' && $method === 'GET') {
    header('Content-Type: application/json');
    $controller = new \App\Http\Controllers\AdminController($pdo);
    echo json_encode($controller->getStats());
    exit;
}

// 5. API: POST /api/admin/upload
if ($uri === '/api/admin/upload' && $method === 'POST') {
    header('Content-Type: application/json');
    if (empty($_SESSION['admin_user'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin authentication required']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $title = $input['title'] ?? 'Uploaded Document';
    $filename = $input['filename'] ?? 'document.txt';
    $content = $input['content'] ?? '';

    $controller = new \App\Http\Controllers\AdminController($pdo);
    echo json_encode($controller->uploadDocument($title, $filename, $content));
    exit;
}

// 6. API: POST /api/admin/delete
if ($uri === '/api/admin/delete' && $method === 'POST') {
    header('Content-Type: application/json');
    if (empty($_SESSION['admin_user'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin authentication required']);
        exit;
    }
    $id = (int)($_GET['id'] ?? 0);
    $controller = new \App\Http\Controllers\AdminController($pdo);
    echo json_encode(['success' => $controller->deleteDocument($id)]);
    exit;
}

// 7. VIEW: GET /admin (Admin Console UI - Image 2)
if ($uri === '/admin') {
    require __DIR__ . '/../resources/views/admin.blade.php';
    exit;
}

// 8. VIEW: GET / (Phone Chatbot UI - Image 1)
require __DIR__ . '/../resources/views/chat.blade.php';
