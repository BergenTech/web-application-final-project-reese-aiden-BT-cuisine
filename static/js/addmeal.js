/* I apologize in advance for writing such an atrocity of a javascript file */

tag_cards = []
columns = []
NUM_OF_COL = 3

for (let i = 0; i < NUM_OF_COL; i++) {
    columns[i] = document.getElementById(`tag-col-${i+1}`)
}
const tag_table = document.getElementById('tag-table')

update_table()

function update_table() {
    for (let i = 0; i < tag_cards.length; i++) {
        tag_table.appendChild(tag_cards[i])
    }
    for (let i = 0; i < columns.length; i++) {
        columns[i].innerHTML = ''
    }

    column_heights = [0,0,0]
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
}

document.getElementById('image').addEventListener('change', function() {
    var fileName = this.files[0].name;
    document.getElementById('file-name').textContent = fileName;
});
function removeNonNumbers(input) {
    let result = '';
    for (let i = 0; i < input.length; i++) {
        if (!isNaN(input[i]) && input[i] !== ' ') {
            result += input[i];
        }
    }
    return result;
}
document.getElementById(`price-input-strict`).addEventListener('blur', function(event) {
    let value = parseFloat(event.target.value.replace(/[^\d.]/g, '')).toFixed(2);
    if (!isNaN(value)) {
        event.target.value = `$${value}`;
    } else {
        event.target.value = '';
    }
});

document.getElementById('add-single-tag').addEventListener('click', function() {
    const numOfTagsInput = document.querySelector('input[name="num_of_tags"]');
    let numOfTags = parseInt(numOfTagsInput.value);

    numOfTags += 1;
    numOfTagsInput.value = numOfTags;

    const newTag = document.createElement('div');
    tag_cards.push(newTag)
    newTag.className = 'card col text-center single-tag';
    newTag.id = 'meal-tag';
    let optionCounter = 2;

    newTag.innerHTML = `
        <div class="tiny-btn-container tag-delete-container">
            <img style="height: 27px; width: 25px; padding: 5px 5px;" class="col-2 btn btn-danger justify-content-end" id="delete-tag${numOfTags}" src="static/assets/delete.png">
        </div>
        <input class="text-center tag-title hover-input" name="tag${numOfTags}" value="Tag${numOfTags}">
        <input class="text-center tag-title hover-input" min="0" step="0.01" type="number" style="display:none" name="tag${numOfTags}-type" value="0">
        <input name="tag${numOfTags}-num_of_options" style="display: none;" min="0" step="0.01" type="number" value="2">
        <div class="justify-content-right no-buttons" id="tag${numOfTags}-options">
            <div class="row" id="tag${numOfTags}-option1-div" style="padding-left: 20px; padding-right: 10px">
                <div class="col-1" style="display: flex; justify-content: center"><input type="radio" name="tag${numOfTags}-radio" value="1"></div>
                <input class="col-7 hover-input" type="text" name="tag${numOfTags}-option1" value="option 1">
                <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
                <input class="col-2 price-input hover-input" min="0" step="0.01" type="number" name="tag${numOfTags}-option1-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="0.00">
                <img class="btn btn-danger btn-circle position-absolute" id="delete-tag${numOfTags}-option1" src="static/assets/cross.png" style="z-index:2; zoom: 0.6; height: 27px; width: 25px; padding: 5px; right: -15px;">
            </div>
            <div class="row" id="tag${numOfTags}-option2-div" style="padding-left: 20px; padding-right: 10px">
                <div class="col-1" style="display: flex; justify-content: center"><input type="radio" name="tag${numOfTags}-radio" value="2"></div>
                <input class="col-7 hover-input" type="text" name="tag${numOfTags}-option2" value="option 2">
                <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
                <input class="col-2 price-input hover-input" min="0" step="0.01" type="number" name="tag${numOfTags}-option2-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="0.00">
                <img class="btn btn-danger btn-circle position-absolute" id="delete-tag${numOfTags}-option2" src="static/assets/cross.png" style="z-index:2; zoom: 0.6; height: 27px; width: 25px; padding: 5px; right: -15px;">
            </div>
        </div>
        <label class="small-add-button" style="margin-left:15px; margin-right:15px; margin-top:5px;" id="add-option-tag${numOfTags}">
            <span style="font-size: 20px; margin-right: 5px;">+</span>
        </label>
    `;
    
    const tagTable = document.getElementById('tag-table');
    update_table()

    document.getElementById(`delete-tag${numOfTags}`).addEventListener('click', function() {
        const index = tag_cards.indexOf(newTag);
        if (index !== -1) {
            tag_cards.splice(index, 1);
            newTag.remove();
            update_table();
        }
    });
    document.getElementById(`delete-tag${numOfTags}-option1`).addEventListener('click', function() {
        document.getElementById(`tag${numOfTags}-option1-div`).remove()
        update_table()
    });
    document.querySelector(`input[name="tag${numOfTags}-option1-price"]`).addEventListener('blur', function(event) {
        let value = parseFloat(event.target.value).toFixed(2);
        if (!isNaN(value)) {
            event.target.value = `${value}`;
        } else {
            event.target.value = '';
        }
    });
    document.getElementById(`delete-tag${numOfTags}-option2`).addEventListener('click', function() {
        document.getElementById(`tag${numOfTags}-option2-div`).remove()
        update_table()
    });
    document.querySelector(`input[name="tag${numOfTags}-option2-price"]`).addEventListener('blur', function(event) {
        let value = parseFloat(event.target.value).toFixed(2);
        if (!isNaN(value)) {
            event.target.value = `${value}`;
        } else {
            event.target.value = '';
        }
    });

    document.getElementById(`add-option-tag${numOfTags}`).addEventListener('click', function() {
        const newOption = document.createElement('div');
        newOption.className = "row"
        newOption.id = `tag${numOfTags}-option${++optionCounter}-div`
        newOption.style = `padding-left: 20px; padding-right: 10px`
        newOption.innerHTML = `<div class="col-1" style="display: flex; justify-content: center"><input type="radio" name="tag${numOfTags}-radio" value="${optionCounter}"></div>
        <input class="col-7 hover-input" type="text" name="tag${numOfTags}-option${optionCounter}" value="option ${optionCounter}">
        <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
        <input class="col-2 price-input hover-input" min="0" step="0.01" type="number" name="tag${numOfTags}-option${optionCounter}-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="0.00">
        <img class="btn btn-danger btn-circle position-absolute" id="delete-tag${numOfTags}-option${optionCounter}" src="static/assets/cross.png" style="z-index:2; zoom: 0.6; height: 27px; width: 25px; padding: 5px; right: -15px;">`
        document.getElementById(`tag${numOfTags}-options`).appendChild(newOption);
        document.getElementById(`delete-tag${numOfTags}-option${optionCounter}`).addEventListener('click', function() {
            newOption.remove()
            update_table()
        });
        document.querySelector(`input[name="tag${numOfTags}-option${optionCounter}-price"]`).addEventListener('blur', function(event) {
            let value = parseFloat(event.target.value).toFixed(2);
            if (!isNaN(value)) {
                event.target.value = `${value}`;
            } else {
                event.target.value = '';
            }
        });
        const inputElement = document.querySelector(`input[name="tag${numOfTags}-num_of_options"`);
        var currentValue = parseInt(inputElement.value, 10);
        var newValue = currentValue + 1;
        inputElement.value = newValue;

        update_table()
    });
});

