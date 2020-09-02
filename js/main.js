// # - 1  Selecting HTML Elements => Variables

// Navbar Section
const navbarCartBtn = document.querySelector('.nav-bar-cart');
const cartNumber = document.querySelector('.cart-number');
// Products Section
const productsContainer = document.querySelector('.products-container');
// Cart Section
const cartSection = document.querySelector('.cart-section');
const closeCartBtn = document.querySelector('.close-cart-btn');
const cartOverlay = document.querySelector('.cart-overlay');
const cartContent = document.querySelector('.cart-content');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const clearCartBtn = document.querySelector('.clear-cart-btn');

// Cart
let cart = [];
let productButtonsContainer = [];

/////////////////////////////////////////////////////////////////////////

// This class is responsible for Getting The Products From products.json
class Products {
  async getProducts() {
    try {
      let result = await fetch('../products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return {
          id: id,
          title: title,
          price: price,
          image: image,
        };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// This class is responsible for Displaying The Products On The Web Page
class UserInterface {
  displayProducts(products) {
    let result = '';
    products.forEach(function (product) {
      const { id, title, price, image } = product;
      result += ` 
      <div class="product">
        <div class="product-image">
          <img src=${image} alt="product" />
          <button class="product-btn" data-id=${id}>
            <i class="fas fa-shopping-cart"></i> add to cart
          </button>
        </div>
        <div class="product-info">
          <h3 class="product-title">${title}</h3>
          <h4 class="product-price">$ ${price}</h4>
        </div>
    </div>
    `;
    });
    productsContainer.innerHTML = result;
  }

  getProductButtons() {
    const productButtons = [...document.querySelectorAll('.product-btn')];
    productButtonsContainer = productButtons;
    productButtons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);

      if (inCart) {
        button.innerText = 'in cart';
        button.disabled = true;
      }

      button.addEventListener('click', (event) => {
        event.target.innerText = 'in cart';
        event.target.disabled = true;
        // Get Product From Local Storage Products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        //  Add Product To The Cart
        cart = [...cart, cartItem];
        //Save Cart In Local Storage
        Storage.saveCart(cart);
        // Set Cart Values
        this.setCartValues(cart);
        // Display Cart Items
        this.addCartItem(cartItem);
        // Show Cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let itemsTotal = 0;
    let tempTotal = 0;
    cart.map((item) => {
      itemsTotal += item.amount;
      tempTotal += item.price * item.amount;
    });
    cartNumber.innerText = itemsTotal;
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
  }
  addCartItem(item) {
    const { id, title, image, price, amount } = item;
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
            <div class="cart-item-image">
              <img src=${image} alt="product" />
            </div>
            <div class="cart-item-info">
              <h4 class="cart-item-title">${title}</h4>
              <h5 class="cart-item-price">$ ${price}</h5>
              <button class="cart-item-remove-btn" data-id=${id}>
                <i class="fas fa-trash-alt remove-item"></i>
              </button>
            </div>
            <div class="cart-item-amount">
              <i class="fas fa-chevron-up" data-id=${id}></i>
              <p class="cart-item-number">${amount}</p>
              <i class="fas fa-chevron-down" data-id=${id}></i>
            </div>
    `;
    cartItems.appendChild(div);
  }
  showCart() {
    cartSection.classList.add('cart-visible');
    cartOverlay.classList.add('show-cart');
    cartContent.classList.add('show-cart');
  }
  hideCart() {
    cartSection.classList.remove('cart-visible');
    cartOverlay.classList.remove('show-cart');
    cartContent.classList.remove('show-cart');
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    navbarCartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart() {
    cart.forEach((item) => this.addCartItem(item));
  }
  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    cartItems.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-item')) {
        let removeItemIcon = event.target.parentNode;
        let id = removeItemIcon.dataset.id;
        cartItems.removeChild(removeItemIcon.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartItems.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItemsId = cart.map((item) => item.id);
    cartItemsId.forEach((id) => this.removeItem(id));
    while (cartItems.children.length > 0) {
      cartItems.removeChild(cartItems.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id != id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
    <i class="fas fa-shopping-cart"></i> add to cart
    `;
  }
  getSingleButton(id) {
    return productButtonsContainer.find((button) => button.dataset.id === id);
  }
}

// This class is responsible for Local Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart(cart) {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const products = new Products();
  const userinterface = new UserInterface();
  // Set Up App
  userinterface.setupApp();
  // Get All Products
  products
    .getProducts()
    .then((products) => {
      userinterface.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      userinterface.getProductButtons();
      userinterface.cartLogic();
    });
});
