tag_cards = []
columns = []
const initialNumOfCol = 3;
let NUM_OF_COL = initialNumOfCol;

for (let i = 0; i < NUM_OF_COL; i++) {
    columns[i] = document.getElementById(`tag-col-${i+1}`)
}

tags_data = mealData[2]

function refreshPrice() {
    let tagsJSON = {};
    for (const tag of tags_data) {
        if (tag.type === 2) {
            tagsJSON[parseInt(tag.id)] = document.querySelector(`input[name="tag${tag.id}-checkbox"]`).checked;
        } else if (tag.type === 0) {
            tagsJSON[parseInt(tag.id)] = parseInt(document.querySelector(`input[name="tag${tag.id}-radio"]:checked`).value);
        } else {
            let list = [];
            for (const option of tag.options) {
                if (document.querySelector(`input[name="tag${tag.id}-checkbox${option.id}"]:checked`)) {
                    list.push(parseInt(option.id));
                }
            }
            tagsJSON[parseInt(tag.id)] = list;
        }
    }

    price_span = document.getElementById("meal-price");
    price_span.textContent = `$${((mealData[1] + getPrice(mealData[2], tagsJSON))*parseInt(document.getElementById("qty").value)).toFixed(2)}`
    
}

for (const tag of tags_data) {
    const newTag = document.createElement('div');
    tag_cards.push(newTag)
    newTag.className = 'card col text-center single-tag';
    newTag.id = 'meal-tag';

    newTag.innerHTML = `
        <span class="text-center tag-title hover-span" style="width: 95%;">${tag.name}</span>
        <div class="justify-content-right" id="tag${tag.id}-options">
            
        </div>
    `;
    let optionsDiv = newTag.querySelector(`#tag${tag.id}-options`);

    // Loop through each option within the item
    switch (tag.type) {
    case 0:
        for (const option of tag.options) {
            const newOption = document.createElement('div');
            newOption.className = "row"
            newOption.id = `tag${tag.id}-option${option.id}-div`
            newOption.style = `padding-left: 20px; padding-right: 10px; align-items: center`
            const isChecked = option.is_default ? 'checked' : '';
            newOption.innerHTML = `<div class="col-1" style="display: flex; justify-content: center"><input class="come-on-my-selector" type="radio" name="tag${tag.id}-radio" value="${option.id}" ${isChecked}></div>
            <span class="col-7 hover-span">${option.name}</span>
            <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
            <span class="col-2 price-input hover-span" type="text" style="white-space: nowrap; z-index:1; width:49px; font-size:15px">${option.price.toFixed(2)}</span>`
            optionsDiv.appendChild(newOption)
        }
        break
    case 1:
        for (const option of tag.options) {
            const newOption = document.createElement('div');
            newOption.className = "row"
            newOption.id = `tag${tag.id}-option${option.id}-div`
            newOption.style = `padding-left: 20px; padding-right: 10px; align-items: center`
            const isChecked = option.is_default ? 'checked' : '';
            newOption.innerHTML = `<div class="col-1" style="display: flex; justify-content: center"><input class="come-on-my-selector" type="checkbox" name="tag${tag.id}-checkbox${option.id}" value="1" ${isChecked}></div>
            <span class="col-7 hover-span">${option.name}</span>
            <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
            <span class="col-2 price-input hover-span" type="text" style="white-space: nowrap; z-index:1; width:49px; font-size:15px">${option.price.toFixed(2)}</span>`
            optionsDiv.appendChild(newOption)
        }
        break
    case 2:
        option = tag.options[0]
        
        newTag.innerHTML = `
        <div class="row" style="display: flex; align-items: center; justify-content: flex-start; position: relative;">
            <div class="col-2" style="max-width: 25px; display: grid;">
                <input class="come-on-my-selector" style="width:20px; height:20px; margin-left:10px; position: absolute; top: 50%; transform: translateY(-50%);" type="checkbox" name="tag${tag.id}-checkbox" value="1">
            </div>
            <div class="col-8"><span class="text-left tag-title">${tag.name}</span></div>
            <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-left:-24px; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
            <span class="col-2 price-input hover-span" type="text" style="white-space: nowrap; z-index:1; width:49px; font-size:15px">${option.price.toFixed(2)}</span>
        </div>
    `;
    }
}

const screenWidth = window.innerWidth;
if (screenWidth < 600) {
    columns[0].classList.remove('col-4');
    columns[1].classList.remove('col-4');
    columns[2].classList.remove('col-4');
    columns[0].classList.add("col-12");
    columns[1].classList.add("col-1");
    columns[2].classList.add("col-1");
    column_heights = [0]
} else if (screenWidth < 900) {
    column_heights = [0,0]
    columns[0].classList.remove('col-4');
    columns[1].classList.remove('col-4');
    columns[2].classList.remove('col-4');
    columns[0].classList.add("col-6");
    columns[1].classList.add("col-6");
    columns[2].classList.add("col-1");
} else {
    column_heights = [0,0,0]
}

for (let i = 0; i < tag_cards.length; i++) {
    yes = column_heights[0]
    k = 0
    for (let j = 1; j < column_heights.length; j++) {
        if (column_heights[j] < yes) {
            yes = column_heights[j]
            k = j
        }
    }
    columns[k].appendChild(tag_cards[i])
    column_heights[k] += tag_cards[i].offsetHeight
}

elements = document.querySelectorAll('.come-on-my-selector');
elements.forEach(element => {
    element.addEventListener('click', refreshPrice);
});


document.getElementById('qty').addEventListener('input', refreshPrice);

document.getElementById('qty').addEventListener('blur', function(event) {
    let value = parseFloat(event.target.value).toFixed(0);
    if (value > 10) {
        event.target.value = 10;
    }
    if (value < 0) {
        event.target.value = 0;
    }
    refreshPrice();  // Ensure price is updated after correcting the value
});

document.getElementById('form').addEventListener('submit', function(event) {

    let meal_id = parseInt(new URLSearchParams(window.location.search).get('meal_id')); // Get meal_id from URL query params
    let qty = parseInt(document.getElementById('qty').value); // Get quantity from the form field

     // Implement this function to retrieve tags data as per your implementation

    // Construct tagsJSON
    let tagsJSON = {};
    for (const tag of tags_data) {
        if (tag.type === 2) {
            tagsJSON[parseInt(tag.id)] = !!document.querySelector(`input[name="tag${tag.id}-checkbox"]`).checked;
        } else if (tag.type === 0) {
            tagsJSON[parseInt(tag.id)] = parseInt(document.querySelector(`input[name="tag${tag.id}-radio"]:checked`).value);
        } else {
            let list = [];
            for (const option of tag.options) {
                if (document.querySelector(`input[name="tag${tag.id}-checkbox${option.id}"]:checked`)) {
                    list.push(parseInt(option.id));
                }
            }
            tagsJSON[parseInt(tag.id)] = list;
        }
    }

    let orderJSON = [
        meal_id,
        qty,
        tagsJSON
    ];

    addToCart(mealData, orderJSON)
});

document.addEventListener('DOMContentLoaded', (event) => {
    refreshPrice()
})