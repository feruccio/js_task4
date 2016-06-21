loadDocuments();

function loadDocuments() {
    var result;
    var xhttp = new XMLHttpRequest();
    clearReference();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            result = xhttp.responseText;
            if (result && result.length > 0) {
                result = JSON.parse(result);
            }
            showDocuments(result);
        }
    };
    xhttp.open('GET', 'http://localhost:3000/docs.svc/getDocumentsList', true);
    xhttp.send();
}

function showDocuments(docs) {
    var i, contents;
    var doc, docList, docItem;
    var length = Object.keys(docs).length;
    if (length && length > 0) {
        contents = document.querySelector('.docs-summary');
        docList = document.createElement('ul');
        docList.setAttribute('style', 'list-style-type:none');
        contents.appendChild(docList);
        for (i = 0; i < length; i++) {
            doc = docs[i];
            docItem = createDocLiElement(doc);
            docList.appendChild(docItem);
        }
    }
}

function createDocLiElement(doc) {
    var i;
    var docId, docItem, docLink;
    var frags, fragLength, frag, fragList, fragItem;
    docId = doc['id'];
    docItem = document.createElement('li');
    docItem.setAttribute('id', docId);
    docItem.setAttribute('class', 'doc-item');
    docLink = document.createElement('a');
    docLink.setAttribute('href', '#');
    docLink.setAttribute('onclick', 'showDocument(' + docId + ')');
    docLink.textContent = doc['name'];
    docItem.appendChild(docLink);
    fragList = document.createElement('ul');
    fragList.setAttribute('style', 'list-style-type:none');
    docItem.appendChild(fragList);
    frags = doc['fragments'];
    if (frags) {
        fragLength = Object.keys(frags).length;
        for (i = 0; i < fragLength; i++) {
            frag = frags[i];
            fragItem = createDocFragmentLiElement(docId, frag);
            fragList.appendChild(fragItem);
        }
        docItem.appendChild(fragList);
    }
    return docItem;
}

function createDocFragmentLiElement(docId, frag) {
    var fragId, fragName;
    fragId = frag['id'];
    fragName = frag['name'] && frag['name'].length > 0 ? frag['name'] : '[no name]';
    return doCreateDocFragmentLiElement(docId, fragId, fragName);
}

function doCreateDocFragmentLiElement(docId, fragId, fragName) {
    var fragItem, fragLink;
    fragName = fragName && fragName.length > 0 ? fragName : '[no name]';
    fragItem = document.createElement('li');
    fragItem.setAttribute('id', fragId);
    fragLink = document.createElement('a');
    fragLink.setAttribute('href', '#');
    fragLink.setAttribute('onclick', 'showFragmentContentAndScroll(\'' + docId + '\',' + fragId + ')');
    fragLink.textContent = fragName;
    fragItem.appendChild(fragLink);
    fragItem.style.display = 'none';
    return fragItem;
}

function showDocument(id) {
    var docSelected = updateReference(id);
    updateContent(docSelected);
}

function updateReference(id) {
    var i, j;
    var frags, fragLength, frag, toShow;
    var docs, docsLength, doc, docId, docSelected;
    var docName = document.querySelector('.doc-selected');
    docs = document.getElementsByClassName('doc-item');
    docsLength = docs.length;
    for (i = 0; i < docsLength; i++) {
        doc = docs[i];
        docId = doc.getAttribute('id');
        toShow = docId == id;
        if (toShow) {
            docName.innerHTML = doc.querySelector('a').innerHTML;
            docSelected = doc;
        }
        frags = doc.querySelectorAll('ul > li');
        fragLength = frags.length;
        for (j = 0; j < fragLength; j++) {
            frag = frags[j];
            if (toShow) {
                frag.style.display = 'list-item';
            } else {
                frag.style.display = 'none';
            }
        }
    }
    return docSelected;
}

