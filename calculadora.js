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
    opArray = [opArray].flat()
    opArray = opArray.map(e=>e.split(/([\%\/x+-])/g));
    let parsed = []
    opArray.forEach(array => {
        array = array.filter(e=>e!=='');
        array = array.map(e => +e ? +e : e);
        for (let i = 0; i < array.length; i++) {
            const e = array[i];
            if(e === '-'){
                if(typeof array[i-1] !== 'number' && typeof array[i+1] === 'number'){
                    array[i+1] *= -1;
                    array.splice(i,1);
                    i--;
                }
            }else if(e === '%'){
                array[i-1] /= 100;
                array.splice(i,1)
                if(typeof array[i] === 'number'){
                    array.splice(i,0,'x');
                    i++;
                }
            }
        }
        parsed.push(array);
    });
    let parsedFlat = parsed.flat();
    for (let i = 0; i < parsedFlat.length-1; i++) {
        const e = parsedFlat[i];
        if (typeof e === 'number' && typeof parsedFlat[i+1] === 'number' ){
            i+=1;
            parsedFlat.splice(i, 0, 'x');
        }
    }
    return parsedFlat;
}

function resolveOps(opString){
    result = resolveOpsRecursive(opString);
    document.getElementById('ANS').value = result;
    document.getElementById('(').value = '(';
    RESULTADO.innerHTML = result;
    VISOR.innerHTML = '';
}

function resolveOpsRecursive(opString){
    let regex = /\(([^)^]+)\)/g
    let it = opString.matchAll(regex);
    let results = [];
    for (subOpString of it) {
        results.push(resolveOpsRecursive(subOpString[1]));
    }
    let opArray = opString.split(/[()]/);
    let resolve = false;
    for (let i = 0; i < opArray.length; i++) {
        if(resolve){
            opArray[i] = results.shift()
        }
        resolve = !resolve;
    }
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
    
    return (+opArray[0]).toString();
}