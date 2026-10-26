```javascript
// OBSERVER PATTERN: Price drop notification

class User {
    update(product, oldPrice, newPrice) {
        let message = product.name + " price dropped from Rs." +
            oldPrice + " to Rs." + newPrice;

        document.getElementById("notifications").innerHTML +=
            "<li>" + message + "</li>";
    }
}

class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.observers = [];
    }

    subscribe(user) {
        this.observers.push(user);
    }

    setPrice(newPrice) {
        let oldPrice = this.price;
        this.price = newPrice;

        if (newPrice < oldPrice) {
            this.observers.forEach(user =>
                user.update(this, oldPrice, newPrice)
            );
        }

        renderProducts();
    }
}

let user = new User();

let products = [
    new Product(1, "Headphones", 2000),
    new Product(2, "Smart Watch", 3000),
    new Product(3, "Keyboard", 1500)
];

products.forEach(product => product.subscribe(user));

function renderProducts() {
    let output = "";

    products.forEach(product => {
        output += `
            <div class="product">
                <h3>${product.name}</h3>
                <p>Price: Rs.${product.price}</p>
                <button onclick="reducePrice(${product.id})">
                    Reduce Price
                </button>
                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>`;
    });

    document.getElementById("products").innerHTML = output;
}

function reducePrice(id) {
    let product = products.find(p => p.id === id);
    product.setPrice(product.price - 100);
}


// STRATEGY PATTERN: Payment methods

class CardPayment {
    pay(amount) {
        return "Paid Rs." + amount + " using Card.";
    }
}

class UPIPayment {
    pay(amount) {
        return "Paid Rs." + amount + " using UPI.";
    }
}

class WalletPayment {
    pay(amount) {
        return "Paid Rs." + amount + " using Wallet.";
    }
}

function checkout() {
    let amount = cartService.getTotal();

    if (amount <= 0) {
        document.getElementById("status").innerText =
            "Please add products to the cart first.";
        return;
    }

    let method = document.getElementById("payment").value;
    let strategy;

    if (method === "card") {
        strategy = new CardPayment();
    } else if (method === "upi") {
        strategy = new UPIPayment();
    } else {
        strategy = new WalletPayment();
    }

    document.getElementById("status").innerText =
        strategy.pay(amount);
}


// COMMAND PATTERN: Shopping cart actions

class CartService {
    constructor() {
        this.items = [];
        this.coupon = false;
    }

    add(product) {
        this.items.push(product);
    }

    remove(productId) {
        let index = this.items.findIndex(p => p.id === productId);

        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }

    getTotal() {
        let total = this.items.reduce(
            (sum, product) => sum + product.price, 0
        );

        return this.coupon ? total * 0.9 : total;
    }
}

let cartService = new CartService();

class AddItemCommand {
    constructor(product) {
        this.product = product;
    }

    execute() {
        cartService.add(this.product);
    }

    undo() {
        cartService.remove(this.product.id);
    }
}

class ApplyCouponCommand {
    execute() {
        cartService.coupon = true;
    }

    undo() {
        cartService.coupon = false;
    }
}

class CommandManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
        renderCart();
    }

    undo() {
        if (this.undoStack.length > 0) {
            let command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
            renderCart();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            let command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
            renderCart();
        }
    }
}

let commandManager = new CommandManager();

function addToCart(id) {
    let product = products.find(p => p.id === id);
    commandManager.execute(new AddItemCommand(product));
}

function applyCoupon() {
    if (!cartService.coupon) {
        commandManager.execute(new ApplyCouponCommand());
    }
}

function undoAction() {
    commandManager.undo();
}

function redoAction() {
    commandManager.redo();
}

function renderCart() {
    let output = "";

    cartService.items.forEach(product => {
        output += `<p>${product.name} - Rs.${product.price}</p>`;
    });

    document.getElementById("cart").innerHTML =
        output || "Cart is empty";

    document.getElementById("total").innerText =
        "Total: Rs." + cartService.getTotal().toFixed(2);
}

renderProducts();
renderCart();
```