function updateContent(docElement) {
    var i, frags, fragsLength, frag, fragId, fragName, docId, noFragElement;
    var fragmentBut, fragmentCont;
    clearContent();
    var column = document.querySelector('.right');
    docId = docElement.getAttribute('id');
    frags = docElement.querySelectorAll('ul > li');
    fragsLength = frags.length;
    if (fragsLength > 0) {
        for (i = 0; i < fragsLength; i++) {
            frag = frags[i];
            fragId = frag.getAttribute('id');
            fragName = frag.querySelector('a').innerHTML;
            fragmentBut = document.createElement('button');
            fragmentBut.setAttribute('class', 'acc');
            fragmentBut.setAttribute('id', fragId);
            fragmentBut.setAttribute('onclick', 'showFragmentContent(\'' + docId + '\',' + fragId + ')');
            fragmentBut.innerHTML = fragName;
            column.appendChild(fragmentBut);
            fragmentCont = document.createElement('div');
            fragmentCont.setAttribute('class', 'panel');
            column.appendChild(fragmentCont);
        }
    } else {
        noFragElement = document.createElement('div');
        noFragElement.innerHTML = 'The document doesn\'t have any fragments';
        column.appendChild(noFragElement);
    }
}

function clearReference() {
    var column = document.querySelector('.docs-summary');
    while (column.firstChild) {
        column.removeChild(column.firstChild);
    }
}

function clearContent() {
    var column = document.querySelector('.right');
    while (column.firstChild) {
        column.removeChild(column.firstChild);
    }
}

function showFragmentContentAndScroll(docId, fragId) {
    var element = showFragmentContent(docId, fragId);
    var curtop = 0;
    if (element.offsetParent) {
        do {
            curtop += element.offsetTop;
        } while (element = element.offsetParent);
        window.scrollTo(0, curtop);
    }
}

function showFragmentContent(docId, fragId, fragContent) {
    var i, length, button, butId, panel, panelText;
    var buttons = document.querySelectorAll('button.acc');
    length = buttons.length;
    for (i = 0; i < length; i++) {
        button = buttons[i];
        butId = button.getAttribute('id');
        if (butId == fragId) {
            panel = button.nextElementSibling;
            panelText = panel.innerHTML;
            if (!panelText || panelText.length === 0) {
                loadFragment(panel, docId, fragId, fragContent);
            }
            button.classList.toggle('active');
            panel.classList.toggle('show');
            return button;
        }
    }
}

function loadFragment(panel, docId, fragId, fragContent) {
    var result, part1, part2;
    if (fragContent === undefined) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                result = xhttp.responseText;
                if (result && result.length > 0) {
                    result = JSON.parse(result);
                    panel.textContent = result['content'];
                }
            }
        };
        part1 = 'http://localhost:3000/docs.svc/getDocumentFragment?docId=';
        part2 = '&fragmentId=';
        xhttp.open('GET', part1 + docId + part2 + fragId, true);
        xhttp.send();
    } else {
        panel.textContent = fragContent;
    }
}

function openModal(name) {
    var content, header, element;
    var body = document.querySelector('body');
    var modal = document.createElement('div');
    modal.setAttribute('class', 'modal');
    body.appendChild(modal);
    content = document.createElement('div');
    content.setAttribute('class', 'modal-content');
    modal.appendChild(content);
    header = document.createElement('div');
    header.setAttribute('class', 'modal-header');
    content.appendChild(header);
    element = document.createElement('span');
    element.setAttribute('id', 'modal-close');
    element.setAttribute('class', 'close');
    element.setAttribute('onclick', 'closeModal()');
    element.innerHTML = 'x';
    header.appendChild(element);
    element = document.createElement('h3');
    element.innerHTML = name;
    header.appendChild(element);
    element = document.createElement('div');
    element.setAttribute('class', 'modal-body');
    content.appendChild(element);
    element = document.createElement('div');
    element.setAttribute('class', 'modal-controls');
    content.appendChild(element);
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    };
    return modal;
}

function newDocModal() {
    var body, element, controls;
    openModal('New Document');
    body = document.querySelector('.modal-body');
    element = document.createElement('input');
    element.setAttribute('id', 'newDocModalName');
    element.setAttribute('type', 'text');
    element.setAttribute('placeholder', 'New document name');
    body.appendChild(element);
    controls = document.querySelector('.modal-controls');
    element = document.createElement('button');
    element.setAttribute('id', 'newDocModalCreateBut');
    element.setAttribute('class', 'modal-button');
    element.setAttribute('onclick', 'createDocument()');
    element.innerHTML = 'Create';
    controls.appendChild(element);
    element = document.createElement('button');
    element.setAttribute('id', 'newDocModalCancelBut');
    element.setAttribute('class', 'modal-button');
    element.setAttribute('onclick', 'closeModal()');
    element.innerHTML = 'Cancel';
    controls.appendChild(element);
}

