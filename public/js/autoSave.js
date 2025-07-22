
    const titleInput = document.querySelector('#title')
    const categoryInput = document.querySelector('#category')
    const draftIdInput = document.querySelector('#draftId');
    const wordCount = document.querySelector('#wordCount');
    let draftController;
    let isSubmitting = false;
    let timeOut;
    const saveStatus = document.querySelector('#saveStatus');
    const draftBtn = document.querySelector('.btn-draft');
    const publishBtn = document.querySelector('button[type="submit"]')
     const thumbnailInput = document.querySelector('#thumbnail')

    async function autoSaveDraft() {
        if (isSubmitting) return;
        if (draftController) draftController.abort();

        draftController = new AbortController();
        const data = {
            title: titleInput.value,
            category: categoryInput.value,
            content: window.ckeditor.getData()
        }
        // console.log('data', data)
        if ((!data.title?.trim() && !data.content?.trim()) || (Number(wordCount.value) < 20)) {
            saveStatus.textContent = "Not enough content to save";
            return;
        }
        // console.log('pass minimum requiement')

        const draftId = draftIdInput.value;
        const method = draftId?'PATCH':'POST';
        const apiUrl = draftId?`/api/drafts/${draftId}?auto=true`:'/api/drafts?auto=true'
        saveStatus.textContent = 'Saving....';

        // console.log( method, apiUrl)
        try{
            const res = await fetch(apiUrl,{
                method: method,
                headers: { 'Content-Type': 'application/json',
                            'Accept': 'application/json'
                            },
                body: JSON.stringify(data),
                signal: draftController.signal 
            })

            const result = await res.json();
            if(res.ok){
                if(!draftId && result._id){
                    draftIdInput.value = result._id;
                }
                saveStatus.textContent = `last saved: ${new Date().toLocaleTimeString()}`;
                
                // localStorage.setItem(`draft-${result._id}`, JSON.stringify(result));
            }else{
                saveStatus.textContent = 'failed to save, retry...'
            }
        }catch(err){
            if (err.name === 'AbortError') {
                console.log('Autosave was aborted'); // OK: do nothing
            } else {
                console.error(err);
                alert('Something went wrong');
            }
        }
        
    }


    async function saveDraft() {
        const formData = new FormData();

        formData.append('title', titleInput.value);
        formData.append('category', categoryInput.value);
        formData.append('content', window.ckeditor.getData());

        if (thumbnailInput.files.length > 0) {
            formData.append('thumbnail', thumbnailInput.files[0]);
        }

        if (!titleInput.value?.trim() || Number(wordCount.value) < 20) {
            alert('For "Save as Draft", provide a title and at least 20 words of content.');
            draftBtn.disabled = false;
                publishBtn.disabled = false;
                isSubmitting = false;
            return;
        }

        const draftId = draftIdInput.value;
        const method = draftId ? 'PATCH' : 'POST';
        const apiUrl = draftId ? `/api/drafts/${draftId}?auto=false` : '/api/drafts?auto=false';

        try {
            const myModal = new bootstrap.Modal(document.querySelector('#pencilLoaderModal'));
            myModal.show();
            const res = await fetch(apiUrl, {
                method: method,
                body: formData  // ✅ No Content-Type manually
            });

            const result = await res.json();

            if (res.ok) {
                window.location.href = '/dashboard/myBlogs';
            } else {
                console.log('Server error:', result);
                alert('Failed to save the draft. Try again.');
                draftBtn.disabled = false;
                publishBtn.disabled = false;
                isSubmitting = false;
            }
        } catch (err) {
            draftBtn.disabled = false;
                publishBtn.disabled = false;
                isSubmitting = false;
            console.error(err);
            alert('Something went wrong.');
        }
    }


    function debounceAutoSave(){

        clearTimeout(timeOut);
        timeOut = setTimeout(()=>{
            if(!isSubmitting){
                autoSaveDraft();
            }
        }, 2000);
    }

    [titleInput, categoryInput].forEach(input=>{
        input.addEventListener('input', debounceAutoSave);
    })

    const form = document.querySelector('#submitForm')
    form.addEventListener('submit', ()=>{
        if (draftController) draftController.abort();
        clearTimeout(timeOut);
        isSubmitting = true;
    })    


    draftBtn.addEventListener('click', async ()=>{


        clearTimeout(timeOut);
        if(draftController) draftController.abort();
        isSubmitting = true;
        await saveDraft();
    })