document.getElementById('add-multi-tag').addEventListener('click', function() {
    const numOfTagsInput = document.querySelector('input[name="num_of_tags"]');
    let numOfTags = parseInt(numOfTagsInput.value);

    numOfTags += 1;
    numOfTagsInput.value = numOfTags;

    const newTag = document.createElement('div');
    tag_cards.push(newTag)
    newTag.className = 'card col text-center multi-tag';
    newTag.id = 'meal-tag';
    let optionCounter = 2;

    newTag.innerHTML = `
        <div class="tiny-btn-container tag-delete-container">
            <img style="height: 27px; width: 25px; padding: 5px 5px;" class="col-2 btn btn-danger justify-content-end" id="delete-tag${numOfTags}" src="static/assets/delete.png">
        </div>
        <input class="text-center tag-title hover-input" name="tag${numOfTags}" value="Tag${numOfTags}">
        <input class="text-center tag-title hover-input" min="0" step="0.01" type="number" style="display:none" name="tag${numOfTags}-type" value="1">
        <input name="tag${numOfTags}-num_of_options" style="display: none;" min="0" step="0.01" type="number" value="2">
        <div class="justify-content-right no-buttons" id="tag${numOfTags}-options">
            <div class="row" id="tag${numOfTags}-option1-div" style="padding-left: 20px; padding-right: 10px">
                <div class="col-1" style="display: flex; justify-content: center"><input type="checkbox" name="tag${numOfTags}-checkbox1" value="1"></div>
                <input class="col-7 hover-input" type="text" name="tag${numOfTags}-option1" value="option 1">
                <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
                <input class="col-2 price-input hover-input" min="0" step="0.01" type="number" name="tag${numOfTags}-option1-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="0.00">
                <img class="btn btn-danger btn-circle position-absolute" id="delete-tag${numOfTags}-option1" src="static/assets/cross.png" style="z-index:2; zoom: 0.6; height: 27px; width: 25px; padding: 5px; right: -15px;">
            </div>
            <div class="row" id="tag${numOfTags}-option2-div" style="padding-left: 20px; padding-right: 10px">
                <div class="col-1" style="display: flex; justify-content: center"><input type="checkbox" name="tag${numOfTags}-checkbox2" value="1"></div>
                <input class="col-7 hover-input" type="text" name="tag${numOfTags}-option2" value="option 2">
                <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
                <input class="col-2 price-input hover-input" min="0" step="0.01" type="number" name="tag${numOfTags}-option2-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="0.00">
                <img class="btn btn-danger btn-circle position-absolute" id="delete-tag${numOfTags}-option2" src="static/assets/cross.png" style="z-index:2; zoom: 0.6; height: 27px; width: 25px; padding: 5px; right: -15px;">
            </div>
        </div>
        <label class="small-add-button" style="margin-left:15px; margin-right:15px; margin-top:5px;" id="add-option-tag${numOfTags}">
            <span style="font-size: 20px; margin-right: 5px;">+</span>
        </label>
    `;
    
    const tagTable = document.getElementById('tag-table');
    update_table()

    document.getElementById(`delete-tag${numOfTags}`).addEventListener('click', function() {
        const index = tag_cards.indexOf(newTag);
        if (index !== -1) {
            tag_cards.splice(index, 1);
            newTag.remove();
            update_table();
        }
    });
    document.getElementById(`delete-tag${numOfTags}-option1`).addEventListener('click', function() {
        document.getElementById(`tag${numOfTags}-option1-div`).remove()
        update_table()
    });
    document.querySelector(`input[name="tag${numOfTags}-option1-price"]`).addEventListener('blur', function(event) {
        let value = parseFloat(event.target.value).toFixed(2);
        if (!isNaN(value)) {
            event.target.value = `${value}`;
        } else {
            event.target.value = '';
        }
    });
    document.getElementById(`delete-tag${numOfTags}-option2`).addEventListener('click', function() {
        document.getElementById(`tag${numOfTags}-option2-div`).remove()
        update_table()
    });
    document.querySelector(`input[name="tag${numOfTags}-option2-price"]`).addEventListener('blur', function(event) {
        let value = parseFloat(event.target.value).toFixed(2);
        if (!isNaN(value)) {
            event.target.value = `${value}`;
        } else {
            event.target.value = '';
        }
    });

    document.getElementById(`add-option-tag${numOfTags}`).addEventListener('click', function() {
        const newOption = document.createElement('div');
        newOption.className = "row"
        newOption.id = `tag${numOfTags}-option${++optionCounter}-div`
        newOption.style = `padding-left: 20px; padding-right: 10px`
        newOption.innerHTML = `<div class="col-1" style="display: flex; justify-content: center"><input type="checkbox" name="tag${numOfTags}-checkbox${optionCounter}" value="1"></div>
        <input class="col-7 hover-input" type="text" name="tag${numOfTags}-option${optionCounter}" value="option ${optionCounter}">
        <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
        <input class="col-2 price-input hover-input" min="0" step="0.01" type="number" name="tag${numOfTags}-option${optionCounter}-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="0.00">
        <img class="btn btn-danger btn-circle position-absolute" id="delete-tag${numOfTags}-option${optionCounter}" src="static/assets/cross.png" style="z-index:2; zoom: 0.6; height: 27px; width: 25px; padding: 5px; right: -15px;">`;
        document.getElementById(`tag${numOfTags}-options`).appendChild(newOption);
        document.getElementById(`delete-tag${numOfTags}-option${optionCounter}`).addEventListener('click', function() {
            newOption.remove()
            update_table()
        });
        document.querySelector(`input[name="tag${numOfTags}-option${optionCounter}-price"]`).addEventListener('blur', function(event) {
            let value = parseFloat(event.target.value).toFixed(2);
            if (!isNaN(value)) {
                event.target.value = `${value}`;
            } else {
                event.target.value = '';
            }
        });
        const inputElement = document.querySelector(`input[name="tag${numOfTags}-num_of_options"`);
        var currentValue = parseInt(inputElement.value, 10);
        var newValue = currentValue + 1;
        inputElement.value = newValue;

        update_table()
    });
});

