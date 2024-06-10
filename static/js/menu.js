// document.getElementById('clear-cart').addEventListener('click', function() {
//     setCookie("cart", "[]");
//     document.querySelector('#thechadcart').innerHTML = ''
// });

const cart = document.querySelector('.cart-container');
const defCartPos = cart.getBoundingClientRect().top
const header_element = document.querySelector('header');
const footer_element = document.getElementById('meals-container');

const stupidFlaskElement1 = document.querySelector(".stupid-flask1");
const stupidFlaskElement2 = document.querySelector(".stupid-flask2");
const cartSwitch = document.getElementById("cart-switch")
cartActive = false


function handleScroll() {
    cartBottomPos = header_element.getBoundingClientRect().bottom + window.scrollY
    footerTopPos = footer_element.getBoundingClientRect().bottom + window.scrollY

    if (window.scrollY > footerTopPos - cart.offsetHeight - 50) {
        yes = footerTopPos - cart.offsetHeight
        cart.style.top = `${yes}px`
        cart.style.position = 'absolute' 
    } else if (window.scrollY < cartBottomPos) {
        yes = cartBottomPos + 50
        cart.style.top = `${yes}px`
        cart.style.position = 'absolute'
    } else {
        cart.style.position = 'fixed'
        cart.style.top = `50px`
    }
}

document.addEventListener('DOMContentLoaded', function () {
    footerTopPos = footer_element.getBoundingClientRect().bottom

    const screenWidth = window.innerWidth;



    if (screenWidth > 600) {
        window.addEventListener('scroll', handleScroll);
        handleScroll()
    } else {
        cart.style.left = "-20px"
        cart.style.display = "none"
        cart.style.width = "100%"
        cartSwitch.style.display = "block"
        cartSwitch.addEventListener('click', function() {
            if (cartActive) {
                cartActive = false
                cart.style.display = "none"
                cartSwitch.style.left = "-8px"
                
            } else {
                cartActive = true
                cart.style.display = "block"
                cartSwitch.style.left = `${cart.getBoundingClientRect().right - 20}px`
            }
        })
    }
});

function refreshCart(mealsData) {
    let cartItems = JSON.parse(getCookie('cart')) || [];

    i = 0
    for (const meal of cartItems) {
        if (mealsData[meal[0]]) {
            item_status = addCartElement(mealsData[meal[0]], meal);
        }

        if (!mealsData[meal[0]] || item_status == -1) {
            removeCart(i)
        }
        i++
    }
}

function updateCart(mealData, itemJson) {
    addToCart(mealData, itemJson);
    addCartElement(mealData, itemJson)
}

function addCartElement(mealData, itemJson) {

    cart_info = getCartInfo(mealData[2], itemJson[2])
    tag_values = cart_info[0]
    tag_price = cart_info[1]

    if (tag_values == -1) {
        return -1
    }

    const cart = document.querySelector('#thechadcart');

    const delButton = document.createElement('td');

    const delImg = document.createElement('img');
    delImg.style = "text-align: center; vertical-align: top;"
    delImg.className = 'btn btn-danger btn-circle';
    delImg.src = 'static/assets/cross.png';

    delImg.style.zoom = '0.6';
    delImg.style.height = '27px';
    delImg.style.width = '25px';
    delImg.style.padding = '5px';

    delImg.addEventListener('click', function() {
        let cartItems = JSON.parse(getCookie('cart')) || [];
        for (let i = 0; i < cartItems.length; i++) {
            if (cartItems[i][0] == itemJson[0]) {
                cartItems.splice(i,1);
                break;
            }
        }
        setCookie("cart", JSON.stringify(cartItems));
        cart.removeChild(cartItem);
    });

    delButton.style.width = "8%"; // Ensure full width
    delButton.appendChild(delImg);

    const cartItem = document.createElement('tr');
    cartItem.id = "meal" + itemJson[0];
    cartItem.style.width = "100%"; // Ensure full width

    const cartItemTop = document.createElement('tr');
    cartItemTop.style = "border: 1px solid transparent; width: 100%;"; // Ensure full width

    const name = document.createElement('td');
    name.className = "name"; // Use className instead of class
    name.textContent = mealData[0];
    name.style.paddingLeft = "5px";
    name.style.width = "62%"; // Ensure full width

    const price = document.createElement('td');
    price.className = "price"; // Use className instead of class
    price.textContent = "$" + ((mealData[1] + tag_price)*itemJson[1]).toFixed(2);
    price.style.width = "30%"; // Ensure full width

    cartItemTop.appendChild(delButton);
    cartItemTop.appendChild(name);
    cartItemTop.appendChild(price);

    const cartItemBottom = document.createElement('tr');
    cartItemBottom.style.width = "100%"; // Ensure full width

    const tagText = document.createElement('td');
    tagText.className = "tagText";
    tagText.innerHTML = tag_values.join("<br class='cart-br'>");
    tagText.style = "font-size:10px; line-height:12px; width: 100%;";
    tagText.style.paddingLeft = "5px";
    tagText.colSpan = 2;
    tagText.style.width = "100%"

    const qty = document.createElement('td');

    if (itemJson[1] > 1) {
        qty.textContent = `Qty ${itemJson[1]}`;
    }

    qty.className = "name"; // Use className instead of class
    qty.style = "text-align: center; font-size: 14px; vertical-align: middle;";
    qty.style.width = "15%"; // Ensure full width

    cartItemBottom.appendChild(tagText);
    cartItemBottom.appendChild(qty);

    // Append both rows to the cart
    cartItem.appendChild(cartItemTop);
    cartItem.appendChild(cartItemBottom);
    cart.appendChild(cartItem);
}