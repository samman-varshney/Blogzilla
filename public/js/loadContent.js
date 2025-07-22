let previouslyActiveCategory = document.querySelector('#All');


async  function loadContent(event){
    previouslyActiveCategory.classList.toggle('active');
    const category = event.target.getAttribute('id');
    previouslyActiveCategory = event.target;
    previouslyActiveCategory.classList.toggle('active');
    const content = category.innerHTML;
    category.innerHTML = `<div class="spinner-border spinner-border-sm" role="status"></div>`;
    try{
        const res = await fetch(`/api/categories/${category}`);
        const result = await res.json();
        if(res.ok){
                renderBlogs(result);
        }else{
            alert('something went wrong reload the page and try again');
        }
    }catch(err){
        alert(err.message);
    }
    category.innerHTML = content;
}

function renderBlogs(obj) {
    const {blogs} = obj;
    const container = document.getElementById('blogRenderArea');
    container.innerHTML = blogs.length
        ? blogs.map(blogComponent).join('')
        : `<div class="d-flex flex-column align-items-center justify-content-center mt-4">
                            <img src="/images/question-mark.svg" style="width: 300px; height:auto;" alt="">
                            <p class="mt-3 text-slate-600 ">No Blogs found</p>
                        </div>`;
}



function blogComponent(blog){
    return `<div class="col-md-6 mb-4">
                <div class="blog-card card h-100">
                    <img src="${ blog.thumbnail.url }" class="card-img-top" alt="${ blog.title }">
                    <div class="card-category">${ blog.category }</div>
                    <div class="card-body">
                        <h5 class="card-title">${ blog.title }</h5>
                        <p class="card-text">${ blog.preview }...</p>
                    </div>
                    <div class="card-body">
                        <a class="btn btn-outline-primary" href="/blogs/${ blog._id }/show">Read</a>
                    </div>
                    
                    <div class="card-footer bg-transparent border-top-0">
                        <div class="d-flex justify-content-between align-items-center card-meta">
                            <span><i class="bi bi-clock"></i> ${ blog.readTime || '5' } read</span>
                            <span><i class="bi bi-calendar"></i> ${ new Date(blog.createdAt).toLocaleDateString()  }</span>
                        </div>
                    </div>
                </div>
            </div>`
}

