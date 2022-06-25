const VISOR = document.querySelector('.visor div:first-child');
const RESULTADO = document.querySelector('.visor div:last-child');
document.querySelectorAll('.teclas button').forEach(b=>{
    b.addEventListener('click', ()=>{
        switch (b.id){
            case 'C':
                cleanOps();
                enableAll();
                break;
            case '=':
                resolveOps(VISOR.innerHTML);
                enableAll();
                break;
            case '(':
                console.log(b.value)
                if(!b.disabled) {
                    addOp(b.value);
                    enableAll();
                    b.value = b.value === '(' ? ')' : '(';
                    b.disabled = true
                }
                break
            case 'ANS':
                addOp(b.value);
                enableAll();
                break
            case '+':
            case '-':
            case 'x':
            case '/':
            case '.':
            case '%':    
                if(!b.disabled) {
                    addOp(b.id);
                    enableAll();
                    b.disabled = true
                }
                break
            default:
                addOp(b.id);
                enableAll();
        }
    });
});

function enableAll(){
    console.log('aqui')
    document.querySelectorAll('.teclas button').forEach(b=>b.disabled=false);
}

function cleanOps(){
    VISOR.innerHTML = '';
    RESULTADO.innerHTML = '';
    document.getElementById('ANS').value = '';
    document.getElementById('(').value = '(';
}

function addOp(value){
    let string = document.querySelector('.visor div:first-child').innerHTML;
    if(string.length<56)
        document.querySelector('.visor div:first-child').innerHTML += value;
}

function applyOp(op, value1, value2){
    switch (op) {
        case '/':
            return (value1) / (value2);
        case 'x':
            return (value1) * (value2);
        case '+':
            return (value1) + (value2);
        case '-':
            return (value1) - (value2);
    }
}

function parseOps(opArray) {
    opArray = opArray.map(e => {
        if(e.includes('%'))
            return e.replace('%','')/100;
        return +e ? +e : e;
    });

    do {
        index = opArray.findIndex(e => e === '');
        if (index!=-1) 
            opArray.splice(index, 3, opArray[index+2]*-1)
    } while (index!=-1);
    return opArray
}

function resolveOps(opString){
    result = resolveOpsRecursive(opString);
    document.getElementById('ANS').value = result;
    document.getElementById('(').value = '(';
    RESULTADO.innerHTML = result;
    VISOR.innerHTML = '';
}

function resolveOpsRecursive(opString){
    console.log("IT ->", opString)
    let regex = /\(([^)]+)\)/g
    let it = opString.matchAll(regex);
    for (subOpString of it) {
        opString = opString.replace(subOpString[0], resolveOpsRecursive(subOpString[1]));
    }
    let opArray = opString.split(/([\/x+-])/g);
    opArray = parseOps(opArray)
    
    // resolve multiplication and division
    do {  
        index = opArray.findIndex(e => e === '/' || e === 'x');
        if (index!=-1) {
            aux = applyOp(opArray[index], opArray[index-1], opArray[index+1]);
            opArray.splice(index-1, 3, aux);
        }

    } while (index!=-1);
    // resulve sum and subtraction
    do {
        index = opArray.findIndex(e => e === '+' || e === '-');
        if (index!=-1) {
            aux = applyOp(opArray[index], opArray[index-1], opArray[index+1]);
            opArray.splice(index-1, 3, aux);
        }

    } while (index!=-1);
    
    return (+opArray[0]).toString()
}