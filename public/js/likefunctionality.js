 // Like functionality
 function requireAuth(currentUser) {
    if (currentUser === 'false') {
        console.log('model error user not found')
        const myModal = new bootstrap.Modal(document.getElementById('authModal'));
        myModal.show();
        return false;
    }
    return true;
}
   
 
async function like(currentUser, blogId, event) {
    if (!requireAuth(currentUser)) return;

    const btn = event.currentTarget;
    const isLiked = btn.getAttribute('fill') === '#f9365e';

    // Add loading class
    btn.classList.add('loading');

    try {
        const res = await fetch(`/api/blogs/${blogId}/like`);
        const result = await res.json();

        if (res.ok) {
            btn.setAttribute('fill', isLiked ? 'gray' : '#f9365e');
            const likeCount = btn.parentElement.querySelector('span');
            if (likeCount) {
                likeCount.textContent = result.likeCount + ' likes';
            }
        } else {
            showToast('warning', result.message);
        }
    } catch (err) {
        showToast('danger', err.message);
    } finally {
        // Remove loading class
        btn.classList.remove('loading');
    }
}


function commentFormAuth(currentUser, event){
    if(!requireAuth(currentUser)){
        event.preventDefault();
        return false;
    }
    event.currentTarget.querySelector('button').disabled = true;
    event.currentTarget.querySelector('button').innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
  <span role="status">posting...</span>`;
}

// function reinstanciateTooltip(element){
//     const tooltipInstance = bootstrap.Tooltip.getInstance(element);
//     if (tooltipInstance) {
//         tooltipInstance.dispose(); // Remove the old tooltip
//     }

//     // Recreate the tooltip with the new title
//     new bootstrap.Tooltip(element); 
// }

async function follow(follower, following, event){
    if(!requireAuth(follower)){
        return;
    }


    
    const button = event.currentTarget;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
  <span role="status">processing...</span>`
    const followerCount = document.querySelector('#followerCount')
    const count = followerCount?parseInt(followerCount.textContent):0
    try{
        const res = await fetch(`/api/follow/${follower}/${following}`);
        const result = await res.json();
        if(res.ok){
          
            if(result.follow){

                button.innerHTML = '<i class="bi bi-person-dash-fill me-2"></i><span>Unfollow</span>';

                if(followerCount){followerCount.textContent = `${count+1}`;}
            }else{
                button.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i><span>follow</span>'; 
                if(followerCount){followerCount.textContent = `${count-1}`;}
            }
            
            showToast('success', `${result.follow?'follow':'unfollow'} successfully`)
         
           }else{
            console.log('result message',result.message)
            showToast('warning', result.message)
        }
        
    }catch(err){
        console.error(err)
        showToast('danger', err.message)
    }
    button.disabled = false;
}