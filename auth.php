// auth.php
<?php
session_start();
require 'database.php'; // PDO connection

class Auth {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    public function register($email, $password) {
        // Validate input
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }

        // Check existing user
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->rowCount() > 0) {
            throw new Exception("Email already exists");
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Create user
        $stmt = $this->db->prepare(
            "INSERT INTO users (email, password) VALUES (?, ?)"
        );
        $stmt->execute([$email, $hashedPassword]);

        return true;
    }

    public function login($email, $password) {
        $stmt = $this->db->prepare(
            "SELECT id, password FROM users WHERE email = ?"
        );
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            throw new Exception("Invalid credentials");
        }

        // Regenerate session ID
        session_regenerate_id(true);
        
        // Store user in session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $email;

        return true;
    }

    public function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }

    public function logout() {
        $_SESSION = array();
        session_destroy();
    }
}

// Usage
$auth = new Auth($db);

try {
    if ($_POST['action'] === 'register') {
        $auth->register($_POST['email'], $_POST['password']);
        header("Location: /login.php");
    } 
    elseif ($_POST['action'] === 'login') {
        $auth->login($_POST['email'], $_POST['password']);
        header("Location: /dashboard.php");
    }
    elseif ($_GET['action'] === 'logout') {
        $auth->logout();
        header("Location: /login.php");
    }
} catch (Exception $e) {
    $_SESSION['error'] = $e->getMessage();
    header("Location: " . $_SERVER['HTTP_REFERER']);
}