document.getElementById('add-binary-tag').addEventListener('click', function() {
    const numOfTagsInput = document.querySelector('input[name="num_of_tags"]');
    let numOfTags = parseInt(numOfTagsInput.value);

    numOfTags += 1;
    numOfTagsInput.value = numOfTags;

    const newTag = document.createElement('div');
    tag_cards.push(newTag)
    newTag.className = 'card col text-center binary-tag';
    newTag.id = 'meal-tag';

    newTag.innerHTML = `
    <input class="text-center tag-title hover-input" min="0" step="0.01" type="number" style="display:none" name="tag${numOfTags}-type" value="2">
    <div class="row no-buttons" style=" overflow: visible; display: flex; align-items: center; justify-content: flex-start; position: relative;">
        <div class="col-2" style="max-width: 25px; display: grid;">
            <input style="width:20px; height:20px; margin-left:10px; z-index:5" type="checkbox" name="tag${numOfTags}-checkbox" value="1">
        </div>
        <div class="col-7"><input class="text-left tag-title hover-input" name="tag${numOfTags}" value="Tag${numOfTags}?"></div>
        <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-left:-24px; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
        <input class="col-2 price-input hover-input" min="0" type="number" name="tag${numOfTags}-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="0.00">
        <div class="col-12 justify-content-center align-items-center" style="font-size:15px; border: 1px;">
            <span style="font-size: 20px;">"</span><input class="col-2 hover-input text-center" type="text" name="tag${numOfTags}-literal" oninput="this.style.width = ((this.value.length + 1) * 10) + 'px';" style="font-size:15px; min-width:50px;" value="Tag${numOfTags}"><span style="font-size: 20px;">"</span>
        </div>
    </div>
    <div class="tiny-btn-container tag-delete-container" style="z-index:1">
        <img style="height: 27px; width: 25px; padding: 5px 5px; z-index:1" class="col-2 btn btn-danger justify-content-end" id="delete-tag${numOfTags}" src="static/assets/delete.png">
    </div>
    `;
    
    const tagTable = document.getElementById('tag-table');
    update_table()

    document.getElementById(`delete-tag${numOfTags}`).addEventListener('click', function() {
        const index = tag_cards.indexOf(newTag);
        if (index !== -1) {
            tag_cards.splice(index, 1);
            newTag.remove();
            update_table();
        }
    });
    document.querySelector(`input[name="tag${numOfTags}-price"]`).addEventListener('blur', function(event) {
        let value = parseFloat(event.target.value).toFixed(2);
        if (!isNaN(value)) {
            event.target.value = `${value}`;
        } else {
            event.target.value = '';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('upload-meal').addEventListener('change', function(event) {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const content = e.target.result;
                const data = JSON.parse(content);
                document.querySelector('input[name="name"]').value = data[0];
                document.querySelector('input[name="price"]').value = data[1];
                reloadTags(data);
            };
            
            reader.readAsText(file); // Read the file as text
        } else {
            console.log("No file selected");
        }
    });

    // Get the button and form elements
    const submitButton = document.getElementById('submit-form');
    const form = document.getElementById('form');

    // Validation function to check if all radio groups have a selected value
    function validateRadioInputs() {
        let allValid = true;
        const radioCards = document.querySelectorAll('.single-tag');

        radioCards.forEach(card  => {
            // const radioName = card.querySelector('input[type="radio"]').name;
            const radioInputs = card.querySelectorAll('input[type="radio"]');
            currentValid = false
            
            radioInputs.forEach(radio => {
                if (radio.checked) {
                    currentValid = true
                }
            });

            if (currentValid) {
                card.style.border = '';
            } else {
                card.style.border = '1px solid red';
                allValid = false
            }
        });

        return allValid;
    }


    // Add event listener to the button
    submitButton.addEventListener('click', function(event) {
        // Prevent form submission
        event.preventDefault();

        // Get the required input elements
        const nameInput = document.querySelector('input[name="name"]');
        const priceInput = document.querySelector('input[name="price"]');
        const qtyInput = document.querySelector('input[name="qty"]');
        const imageInput = document.getElementById('image');
        const imageBox = document.getElementById('image-box');

        // Check if all required fields are filled
        const isNameFilled = nameInput && nameInput.value.trim() !== '';
        const isPriceFilled = priceInput && priceInput.value.trim() !== '';
        const isQtyFilled = qtyInput && qtyInput.value.trim() !== '' && !isNaN(qtyInput.value);
        if (imageBox.classList.contains("optional")) {
            isImageSelected = true
        } else {
            isImageSelected = imageInput && imageInput.files && imageInput.files.length > 0;
        }


        if (isNameFilled && isPriceFilled && isImageSelected) {
            // If all fields are filled, submit the form
            if (validateRadioInputs()) {
                form.submit();
            } else {
                alert('supply a default option for all single-select tags.')
            }
        } else {
            // If not, alert the user and highlight the missing fields
            alert('Please fill in all required fields: name, price, quantity, select an image.');

            if (!isNameFilled) {
                nameInput.style.border = '1px solid red';
            } else {
                nameInput.style.border = '';
            }

            if (!isPriceFilled) {
                priceInput.style.border = '1px solid red';
            } else {
                priceInput.style.border = '';
            }

            if (!isImageSelected) {
                imageBox.style.border = '1px solid red';
            } else {
                imageBox.style.border = '';
            }
        }
    });
});