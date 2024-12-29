const NBSP = "\u00A0", FLAG = "\uD83D\uDEA9", MINE = "\uD83D\uDCA3"
const get = document.querySelector.bind(document)
const getAll = document.querySelectorAll.bind(document)
const create = document.createElement.bind(document)
const createAndAssign = (tag, attributes) => Object.assign(create(tag), attributes)
const getButton = (row, col) => get(`button[row='${row}'][col='${col}']`)
let height, length, mines, endCounter

function setForm(notFirst) {
    if (notFirst) get("table").remove()
    let form = createAndAssign("form", { method: "post" });
    [
        { type: "number", name: "height", id: "height", placeholder: "Height", value: height, min: 1 },
        { type: "number", name: "length", id: "length", placeholder: "Length", value: length, min: 1 },
        { type: "number", name: "mines", id: "mines", placeholder: "Mines", value: mines, min: 1 },
        { type: "button", id: "button", onclick: () => setTable(), value: "Start" }
    ].map(attributes => createAndAssign("input", attributes)
    ).forEach((input) => {
        form.appendChild(input)
        form.appendChild(create("br"))
    })
    get("main").appendChild(form)
}

function setTable() {
    form       = get("form")
    height     = form.height.valueAsNumber
    length     = form.length.valueAsNumber
    mines      = form.mines.valueAsNumber
    endCounter = height * length - mines

    if (endCounter <= 0) return alert("This configuration is not possible.\nIncrease height and/or length or decrease amount of mines.")
    else get("form").remove()

    let table = create("table")
    for (let row = 0; row < height; row++) {
        let tr = create("tr")
        for (let col = 0; col < length; col++) {
            let td = create("td")
            let button = createAndAssign("button", {
                textContent: NBSP, style: "background-color: #CCC !important;", // html+css
                onclick: ({ target }) => leftClick(target), oncontextmenu: ({ target }) => rightClick(target), // functions
                mine: false, minesAround: 0, row: row, col: col,
            })
            Object.entries({ row: row, col: col }).forEach(([key, value]) => button.setAttribute(key, value))
            td.appendChild(button)
            tr.appendChild(td)
        }
        table.appendChild(tr)
    }

    let caption     = createAndAssign("caption",     { innerHTML: "\uD83D\uDEA9" })
    let flagCounter = createAndAssign("flagCounter", { flagsLeft: mines, innerHTML: mines })
    caption.appendChild(flagCounter)
    table.appendChild(caption)
    get("main").appendChild(table)
}

function firstClick(clickedButton) {
    let ms = mines
    while (ms) {
        let randomRow = Math.floor(Math.random() * height), randomCol = Math.floor(Math.random() * length)
        let { attributes } = randomButton = getButton(randomRow, randomCol)
        
        if (!randomButton.mine && (randomRow !== clickedButton.row || randomCol !== clickedButton.col)) {
            randomButton.mine = attributes.mine = true
            ms--
            getSurroundingButtons(randomButton).forEach(button => button.attributes.minesAround = button.minesAround++)
        }
    }
}

function leftClick(button) {
    if (button.textContent !== NBSP) return
    if (endCounter === height * length - mines) firstClick(button)
    if (button.mine) {
        button.textContent = MINE
        button.style = "background-color: red;"
        alert("Boom 😵")
        setForm(true)
    } else {
        button.textContent = button.minesAround
        button.style = colorPicker(button.minesAround) + "background-color: #999 !important;"
        endCounter--
        if (!endCounter) {
            alert("No boom 😎")
            setForm(true)
        }
    }
    if (button.minesAround !== 0 || button.mine) return
    getSurroundingButtons(button)
        .forEach(surroundingButton => !surroundingButton.mine && leftClick(surroundingButton))
}

function rightClick(button) {
    const hidden = button.textContent === NBSP, flagged = button.textContent === FLAG;
    let flagCounter = get("flagCounter");
    
    if (hidden || flagged) {
        [flagCounter.textContent, button.textContent] = hidden
            ? [flagCounter.flagsLeft--, FLAG]
            : [flagCounter.flagsLeft++, NBSP];
        return false;
    }
    
    let flaggedSurroundingButtons = 0, surroundingButtons = getSurroundingButtons(button)
    
    surroundingButtons.forEach(({ textContent }) => textContent === FLAG && flaggedSurroundingButtons++);
    
    if (flaggedSurroundingButtons !== button.minesAround) return false;
    
    surroundingButtons.forEach((surroundingButton) => leftClick(surroundingButton));
    
    return false;
}

function getSurroundingButtons({row, col}) {
    let surroundingButtons = []
    for (let i = -1; i < 2; i++)
        for (let j = -1; j < 2; j++)
            if ((row + i >= 0) && (col + j >= 0) && (row + i < height) && (col + j < length) && (i !== 0 || j !== 0))
                surroundingButtons.push(getButton(row + i, col + j))
    return surroundingButtons
}

function colorPicker(number) {
    return `color: ${
        [
            "#999 !important",
            "blue",
            "green",
            "red",
            "navy",
            "maroon",
            "teal",
            "black",
            "silver",
        ][number]
    };`
}
