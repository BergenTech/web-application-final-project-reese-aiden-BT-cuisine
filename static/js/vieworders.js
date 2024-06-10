function refreshCart(mealsData, orderItems, tr) {

    i = 0
    total_price = 0.0

    for (const meal of orderItems) {
        if (mealsData[meal[0]]) {

            item_status = addCartElement(mealsData[meal[0]], meal, tr);
        }
        i++
    }
}

function addCartElement(mealData, itemJson, cart) {
    if (Object.keys(itemJson[2]).length == 0) {
        itemJson[2] = getDefaultItemData(mealData[2])
    }

    cart_info = getCartInfo(mealData[2], itemJson[2])
    tag_values = cart_info[0]
    tag_price = cart_info[1];;

    if (tag_values == -1) {
        return -1;
    }

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
    cartItem.style.border = "0px solid black"

    cartItem.appendChild(name);
    cartItem.appendChild(price);
    cartItem.appendChild(qty);
    cartItem.appendChild(tagText);


    cart.appendChild(cartItem);
}
