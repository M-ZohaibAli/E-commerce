// api.php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'database.php';
require_once 'Product.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = explode('/', trim($_SERVER['REQUEST_URI'], '/'));

$db = (new Database())->connect();
$product = new Product($db);

// Get ID if present
$id = isset($uri[1]) ? $uri[1] : null;

switch ($method) {
  case 'GET':
    if ($id) {
      $product->id = $id;
      $stmt = $product->read_single();
      $row = $stmt->fetch(PDO::FETCH_ASSOC);
      
      if ($row) {
        http_response_code(200);
        echo json_encode($row);
      } else {
        http_response_code(404);
        echo json_encode(['message' => 'Product not found']);
      }
    } else {
      $stmt = $product->read();
      $num = $stmt->rowCount();
      
      $products = [];
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $products[] = $row;
      }
      
      http_response_code(200);
      echo json_encode($products);
    }
    break;
    
  case 'POST':
    $data = json_decode(file_get_contents("php://input"));
    
    $product->name = $data->name;
    $product->description = $data->description;
    $product->price = $data->price;
    $product->category = $data->category;
    $product->stock = $data->stock;
    
    if ($product->create()) {
      http_response_code(201);
      echo json_encode(['message' => 'Product created']);
    } else {
      http_response_code(503);
      echo json_encode(['message' => 'Product creation failed']);
    }
    break;
    
  case 'PUT':
    $data = json_decode(file_get_contents("php://input"));
    $product->id = $id;
    
    $product->name = $data->name;
    $product->description = $data->description;
    $product->price = $data->price;
    $product->category = $data->category;
    $product->stock = $data->stock;
    
    if ($product->update()) {
      http_response_code(200);
      echo json_encode(['message' => 'Product updated']);
    } else {
      http_response_code(503);
      echo json_encode(['message' => 'Product update failed']);
    }
    break;
    
  case 'DELETE':
    $product->id = $id;
    
    if ($product->delete()) {
      http_response_code(200);
      echo json_encode(['message' => 'Product deleted']);
    } else {
      http_response_code(503);
      echo json_encode(['message' => 'Product deletion failed']);
    }
    break;
    
  default:
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}