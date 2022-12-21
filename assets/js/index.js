posts = document.getElementById('posts')
dayjs.extend(window.dayjs_plugin_relativeTime)
var isFetching = false
var hasMore = true
var currentPage = 1
function createPost(post, position = 'end')
{
    var postInner = `
        <div class="postContent">
            <img src="${post.user.avatar}" alt="${post.user.name}">
            <div>
                <div class="mb-0 name">${post.user.name}</div>
                <div class="mb-2 datetime">${dayjs(post.created_at).fromNow()}</div>
                <p>${post.content}</p>
                <div class="icons d-flex align-items-center">
                    <div class="me-3 border rounded border bg-light py-1 px-2 d-flex align-items-center">
                        <svg class="css-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="FavoriteBorderIcon">
                            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                        </svg>
                        <div class="ms-2 fw-bolder">${post.likes_count}</div>
                    </div>
                    <div class="border rounded border bg-light py-1 px-2 d-flex align-items-center">
                        <svg class="css-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ChatBubbleOutlineIcon">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"></path>
                        </svg>
                        <div class="ms-2 fw-bolder">${post.comments_count}</div>
                    </div>
                </div>
            </div>
        </div>
    `
    var post = document.createElement('div')
    post.setAttribute('class', 'post')
    post.setAttribute('id', `post-${post.id}`)
    post.innerHTML = postInner
    if (position == 'end') {
        posts.appendChild(post)
    } else {
        posts.insertBefore(post, posts.firstChild);
    }
}



document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('scroll', function() {
        if (!isFetching && hasMore && (window.innerHeight + document.documentElement.scrollTop + 100) > document.documentElement.offsetHeight) {
            isFetching = true
            currentPage++
            
            fetchPosts(currentPage)
        }
    })
    fetchPosts(currentPage)
})
function fetchPosts(page)
{
    loading.style.display = 'block'
    fetch('https://www.ferasjobeir.com/api/posts?page=' + page, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(json => {
        json.data.data.forEach(post => {
            createPost(post)
        });
        isFetching = false
        hasMore = currentPage < json.data.last_page
        loading.style.display = 'none'
    })
}
function postCreated(json)
{
    createPost(json.data, 'start')
}