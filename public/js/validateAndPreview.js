 function updatePreview(){
    const thumbnail = document.querySelector('#thumbnail');
    const file = thumbnail.files[0];
    const maxSizeMB = 2;
    if(file){
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            showToast('warning', `File "${file.name}" is too large. Max size is ${maxSizeMB} MB.`)
            // alert(`File "${file.name}" is too large. Max size is ${maxSizeMB} MB.`);
            thumbnail.value = null;
            return false;
        }
        const reader = new FileReader();
        reader.onload = function(e){
            document.querySelector('#preview').src = e.target.result;
            if(document.querySelector('#previewArea')){
            document.querySelector('#previewArea').style.display = 'block'}
        }
        reader.readAsDataURL(file);
    }
}

async function deleteDraft(draftId) {
    const res = await fetch(`/api/drafts/${draftId}`, { method: 'DELETE' });

    if (!res.ok) {
        throw new Error(`Draft deletion failed (ID: ${draftId}, Status: ${res.status})`);
    }
}



async function validate(event) {
    event.preventDefault();

    const wordCountInput = document.querySelector('#wordCount');
    const draftIdInput = document.querySelector('#draftId');

    if (!wordCountInput) {
        console.error('Required DOM elements not found.');
        return;
    }

    const wordCount = wordCountInput.value;

    if (wordCount < 100) {
        alert('Content must contain at least 100 words.');
        return;
    }

    const draftId = draftIdInput?draftIdInput.value:null;
    const myModal = new bootstrap.Modal(document.querySelector('#pencilLoaderModal'));
    myModal.show();
    try {
        if (draftId) {
            await deleteDraft(draftId);
            // localStorage.removeItem(`draft-${draftId}`);
        }
    } catch (err) {
        myModal.hide();
        alert(err.message);
        console.error('Draft deletion error:', err);
        return;
    }

    // Disable only submit buttons
    const btn = document.querySelector('button[type="submit"]');
    btn.disabled = true
    
    event.target.submit();
}

// function validateFiles(len, element) {
//   const files = element.files;
//   const maxFiles = (10 - len) >= 4 ? 4 : (10 - len);
//   const maxSizeMB = 2;

//   if (files.length > maxFiles) {
//     showCustomAlert(`You can upload up to ${maxFiles} more images only.`);
//     element.value = null;
//     return false;
//   }

//   for (let file of files) {
//     const sizeMB = file.size / (1024 * 1024);
//     if (sizeMB > maxSizeMB) {
//       showCustomAlert(`File "${file.name}" is too large. Max size is ${maxSizeMB} MB.`);
//       element.value = null;
//       return false;
//     }
//   }

//   return true;
// }
// ---- END of fileValidation.js content ----
