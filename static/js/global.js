function getCookie(name) {
    // Split cookies string into an array of key-value pairs
    const cookies = document.cookie.split(';');

    // Iterate through each key-value pair
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        // Check if the cookie starts with the provided name
        if (cookie.startsWith(name + '=')) {
            // Return the substring after the equals sign
            return cookie.substring(name.length + 1);
        }
    }

    // Return null if cookie with provided name is not found
    return null;
}

function setCookie(name, value) {
    let replaced = false
    cookieString = name + '=' + (value || '')

    // Split cookies string into an array of key-value pairs
    if (document.cookie) {
        cookies = document.cookie.split(';')
    } else {
        cookies = []
    }

    // Iterate through each key-value pair
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        // Check if the cookie starts with the provided name
        if (cookie.startsWith(name + '=')) {
            // Return the substring after the equals sign
            cookies[i] = cookieString
            replaced = true
        }
    }
    if (!replaced) {
        cookies.push(cookieString)
    }
    document.cookie = cookies.join(';')
    return 0
}

function addToCart(mealTags, itemTags) {

    if (itemTags == 0) return

    let cartItems = JSON.parse(getCookie('cart')) || [];
    cartItems.push(itemTags);
    setCookie("cart", JSON.stringify(cartItems), 30);
}

function removeCart(index) {
    let cartItems = JSON.parse(getCookie('cart')) || [];
    cartItems.splice(index, 1);
    setCookie("cart", JSON.stringify(cartItems), 30);
}

function clearCart() {
    setCookie("cart", '[]', 30);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const fileInput = document.querySelector('.instantUpload');
    const form = document.querySelector('.instantUploadForm');

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {  // Check if a file is selected
                form.submit();
            }
        });
    }
});

function getDefaultItemData(mealTags) {
    
    let tagsJSON = {};

    for (const tag of mealTags) {
        if (tag.type === 2) {
            tagsJSON[parseInt(tag.id)] = tag.options[0].is_default;
        } else if (tag.type === 0) {
            for (const option of tag.options) {
                if (option.is_default) {
                    tagsJSON[parseInt(tag.id)]  = option.id
                    break
                }
            }
        } else {
            let list = [];
            for (const option of tag.options) {
                if (option.is_default) {
                    list.push(option.id)
                }
            }
            tagsJSON[parseInt(tag.id)] = list;
        }
    }

    return tagsJSON
}

function getPrice(mealTags, itemTags) {

    price = 0.0

    for (const [key, value] of Object.entries(itemTags)) {
        for (let tag of mealTags) {
            if (tag.id == key) {
                iter_check = false
                if (tag.type == 0) {
                    for (let option of tag.options) {
                        iter_check = true
                        if (option.id == value) {
                            price += option.price
                            iter_check = false
                            break
                        }
                    }
                    if (iter_check) {
                        return -1
                    }
                }
                else if (tag.type == 1) {
                    for (let id of value) {
                        iter_check = true
                        for (let option of tag.options) {
                            if (option.id == id) {
                                price += option.price
                                iter_check = false
                                break
                            }
                        }
                        if (iter_check) {
                            return -1
                        }
                    }
                }
                else if (tag.type == 2) {
                    if (value) {
                        if (tag.options[0].name) {
                            price += tag.options[0].price
                        } else {
                            return -1
                        }
                    }
                }
                if (iter_check) {
                    return -1
                }
                break
            }
        }
    }

    return price
}

function getCartInfo(mealTags, itemTags) {

    price = 0.0
    tag_values0 = []
    tag_values1 = []
    tag_values2 = []

    for (const [key, value] of Object.entries(itemTags)) {
        for (let tag of mealTags) {
            if (tag.id == key) {
                iter_check = false
                if (tag.type == 0) {
                    for (let option of tag.options) {
                        iter_check = true
                        if (option.id == value) {
                            tag_values0.push(`${tag.name} - ${option.name}`)
                            price += option.price
                            iter_check = false
                            break
                        }
                    }
                    if (iter_check) {
                        return -1
                    }
                }
                else if (tag.type == 1) {
                    strs = []
                    for (let id of value) {
                        iter_check = true
                        for (let option of tag.options) {
                            if (option.id == id) {
                                strs.push(option.name)
                                price += option.price
                                iter_check = false
                                break
                            }
                        }
                        if (iter_check) {
                            return -1
                        }
                    }
                    if (strs.length > 0) {
                        str = strs.join(", ")
                        str = `${tag.name}: ` + str
                        tag_values1.push(str)
                    }
                }
                else if (tag.type == 2) {
                    if (value) {
                        if (tag.options[0].name) {
                            tag_values2.push(tag.options[0].name);
                            price += tag.options[0].price
                        } else {
                            return -1
                        }
                    }
                }
                if (iter_check) {
                    return -1
                }
                break
            }
        }
    }

    return [tag_values1.concat(tag_values0, tag_values2), price]
}