// Product.php
<?php
class Product {
  private $conn;
  private $table = 'products';

  public $id;
  public $name;
  public $description;
  public $price;
  public $category;
  public $stock;

  public function __construct($db) {
    $this->conn = $db;
  }

  public function read() {
    $query = 'SELECT * FROM ' . $this->table;
    $stmt = $this->conn->prepare($query);
    $stmt->execute();
    return $stmt;
  }

  public function read_single() {
    $query = 'SELECT * FROM ' . $this->table . ' WHERE id = ? LIMIT 1';
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(1, $this->id);
    $stmt->execute();
    return $stmt;
  }

  public function create() {
    $query = 'INSERT INTO ' . $this->table . '
      SET name = :name,
          description = :description,
          price = :price,
          category = :category,
          stock = :stock';

    $stmt = $this->conn->prepare($query);

    $this->name = htmlspecialchars(strip_tags($this->name));
    $this->description = htmlspecialchars(strip_tags($this->description));
    $this->price = htmlspecialchars(strip_tags($this->price));
    $this->category = htmlspecialchars(strip_tags($this->category));
    $this->stock = htmlspecialchars(strip_tags($this->stock));

    $stmt->bindParam(':name', $this->name);
    $stmt->bindParam(':description', $this->description);
    $stmt->bindParam(':price', $this->price);
    $stmt->bindParam(':category', $this->category);
    $stmt->bindParam(':stock', $this->stock);

    if ($stmt->execute()) return true;
    return false;
  }

  public function update() {
    $query = 'UPDATE ' . $this->table . '
      SET name = :name,
          description = :description,
          price = :price,
          category = :category,
          stock = :stock
      WHERE id = :id';

    $stmt = $this->conn->prepare($query);

    $this->name = htmlspecialchars(strip_tags($this->name));
    $this->description = htmlspecialchars(strip_tags($this->description));
    $this->price = htmlspecialchars(strip_tags($this->price));
    $this->category = htmlspecialchars(strip_tags($this->category));
    $this->stock = htmlspecialchars(strip_tags($this->stock));
    $this->id = htmlspecialchars(strip_tags($this->id));

    $stmt->bindParam(':name', $this->name);
    $stmt->bindParam(':description', $this->description);
    $stmt->bindParam(':price', $this->price);
    $stmt->bindParam(':category', $this->category);
    $stmt->bindParam(':stock', $this->stock);
    $stmt->bindParam(':id', $this->id);

    if ($stmt->execute()) return true;
    return false;
  }

  public function delete() {
    $query = 'DELETE FROM ' . $this->table . ' WHERE id = :id';
    $stmt = $this->conn->prepare($query);
    $this->id = htmlspecialchars(strip_tags($this->id));
    $stmt->bindParam(':id', $this->id);

    if ($stmt->execute()) return true;
    return false;
  }
}