function newFragModal() {
    var body, element, controls;
    if (newDocumentCreated()) {
        openModal('New Fragment');
        body = document.querySelector('.modal-body');
        element = document.createElement('input');
        element.setAttribute('id', 'newFragModalName');
        element.setAttribute('type', 'text');
        element.setAttribute('placeholder', 'New fragment name');
        body.appendChild(element);
        element = document.createElement('textarea');
        element.setAttribute('id', 'newFragModalContent');
        element.setAttribute('placeholder', 'Enter text here...');
        body.appendChild(element);
        controls = document.querySelector('.modal-controls');
        element = document.createElement('button');
        element.setAttribute('id', 'newFragModalCreateBut');
        element.setAttribute('class', 'modal-button');
        element.setAttribute('onclick', 'createFragment()');
        element.innerHTML = 'Create';
        controls.appendChild(element);
        element = document.createElement('button');
        element.setAttribute('id', 'newFragModalCancelBut');
        element.setAttribute('class', 'modal-button');
        element.setAttribute('onclick', 'closeModal()');
        element.innerHTML = 'Cancel';
        controls.appendChild(element);
    } else {
        newDocModal();
    }
}

function saveModal() {
    var body, element, controls;
    if (newDocumentCreated()) {
        openModal('Save Document');
        body = document.querySelector('.modal-body');
        element = document.createElement('div');
        element.innerHTML = 'Click SAVE button to save the document';
        body.appendChild(element);
        element = document.createElement('div');
        element.innerHTML = 'or click CANCEL button to cancel saving';
        body.appendChild(element);
        controls = document.querySelector('.modal-controls');
        element = document.createElement('button');
        element.setAttribute('id', 'saveModalSaveBut');
        element.setAttribute('class', 'modal-button');
        element.setAttribute('onclick', 'saveDocument()');
        element.innerHTML = 'Save';
        controls.appendChild(element);
        element = document.createElement('button');
        element.setAttribute('id', 'saveModalCancelBut');
        element.setAttribute('class', 'modal-button');
        element.setAttribute('onclick', 'closeModal()');
        element.innerHTML = 'Cancel';
        controls.appendChild(element);
    } else {
        newDocModal();
    }
}

function closeModal() {
    var modal = document.querySelector('.modal');
    var parent = modal.parentNode;
    parent.removeChild(modal);
    window.onclick = undefined;
}

function createDocument() {
    var id = 'newlyAddedElementId';
    var docList, docItem;
    var nameInput = document.getElementById('newDocModalName');
    var name = nameInput.value;
    var doc = {id : id, name : name};
    docList = document.querySelector('.docs-summary ul');
    docItem = createDocLiElement(doc);
    docList.appendChild(docItem);
    closeModal();
    showDocument(id);
}

function createFragment() {
    var frags, newFrag, fragNameInput, textArea, fragName, docSelected;
    var fragId = generateFragId();
    frags = document.querySelector('#newlyAddedElementId ul');
    fragNameInput = document.getElementById('newFragModalName');
    fragName = fragNameInput.value;
    newFrag = doCreateDocFragmentLiElement('newlyAddedElementId', fragId, fragName);
    frags.appendChild(newFrag);
    docSelected = updateReference('newlyAddedElementId');
    updateContent(docSelected);
    textArea = document.getElementById('newFragModalContent');
    showFragmentContent('newlyAddedElementId', fragId, textArea.value);
    closeModal();
}

function generateFragId() {
    var frags = document.querySelectorAll('#newlyAddedElementId ul li');
    return frags == null ? 0 : frags.length;
}

function newDocumentCreated() {
    var newDoc = document.getElementById('newlyAddedElementId');
    return newDoc != null;
}

function saveDocument() {
    var i, doc, name, frags, length, button, panel;
    var fragments = [], fragment;
    var docSelected = document.querySelector('.doc-selected');
    name = docSelected.innerHTML;
    frags = document.querySelectorAll('.right .acc, .right .panel');
    length = frags.length;
    for (i = 0; i < length; i++) {
        button = frags[i];
        panel = frags[i + 1];
        fragment = {name : button.innerHTML, content : panel.innerHTML};
        fragments.push(fragment);
    }
    doc = {name : name, fragments : fragments};
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            loadDocuments();
        }
    };
    xhttp.open('POST', 'http://localhost:3000/docs.svc/saveDocument', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send(JSON.stringify(doc));
}