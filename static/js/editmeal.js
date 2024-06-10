function makeImageOptional() {
    const imageBox = document.getElementById('image-box');
    imageBox.classList.add("optional")
}

function reloadTags(mealData) {
    for (tag of mealData[2]) {
        if (tag.type == 0) {
            addSingleTag(tag.name, tag.options)
        }
        else if (tag.type == 1) {
            addMultiTag(tag.name, tag.options)
        }
        else if (tag.type == 2) {
            addBinaryTag(tag.name, tag.options[0])
        }
    }

    document.getElementById('download').addEventListener('click', function() {
        const fileContent = JSON.stringify(mealData);
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = `${mealData[0]}.json`;
        link.href = window.URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    document.getElementById('upload').addEventListener('click', function() {
        
    });
}

function addSingleTag(name, options) {
    const numOfTagsInput = document.querySelector('input[name="num_of_tags"]');
    let numOfTags = parseInt(numOfTagsInput.value);

    numOfTags += 1;
    numOfTagsInput.value = numOfTags;

    const newTag = document.createElement('div');
    tag_cards.push(newTag)
    newTag.className = 'card col text-center single-tag';
    newTag.id = 'meal-tag';
    let optionCounter = 0;

    newTag.innerHTML = `
        <div class="tiny-btn-container tag-delete-container">
            <img style="height: 27px; width: 25px; padding: 5px 5px;" class="col-2 btn btn-danger justify-content-end" id="delete-tag${numOfTags}" src="static/assets/delete.png">
        </div>
        <input class="text-center tag-title hover-input" name="tag${numOfTags}" value="${name}">
        <input class="text-center tag-title hover-input" min="0" step="0.01" type="number" style="display:none" name="tag${numOfTags}-type" value="0">
        <input name="tag${numOfTags}-num_of_options" style="display: none;" min="0" step="0.01" type="number" value="${options.length}">
        <div class="justify-content-right no-buttons" id="tag${numOfTags}-options"></div>
        <label class="small-add-button" style="margin-left:15px; margin-right:15px; margin-top:5px;" id="add-option-tag${numOfTags}">
            <span style="font-size: 20px; margin-right: 5px;">+</span>
        </label>
    `;
    
    const tagTable = document.getElementById('tag-table');
    update_table()

    for (const option of options) {
        const newOption = document.createElement('div');
        newOption.className = "row"
        newOption.id = `tag${numOfTags}-option${++optionCounter}-div`
        newOption.style = `padding-left: 20px; padding-right: 10px`
        const isChecked = option.is_default ? 'checked' : '';
        newOption.innerHTML = `<div class="col-1" style="display: flex; justify-content: center"><input type="radio" name="tag${numOfTags}-radio" value="${optionCounter}" ${isChecked}></div>
        <input class="col-7 hover-input" type="text" name="tag${numOfTags}-option${optionCounter}" value="${option.name}">
        <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
        <input class="col-2 price-input hover-input" min="0" type="number" name="tag${numOfTags}-option${optionCounter}-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="${option.price.toFixed(2)}">
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
    }

    document.getElementById(`delete-tag${numOfTags}`).addEventListener('click', function() {
        const index = tag_cards.indexOf(newTag);
        if (index !== -1) {
            tag_cards.splice(index, 1);
            newTag.remove();
            update_table();
        }
    });

    document.getElementById(`add-option-tag${numOfTags}`).addEventListener('click', function() {
        const newOption = document.createElement('div');
        newOption.className = "row"
        newOption.id = `tag${numOfTags}-option${++optionCounter}-div`
        newOption.style = `padding-left: 20px; padding-right: 10px`
        newOption.innerHTML = `<div class="col-1" style="display: flex; justify-content: center"><input type="radio" name="tag${numOfTags}-radio" value="1"></div>
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
};

function addMultiTag(name, options) {
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
        <input class="text-center tag-title hover-input" name="tag${numOfTags}" value="${name}">
        <input class="text-center tag-title hover-input" min="0" step="0.01" type="number" style="display:none" name="tag${numOfTags}-type" value="1">
        <input name="tag${numOfTags}-num_of_options" style="display: none;" min="0" step="0.01" type="number" value="${options.length}">
        <div class="justify-content-right no-buttons" id="tag${numOfTags}-options"></div>
        <label class="small-add-button" style="margin-left:15px; margin-right:15px; margin-top:5px;" id="add-option-tag${numOfTags}">
            <span style="font-size: 20px; margin-right: 5px;">+</span>
        </label>
    `;
    
    const tagTable = document.getElementById('tag-table');
    update_table()

    for (const option of options) {
        const newOption = document.createElement('div');
        newOption.className = "row"
        newOption.id = `tag${numOfTags}-option${++optionCounter}-div`
        newOption.style = `padding-left: 20px; padding-right: 10px`
        const isChecked = option.is_default ? 'checked' : '';
        newOption.innerHTML = `<div class="col-1" style="display: flex; justify-content: center"><input type="checkbox" name="tag${numOfTags}-checkbox${optionCounter}" value="1" ${isChecked}></div>
        <input class="col-7 hover-input" type="text" name="tag${numOfTags}-option${optionCounter}" value="${option.name}">
        <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
        <input class="col-2 price-input hover-input" min="0" type="number" name="tag${numOfTags}-option${optionCounter}-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="${option.price.toFixed(2)}">
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
    }

    document.getElementById(`delete-tag${numOfTags}`).addEventListener('click', function() {
        const index = tag_cards.indexOf(newTag);
        if (index !== -1) {
            tag_cards.splice(index, 1);
            newTag.remove();
            update_table();
        }
    });

    document.getElementById(`add-option-tag${numOfTags}`).addEventListener('click', function() {
        const newOption = document.createElement('div');
        newOption.className = "row"
        newOption.id = `tag${numOfTags}-option${++optionCounter}-div`
        newOption.style = `padding-left: 20px; padding-right: 10px`
        newOption.innerHTML = `<div class="col-1" style="display: flex; justify-content: center"><input type="checkbox" name="tag${numOfTags}-checkbox" value="1"></div>
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
};

function addBinaryTag(name, option) {
    const numOfTagsInput = document.querySelector('input[name="num_of_tags"]');
    let numOfTags = parseInt(numOfTagsInput.value);

    numOfTags += 1;
    numOfTagsInput.value = numOfTags;

    const newTag = document.createElement('div');
    tag_cards.push(newTag)
    newTag.className = 'card col text-center binary-tag';
    newTag.id = 'meal-tag';
    const isChecked = option.is_default ? 'checked' : '';

    newTag.innerHTML = `
    <input class="text-center tag-title hover-input" min="0" step="0.01" type="number" style="display:none" name="tag${numOfTags}-type" value="2">
    <div class="row no-buttons" style=" overflow: visible; display: flex; align-items: center; justify-content: flex-start; position: relative;">
        <div class="col-2" style="max-width: 25px; display: grid;">
            <input style="width:20px; height:20px; margin-left:10px; z-index:5" type="checkbox" name="tag${numOfTags}-checkbox" value="1" ${isChecked}>
        </div>
        <div class="col-7"><input class="text-left tag-title hover-input" name="tag${numOfTags}" value="${name}"></div>
        <div class="col-1 d-flex justify-content-center align-items-center" style="white-space: nowrap; z-index:2; margin-left:-24px; margin-right:-10px; font-size:15px"><span style="font-size: 10px;">+</span>$</div>
        <input class="col-2 price-input hover-input" min="0" type="number" name="tag${numOfTags}-price" style="white-space: nowrap; z-index:1; width:49px; font-size:15px" value="${option.price.toFixed(2)}">
        <div class="col-12 justify-content-center align-items-center" style="font-size:15px; border: 1px;">
            <span style="font-size: 20px;">"</span><input class="col-2 hover-input text-center" type="text" name="tag${numOfTags}-literal" oninput="this.style.width = ((this.value.length + 1) * 10) + 'px';" style="font-size:15px; min-width:50px;" value="${option.name}"><span style="font-size: 20px;">"</span>
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

    const priceInput = document.querySelector(`input[name="tag${numOfTags}-literal"]`);
    priceInput.style.width = ((option.name.length + 1) * 10) + 'px';
};