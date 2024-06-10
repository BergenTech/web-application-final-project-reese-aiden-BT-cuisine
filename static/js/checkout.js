function refreshCart(mealsData) {
    let cartItems = JSON.parse(getCookie('cart')) || [];

    if (cartItems.length == 0) {
        document.getElementById("total-price").textContent = "Cart is Empty :("
        document.getElementById("form").style = "display: none"
        return 1
    }

    i = 0
    total_price = 0.0

    for (const meal of cartItems) {
        if (mealsData[meal[0]]) {
            cart_info = getCartInfo(mealsData[meal[0]][2], meal[2]);
            console.log(cart_info)
            tag_price = cart_info[1];
            
            total_price += (mealsData[meal[0]][1] + tag_price) * meal[1]

            item_status = addCartElement(mealsData[meal[0]], meal);
        }

        if (!mealsData[meal[0]] || item_status == -1) {
            removeCart(i)
        }
        i++
    }

    document.getElementById("total-price").textContent = `$${total_price.toFixed(2)}`
}

function addCartElement(mealData, itemJson) {
    if (Object.keys(itemJson[2]).length == 0) {
        itemJson[2] = getDefaultItemData(mealData[2])
    }

    cart_info = getCartInfo(mealData[2], itemJson[2])
    tag_values = cart_info[0]
    tag_price = cart_info[1];;

    if (tag_values == -1) {
        return -1;
    }

    const cart = document.querySelector('#thechadcart');

    const cartItem = document.createElement('tr');
    cartItem.id = "meal" + itemJson[0];
    cartItem.style.width = "100%";
    cartItem.style.height = "auto"; // Ensure the row height adjusts automatically

    const name = document.createElement('td');
    name.className = "name";
    name.textContent = mealData[0];
    name.style.paddingLeft = "5px";
    name.style = "text-align: left; vertical-align: middle;";
    name.style.width = "15%";

    const price = document.createElement('td');
    price.className = "price";
    price.textContent = "$" + ((mealData[1] + tag_price)*itemJson[1]).toFixed(2);
    price.style = "text-align: left; vertical-align: middle;";
    price.style.width = "10%";

    const qty = document.createElement('td');
    qty.className = "name";
    qty.style = "text-align: left; vertical-align: middle;";
    qty.style.width = "10%";


    qty.textContent = `Qty ${itemJson[1]}`;

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

        cart_price = document.getElementById("total-price")
        console.log(cart_price.textContent)
        console.log(price.textContent)
        cart_price.textContent = `$${(cart_price.textContent.replace("$","") - price.textContent.replace("$","")).toFixed(2)}`
    });

    delButton.style.width = "10%";
    delButton.appendChild(delImg);

    const tagText = document.createElement('td');
    tagText.className = "tagText";
    // let yes = tag_values.map(str => '<span style="white-space: nowrap;">' + str + '</span>');
    tagText.innerHTML = tag_values.join('<span style="margin-left: 15px; margin-right: 15px"></span>');
    tagText.style = "font-size:20px line-height:32px; width: 100%;";
    tagText.style.paddingLeft = "5px";
    tagText.colSpan = 4;
    tagText.style.width = "65%";
    tagText.style.height = "auto";

    // Set the minimum height of the tr element to the maximum height
    cartItem.style.maxHeight = 9999

    cartItem.appendChild(name);
    cartItem.appendChild(price);
    cartItem.appendChild(qty);
    cartItem.appendChild(tagText);
    cartItem.appendChild(delButton);

    cart.appendChild(cartItem);
}

function submit_order(mealsData) {

    cartItems = JSON.parse(getCookie('cart'))
    let mealData = {}

    for (let i = 0; i < cartItems.length; i++) {
        mealData = mealsData[cartItems[i][0]]
        if (Object.keys(cartItems[i][2]).length == 0) {
            cartItems[i][2] = getDefaultItemData(mealData[2])
        }

        if (!mealsData[cartItems[i][0]]) {
            removeCart(i)
            location.reload(true);
            return "that ain't too good"
        }
    }

    value = cartItems
    $.ajax({ 
        url: '/sendorder', 
        type: 'POST', 
        contentType: 'application/json', 
        data: JSON.stringify({ 'value': value }), 
        success: function(response) { 
            if (response.redirect) {
                window.location.href = response.redirect;
            }
            clearCart()
        }, 
        error: function(error) { 
            console.log(error); 
        } 
    }); 
}
