var loading = document.getElementById('loading')
var body = document.querySelector('body')
var token = localStorage.getItem('token')
var user = localStorage.getItem('user')
if (user) {
    user = JSON.parse(user)
}

if (body.classList.contains('protected') && !token) {
    window.location.href = '/login.html'
}
var ajaxForms = Array.from(document.getElementsByClassName('ajaxForm'))
ajaxForms.forEach((form) => {
    form.addEventListener('submit', function (event) {
        event.preventDefault()
        var submitButton = form.querySelector('button[type=submit]')
        if (submitButton) {
            submitButton.disabled = true
        }
        var formData = new FormData(event.target)
        var formId = form.getAttribute('id')
        var action = form.getAttribute('action')
        var method = form.getAttribute('method')
        var requiresToken = form.getAttribute('data-with-token')
        var headers = {}
        if (requiresToken == "true") {
            headers.Authorization = 'Bearer ' + token
        }
        try {
            fetch(action, {
                method: method,
                body: formData,
                headers,
            })
                .then(response => response.json())
                .then(json => {
                    if (submitButton) {
                        submitButton.disabled = false
                    }
                    if (json.success) {
                        if (form.getAttribute('data-success-alert') == 'true') {
                            createToast('success', `<div>${json.messages.join('</div><div>')}</div>`)
                        }
                        if (form.getAttribute('data-reset-on-success') == 'true') {
                            form.reset()
                        }
                        formSubmitted(json, formId)
                    } else {
                        createToast('danger', `<div>${json.messages.join('</div><div>')}</div>`)
                    }
                })
                .catch((error) => {
                    createToast('danger', 'Oops! We have a connection problem')
                    if (form.getAttribute('data-sync-on-fail') === "true") {
                        formSubmissionFailed(formData, formId)
                    }
                })

        } catch (error) {
            console.log('OOps', error)
        }
    })
})

function formSubmissionFailed(formData, formId) {
    var postData
    var storeName
    switch (formId) {
        case 'createPostForm':
            postData = {
                id: new Date().toISOString(),
                content: formData.get('content'),
                token: token
            }
            storeName = 'posts-to-send'
            break;
    }
    navigator.serviceWorker.ready.then(function (swRegistration) {
        writeData(storeName, postData)
            .then(function () {
                return swRegistration.sync.register('sync-new-posts');
            })
            .then(function () {
                createToast('primary', 'Your post will be automatically posted when a network connection is established')
            })
            .catch(function (err) {
                console.log('Post failed to be schedualed');
            });
    })
}

function formSubmitted(json, formId) {
    switch (formId) {
        case 'loginForm':
            userHasLoggedIn(json)
            break
        case 'createPostForm':
            postCreated(json)
            break
    }
}
function userHasLoggedIn(json) {
    localStorage.setItem('token', json.token)
    localStorage.setItem('user', JSON.stringify(json.data))
    window.location.href = '/index.html'
}

function createToast(type = 'primary', content = '') {
    var toastId = 'toast' + Math.random()
    var toastCode = `
    <div id="${toastId}" class="toast position-fixed bottom-0 end-0 mb-2 me-2 align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">${content}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    `
    var toastContainer = document.createElement('div')
    toastContainer.innerHTML = toastCode
    document.body.appendChild(toastContainer)
    var toastElement = document.getElementById(toastId)
    var toast = new bootstrap.Toast(toastElement)
    toast.show()
    toastElement.addEventListener('hidden.bs.toast', (e) => {
        toastContainer.parentNode.removeChild(toastContainer)
    })
}
function signout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login.html'
}